/**
 * Case Stage Change Detection and Monitoring System
 * Monitors case.json files for stage/status changes and triggers email notifications
 */

import fs from 'fs/promises';
import path from 'path';
import { sendCaseStageChangeNotification } from './email.js';

/**
 * Detect stage changes and trigger notifications
 * @param {string} caseId - Case identifier
 * @param {Object} oldCaseData - Previous case data
 * @param {Object} newCaseData - Updated case data
 */
async function detectAndNotifyStageChanges(caseId, oldCaseData, newCaseData) {
  try {
    const oldStage = oldCaseData?.status || oldCaseData?.currentPhase || oldCaseData?.stage || 'unknown';
    const newStage = newCaseData?.status || newCaseData?.currentPhase || newCaseData?.stage || 'unknown';
    
    // Check if stage actually changed
    if (oldStage !== newStage && newStage !== 'unknown') {
      console.log(`🔄 Stage change detected for case ${caseId}: ${oldStage} → ${newStage}`);
      
      // Extract any notes or comments
      const notes = newCaseData?.notes || newCaseData?.comments || newCaseData?.lastUpdate?.notes || '';
      
      // Send stage change notification
      const emailResult = await sendCaseStageChangeNotification(caseId, oldStage, newStage, notes);
      console.log('📧 Stage change notification result:', emailResult);
      
      return {
        changed: true,
        oldStage,
        newStage,
        emailResult,
        caseId
      };
    } else {
      console.log(`📝 Case ${caseId} updated but no stage change detected`);
      return {
        changed: false,
        oldStage,
        newStage: oldStage,
        caseId
      };
    }
  } catch (error) {
    console.error('❌ Error detecting/notifying stage changes:', error);
    return {
      changed: false,
      error: error.message,
      caseId
    };
  }
}

/**
 * Monitor case.json file updates with stage change detection
 * @param {string} caseId - Case identifier
 * @param {Object} newCaseData - Updated case data to save
 * @param {string} caseFilePath - Path to case.json file
 */
async function updateCaseWithStageMonitoring(caseId, newCaseData, caseFilePath) {
  let oldCaseData = {};
  let stageChangeResult = null;

  try {
    // Read existing case data if file exists
    try {
      const existingContent = await fs.readFile(caseFilePath, 'utf8');
      oldCaseData = JSON.parse(existingContent);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn(`⚠️ Warning reading existing case file for ${caseId}:`, error.message);
      }
      // If file doesn't exist, oldCaseData remains empty
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(caseFilePath), { recursive: true });

    // Add update metadata
    const updatedCaseData = {
      ...newCaseData,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: 'Case Management System'
    };

    // Write the updated case data
    await fs.writeFile(caseFilePath, JSON.stringify(updatedCaseData, null, 2), 'utf8');

    // Detect and notify stage changes
    stageChangeResult = await detectAndNotifyStageChanges(caseId, oldCaseData, updatedCaseData);

    console.log(`✅ Case ${caseId} updated successfully`);
    
    return {
      success: true,
      caseId,
      oldData: oldCaseData,
      newData: updatedCaseData,
      stageChange: stageChangeResult
    };

  } catch (error) {
    console.error(`❌ Error updating case ${caseId}:`, error);
    return {
      success: false,
      caseId,
      error: error.message,
      stageChange: stageChangeResult
    };
  }
}

/**
 * Convenience function for updating case.json in standard case directory structure
 * @param {string} caseId - Case identifier
 * @param {Object} newCaseData - Updated case data
 */
async function updateStandardCaseFile(caseId, newCaseData) {
  const caseFilePath = path.join(process.cwd(), 'data', 'cases', caseId, 'case.json');
  return await updateCaseWithStageMonitoring(caseId, newCaseData, caseFilePath);
}

/**
 * Manual stage change trigger for admin use
 * @param {string} caseId - Case identifier  
 * @param {string} newStage - New stage to set
 * @param {string} notes - Optional notes about the change
 */
async function triggerStageChange(caseId, newStage, notes = '') {
  try {
    const caseFilePath = path.join(process.cwd(), 'data', 'cases', caseId, 'case.json');
    
    // Read existing case data
    let caseData = {};
    try {
      const existingContent = await fs.readFile(caseFilePath, 'utf8');
      caseData = JSON.parse(existingContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Create new case if it doesn't exist
        caseData = { caseId, createdAt: new Date().toISOString() };
      } else {
        throw error;
      }
    }

    // Update stage and add notes
    const updatedCaseData = {
      ...caseData,
      status: newStage,
      currentPhase: newStage,
      stage: newStage,
      notes: notes,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: 'Admin Manual Update'
    };

    // Use the monitoring function to update and detect changes
    const result = await updateCaseWithStageMonitoring(caseId, updatedCaseData, caseFilePath);
    
    console.log(`🎯 Manual stage change triggered for case ${caseId}: → ${newStage}`);
    
    return result;

  } catch (error) {
    console.error(`❌ Error triggering stage change for case ${caseId}:`, error);
    return {
      success: false,
      caseId,
      error: error.message
    };
  }
}

export {
  detectAndNotifyStageChanges,
  updateCaseWithStageMonitoring,
  updateStandardCaseFile,
  triggerStageChange
};