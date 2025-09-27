/**
 * API routes for Dropbox ingest system
 */

import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';

const router = Router();

// Validation schemas
const linkSuggestionSchema = z.object({
  suggestionId: z.string(),
  caseId: z.string(),
  slotKey: z.string()
});

const ignoreSuggestionSchema = z.object({
  suggestionId: z.string(),
  reason: z.string().min(1)
});

const createCaseSchema = z.object({
  fromSuggestionId: z.string(),
  caseData: z.object({
    name: z.string(),
    email: z.string().email(),
    code: z.string().optional()
  })
});

// Get all suggestions
router.get('/suggestions', async (req, res) => {
  try {
    // Mock response for now - replace with actual database query
    const suggestions = [];
    res.json({ suggestions });
  } catch (error) {
    console.error('Failed to get suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Link suggestion to case
router.post('/link', async (req, res) => {
  try {
    const { suggestionId, caseId, slotKey } = linkSuggestionSchema.parse(req.body);
    
    // Get case data
    const caseData = await storage.getCaseById(caseId);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    // Mock suggestion data - replace with actual lookup
    const suggestion = {
      id: suggestionId,
      dropboxPath: '/CASES/MOCK/document.pdf',
      sha256: 'mock_hash',
      displayName: 'document.pdf',
      size: 1024,
      mime: 'application/pdf'
    };
    
    // Update case documents
    const updatedDocuments = {
      ...caseData.documents,
      [slotKey]: {
        ...caseData.documents?.[slotKey],
        attachment: {
          dropboxPath: suggestion.dropboxPath,
          sha256: suggestion.sha256,
          name: suggestion.displayName,
          size: suggestion.size,
          mime: suggestion.mime,
          linkedAt: new Date().toISOString()
        }
      }
    };
    
    await storage.updateCase(caseId, { documents: updatedDocuments });
    
    // TODO: Mark suggestion as linked in ingest database
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to link suggestion:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to link suggestion' });
  }
});

// Ignore suggestion
router.post('/ignore', async (req, res) => {
  try {
    const { suggestionId, reason } = ignoreSuggestionSchema.parse(req.body);
    
    // TODO: Mark suggestion as ignored in ingest database
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to ignore suggestion:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to ignore suggestion' });
  }
});

// Create new case from suggestion
router.post('/create-case', async (req, res) => {
  try {
    const { fromSuggestionId, caseData } = createCaseSchema.parse(req.body);
    
    // Create new case
    const newCase = await storage.createCase({
      ...caseData,
      stage: 'initial',
      tier: 'bronze',
      score: 0,
      ageMonths: 0,
      processing: false,
      state: 'active',
      documents: {}
    });
    
    // TODO: Link the suggestion to the new case
    
    res.json({ success: true, caseId: newCase.id });
  } catch (error) {
    console.error('Failed to create case:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create case' });
  }
});

export { router as ingestRoutes };