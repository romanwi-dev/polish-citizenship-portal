import express from 'express';
import { db } from '../db.js';
import { casesIngestQueue, caseProgress } from '../../shared/schema.js';
import { eq, desc } from 'drizzle-orm';
import { scanDropboxCases, triggerManualSync } from '../ingest/dropbox-cases.js';
import { insertCasesIngestQueueSchema } from '../../shared/schema.js';

const router = express.Router();

// Get all ingest queue items
router.get('/ingest/queue', async (req, res) => {
  try {
    const queueItems = await db
      .select()
      .from(casesIngestQueue)
      .orderBy(desc(casesIngestQueue.createdAt));
    
    res.json({ success: true, items: queueItems });
  } catch (error: any) {
    console.error('Error fetching ingest queue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger manual sync from Dropbox
router.post('/ingest/sync', async (req, res) => {
  try {
    const result = await triggerManualSync();
    res.json({ 
      success: true, 
      processed: result.processed,
      errors: result.errors 
    });
  } catch (error: any) {
    console.error('Error triggering manual sync:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new case from ingest queue item
router.post('/ingest/:queueId/create-case', async (req, res) => {
  try {
    const { queueId } = req.params;
    const { userId } = req.body; // Admin who is processing it
    
    // Get queue item
    const queueItem = await db
      .select()
      .from(casesIngestQueue)
      .where(eq(casesIngestQueue.id, queueId))
      .limit(1);
    
    if (queueItem.length === 0) {
      return res.status(404).json({ success: false, error: 'Queue item not found' });
    }
    
    const item = queueItem[0];
    
    // Create new case in case_progress table
    const newCase = await db.insert(caseProgress).values({
      caseId: item.caseId || `CASE-${Date.now()}`,
      userId: null, // Will be set when client claims the case
      currentPhase: 'initial_assessment',
      overallProgress: 10,
      documentsCollected: item.fileCount || 0,
      documentsRequired: 12,
      nextSteps: [`Review documents from Dropbox folder: ${item.folderName}`],
      notes: `Created from Dropbox ingest: ${item.folderPath}`,
      clientName: item.clientName,
      clientEmail: item.clientEmail,
      serviceLevel: 'standard',
      difficulty: null,
      confidence: null,
      status: 'INTAKE'
    }).returning();
    
    // Update queue item status
    await db
      .update(casesIngestQueue)
      .set({
        status: 'created',
        linkedToCaseId: newCase[0].caseId,
        processedBy: userId,
        processedAt: new Date()
      })
      .where(eq(casesIngestQueue.id, queueId));
    
    res.json({ 
      success: true, 
      case: newCase[0],
      message: `Created case ${newCase[0].caseId} from Dropbox folder`
    });
  } catch (error: any) {
    console.error('Error creating case from ingest:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Link to existing case
router.post('/ingest/:queueId/link-case', async (req, res) => {
  try {
    const { queueId } = req.params;
    const { caseId, userId } = req.body;
    
    // Verify the target case exists
    const existingCase = await db
      .select()
      .from(caseProgress)
      .where(eq(caseProgress.caseId, caseId))
      .limit(1);
    
    if (existingCase.length === 0) {
      return res.status(404).json({ success: false, error: 'Target case not found' });
    }
    
    // Get queue item
    const queueItem = await db
      .select()
      .from(casesIngestQueue)
      .where(eq(casesIngestQueue.id, queueId))
      .limit(1);
    
    if (queueItem.length === 0) {
      return res.status(404).json({ success: false, error: 'Queue item not found' });
    }
    
    const item = queueItem[0];
    
    // Update existing case with new document count
    await db
      .update(caseProgress)
      .set({
        documentsCollected: (existingCase[0].documentsCollected || 0) + (item.fileCount || 0),
        notes: `${existingCase[0].notes || ''}\n\nLinked from Dropbox: ${item.folderPath} (${item.fileCount} files)`,
        updatedAt: new Date()
      })
      .where(eq(caseProgress.caseId, caseId));
    
    // Update queue item status
    await db
      .update(casesIngestQueue)
      .set({
        status: 'linked',
        linkedToCaseId: caseId,
        processedBy: userId,
        processedAt: new Date()
      })
      .where(eq(casesIngestQueue.id, queueId));
    
    res.json({ 
      success: true, 
      message: `Linked Dropbox folder to case ${caseId}. Added ${item.fileCount} documents.`
    });
  } catch (error: any) {
    console.error('Error linking case from ingest:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ignore queue item
router.post('/ingest/:queueId/ignore', async (req, res) => {
  try {
    const { queueId } = req.params;
    const { userId, reason } = req.body;
    
    // Update queue item status
    await db
      .update(casesIngestQueue)
      .set({
        status: 'ignored',
        processedBy: userId,
        processedAt: new Date()
      })
      .where(eq(casesIngestQueue.id, queueId));
    
    res.json({ 
      success: true, 
      message: 'Queue item marked as ignored'
    });
  } catch (error: any) {
    console.error('Error ignoring ingest item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;