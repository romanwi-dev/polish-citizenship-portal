import express from 'express';
import { 
  listFolder, 
  ensureFolder, 
  writeFile,
  getJson,
  putJsonEnhanced,
  ROOT 
} from '../integrations/dropbox.js';
import { checkAdminAuth } from '../lib/devAuth.js';

const router = express.Router();

// Admin authentication middleware
const requireAdminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'] || '';
  if (!checkAdminAuth(token)) {
    return res.status(401).json({
      ok: false,
      error: 'UNAUTHORIZED: Admin access required'
    });
  }
  next();
};

// POST /api/admin/import/smoke - Import first 2 clients for smoke testing
router.post('/admin/import/smoke', requireAdminAuth, async (req, res) => {
  const summary = {
    scanned: 0,
    created: [],
    updated: [],
    errors: []
  };

  try {
    console.log(`[import-smoke] Starting smoke test import from ROOT: ${ROOT}`);

    // List folders in ROOT, excluding .health
    let rootEntries;
    try {
      const result = await listFolder(ROOT);
      rootEntries = result.entries || [];
    } catch (error) {
      summary.errors.push(`Failed to list ROOT folder: ${error.message}`);
      return res.json(summary);
    }

    // Filter to get first 2 folders (exclude .health and files)
    const folders = rootEntries
      .filter(entry => entry['.tag'] === 'folder' && !entry.name.startsWith('.'))
      .slice(0, 2);

    summary.scanned = folders.length;
    console.log(`[import-smoke] Found ${folders.length} folders to process`);

    for (const folder of folders) {
      try {
        const folderName = folder.name;
        const folderPath = folder.path_lower || folder.path_display;
        const caseId = folderName; // Use folder name as caseId
        
        console.log(`[import-smoke] Processing folder: ${folderName}`);

        // Ensure portal structure exists
        const portalPath = `${folderPath}/portal`;
        const caseJsonPath = `${portalPath}/case.json`;

        try {
          await ensureFolder(portalPath);
          console.log(`[import-smoke] Ensured portal folder: ${portalPath}`);
        } catch (folderError) {
          console.error(`[import-smoke] Failed to create portal folder for ${folderName}:`, folderError);
          summary.errors.push(`Failed to create portal folder for ${folderName}: ${folderError.message}`);
          continue;
        }

        // Check if case.json already exists
        let existingCase = null;
        try {
          existingCase = await getJson(caseJsonPath);
        } catch (error) {
          // File doesn't exist, which is fine
        }

        // Create or merge case data
        const caseData = {
          caseId: caseId,
          clientName: existingCase?.clientName || `Client ${caseId}`,
          status: existingCase?.status || 'imported',
          createdAt: existingCase?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: 'dropbox_smoke_test',
          folderPath: folderPath,
          portalPath: portalPath,
          ...(existingCase || {}) // Preserve existing data
        };

        // Write case.json
        try {
          await putJsonEnhanced(caseJsonPath, caseData);
          
          if (existingCase) {
            summary.updated.push(caseId);
            console.log(`[import-smoke] Updated existing case: ${caseId}`);
          } else {
            summary.created.push(caseId);
            console.log(`[import-smoke] Created new case: ${caseId}`);
          }
        } catch (writeError) {
          console.error(`[import-smoke] Failed to write case.json for ${folderName}:`, writeError);
          summary.errors.push(`Failed to write case.json for ${folderName}: ${writeError.message}`);
        }

      } catch (folderError) {
        console.error(`[import-smoke] Error processing folder ${folder.name}:`, folderError);
        summary.errors.push(`Error processing folder ${folder.name}: ${folderError.message}`);
      }
    }

    console.log(`[import-smoke] Smoke test completed:`, summary);
    res.json(summary);

  } catch (error) {
    console.error('[import-smoke] Unexpected error:', error);
    summary.errors.push(`Unexpected error: ${error.message}`);
    res.json(summary);
  }
});

