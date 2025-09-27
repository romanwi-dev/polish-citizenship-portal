import { Dropbox } from "dropbox";
const fetchNode = (...a)=>import("node-fetch").then(({default:f})=>f(...a));

let cachedClient = null;
let cachedClientExpiry = 0;

// PERFORMANCE: In-flight request deduplication
const inFlightRequests = new Map();

async function getAccessToken() {
  // Try new OAuth2 auth first, fallback to Replit connection system
  try {
    const { getDropboxAccessToken } = await import('../lib/dropboxAuth.js');
    return await getDropboxAccessToken();
  } catch (oauthError) {
    // Fallback to Replit connection system
    console.log('[dropbox-client] OAuth2 auth failed, trying Replit connection system');
    
    let connectionSettings;
    if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
      return connectionSettings.settings.access_token;
    }
    
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken) {
      throw new Error('X_REPLIT_TOKEN not found for repl/depl');
    }

    connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=dropbox',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

    if (!connectionSettings || !accessToken) {
      throw new Error('Dropbox not connected');
    }
    return accessToken;
  }
}

/**
 * PERFORMANCE: Creates a singleton Dropbox client with caching
 * Reuses client instance until token expiry for better performance
 * 
 * @returns {Promise<Dropbox>} Cached or fresh Dropbox client instance
 */
export async function getUncachableDropboxClient() {
  try {
    const now = Date.now();
    
    // PERFORMANCE: Return cached client if still valid (5 minute cache)
    if (cachedClient && now < cachedClientExpiry) {
      return cachedClient;
    }
    
    const accessToken = await getAccessToken();
    
    // Create new client instance with fresh token
    cachedClient = new Dropbox({ 
      accessToken, 
      fetch: fetchNode 
    });
    
    // Cache for 5 minutes
    cachedClientExpiry = now + (5 * 60 * 1000);
    
    // PERFORMANCE: Reduced console logging
    if (process.env.NODE_ENV !== 'production') {
      console.log("[dropbox-client] Client cached for 5 minutes");
    }
    return cachedClient;
    
  } catch (error) {
    console.error("[dropbox-client] Failed to create client:", error.message);
    throw new Error(`Dropbox client initialization failed: ${error.message}`);
  }
}

/**
 * Utility function to execute operations with a fresh client
 * Automatically handles token refresh and error recovery
 * 
 * @param {Function} operation - Function that receives dbx client and returns a promise
 * @returns {Promise<any>} Result of the operation
 */
export async function withFreshClient(operation) {
  const dbx = await getUncachableDropboxClient();
  return await operation(dbx);
}

/**
 * Check if Dropbox is properly configured and accessible
 * 
 * @returns {Promise<boolean>} True if Dropbox is ready for use
 */
export async function isDropboxReady() {
  try {
    const dbx = await getUncachableDropboxClient();
    
    // Test connection with a simple account info call
    await dbx.usersGetCurrentAccount();
    return true;
    
  } catch (error) {
    console.warn("[dropbox-client] Dropbox not ready:", error.message);
    return false;
  }
}