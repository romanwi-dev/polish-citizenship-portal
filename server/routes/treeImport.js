import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { parseGedcom, toTreeJson, validateGedcom } from '../tree/gedcom.js';

const router = express.Router();

// Security validation for case IDs - prevent path traversal attacks
function validateCaseId(caseId) {
  const caseIdRegex = /^[A-Za-z0-9_-]+$/;
  return caseId && caseIdRegex.test(caseId) && !caseId.includes('..');
}

// Helper function to get case directory
function getCaseDir(caseId) {
  if (!validateCaseId(caseId)) {
    throw new Error('Invalid case ID format');
  }
  return path.join(process.cwd(), 'data', 'cases', caseId);
}

// Configure multer for GEDCOM file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit for GEDCOM files
  },
  fileFilter: (req, file, cb) => {
    // Allow .ged files and common text files that might contain GEDCOM data
    const allowedExtensions = /\.(ged|gedcom|txt)$/i;
    const allowedMimeTypes = ['text/plain', 'application/octet-stream', 'text/gedcom'];
    
    if (allowedExtensions.test(file.originalname) || allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .ged, .gedcom, and .txt files are allowed.'));
    }
  }
});

// POST /api/cases/:id/tree/import-gedcom → Import GEDCOM file and save as tree.json
router.post('/cases/:id/tree/import-gedcom', upload.single('gedcomFile'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate case ID
    if (!validateCaseId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format. Only alphanumeric characters, hyphens, and underscores are allowed.'
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No GEDCOM file uploaded. Please select a .ged file.'
      });
    }
    
    // Get file content
    const gedcomContent = req.file.buffer.toString('utf8');
    
    // Validate GEDCOM content
    const validation = validateGedcom(gedcomContent);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid GEDCOM file format',
        details: validation.errors,
        warnings: validation.warnings
      });
    }
    
    // Parse GEDCOM
    let gedcomData;
    try {
      gedcomData = parseGedcom(gedcomContent);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Failed to parse GEDCOM file',
        details: parseError.message
      });
    }
    
    // Convert to tree.json format
    let treeData;
    try {
      treeData = toTreeJson(gedcomData);
    } catch (convertError) {
      return res.status(400).json({
        success: false,
        error: 'Failed to convert GEDCOM to tree format',
        details: convertError.message
      });
    }
    
    // Ensure case directory exists
    const caseDir = getCaseDir(id);
    await fs.mkdir(caseDir, { recursive: true });
    
    // Save tree.json
    const treePath = path.join(caseDir, 'tree.json');
    await fs.writeFile(treePath, JSON.stringify(treeData, null, 2), 'utf8');
    
    // Also save the original GEDCOM file for reference
    const sourcesDir = path.join(caseDir, 'tree', 'sources');
    await fs.mkdir(sourcesDir, { recursive: true });
    
    const originalFileName = req.file.originalname;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const gedcomFileName = `imported-${timestamp}-${originalFileName}`;
    const gedcomPath = path.join(sourcesDir, gedcomFileName);
    
    await fs.writeFile(gedcomPath, gedcomContent, 'utf8');
    
    // Find proband/root person for response
    const probandPerson = treeData.persons.find(p => p.relation === 'self') || treeData.persons[0];
    
    // Collect import statistics
    const stats = {
      totalPersons: treeData.persons.length,
      totalRelationships: treeData.relationships.length,
      generationsSpan: Math.max(...treeData.persons.map(p => p.generation)) - Math.min(...treeData.persons.map(p => p.generation)) + 1,
      probandInfo: probandPerson ? {
        name: probandPerson.name,
        birthDate: probandPerson.birthDate,
        birthPlace: probandPerson.birthPlace
      } : null,
      sourceFile: {
        originalName: originalFileName,
        savedAs: gedcomFileName,
        size: req.file.size
      },
      warnings: validation.warnings
    };
    
    res.json({
      success: true,
      message: 'GEDCOM file imported successfully',
      stats: stats,
      tree: treeData
    });
    
  } catch (error) {
    console.error('Error importing GEDCOM:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import GEDCOM file',
      details: error.message
    });
  }
});

// GET /api/cases/:id/tree/import-status → Check if tree was imported and get basic info
router.get('/cases/:id/tree/import-status', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateCaseId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format'
      });
    }
    
    const caseDir = getCaseDir(id);
    const treePath = path.join(caseDir, 'tree.json');
    const sourcesDir = path.join(caseDir, 'tree', 'sources');
    
    try {
      // Check if tree.json exists
      await fs.access(treePath);
      
      // Get tree data
      const treeContent = await fs.readFile(treePath, 'utf8');
      const treeData = JSON.parse(treeContent);
      
      // Check for imported GEDCOM files
      let importedFiles = [];
      try {
        const sourceFiles = await fs.readdir(sourcesDir);
        importedFiles = sourceFiles.filter(file => file.startsWith('imported-') && file.endsWith('.ged'));
      } catch (sourcesError) {
        // Sources directory might not exist
      }
      
      res.json({
        success: true,
        hasTree: true,
        lastUpdated: treeData.metadata?.updated,
        source: treeData.metadata?.source,
        totalPersons: treeData.persons?.length || 0,
        importedFiles: importedFiles.length,
        isImported: importedFiles.length > 0 || treeData.metadata?.source === 'GEDCOM Import'
      });
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.json({
          success: true,
          hasTree: false,
          isImported: false,
          importedFiles: 0
        });
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('Error checking import status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check import status',
      details: error.message
    });
  }
});

export default router;