import { putJson, norm, sanitizePath, ensureUnderRoot } from "../integrations/dropbox.js";
// Import the correct storage with database methods (not the mock storage)
// Use the same pattern as other files in the server directory

/**
 * Detect language preference from request headers
 * @param {Object} req - Express request object
 * @returns {string} Language code ('en' or 'pl')
 */
function detectLanguageFromRequest(req) {
  if (req && req.headers && req.headers['accept-language']) {
    const acceptLanguage = req.headers['accept-language'];
    // Check for Polish language variants (pl-PL, pl, etc.)
    if (acceptLanguage.toLowerCase().includes('pl')) {
      return 'pl';
    }
  }
  return 'en'; // Default fallback
}

const ROOT = process.env.DROPBOX_ROOT || "/CASES";

export default async function createAccounts(req, res) { 
  try {
    const { items } = req.body || {}; 
    if(!Array.isArray(items) || !items.length) return res.status(400).json({ok:false, error:"Invalid payload"});
    
    const created = [];
    for(const it of items){
      const caseId = (it.caseId || `C-${Date.now()}-${Math.random().toString(36).slice(2,6)}`).toUpperCase();
      
      // SECURITY: Enhanced path sanitization and confinement
      const originalPath = it.path || ROOT;
      const sanitizedBase = sanitizePath(originalPath.replace(/\/+$/, ""), caseId);
      const base = norm(sanitizedBase, caseId);
      const target = ensureUnderRoot(norm(`${base}/portal/case.json`, caseId));
      
      // SECURITY: Log path sanitization only in debug mode
      if (originalPath !== sanitizedBase && process.env.NODE_ENV !== 'production') {
        console.debug(`📝 Path sanitized for case ${caseId}: [REDACTED] → [REDACTED]`);
      }
      
      // Create Dropbox record
      const dropboxRecord = { 
        caseId, 
        client: {name: it.clientName || "", email: it.email || ""}, 
        processing: (it.processing || "standard").toLowerCase(), 
        difficulty: +(it.difficulty || 1), 
        clientScore: +(it.clientScore || 0), 
        preferredLanguage: it.preferredLanguage || detectLanguageFromRequest(req),
        source: "dropbox", 
        dropboxPath: base,
        originalPath: originalPath, // Keep track of original path 
        createdAt: new Date().toISOString() 
      };
      
      try {
        await putJson(target, dropboxRecord, caseId);
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`✅ Dropbox file created successfully: [REDACTED]`);
        } else {
          console.log(`✅ Dropbox file created successfully for case ${caseId}`);
        }
      } catch (pathError) {
        // SECURITY: Handle path-specific errors with minimal sensitive information
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`❌ Dropbox path error for case ${caseId}:`, {
            originalPath: '[REDACTED]',
            sanitizedPath: '[REDACTED]', 
            finalPath: '[REDACTED]',
            error: pathError.message
          });
        } else {
          console.error(`❌ Dropbox path error for case ${caseId}: ${pathError.message}`);
        }
        throw new Error(`Failed to create Dropbox entry for case ${caseId}: Path '${originalPath}' contains invalid characters. Sanitized to '${target}' but still invalid. Error: ${pathError.message}`);
      }
      
      // Create database entry for AI Agent Control Room
      const dbRecord = {
        caseId,
        currentPhase: 'initial_assessment',
        overallProgress: 5, // Just started
        documentsCollected: 0,
        documentsRequired: 12,
        documentsVerified: 0,
        translationsCompleted: 0,
        translationsRequired: 6,
        serviceLevel: dropboxRecord.processing,
        successProbability: Math.min(95, Math.max(50, dropboxRecord.clientScore + 15)),
        caseManager: 'AI System',
        lastActivityDate: new Date()
      };
      
      // Create service file (keep this working)
      const { ensureCaseProgress } = await import('../services/caseProgress.js');
      const serviceCase = await ensureCaseProgress(caseId);
      
      // Create database record via API call (uses existing working infrastructure)
      let dbCase = null;
      try {
        console.log(`🔄 Creating database record for case: ${caseId}`);
        
        // Store client name in caseManager field for display (not ideal naming but existing schema)
        const dbRecordForCaseProgress = {
          userId: '4c8c5ac2-ac09-46b4-a125-b9e391bdd0e3',
          caseId,
          currentPhase: 'initial_assessment',
          overallProgress: 5,
          documentsCollected: 0,
          documentsRequired: 12,
          caseManager: dropboxRecord.client.name // Client's family name like "GORNICKI" (using existing field)
        };

        // Use internal API call to create database record (avoids import issues)
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://localhost:5000/api/case-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dbRecordForCaseProgress)
        });
        
        if (response.ok) {
          const result = await response.json();
          dbCase = result.data;
          console.log(`✅ Database record created for case: ${caseId} (ID: ${dbCase.id})`);
        } else {
          throw new Error(`API call failed: ${response.status}`);
        }
      } catch (dbError) {
        console.error(`❌ Database record creation failed for ${caseId}:`, dbError?.message || 'Unknown error');
        console.error(`🚨 CRITICAL: Case will NOT appear in Cases Management UI without database record!`);
      }
      
      // Clear status logging for debugging
      const status = {
        dropbox: '✅ OK',
        serviceFile: '✅ OK', 
        database: dbCase ? '✅ OK' : '❌ FAILED',
        managementUI: dbCase ? '✅ WILL APPEAR' : '❌ WILL NOT APPEAR'
      };
      console.log(`📊 IMPORT STATUS: ${JSON.stringify(status)}`);
      console.log(`✅ Case created: ${caseId} → Ready for HAC`);
      
      created.push({ 
        caseId, 
        dropboxPath: target,
        databaseId: dbCase?.id || null,
        hacReady: true
      });
    }
    res.json({ ok: true, created });
  } catch(e) { 
    // SECURITY: Log errors with minimal sensitive information
    if (process.env.NODE_ENV !== 'production') {
      console.debug("Dropbox account creation error:", e.message);
    } else {
      console.error("Dropbox account creation error:", e.message || 'Unknown error');
    }
    
    // Provide specific error messages for path-related issues
    const isPathError = e.message && (e.message.includes('Invalid path') || e.message.includes('invalid characters'));
    
    if (isPathError) {
      res.status(400).json({ 
        ok: false, 
        error: "Invalid folder path", 
        details: e.message,
        suggestion: "Folder names cannot contain special characters like #, +, or (). Please rename the folder and try again."
      });
    } else {
      res.status(500).json({ 
        ok: false, 
        error: e.message || "Server error",
        type: "dropbox_creation_error"
      });
    }
  } 
};