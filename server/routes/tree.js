import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';

const router = express.Router();

// Configure multer for CSV file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for CSV files
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(csv)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV files are allowed.'));
    }
  }
});

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

// Helper function to get tree sources directory  
function getTreeSourcesDir(caseId) {
  return path.join(getCaseDir(caseId), 'tree', 'sources');
}

// Default tree structure
const DEFAULT_TREE = {
  persons: [
    {
      id: 'applicant',
      name: '',
      birthDate: '',
      birthPlace: '',
      relation: 'self',
      generation: 0
    }
  ],
  relationships: [],
  lineage: '',
  metadata: {
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  }
};

// GET /api/cases/:id/tree → returns tree.json or default tree
router.get('/cases/:id/tree', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateCaseId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format. Only alphanumeric characters, hyphens, and underscores are allowed.'
      });
    }
    
    const caseDir = getCaseDir(id);
    const treePath = path.join(caseDir, 'tree.json');

    try {
      const treeData = await fs.readFile(treePath, 'utf8');
      const parsedTree = JSON.parse(treeData);
      
      res.json({
        success: true,
        tree: parsedTree
      });
    } catch (error) {
      // If tree.json doesn't exist, return default tree
      if (error.code === 'ENOENT') {
        res.json({
          success: true,
          tree: DEFAULT_TREE
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error fetching tree:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch family tree',
      details: error.message
    });
  }
});

// PUT /api/cases/:id/tree → saves tree.json
router.put('/cases/:id/tree', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateCaseId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format. Only alphanumeric characters, hyphens, and underscores are allowed.'
      });
    }
    
    const treeData = req.body;

    if (!treeData) {
      return res.status(400).json({
        success: false,
        error: 'Tree data is required'
      });
    }

    const caseDir = getCaseDir(id);
    const treePath = path.join(caseDir, 'tree.json');

    // Ensure directory exists
    await fs.mkdir(caseDir, { recursive: true });

    // Add metadata
    const updatedTree = {
      ...treeData,
      metadata: {
        ...treeData.metadata,
        updated: new Date().toISOString()
      }
    };

    // Save tree data
    await fs.writeFile(treePath, JSON.stringify(updatedTree, null, 2), 'utf8');

    res.json({
      success: true,
      message: 'Family tree saved successfully',
      tree: updatedTree
    });
  } catch (error) {
    console.error('Error saving tree:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save family tree',
      details: error.message
    });
  }
});

// GET /api/cases/:id/tree/sources → lists files under data/cases/:id/tree/sources
router.get('/cases/:id/tree/sources', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateCaseId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format. Only alphanumeric characters, hyphens, and underscores are allowed.'
      });
    }
    
    const sourcesDir = getTreeSourcesDir(id);

    try {
      const files = await fs.readdir(sourcesDir, { withFileTypes: true });
      
      const fileList = await Promise.all(
        files
          .filter(file => file.isFile())
          .map(async (file) => {
            const filePath = path.join(sourcesDir, file.name);
            const stats = await fs.stat(filePath);
            
            return {
              name: file.name,
              size: stats.size,
              modified: stats.mtime.toISOString(),
              type: path.extname(file.name).toLowerCase().substring(1) || 'unknown'
            };
          })
      );

      res.json({
        success: true,
        sources: fileList,
        count: fileList.length
      });
    } catch (error) {
      // If sources directory doesn't exist, return empty list
      if (error.code === 'ENOENT') {
        res.json({
          success: true,
          sources: [],
          count: 0
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error listing tree sources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list tree sources',
      details: error.message
    });
  }
});

