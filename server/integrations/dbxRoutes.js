import express from "express";
import { getAuthUrl, exchange, generateStateParameter } from "./dropbox-oauth.js";
import { readTokens } from "./dropbox-tokens.js";

const router = express.Router();

router.get("/status", (req, res) => { 
  const t = readTokens(); 
  res.json({ 
    mode: "oauth", 
    connected: !!(t && t.access_token), 
    root: process.env.DROPBOX_ROOT || "/CASES" 
  }); 
});

router.get("/authorize", (req, res) => {
  // Generate secure state parameter for CSRF protection
  const state = generateStateParameter();
  
  // Store state in secure httpOnly cookie
  res.cookie('dropbox_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000 // 10 minutes
  });
  
  console.log("[dbx] Generated OAuth state and stored in secure cookie");
  res.redirect(getAuthUrl(state));
});

router.get("/callback", async (req, res) => { 
  try { 
    const { code, state } = req.query;
    const expectedState = req.cookies?.dropbox_oauth_state;
    
    // Clear the state cookie immediately
    res.clearCookie('dropbox_oauth_state');
    
    if (!code) {
      throw new Error("No authorization code received");
    }
    
    // Exchange code with state verification
    await exchange(code, state, expectedState);
    
    console.log("[dbx] OAuth callback successful with CSRF protection verified");
    res.redirect("/admin/imports/dropbox"); 
  } catch(e) { 
    console.error("[dbx] OAuth callback error:", e.message); 
    res.status(500).send(`Dropbox connect failed: ${e.message}`); 
  } 
});

export default router;