import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Schema for dashboard progress data
const DashboardProgressSchema = z.object({
  clientData: z.object({
    firstNames: z.string().optional(),
    lastName: z.string().optional(),
    maidenName: z.string().optional(),
    birthDate: z.string().optional(),
    birthPlace: z.string().optional(),
    passportNumber: z.string().optional(),
    spouseFirstNames: z.string().optional(),
    spouseLastName: z.string().optional(),
    spouseFullName: z.string().optional(),
    dateOfMarriage: z.string().optional(),
    placeOfMarriage: z.string().optional(),
    email: z.string().optional(),
    mobilePhone: z.string().optional(),
    gender: z.string().optional(),
    maritalStatus: z.string().optional(),
  }).nullable(),
  familyTreeData: z.object({
    applicantName: z.string().optional(),
    applicantBirthDate: z.string().optional(),
    applicantBirthPlace: z.string().optional(),
    polishParentName: z.string().optional(),
    polishParentBirthDate: z.string().optional(),
    polishParentBirthPlace: z.string().optional(),
  }).optional(),
});

// Auto-save dashboard progress
router.post('/save-progress', async (req, res) => {
  try {
    const validatedData = DashboardProgressSchema.parse(req.body);
    
    // In a real application, you would save this to the database
    // For now, we'll just acknowledge the save
    console.log('Dashboard progress saved:', {
      timestamp: new Date().toISOString(),
      clientDataFields: validatedData.clientData ? Object.keys(validatedData.clientData).filter(key => 
        validatedData.clientData![key as keyof typeof validatedData.clientData]
      ).length : 0,
      familyTreeFields: validatedData.familyTreeData ? Object.keys(validatedData.familyTreeData).filter(key => 
        validatedData.familyTreeData![key as keyof typeof validatedData.familyTreeData]
      ).length : 0,
    });

    res.json({ 
      success: true, 
      message: 'Dashboard progress saved successfully',
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving dashboard progress:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Invalid data format',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get dashboard progress
router.get('/progress', async (req, res) => {
  try {
    // In a real application, you would retrieve this from the database
    // For now, return empty data
    res.json({
      success: true,
      data: {
        clientData: null,
        familyTreeData: {},
        lastSaved: null
      }
    });
  } catch (error) {
    console.error('Error retrieving dashboard progress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve progress data'
    });
  }
});

export default router;