// GET /api/cases/:id/tree.csv → export tree data as CSV
router.get('/cases/:id/tree.csv', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateCaseId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format. Only alphanumeric characters, hyphens, and underscores are allowed.'
      });
    }
    
    const caseDir = getCaseDir(id);
    const treePath = path.join(caseDir, 'tree.json');

    let treeData;
    try {
      const treeFileData = await fs.readFile(treePath, 'utf8');
      treeData = JSON.parse(treeFileData);
    } catch (error) {
      // If tree.json doesn't exist, use default tree
      if (error.code === 'ENOENT') {
        treeData = DEFAULT_TREE;
      } else {
        throw error;
      }
    }

    // Convert tree data to CSV format
    const csvHeaders = ['id', 'given', 'surname', 'sex', 'bornDate', 'bornPlace', 'parent1', 'parent2'];
    const csvRows = [csvHeaders.join(',')];
    
    if (treeData.persons) {
      treeData.persons.forEach(person => {
        // Find relationships to get parents
        const relationships = treeData.relationships || [];
        const parentRelationships = relationships.filter(rel => rel.child === person.id);
        const parent1 = parentRelationships[0]?.parent || '';
        const parent2 = parentRelationships[1]?.parent || '';
        
        const csvRow = [
          person.id || '',
          person.given || person.name || '',
          person.surname || '',
          person.sex || 'Unknown',
          person.born?.date || person.birthDate || '',
          person.born?.place || person.birthPlace || '',
          parent1,
          parent2
        ].map(field => `"${String(field).replace(/"/g, '""')}"`); // Escape quotes
        
        csvRows.push(csvRow.join(','));
      });
    }

    const csvContent = csvRows.join('\n');
    const filename = `family_tree_${id}_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
    
  } catch (error) {
    console.error('Error exporting tree CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export family tree as CSV',
      details: error.message
    });
  }
});

// POST /api/cases/:id/tree/import-csv → import CSV file and merge into tree.json
router.post('/cases/:id/tree/import-csv', upload.single('csvFile'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateCaseId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format. Only alphanumeric characters, hyphens, and underscores are allowed.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'CSV file is required'
      });
    }

    const csvContent = req.file.buffer.toString('utf8');

    // Parse CSV - normalize line endings and remove BOM
    const normalizedContent = csvContent.replace(/\r\n|\r/g, '\n').replace(/^\uFEFF/, '');
    const csvLines = normalizedContent.split('\n').filter(line => line.trim());
    
    if (csvLines.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'CSV file must contain at least a header row and one data row'
      });
    }

    const headerLine = csvLines[0];
    const expectedHeaders = ['id', 'given', 'surname', 'sex', 'bornDate', 'bornPlace', 'parent1', 'parent2'];
    
    // Simple CSV parsing (handles quoted fields)
    const parseCSVLine = (line) => {
      const fields = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current.trim());
      return fields;
    };

    const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());
    
    // Build header-to-index map and validate exact headers
    const headerMap = new Map();
    const normalizedExpectedHeaders = expectedHeaders.map(h => h.toLowerCase());
    
    // Check that we have exactly the expected headers (order can vary)
    if (headers.length !== expectedHeaders.length || 
        !normalizedExpectedHeaders.every(expected => headers.includes(expected))) {
      return res.status(400).json({
        success: false,
        error: `CSV must contain exactly these headers: ${expectedHeaders.join(', ')}`
      });
    }
    
    // Create mapping from normalized header name to index
    headers.forEach((header, index) => {
      headerMap.set(header, index);
    });

    // Load existing tree data
    const caseDir = getCaseDir(id);
    const treePath = path.join(caseDir, 'tree.json');
    
    let existingTree;
    try {
      const existingData = await fs.readFile(treePath, 'utf8');
      existingTree = JSON.parse(existingData);
    } catch (error) {
      if (error.code === 'ENOENT') {
        existingTree = DEFAULT_TREE;
      } else {
        throw error;
      }
    }

    // Parse CSV data using header map
    const importedPersons = [];
    const importedRelationships = [];
    
    for (let i = 1; i < csvLines.length; i++) {
      const lineNumber = i + 1; // 1-based line numbers for error reporting
      const fields = parseCSVLine(csvLines[i]);
      
      if (fields.length !== headers.length) {
        console.warn(`CSV row ${lineNumber}: Expected ${headers.length} fields, got ${fields.length}`);
        continue; // Skip malformed rows
      }
      
      try {
        const person = {
          id: fields[headerMap.get('id')] || `imported_${Date.now()}_${i}`,
          given: fields[headerMap.get('given')] || '',
          surname: fields[headerMap.get('surname')] || '',
          sex: fields[headerMap.get('sex')] || 'Unknown',
          born: {
            date: fields[headerMap.get('borndate')] || '',
            place: fields[headerMap.get('bornplace')] || ''
          },
          died: { date: '', place: '' },
          parents: []
        };
        
        // Add parents if specified (using header map)
        const parent1 = fields[headerMap.get('parent1')];
        const parent2 = fields[headerMap.get('parent2')];
        
        if (parent1 && parent1.trim()) {
          person.parents.push(parent1.trim());
          importedRelationships.push({
            parent: parent1.trim(),
            child: person.id,
            type: 'parent'
          });
        }
        if (parent2 && parent2.trim()) {
          person.parents.push(parent2.trim());
          importedRelationships.push({
            parent: parent2.trim(),
            child: person.id,
            type: 'parent'
          });
        }
        
        importedPersons.push(person);
      } catch (error) {
        console.error(`CSV row ${lineNumber}: Error parsing person data:`, error);
        // Continue with other rows instead of failing completely
      }
    }

    // Merge with existing tree
    const existingPersonIds = new Set(existingTree.persons.map(p => p.id));
    const newPersons = importedPersons.filter(p => !existingPersonIds.has(p.id));
    
    // Update existing persons or add new ones
    const updatedPersons = [...existingTree.persons];
    
    importedPersons.forEach(importedPerson => {
      const existingIndex = updatedPersons.findIndex(p => p.id === importedPerson.id);
      if (existingIndex >= 0) {
        // Update existing person
        updatedPersons[existingIndex] = { ...updatedPersons[existingIndex], ...importedPerson };
      } else {
        // Add new person
        updatedPersons.push(importedPerson);
      }
    });

    // Merge relationships
    const existingRelationships = existingTree.relationships || [];
    const existingRelKeys = new Set(existingRelationships.map(r => `${r.parent}-${r.child}-${r.type}`));
    const newRelationships = importedRelationships.filter(r => 
      !existingRelKeys.has(`${r.parent}-${r.child}-${r.type}`)
    );

    const updatedTree = {
      ...existingTree,
      persons: updatedPersons,
      relationships: [...existingRelationships, ...newRelationships],
      metadata: {
        ...existingTree.metadata,
        updated: new Date().toISOString(),
        lastImport: {
          type: 'csv',
          timestamp: new Date().toISOString(),
          imported: importedPersons.length,
          new: newPersons.length
        }
      }
    };

    // Ensure directory exists
    await fs.mkdir(caseDir, { recursive: true });
    
    // Save updated tree
    await fs.writeFile(treePath, JSON.stringify(updatedTree, null, 2), 'utf8');

    res.json({
      success: true,
      message: 'CSV imported successfully',
      stats: {
        totalPersons: updatedPersons.length,
        importedPersons: importedPersons.length,
        newPersons: newPersons.length,
        totalRelationships: updatedTree.relationships.length,
        newRelationships: newRelationships.length
      }
    });

  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import CSV file',
      details: error.message
    });
  }
});

// GET /api/cases/:id/tree/import-status → check if tree has been imported
router.get('/cases/:id/tree/import-status', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateCaseId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format. Only alphanumeric characters, hyphens, and underscores are allowed.'
      });
    }
    
    const caseDir = getCaseDir(id);
    const treePath = path.join(caseDir, 'tree.json');

    try {
      const treeData = await fs.readFile(treePath, 'utf8');
      const parsedTree = JSON.parse(treeData);
      
      // Check if tree has been imported (has more than default structure)
      const isImported = parsedTree.persons && parsedTree.persons.length > 1 ||
                        parsedTree.metadata?.lastImport;
      
      res.json({
        success: true,
        isImported,
        totalPersons: parsedTree.persons ? parsedTree.persons.length : 0,
        lastImport: parsedTree.metadata?.lastImport || null
      });
    } catch (error) {
      // If tree.json doesn't exist, return not imported
      if (error.code === 'ENOENT') {
        res.json({
          success: true,
          isImported: false,
          totalPersons: 0,
          lastImport: null
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error checking tree import status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check tree import status',
      details: error.message
    });
  }
});

export default router;