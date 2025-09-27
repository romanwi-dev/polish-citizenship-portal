import express from 'express';
import { recordVersion, getVersions, restoreVersion, getLatestVersion, getVersionStats } from '../audit/versioning.js';

const router = express.Router();

/**
 * GET /api/versions/:caseId
 * Get all versions for a case, optionally filtered by entity
 */
router.get('/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    const { entity } = req.query;
    
    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: 'Case ID is required'
      });
    }

    const versions = await getVersions(caseId, entity as string);
    
    res.json({
      success: true,
      versions,
      count: versions.length
    });
  } catch (error) {
    console.error('[VERSIONS API] Get versions failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get versions',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/versions
 * Record a new version/change
 */
router.post('/', async (req, res) => {
  try {
    const { caseId, entity, dataBefore, dataAfter, actor, reason, fieldName } = req.body;
    
    if (!caseId || !entity || !actor) {
      return res.status(400).json({
        success: false,
        error: 'caseId, entity, and actor are required'
      });
    }

    const versionId = await recordVersion(
      caseId,
      entity,
      dataBefore,
      dataAfter,
      actor,
      reason,
      fieldName
    );
    
    res.status(201).json({
      success: true,
      versionId,
      message: 'Version recorded successfully'
    });
  } catch (error) {
    console.error('[VERSIONS API] Record version failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record version',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/versions/restore/:versionId
 * Restore a specific version
 */
router.post('/restore/:versionId', async (req, res) => {
  try {
    const { versionId } = req.params;
    const { actor, reason } = req.body;
    
    if (!versionId || !actor) {
      return res.status(400).json({
        success: false,
        error: 'Version ID and actor are required'
      });
    }

    const result = await restoreVersion(versionId, actor, reason);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to restore version',
        message: 'Could not restore the specified version'
      });
    }

    res.json({
      success: true,
      restoredData: result.restoredData,
      newVersionId: result.newVersionId,
      message: 'Version restored successfully'
    });
  } catch (error) {
    console.error('[VERSIONS API] Restore version failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore version',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/versions/:caseId/latest
 * Get the latest version for a specific entity
 */
router.get('/:caseId/latest', async (req, res) => {
  try {
    const { caseId } = req.params;
    const { entity } = req.query;
    
    if (!caseId || !entity) {
      return res.status(400).json({
        success: false,
        error: 'Case ID and entity are required'
      });
    }

    const version = await getLatestVersion(caseId, entity as string);
    
    if (!version) {
      return res.status(404).json({
        success: false,
        error: 'No versions found'
      });
    }

    res.json({
      success: true,
      version
    });
  } catch (error) {
    console.error('[VERSIONS API] Get latest version failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get latest version',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/versions/:caseId/stats
 * Get version statistics for a case
 */
router.get('/:caseId/stats', async (req, res) => {
  try {
    const { caseId } = req.params;
    
    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: 'Case ID is required'
      });
    }

    const stats = await getVersionStats(caseId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('[VERSIONS API] Get version stats failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get version stats',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;