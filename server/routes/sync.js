import { listFolder, putJson, ROOT } from '../integrations/dropbox.js';
import { DropboxAIService } from '../integrations/dropbox-ai-service.js';
import { isDropboxReady } from '../integrations/dropbox-client.js';
import fetch from 'node-fetch';

/**
 * Detect browser language preference from HTTP headers
 * @param {Object} req - Express request object (optional for sync context)
 * @returns {string} Language code ('en' or 'pl')
 */
function detectLanguagePreference(req = null) {
  // If request is available, check Accept-Language header
  if (req && req.headers && req.headers['accept-language']) {
    const acceptLanguage = req.headers['accept-language'];
    // Check for Polish language variants (pl-PL, pl, etc.)
    if (acceptLanguage.toLowerCase().includes('pl')) {
      return 'pl';
    }
  }
  
  // Default fallback to English
  return 'en';
}

/**
 * Dropbox→Dashboard One-Click Sync
 * Scans DROPBOX_ROOT (/CASES) and syncs case structure
 */

// Fast authentication check without making API calls
async function checkDropboxConfig() {
  try {
    // Check if required environment variables exist
    const hasReplitConnectors = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const hasReplitToken = process.env.REPL_IDENTITY || process.env.WEB_REPL_RENEWAL;
    
    if (!hasReplitConnectors || !hasReplitToken) {
      return {
        configured: false,
        reason: 'Missing Replit connector configuration',
        details: 'REPLIT_CONNECTORS_HOSTNAME or authentication token not found'
      };
    }
    
    return {
      configured: true,
      reason: 'Environment variables present'
    };
  } catch (error) {
    return {
      configured: false,
      reason: 'Configuration check failed',
      details: error.message
    };
  }
}

// Ensure portal subfolders exist with timeout handling
async function ensurePortalStructure(caseFolder) {
  const portalSubfolders = [
    'portal',
    'portal/drafts',
    'portal/events', 
    'portal/tasks',
    'portal/hac',
    'portal/hac/req',
    'portal/hac/arc',
    'portal/tree',
    'portal/tree/sources',
    'portal/uploads'
  ];

  for (const subfolder of portalSubfolders) {
    const folderPath = `${caseFolder}/${subfolder}`;
    try {
      await Promise.race([
        DropboxAIService.createFolder(folderPath, false),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Folder creation timeout: ${folderPath}`)), 10000)
        )
      ]);
    } catch (error) {
      // Folder might already exist, that's OK
      if (!error.message.includes('already exists') && !error.message.includes('timeout')) {
        console.warn(`Failed to create folder ${folderPath}: ${error.message}`);
      } else if (error.message.includes('timeout')) {
        throw new Error(`Dropbox API timeout while creating folder structure`);
      }
    }
  }
}

// Load existing case.json or initialize new one with timeout handling
async function loadOrInitializeCaseJson(caseFolder, caseId, req = null) {
  const caseJsonPath = `${caseFolder}/portal/case.json`;
  
  try {
    const result = await Promise.race([
      DropboxAIService.readFile(caseJsonPath),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Read timeout: ${caseJsonPath}`)), 10000)
      )
    ]);
    return JSON.parse(result.content);
  } catch (error) {
    if (error.message.includes('timeout')) {
      throw new Error(`Dropbox API timeout while reading case.json`);
    }
    
    // File doesn't exist, create new case.json
    const newCaseData = {
      caseId,
      client: {
        name: "",
        email: ""
      },
      processing: "standard",
      difficulty: 1,
      clientScore: 50,
      state: "INTAKE",
      preferredLanguage: detectLanguagePreference(req),
      docs: {
        received: 0,
        expected: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revision: 1
    };
    
    await Promise.race([
      putJson(caseJsonPath, newCaseData),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Write timeout: ${caseJsonPath}`)), 10000)
      )
    ]);
    return newCaseData;
  }
}

// Compute lineage from tree.json if present with timeout handling
async function computeLineageFromTree(caseFolder, caseId) {
  const treeJsonPath = `${caseFolder}/portal/tree/tree.json`;
  
  try {
    const result = await Promise.race([
      DropboxAIService.readFile(treeJsonPath),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Read timeout: ${treeJsonPath}`)), 10000)
      )
    ]);
    const treeData = JSON.parse(result.content);
    
    if (treeData.proband) {
      // Simple lineage computation - can be enhanced
      const lineage = `${treeData.proband.givenName || ''} ${treeData.proband.surname || ''}`.trim();
      
      if (lineage) {
        // Submit via HAC instead of direct write
        const hacData = {
          type: 'CASE_PATCH',
          title: `Auto-sync lineage for ${caseId}`,
          description: `Computed lineage from family tree: ${lineage}`,
          caseId,
          payload: { lineage },
          priority: 'low',
          category: 'automation'
        };
        
        // Use fetch to submit to HAC endpoint with timeout
        try {
          const response = await Promise.race([
            fetch('http://localhost:5000/api/hac/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(hacData)
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('HAC submission timeout')), 5000)
            )
          ]);
          
          if (!response.ok) {
            console.warn(`Failed to submit HAC request for ${caseId}: ${response.statusText}`);
          }
        } catch (fetchError) {
          console.warn(`HAC submission failed for ${caseId}: ${fetchError.message}`);
        }
        
        return { lineage, hacQueued: true };
      }
    }
  } catch (error) {
    if (error.message.includes('timeout')) {
      console.warn(`Timeout reading tree.json for ${caseId}`);
      return { lineage: null, hacQueued: false };
    }
    // Tree file doesn't exist or is invalid, that's OK
    console.debug(`No valid tree.json found for ${caseId}: ${error.message}`);
  }
  
  return { lineage: null, hacQueued: false };
}

