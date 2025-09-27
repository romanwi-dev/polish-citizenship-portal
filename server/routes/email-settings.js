/**
 * Email Notification Settings API Routes
 * Provides admin controls for HAC and case management email notifications
 */

import express from 'express';
import { triggerStageChange } from '../notify/case-monitor.js';
import { loadSettings, saveSettings, sendNewHACNotification, sendHACApprovalNotification, sendCaseStageChangeNotification } from '../notify/email.js';

const router = express.Router();

// GET /api/admin/email-settings - Get current email notification settings
router.get('/admin/email-settings', async (req, res) => {
  try {
    const settings = await loadSettings();
    
    res.json({
      success: true,
      settings: settings,
      message: 'Email notification settings retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error loading email settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load email notification settings',
      details: error.message
    });
  }
});

// PUT /api/admin/email-settings - Update email notification settings
router.put('/admin/email-settings', async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid settings payload. Expected an object with notification preferences.'
      });
    }

    // Validate settings structure
    const validKeys = [
      'globalEnabled',
      'hacNotifications',
      'caseNotifications', 
      'romanEmail'
    ];

    const filteredSettings = {};
    for (const key of validKeys) {
      if (key in settings) {
        filteredSettings[key] = settings[key];
      }
    }

    // Load current settings and merge with new ones
    const currentSettings = await loadSettings();
    const updatedSettings = { 
      ...currentSettings, 
      ...filteredSettings,
      lastUpdated: new Date().toISOString(),
      updatedBy: req.user?.email || req.ip || 'admin'
    };

    await saveSettings(updatedSettings);

    console.log('📧 Email notification settings updated:', {
      globalEnabled: updatedSettings.globalEnabled,
      hacNotifications: updatedSettings.hacNotifications,
      caseNotifications: updatedSettings.caseNotifications,
      romanEmail: updatedSettings.romanEmail ? '[SET]' : '[NOT SET]'
    });

    res.json({
      success: true,
      settings: updatedSettings,
      message: 'Email notification settings updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating email settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update email notification settings',
      details: error.message
    });
  }
});

// POST /api/admin/trigger-stage-change - Manual stage change trigger for testing
router.post('/admin/trigger-stage-change', async (req, res) => {
  try {
    const { caseId, newStage, notes } = req.body;
    
    if (!caseId || !newStage) {
      return res.status(400).json({
        success: false,
        error: 'Both caseId and newStage are required'
      });
    }

    const validStages = [
      'initial_assessment',
      'document_collection', 
      'archive_search',
      'translation',
      'submission',
      'review', 
      'decision',
      'completed'
    ];

    if (!validStages.includes(newStage)) {
      return res.status(400).json({
        success: false,
        error: `Invalid stage. Must be one of: ${validStages.join(', ')}`
      });
    }

    const result = await triggerStageChange(caseId, newStage, notes || '');
    
    res.json({
      success: result.success,
      message: result.success ? 
        `Stage change triggered for case ${caseId}` : 
        'Failed to trigger stage change',
      result: result,
      caseId: caseId,
      newStage: newStage,
      emailNotificationSent: result.stageChange?.emailResult?.success || false
    });
  } catch (error) {
    console.error('❌ Error triggering stage change:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger stage change',
      details: error.message
    });
  }
});

// POST /api/admin/test-hac-notification - Test HAC notifications
router.post('/admin/test-hac-notification', async (req, res) => {
  try {
    const { type, caseId } = req.body;
    
    if (!type || !caseId) {
      return res.status(400).json({
        success: false,
        error: 'Both type and caseId are required'
      });
    }

    let result;
    
    if (type === 'new_request') {
      // Create mock HAC request for testing
      const mockHACRequest = {
        id: `test_${Date.now()}`,
        caseId: caseId,
        type: 'case_update',
        payload: { test: 'data', testMode: true },
        submittedAt: new Date().toISOString(),
        submittedBy: 'admin-test',
        status: 'pending'
      };
      
      result = await sendNewHACNotification(mockHACRequest);
      
    } else if (type === 'approval') {
      // Create mock approved HAC request for testing
      const mockHACRequest = {
        id: `test_${Date.now()}`,
        caseId: caseId,
        type: 'case_update',
        payload: { test: 'data', testMode: true },
        submittedAt: new Date().toISOString(),
        submittedBy: 'admin-test',
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: 'admin-test',
        comments: 'This is a test notification'
      };
      
      result = await sendHACApprovalNotification(mockHACRequest);
      
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be either "new_request" or "approval"'
      });
    }

    res.json({
      success: true,
      message: `Test ${type} notification sent`,
      result: result,
      type: type,
      caseId: caseId
    });
  } catch (error) {
    console.error('❌ Error sending test HAC notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test HAC notification',
      details: error.message
    });
  }
});

// POST /api/admin/test-stage-notification - Test stage change notifications
router.post('/admin/test-stage-notification', async (req, res) => {
  try {
    const { caseId, oldStage, newStage, notes } = req.body;
    
    if (!caseId || !oldStage || !newStage) {
      return res.status(400).json({
        success: false,
        error: 'caseId, oldStage, and newStage are all required'
      });
    }

    const result = await sendCaseStageChangeNotification(
      caseId, 
      oldStage, 
      newStage, 
      notes || 'This is a test notification'
    );

    res.json({
      success: true,
      message: 'Test stage change notification sent',
      result: result,
      caseId: caseId,
      stageChange: `${oldStage} → ${newStage}`
    });
  } catch (error) {
    console.error('❌ Error sending test stage notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test stage notification', 
      details: error.message
    });
  }
});

// GET /api/admin/notification-test-data - Get test data for notification testing
router.get('/admin/notification-test-data', async (req, res) => {
  try {
    const testData = {
      sampleCaseIds: [
        'TEST-123',
        'C-1234567890-ABCD',
        'DEMO-CASE-001'
      ],
      availableStages: [
        'initial_assessment',
        'document_collection',
        'archive_search', 
        'translation',
        'submission',
        'review',
        'decision',
        'completed'
      ],
      hacTypes: [
        'case_update',
        'tree_update', 
        'document_update',
        'status_change'
      ],
      testEmailTemplates: [
        'newHACRequest',
        'hacApproved',
        'caseStageChange'
      ]
    };

    res.json({
      success: true,
      testData: testData,
      message: 'Test data for notification system retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting test data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get test data',
      details: error.message
    });
  }
});

export default router;