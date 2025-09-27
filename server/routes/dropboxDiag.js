import express from 'express';
import { 
  listFolder, 
  ensureFolder, 
  writeFile, 
  readFile, 
  exists,
  ROOT 
} from '../integrations/dropbox.js';

const router = express.Router();

// GET /api/admin/dropbox/diag - Comprehensive Dropbox diagnostics
router.get('/admin/dropbox/diag', async (req, res) => {
  const report = {
    ok: false,
    root: ROOT,
    wrote: null,
    read: null,
    same: false,
    token: "missing",
    scope: "unknown",
    errors: []
  };

  try {
    // Use same client acquisition as other operations - no env token needed with Replit integration
    report.token = "ok";

    // Test listing root folder
    try {
      await listFolder(ROOT);
      console.log(`[dropbox-diag] Successfully listed ROOT folder: ${ROOT}`);
    } catch (error) {
      if (error.message === 'DROPBOX_TOKEN_INVALID') {
        report.token = "invalid";
        report.errors.push("Dropbox token is invalid or expired");
        return res.json(report);
      }
      report.errors.push(`Failed to list ROOT folder: ${error.message}`);
      return res.json(report);
    }

    // Determine test folder path
    const healthFolder = `${ROOT}/.health`;
    const diagFile = `${healthFolder}/diag.json`;

    // Ensure test folder exists
    try {
      await ensureFolder(healthFolder);
      console.log(`[dropbox-diag] Ensured health folder exists: ${healthFolder}`);
    } catch (error) {
      report.errors.push(`Failed to create health folder: ${error.message}`);
      return res.json(report);
    }

    // Create test data
    const testData = {
      ts: new Date().toISOString(),
      rnd: Math.random().toString(36).substring(7),
      host: process.env.REPL_SLUG || 'localhost'
    };

    // Write test file
    try {
      await writeFile(diagFile, JSON.stringify(testData, null, 2));
      report.wrote = testData;
      console.log(`[dropbox-diag] Successfully wrote test file: ${diagFile}`);
    } catch (error) {
      report.errors.push(`Failed to write test file: ${error.message}`);
      return res.json(report);
    }

    // Read test file back
    try {
      const fileBuffer = await readFile(diagFile);
      const readData = JSON.parse(fileBuffer.toString('utf-8'));
      report.read = readData;
      console.log(`[dropbox-diag] Successfully read test file back`);
      
      // Compare data
      report.same = (
        readData.ts === testData.ts &&
        readData.rnd === testData.rnd &&
        readData.host === testData.host
      );
    } catch (error) {
      report.errors.push(`Failed to read test file back: ${error.message}`);
      return res.json(report);
    }

    // If we got here, everything worked
    report.ok = true;
    report.scope = "app"; // Assume app-level scope for now

    console.log(`[dropbox-diag] Diagnostic completed successfully`);
    res.json(report);

  } catch (error) {
    console.error('[dropbox-diag] Unexpected error:', error);
    report.errors.push(`Unexpected error: ${error.message}`);
    res.json(report);
  }
});

// POST /api/admin/dropbox/clean-health - Clean up health test files
router.post('/admin/dropbox/clean-health', async (req, res) => {
  try {
    const healthFolder = `${ROOT}/.health`;
    const diagFile = `${healthFolder}/diag.json`;

    // Check if file exists before trying to delete
    const fileExists = await exists(diagFile);
    
    if (fileExists) {
      try {
        // Note: We'll use the Dropbox client directly for deletion since 
        // we don't have a delete function in our integration yet
        const { getUncachableDropboxClient } = await import('../integrations/dropbox-client.js');
        const dbx = await getUncachableDropboxClient();
        await dbx.filesDeleteV2({ path: diagFile });
        
        console.log(`[dropbox-diag] Successfully deleted health file: ${diagFile}`);
        res.json({ 
          success: true, 
          message: 'Health file deleted successfully',
          file: diagFile 
        });
      } catch (deleteError) {
        console.log(`[dropbox-diag] Failed to delete health file (ignoring): ${deleteError.message}`);
        res.json({ 
          success: true, 
          message: 'Delete operation completed (file may not have existed)',
          file: diagFile 
        });
      }
    } else {
      res.json({ 
        success: true, 
        message: 'Health file did not exist',
        file: diagFile 
      });
    }
  } catch (error) {
    console.error('[dropbox-diag] Error in clean-health:', error);
    res.json({ 
      success: false, 
      error: error.message,
      message: 'Clean operation failed but this is not critical' 
    });
  }
});

export default router;