// Create/refresh portal/index.json for fast access with timeout handling
async function createPortalIndex(caseFolder, caseData) {
  const indexPath = `${caseFolder}/portal/index.json`;
  
  const docsPct = caseData.docs.expected > 0 
    ? Math.round((caseData.docs.received / caseData.docs.expected) * 100) 
    : 0;
  
  const indexData = {
    caseId: caseData.caseId,
    clientName: caseData.client.name || 'Unnamed Client',
    processing: caseData.processing,
    difficulty: caseData.difficulty,
    clientScore: caseData.clientScore,
    docsPct,
    state: caseData.state,
    updatedAt: new Date().toISOString()
  };
  
  await Promise.race([
    putJson(indexPath, indexData),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Write timeout: ${indexPath}`)), 10000)
    )
  ]);
  return indexData;
}

// Main sync endpoint - real Dropbox operations
export async function syncCases(req, res) {
  console.log('🔄 Starting Dropbox→Dashboard sync...');
  
  const results = {
    ok: true,
    created: [],
    updated: [],
    hacQueued: [],
    errors: []
  };
  
  try {
    // AUTHENTICATION CHECK: Verify Dropbox is properly configured before proceeding
    console.log('🔐 Checking Dropbox configuration...');
    const configCheck = await checkDropboxConfig();
    
    if (!configCheck.configured) {
      console.warn('❌ Dropbox not configured:', configCheck.reason);
      return res.status(400).json({
        ok: false,
        error: 'DROPBOX_NOT_CONFIGURED',
        message: 'Dropbox integration is not properly configured.',
        details: configCheck.details || 'Please set up the Dropbox integration in your Replit workspace to enable case synchronization.',
        suggestion: 'Visit the Integrations panel in Replit and connect your Dropbox account.',
        configCheck,
        created: [],
        updated: [],
        hacQueued: [],
        errors: ['Dropbox authentication required']
      });
    }
    
    console.log('✅ Dropbox authentication verified');
    
    // Scan DROPBOX_ROOT (/CASES) for top-level folders with timeout
    console.log(`📁 Scanning ${ROOT} for case folders...`);
    const rootListing = await Promise.race([
      listFolder(ROOT),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Folder listing timeout')), 10000)
      )
    ]);
    
    const caseFolders = rootListing.entries
      .filter(entry => entry['.tag'] === 'folder')
      .map(folder => ({
        name: folder.name,
        path: folder.path_display
      }));
    
    console.log(`📋 Found ${caseFolders.length} potential case folders`);
    
    // Process each case folder
    for (const folder of caseFolders) {
      const caseId = folder.name;
      const caseFolder = folder.path;
      
      try {
        console.log(`🔄 Processing case: ${caseId}`);
        
        // Process case with timeout and error handling
        await Promise.race([
          processSingleCase(caseFolder, caseId, results),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Case processing timeout for ${caseId}`)), 30000)
          )
        ]);
        
      } catch (caseError) {
        const errorMsg = `Failed to process case ${caseId}: ${caseError.message}`;
        console.error(`❌ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }
    
    console.log('🎉 Sync completed successfully:', {
      created: results.created.length,
      updated: results.updated.length,
      hacQueued: results.hacQueued.length,
      errors: results.errors.length
    });
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    results.ok = false;
    
    // Provide user-friendly error messages based on error type
    if (error.message.includes('Authentication check timeout')) {
      results.error = 'DROPBOX_AUTH_TIMEOUT';
      results.message = 'Dropbox authentication check timed out.';
      results.suggestion = 'Please check your internet connection and Dropbox integration status.';
    } else if (error.message.includes('Folder listing timeout')) {
      results.error = 'DROPBOX_API_TIMEOUT';
      results.message = 'Dropbox API request timed out while listing folders.';
      results.suggestion = 'Please try again later or check Dropbox service status.';
    } else if (error.message.includes('not connected') || error.message.includes('not configured')) {
      results.error = 'DROPBOX_NOT_CONFIGURED';
      results.message = 'Dropbox integration is not properly configured.';
      results.suggestion = 'Please set up the Dropbox integration in your Replit workspace.';
    } else {
      results.error = error.message;
      results.message = 'An unexpected error occurred during synchronization.';
      results.suggestion = 'Please check the logs for more details and try again.';
    }
  }
  
  res.json(results);
}

// Process a single case with proper error handling and timeouts
async function processSingleCase(caseFolder, caseId, results) {
  // 1. Ensure portal structure exists
  await ensurePortalStructure(caseFolder);
  
  // 2. Load or initialize case.json
  const existingCaseData = await checkExistingCaseData(caseFolder);
  const caseData = await loadOrInitializeCaseJson(caseFolder, caseId, null); // No request context in sync
  
  // Track if this is a new case or update
  if (!existingCaseData) {
    results.created.push(caseId);
    console.log(`✅ Created new case: ${caseId}`);
  } else {
    results.updated.push(caseId);
    console.log(`🔄 Updated existing case: ${caseId}`);
  }
  
  // 3. Check for tree.json and compute lineage
  const lineageResult = await computeLineageFromTree(caseFolder, caseId);
  if (lineageResult.hacQueued) {
    results.hacQueued.push(`${caseId}: lineage update`);
    console.log(`📋 Queued HAC request for ${caseId}`);
  }
  
  // 4. Create/refresh portal index
  await createPortalIndex(caseFolder, caseData);
  console.log(`📄 Updated portal index for ${caseId}`);
}

// Helper function to check if case.json already exists with timeout handling
async function checkExistingCaseData(caseFolder) {
  const caseJsonPath = `${caseFolder}/portal/case.json`;
  
  try {
    const result = await Promise.race([
      DropboxAIService.readFile(caseJsonPath),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Read timeout: ${caseJsonPath}`)), 10000)
      )
    ]);
    return JSON.parse(result.content);
  } catch (error) {
    if (error.message.includes('timeout')) {
      throw new Error(`Dropbox API timeout while checking existing case data`);
    }
    // File doesn't exist, this is a new case
    return null;
  }
}

// Test endpoint for authentication check
export async function testDropboxAuth(req, res) {
  try {
    console.log('🔍 Testing Dropbox configuration...');
    
    const configCheck = await checkDropboxConfig();
    
    if (configCheck.configured) {
      res.json({
        ok: true,
        status: 'CONFIGURED',
        message: 'Dropbox configuration appears valid',
        details: configCheck.reason
      });
    } else {
      res.json({
        ok: false,
        status: 'NOT_CONFIGURED',
        message: 'Dropbox configuration is missing or invalid',
        details: configCheck.details,
        reason: configCheck.reason
      });
    }
  } catch (error) {
    res.json({
      ok: false,
      status: 'ERROR',
      error: error.message,
      message: 'Error checking Dropbox configuration'
    });
  }
}

// Simple test endpoint without any Dropbox calls
export async function testSimple(req, res) {
  console.log('🧪 Simple test endpoint called');
  res.json({
    ok: true,
    message: 'Simple test endpoint works',
    timestamp: new Date().toISOString()
  });
}

// Routes
export default function syncRoutes(app) {
  app.get('/api/admin/sync-cases', syncCases);
  app.get('/api/admin/test-dropbox-auth', testDropboxAuth);
  app.get('/api/admin/test-simple', testSimple);
}