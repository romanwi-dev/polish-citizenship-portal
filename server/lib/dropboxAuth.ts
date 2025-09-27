/**
 * Complete Dropbox OAuth2 implementation with file-based token persistence
 * Supports full OAuth flow: authorize → callback → refresh tokens
 */

import fs from 'fs/promises';
import path from 'path';

interface DropboxTokenData {
  refresh_token: string;
  access_token: string;
  expires_at: number; // timestamp
}

const TOKEN_FILE_PATH = path.join(process.cwd(), 'data', 'dropbox.json');

/**
 * Get current access token, refreshing if necessary
 * @returns Promise<string> Valid access token
 * @throws Error if refresh fails or no tokens available
 */
export async function getDropboxAccessToken(): Promise<string> {
  try {
    // Read existing token data
    const tokenData = await readTokenData();
    if (!tokenData) {
      throw new Error('No Dropbox tokens found. Please connect your Dropbox account first.');
    }

    // Check if current token is still valid (with 60 second buffer)
    if (tokenData.access_token && Date.now() < tokenData.expires_at - 60_000) {
      return tokenData.access_token;
    }

    // Need to refresh token
    console.log('[dropboxAuth] Access token expired, refreshing...');
    return await refreshAccessToken(tokenData);

  } catch (error) {
    console.error('[dropboxAuth] Failed to get access token:', error);
    throw error;
  }
}

/**
 * Refresh access token using stored refresh token
 */
async function refreshAccessToken(tokenData: DropboxTokenData): Promise<string> {
  const appKey = process.env.DROPBOX_APP_KEY;
  const appSecret = process.env.DROPBOX_APP_SECRET;

  if (!appKey || !appSecret) {
    throw new Error('Missing Dropbox OAuth environment variables: DROPBOX_APP_KEY, DROPBOX_APP_SECRET');
  }

  try {
    // Create Basic Auth header
    const credentials = Buffer.from(`${appKey}:${appSecret}`).toString('base64');
    
    // Prepare form data for token refresh
    const formData = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token
    });

    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
    }

    const tokenResponse = await response.json();
    
    if (!tokenResponse.access_token || !tokenResponse.expires_in) {
      throw new Error('Invalid token response: missing access_token or expires_in');
    }

    // Update token data with new access token
    const updatedTokenData: DropboxTokenData = {
      ...tokenData,
      access_token: tokenResponse.access_token,
      expires_at: Date.now() + (tokenResponse.expires_in * 1000)
    };

    // Save updated tokens
    await saveTokenData(updatedTokenData);

    console.log(`[dropboxAuth] Token refreshed successfully, expires in ${tokenResponse.expires_in} seconds`);
    return updatedTokenData.access_token;

  } catch (error) {
    console.error('[dropboxAuth] Token refresh failed:', error);
    throw error;
  }
}

/**
 * Exchange authorization code for tokens (OAuth callback)
 */
export async function exchangeCodeForTokens(code: string): Promise<void> {
  const appKey = process.env.DROPBOX_APP_KEY;
  const appSecret = process.env.DROPBOX_APP_SECRET || process.env.Dropbox_APP_SECRET;
  const appUrl = process.env.APP_URL;

  if (!appKey || !appSecret || !appUrl) {
    throw new Error('Missing required environment variables: DROPBOX_APP_KEY, DROPBOX_APP_SECRET, APP_URL');
  }

  const redirectUri = `${appUrl}/api/dropbox/oauth/callback`;

  try {
    const formData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: appKey,
      client_secret: appSecret,
      redirect_uri: redirectUri
    });

    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const tokenResponse = await response.json();
    
    if (!tokenResponse.access_token || !tokenResponse.refresh_token || !tokenResponse.expires_in) {
      throw new Error('Invalid token response: missing required fields');
    }

    // Save tokens to file
    const tokenData: DropboxTokenData = {
      refresh_token: tokenResponse.refresh_token,
      access_token: tokenResponse.access_token,
      expires_at: Date.now() + (tokenResponse.expires_in * 1000)
    };

    await saveTokenData(tokenData);
    console.log('[dropboxAuth] OAuth tokens saved successfully');

  } catch (error) {
    console.error('[dropboxAuth] Code exchange failed:', error);
    throw error;
  }
}

/**
 * Test Dropbox connection with current token
 */
export async function testDropboxConnection(): Promise<{ok: boolean, note?: string}> {
  try {
    const token = await getDropboxAccessToken();
    
    const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: 'null'
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        ok: false, 
        note: `API call failed: ${response.status} ${errorText}` 
      };
    }

    const accountInfo = await response.json();
    return { 
      ok: true, 
      note: `Connected as ${accountInfo.name?.display_name || accountInfo.email}` 
    };

  } catch (error) {
    if (error instanceof Error && error.message.includes('No Dropbox tokens found')) {
      return { 
        ok: false, 
        note: 'not_connected' 
      };
    }
    
    if (error instanceof Error && error.message.includes('Missing Dropbox OAuth environment variables')) {
      return { 
        ok: false, 
        note: 'missing_env_vars' 
      };
    }
    
    return { 
      ok: false, 
      note: 'refresh_failed' 
    };
  }
}

/**
 * Check if Dropbox is connected (tokens exist)
 */
export async function isDropboxConnected(): Promise<boolean> {
  try {
    const tokenData = await readTokenData();
    return !!tokenData?.refresh_token;
  } catch {
    return false;
  }
}

/**
 * Get OAuth authorization URL
 */
export function getOAuthUrl(): string {
  const appKey = process.env.DROPBOX_APP_KEY;
  const appUrl = process.env.APP_URL;

  if (!appKey || !appUrl) {
    throw new Error('Missing required environment variables: DROPBOX_APP_KEY, APP_URL');
  }

  const redirectUri = `${appUrl}/api/dropbox/oauth/callback`;
  
  return `https://www.dropbox.com/oauth2/authorize?` +
    `client_id=${encodeURIComponent(appKey)}&` +
    `response_type=code&` +
    `token_access_type=offline&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}`;
}

/**
 * Read token data from file
 */
async function readTokenData(): Promise<DropboxTokenData | null> {
  try {
    const data = await fs.readFile(TOKEN_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or can't be read
    return null;
  }
}

/**
 * Save token data to file
 */
async function saveTokenData(tokenData: DropboxTokenData): Promise<void> {
  // Ensure data directory exists
  const dataDir = path.dirname(TOKEN_FILE_PATH);
  await fs.mkdir(dataDir, { recursive: true });
  
  // Save tokens
  await fs.writeFile(TOKEN_FILE_PATH, JSON.stringify(tokenData, null, 2), 'utf-8');
}

/**
 * Clear stored tokens (for testing or disconnection)
 */
export async function clearTokens(): Promise<void> {
  try {
    await fs.unlink(TOKEN_FILE_PATH);
    console.log('[dropboxAuth] Tokens cleared');
  } catch (error) {
    // File doesn't exist - that's fine
  }
}