import { Dropbox } from "dropbox";
const fetchNode = (...a)=>import("node-fetch").then(({default:f})=>f(...a));
import path from 'path';
import { getUncachableDropboxClient } from "./dropbox-client.js";

const ROOT = process.env.DROPBOX_ROOT || "/CASES";

// SECURITY: Ensure path is confined under ROOT - prevents path traversal attacks
const ensureUnderRoot = (p) => {
  if (!p) return ROOT;
  
  // Normalize the path first
  let normalized = String(p).replace(/\\/g, '/').replace(/\/+/g, '/');
  
  // Remove any path traversal attempts
  normalized = normalized.replace(/\.\.\//g, '').replace(/\.\.\\/g, '').replace(/\.\.$/g, '');
  
  // Ensure it starts with ROOT
  if (!normalized.startsWith(ROOT)) {
    // If it's an absolute path that doesn't start with ROOT, confine it
    if (normalized.startsWith('/')) {
      normalized = ROOT + normalized;
    } else {
      // If it's a relative path, make it relative to ROOT
      normalized = ROOT + '/' + normalized;
    }
  }
  
  // Final normalization
  normalized = normalized.replace(/\/+/g, '/');
  
  // Security check: ensure the final path is still under ROOT
  if (!normalized.startsWith(ROOT + '/') && normalized !== ROOT) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[SECURITY] Path confined to ROOT: '${p}' -> '${ROOT}'`);
    }
    return ROOT;
  }
  
  return normalized;
};

// SECURITY: Enhanced path sanitization with segment-wise processing
const sanitizePath = (p, caseId = null) => {
  if (!p) return "/";
  
  // First, apply security confinement
  p = ensureUnderRoot(p);
  
  // Split into segments for segment-wise sanitization
  const segments = String(p).split('/').filter(segment => segment.length > 0);
  const sanitizedSegments = segments.map((segment, index) => {
    // Handle empty segments with fallback
    if (!segment || segment.trim() === '') {
      return caseId ? `case-${caseId}` : 'unnamed-segment';
    }
    
    return segment
      .trim()
      // Replace sequences of # with underscore
      .replace(/#+/g, "_")
      // Replace + with underscore
      .replace(/\+/g, "_")
      // Replace parentheses with underscores
      .replace(/[()]/g, "_")
      // Replace other invalid characters with underscores
      .replace(/[^a-zA-Z0-9 _\-.]/g, "_")
      // Clean up multiple underscores
      .replace(/_+/g, "_")
      // Trim underscores from start and end
      .replace(/^_+|_+$/g, "")
      // Ensure segment is not empty after sanitization
      || (caseId ? `case-${caseId}` : 'sanitized-segment');
  });
  
  // Reconstruct path
  const result = '/' + sanitizedSegments.join('/');
  
  // Final security check
  return ensureUnderRoot(result);
};

// SECURITY: Enhanced normalization with proper sanitization
const norm = (p, caseId = null) => { 
  if(!p) return ROOT; 
  
  // Apply sanitization first (which includes ensureUnderRoot)
  let s = sanitizePath(p, caseId);
  
  // Ensure it starts with /
  if(!s.startsWith("/")) s = "/" + s;
  
  // Clean up multiple slashes
  s = s.replace(/\/+/g,"/");
  
  // Final security confinement
  return ensureUnderRoot(s);
};

// SECURITY: Enhanced path validation - rejects dot segments and traversal patterns
const okPath = p => {
  if (!p || typeof p !== 'string') return false;
  
  // Must start with /
  if (p[0] !== '/') return false;
  
  // Cannot end with / unless it's the root
  if (p.length > 1 && p.endsWith('/')) return false;
  
  // SECURITY: Special case for .health folder (diagnostic purposes)
  const isHealthPath = p === `${ROOT}/.health` || p.startsWith(`${ROOT}/.health/`);
  if (isHealthPath) {
    // Apply basic validation for health paths
    return !p.includes('..') && !p.includes('~') && !p.includes('//') && !p.includes('\\');
  }
  
  // SECURITY: Reject any dot segments or traversal patterns for non-health paths
  if (p.includes('..') || p.includes('./') || p.includes('/.') || p.includes('~')) {
    return false;
  }
  
  // SECURITY: Must be under ROOT
  if (!p.startsWith(ROOT + '/') && p !== ROOT) {
    return false;
  }
  
  // Check for valid characters only
  if (!/^[a-zA-Z0-9 _\-.\/]+$/.test(p)) {
    return false;
  }
  
  // Additional security: no double slashes or suspicious patterns
  if (p.includes('//') || p.includes('\\') || p.includes('\x00')) {
    return false;
  }
  
  return true;
};

// PERFORMANCE: Enhanced caching and in-flight deduplication
const folderListCache = new Map();
const inFlightRequests = new Map();
const CACHE_TTL = 300000; // 5 minutes cache for better performance

async function withClient(fn){ 
  const dbx = await getUncachableDropboxClient(); 
  return fn(dbx); 
}

async function listFolder(pathLower, caseId = null){ 
  const path = norm(pathLower ?? ROOT, caseId);
  
  // SECURITY: Validate path before API call
  if (!okPath(path)) {
    throw new Error(`Invalid path rejected for security: '${pathLower}' -> '${path}'`);
  }
  
  const cacheKey = path;
  
  // PERFORMANCE: Check cache first
  const cached = folderListCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  // PERFORMANCE: In-flight request deduplication
  if (inFlightRequests.has(cacheKey)) {
    return await inFlightRequests.get(cacheKey);
  }
  
  // Create the request promise
  const requestPromise = withClientRetry(dbx => dbx.filesListFolder({ path }).then(r => r.result))
    .then(result => {
      // PERFORMANCE: Cache the result
      folderListCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      return result;
    })
    .finally(() => {
      // Clean up in-flight tracking
      inFlightRequests.delete(cacheKey);
    });
  
  // Track in-flight request
  inFlightRequests.set(cacheKey, requestPromise);
  
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[dropbox] Listing folder: ${path}`);
  }
  
  return await requestPromise;
}

