const fetchNode = (...a)=>import("node-fetch").then(({default:f})=>f(...a));
import crypto from "crypto";
import { readTokens, saveTokens } from "./dropbox-tokens.js";

const AUTH_BASE = "https://www.dropbox.com/oauth2";
const TOKEN_BASE = "https://api.dropboxapi.com/oauth2";
const APP_KEY = process.env.DROPBOX_APP_KEY;
const APP_SECRET = process.env.DROPBOX_APP_SECRET;
const REDIRECT = process.env.DROPBOX_REDIRECT_URI;

// Generate secure state parameter for CSRF protection
function generateStateParameter(){
  return crypto.randomBytes(32).toString('hex');
}

function getAuthUrl(state){
  const qs = new URLSearchParams({
    response_type:"code", 
    client_id:APP_KEY, 
    redirect_uri:REDIRECT,
    token_access_type:"offline",
    scope:"files.metadata.read files.content.read files.content.write account_info.read",
    state: state // Add state parameter for CSRF protection
  }).toString();
  const url = `${AUTH_BASE}/authorize?${qs}`;
  console.log("[dbx] authorize with state:", url);
  return url;
}

async function exchange(code, state, expectedState){
  // Verify state parameter to prevent CSRF attacks
  if (!state || !expectedState || state !== expectedState) {
    throw new Error("Invalid state parameter - possible CSRF attack");
  }
  
  const body = new URLSearchParams({ 
    code, 
    grant_type:"authorization_code", 
    client_id:APP_KEY, 
    client_secret:APP_SECRET, 
    redirect_uri:REDIRECT 
  });
  const r = await fetchNode(`${TOKEN_BASE}/token`, { 
    method:"POST", 
    headers:{ "Content-Type":"application/x-www-form-urlencoded" }, 
    body 
  });
  const j = await r.json();
  if(!r.ok) throw new Error(j.error_description||"token exchange failed");
  saveTokens({ ...j, created_at: Date.now() });
  console.log("[dbx] token exchange successful with CSRF protection");
  return j;
}

async function refresh(){
  const t = readTokens();
  if(!t?.refresh_token) throw new Error("no refresh token");
  const body = new URLSearchParams({ 
    refresh_token:t.refresh_token, 
    grant_type:"refresh_token", 
    client_id:APP_KEY, 
    client_secret:APP_SECRET 
  });
  const r = await fetchNode(`${TOKEN_BASE}/token`, { 
    method:"POST", 
    headers:{ "Content-Type":"application/x-www-form-urlencoded" }, 
    body 
  });
  const j = await r.json();
  if(!r.ok) throw new Error(j.error_description||"refresh failed");
  saveTokens({ ...t, ...j, refreshed_at: Date.now() });
  return j;
}

async function getAccessToken(){
  const t = readTokens();
  if(!t?.access_token) throw new Error("not connected");
  const base = t.refreshed_at || t.created_at || Date.now();
  const age = (Date.now()-base)/1000;
  const ttl = t.expires_in ?? 14400;
  if (age > ttl - 60) { 
    const j = await refresh(); 
    return j.access_token; 
  }
  return t.access_token;
}

export { getAuthUrl, exchange, refresh, getAccessToken, generateStateParameter };