// POST /api/admin/import/dry-run - Simulate import without writing to show what would be created
router.post('/admin/import/dry-run', requireAdminAuth, async (req, res) => {
  const results = {
    wouldCreate: [],
    wouldUpdate: [],
    errors: [],
    scanned: 0
  };

  try {
    console.log(`[dry-run-import] Starting dry-run import analysis from ROOT: ${ROOT}`);

    // List folders in ROOT
    let rootEntries;
    try {
      const result = await listFolder(ROOT);
      rootEntries = result.entries || [];
    } catch (error) {
      results.errors.push(`Failed to list ROOT folder: ${error.message}`);
      return res.json(results);
    }

    // Filter to get folders (exclude .health and files)
    const folders = rootEntries
      .filter(entry => entry['.tag'] === 'folder' && !entry.name.startsWith('.'));

    results.scanned = folders.length;
    console.log(`[dry-run-import] Found ${folders.length} folders to analyze`);

    for (const folder of folders) {
      try {
        const folderName = folder.name;
        const folderPath = folder.path_lower || folder.path_display;
        const caseId = folderName;
        
        console.log(`[dry-run-import] Analyzing folder: ${folderName}`);

        // Parse client info from folder name
        const clientInfo = parseClientFromFolderName(folderName);
        
        // Check if case.json would exist
        const portalPath = `${folderPath}/portal`;
        const caseJsonPath = `${portalPath}/case.json`;
        
        let existingCase = null;
        try {
          existingCase = await getJson(caseJsonPath);
        } catch (error) {
          // File doesn't exist
        }

        const caseData = {
          caseId: caseId,
          clientName: clientInfo.clientName || `Client ${caseId}`,
          email: clientInfo.email || '',
          status: 'imported',
          difficulty: clientInfo.difficulty || 2,
          clientScore: clientInfo.score || 50,
          processing: clientInfo.processing || 'standard',
          dropboxPath: folderPath,
          portalPath: portalPath,
          source: 'dropbox_import',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (existingCase) {
          // Would update existing
          const changes = [];
          if (existingCase.clientName !== caseData.clientName) changes.push('clientName');
          if (existingCase.status !== caseData.status) changes.push('status');
          if (existingCase.difficulty !== caseData.difficulty) changes.push('difficulty');
          
          results.wouldUpdate.push({
            ...caseData,
            changes: changes,
            existingData: existingCase
          });
        } else {
          // Would create new
          results.wouldCreate.push(caseData);
        }

      } catch (folderError) {
        console.error(`[dry-run-import] Error analyzing folder ${folder.name}:`, folderError);
        results.errors.push(`Error analyzing folder ${folder.name}: ${folderError.message}`);
      }
    }

    console.log(`[dry-run-import] Dry-run analysis completed:`, {
      scanned: results.scanned,
      wouldCreate: results.wouldCreate.length,
      wouldUpdate: results.wouldUpdate.length,
      errors: results.errors.length
    });
    
    res.json(results);

  } catch (error) {
    console.error('[dry-run-import] Unexpected error:', error);
    results.errors.push(`Unexpected error: ${error.message}`);
    res.json(results);
  }
});

// Helper function to parse client info from folder name
function parseClientFromFolderName(folderName) {
  const cleaned = folderName.replace(/[_\-\(\)]/g, ' ').trim();
  const parts = cleaned.split(' ').filter(p => p.length > 0);
  
  let clientName = parts.slice(0, 2).join(' ') || folderName;
  let email = '';
  let difficulty = 2;
  let score = 50;
  let processing = 'standard';
  
  // Try to extract email if present
  const emailMatch = folderName.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    email = emailMatch[1];
  }
  
  // Try to extract difficulty (D1, D2, etc.)
  const difficultyMatch = folderName.match(/D([1-5])/i);
  if (difficultyMatch) {
    difficulty = parseInt(difficultyMatch[1]);
  }
  
  // Try to extract score (S50, S75, etc.)
  const scoreMatch = folderName.match(/S(\d{1,3})/i);
  if (scoreMatch) {
    score = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
  }
  
  // Try to extract processing type
  if (folderName.toLowerCase().includes('vip+')) {
    processing = 'vip+';
  } else if (folderName.toLowerCase().includes('vip')) {
    processing = 'vip';
  } else if (folderName.toLowerCase().includes('exp')) {
    processing = 'expedited';
  }
  
  return {
    clientName,
    email,
    difficulty,
    score,
    processing
  };
}

export default router;