async function putJson(pathLower, obj, caseId = null){
  const originalPath = pathLower;
  const path = norm(pathLower, caseId); 
  
  // SECURITY: Enhanced path validation
  if(!okPath(path)) { 
    const e = new Error(`SECURITY: Invalid Dropbox path rejected: '${originalPath}' -> '${path}'`); 
    e.path = path;
    e.originalPath = originalPath;
    throw e; 
  }
  
  const contents = Buffer.from(JSON.stringify(obj, null, 2));
  
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[dropbox] Uploading to: ${path}`);
    }
    
    return await withClientRetry(dbx => dbx.filesUpload({ path, contents, mode:{ ".tag":"overwrite" } }).then(r => r.result));
  } catch (error) {
    // SECURITY: Only log sensitive paths in debug mode
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`Dropbox upload error for path '${path}':`, error.message);
    } else {
      console.error('Dropbox upload error:', error.message);
    }
    
    const e = new Error(`Failed to upload to Dropbox: ${error.message}`);
    e.originalError = error;
    e.path = path;
    e.originalPath = originalPath;
    throw e;
  }
}

// Normalize path function as required by specs
function normalizePath(p) {
  if (!p || p === '' || p === '.' || p === null) return '/';
  
  // Ensure starts with /
  let normalized = String(p);
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  
  // Collapse duplicate slashes
  normalized = normalized.replace(/\/+/g, '/');
  
  // Percent-encode illegal chars for Dropbox v2
  // Remove trailing spaces and reserved ASCII control characters
  normalized = normalized.replace(/\s+$/g, ''); // Remove trailing spaces
  normalized = normalized.replace(/[\x00-\x1F\x7F]/g, ''); // Remove control chars
  
  return normalized;
}

// Retry wrapper for fetch calls with exponential backoff
async function retryFetch(url, options, maxRetries = 3) {
  const delays = [200, 600, 1500]; // ms
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetchNode(url, options);
      
      // Check for retry conditions
      if (response.status === 409 || response.status === 429 || response.status >= 500) {
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delays[attempt]));
          continue;
        }
      }
      
      // Check for invalid token errors
      if (response.status === 401 || response.status === 400) {
        try {
          const errorBody = await response.json();
          if (errorBody.error && errorBody.error.includes('invalid_access_token')) {
            throw new Error('DROPBOX_TOKEN_INVALID');
          }
        } catch (parseError) {
          // If we can't parse the error, continue with original response
        }
      }
      
      return response;
    } catch (error) {
      if (error.message === 'DROPBOX_TOKEN_INVALID') {
        throw error;
      }
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delays[attempt]));
    }
  }
}

// Enhanced withClient to use retry logic with exponential backoff
async function withClientRetry(fn) {
  const delays = [200, 600, 1500]; // ms
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const dbx = await getUncachableDropboxClient();
      const result = await fn(dbx);
      return result;
    } catch (error) {
      // Parse error for detailed information
      const errorInfo = {
        code: error?.error?.error?.['.tag'] || 'unknown',
        status: error?.status || error?.error?.status || 0,
        summary: error?.error?.error_summary || error.message || 'Unknown error'
      };
      
      // Check for invalid token
      if (errorInfo.status === 401 || errorInfo.status === 400 || 
          errorInfo.summary.includes('invalid_access_token') ||
          errorInfo.code === 'invalid_access_token') {
        throw new Error('DROPBOX_TOKEN_INVALID');
      }
      
      // Check for retry conditions (409, 429, >=500)
      const shouldRetry = (
        errorInfo.status === 409 || 
        errorInfo.status === 429 || 
        errorInfo.status >= 500
      ) && attempt < maxRetries - 1;
      
      if (shouldRetry) {
        console.log(`[dropbox-retry] Attempt ${attempt + 1} failed, retrying in ${delays[attempt]}ms:`, errorInfo.summary);
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
        continue;
      }
      
      // If we can't retry or have exhausted attempts, throw with enhanced error info
      const enhancedError = new Error(`Dropbox operation failed: ${errorInfo.summary}`);
      enhancedError.code = errorInfo.code;
      enhancedError.status = errorInfo.status;
      enhancedError.summary = errorInfo.summary;
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }
}

// Ensure folder exists (create if needed)
async function ensureFolder(folderPath, caseId = null) {
  const originalPath = folderPath;
  const path = norm(folderPath, caseId);
  
  // SECURITY: Validate path before API call
  if (!okPath(path)) {
    throw new Error(`Invalid path rejected for security: '${originalPath}' -> '${path}'`);
  }
  
  try {
    return await withClientRetry(async dbx => {
      try {
        await dbx.filesCreateFolderV2({ path, autorename: false });
        return { success: true, path };
      } catch (error) {
        // Handle retry conditions
        if (error?.status === 409 || error?.status === 429 || error?.status >= 500) {
          throw error; // Let retry wrapper handle it
        }
        
        // Check for invalid token
        if (error?.status === 401 || error?.status === 400) {
          if (error?.error?.error_summary?.includes('invalid_access_token')) {
            throw new Error('DROPBOX_TOKEN_INVALID');
          }
        }
        
        // Ignore if folder already exists
        if (error?.error?.error_summary?.includes('path/conflict/folder')) {
          return { success: true, path, existed: true };
        }
        throw error;
      }
    });
  } catch (error) {
    if (error.message === 'DROPBOX_TOKEN_INVALID') {
      throw error;
    }
    return { success: false, error: error.message, path };
  }
}

// Get JSON from Dropbox
async function getJson(filePath, caseId = null) {
  const originalPath = filePath;
  const path = norm(filePath, caseId);
  
  // SECURITY: Validate path before API call
  if (!okPath(path)) {
    throw new Error(`Invalid path rejected for security: '${originalPath}' -> '${path}'`);
  }
  
  try {
    return await withClientRetry(async dbx => {
      const response = await dbx.filesDownload({ path });
      const content = response.result.fileBinary.toString('utf-8');
      return JSON.parse(content);
    });
  } catch (error) {
    // Handle retry conditions
    if (error?.status === 409 || error?.status === 429 || error?.status >= 500) {
      throw error; // Let retry wrapper handle it
    }
    
    // Check for invalid token
    if (error?.status === 401 || error?.status === 400) {
      if (error?.error?.error_summary?.includes('invalid_access_token')) {
        throw new Error('DROPBOX_TOKEN_INVALID');
      }
    }
    
    if (error?.error?.error_summary?.includes('path/not_found')) {
      return null;
    }
    throw error;
  }
}

// Write file (Buffer or String) with parent directory creation
async function writeFile(filePath, content, caseId = null) {
  const originalPath = filePath;
  const normalizedPath = norm(filePath, caseId);
  
  // SECURITY: Validate path before API call
  if (!okPath(normalizedPath)) {
    throw new Error(`Invalid path rejected for security: '${originalPath}' -> '${normalizedPath}'`);
  }
  
  const dirname = path.dirname(normalizedPath);
  
  // Ensure parent directory exists
  if (dirname !== '/' && dirname !== ROOT) {
    await ensureFolder(dirname, caseId);
  }
  
  const contents = Buffer.isBuffer(content) ? content : Buffer.from(String(content));
  
  return await withClientRetry(async dbx => {
    const response = await dbx.filesUpload({
      path: normalizedPath,
      contents,
      mode: { '.tag': 'overwrite' }
    });
    return response.result;
  });
}

// Read file from Dropbox
async function readFile(filePath, caseId = null) {
  const originalPath = filePath;
  const path = norm(filePath, caseId);
  
  // SECURITY: Validate path before API call
  if (!okPath(path)) {
    throw new Error(`Invalid path rejected for security: '${originalPath}' -> '${path}'`);
  }
  
  return await withClientRetry(async dbx => {
    const response = await dbx.filesDownload({ path });
    return response.result.fileBinary;
  });
}

// Check if file/folder exists
async function exists(checkPath, caseId = null) {
  const originalPath = checkPath;
  const path = norm(checkPath, caseId);
  
  // SECURITY: Validate path before API call
  if (!okPath(path)) {
    throw new Error(`Invalid path rejected for security: '${originalPath}' -> '${path}'`);
  }
  
  try {
    await withClientRetry(async dbx => {
      await dbx.filesGetMetadata({ path });
    });
    return true;
  } catch (error) {
    // Handle retry conditions
    if (error?.status === 409 || error?.status === 429 || error?.status >= 500) {
      throw error; // Let retry wrapper handle it
    }
    
    // Check for invalid token
    if (error?.status === 401 || error?.status === 400) {
      if (error?.error?.error_summary?.includes('invalid_access_token')) {
        throw new Error('DROPBOX_TOKEN_INVALID');
      }
    }
    
    if (error?.error?.error_summary?.includes('path/not_found')) {
      return false;
    }
    throw error;
  }
}

// Enhanced putJson with parent directory creation
async function putJsonEnhanced(pathLower, obj, caseId = null) {
  const originalPath = pathLower;
  const filePath = norm(pathLower, caseId);
  
  // SECURITY: Validate path before operations
  if (!okPath(filePath)) {
    throw new Error(`Invalid path rejected for security: '${originalPath}' -> '${filePath}'`);
  }
  
  const dirname = path.dirname(filePath);
  
  // Ensure parent directory exists
  if (dirname !== '/' && dirname !== ROOT) {
    await ensureFolder(dirname, caseId);
  }
  
  return await putJson(pathLower, obj, caseId);
}

export { 
  listFolder, 
  putJson, 
  putJsonEnhanced,
  ROOT, 
  norm, 
  sanitizePath, 
  ensureUnderRoot, 
  okPath,
  normalizePath,
  ensureFolder,
  getJson,
  writeFile,
  readFile,
  exists,
  retryFetch,
  withClientRetry
};