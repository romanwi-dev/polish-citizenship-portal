import express from 'express';
import path from 'path';
import fs from 'fs/promises';

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

// Helper function to generate unique person ID
function generatePersonId() {
  return `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to read tree data
async function readTreeData(caseId) {
  const caseDir = getCaseDir(caseId);
  const treePath = path.join(caseDir, 'tree.json');
  
  try {
    const treeContent = await fs.readFile(treePath, 'utf8');
    return JSON.parse(treeContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Return default tree structure if file doesn't exist
      return {
        persons: [],
        proband: null,
        metadata: {
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        }
      };
    }
    throw error;
  }
}

// Helper function to save tree data
async function saveTreeData(caseId, treeData) {
  const caseDir = getCaseDir(caseId);
  const treePath = path.join(caseDir, 'tree.json');
  
  // Ensure directory exists
  await fs.mkdir(caseDir, { recursive: true });
  
  // Update metadata
  const updatedTree = {
    ...treeData,
    metadata: {
      ...treeData.metadata,
      updated: new Date().toISOString()
    }
  };
  
  await fs.writeFile(treePath, JSON.stringify(updatedTree, null, 2), 'utf8');
  return updatedTree;
}

// POST /api/cases/:id/tree/person - Upsert person
router.post('/cases/:id/tree/person', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateCaseId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format. Only alphanumeric characters, hyphens, and underscores are allowed.'
      });
    }
    
    const { personId, given, surname, sex, born, died, parents } = req.body;
    
    // Validate required fields
    if (!given || !surname) {
      return res.status(400).json({
        success: false,
        error: 'Given name and surname are required.'
      });
    }
    
    // Validate sex field
    if (sex && !['Male', 'Female', 'Unknown'].includes(sex)) {
      return res.status(400).json({
        success: false,
        error: 'Sex must be one of: Male, Female, Unknown'
      });
    }
    
    // Validate parents array (max 2 parents)
    if (parents && (!Array.isArray(parents) || parents.length > 2)) {
      return res.status(400).json({
        success: false,
        error: 'Parents must be an array with maximum 2 entries.'
      });
    }
    
    // Read current tree data
    const treeData = await readTreeData(id);
    
    // Check if we're updating an existing person or creating a new one
    const isUpdate = personId && treeData.persons.some(p => p.id === personId);
    const finalPersonId = personId || generatePersonId();
    
    // Validate parent references exist
    if (parents && parents.length > 0) {
      const validParents = parents.filter(parentId => 
        parentId && treeData.persons.some(p => p.id === parentId)
      );
      
      if (validParents.length !== parents.filter(p => p).length) {
        return res.status(400).json({
          success: false,
          error: 'One or more parent references are invalid.'
        });
      }
    }
    
    // Create person object
    const person = {
      id: finalPersonId,
      given: given.trim(),
      surname: surname.trim(),
      sex: sex || 'Unknown',
      born: {
        date: born?.date || '',
        place: born?.place || ''
      },
      died: {
        date: died?.date || '',
        place: died?.place || ''
      },
      parents: parents ? parents.filter(p => p) : []
    };
    
    // Update or add person
    if (isUpdate) {
      treeData.persons = treeData.persons.map(p => 
        p.id === personId ? person : p
      );
    } else {
      treeData.persons.push(person);
      
      // If this is the first person and no proband is set, make them the proband
      if (treeData.persons.length === 1 && !treeData.proband) {
        treeData.proband = finalPersonId;
      }
    }
    
    // Save updated tree
    const savedTree = await saveTreeData(id, treeData);
    
    res.json({
      success: true,
      message: isUpdate ? 'Person updated successfully' : 'Person created successfully',
      person: person,
      tree: savedTree
    });
    
  } catch (error) {
    console.error('Error saving person:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save person',
      details: error.message
    });
  }
});

// DELETE /api/cases/:id/tree/person/:pid - Delete person, but forbid if pid==proband
router.delete('/cases/:id/tree/person/:pid', async (req, res) => {
  try {
    const { id, pid } = req.params;
    
    if (!validateCaseId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format. Only alphanumeric characters, hyphens, and underscores are allowed.'
      });
    }
    
    if (!pid) {
      return res.status(400).json({
        success: false,
        error: 'Person ID is required.'
      });
    }
    
    // Read current tree data
    const treeData = await readTreeData(id);
    
    // Check if person exists
    const personExists = treeData.persons.some(p => p.id === pid);
    if (!personExists) {
      return res.status(404).json({
        success: false,
        error: 'Person not found.'
      });
    }
    
    // Forbid deletion if person is the proband
    if (treeData.proband === pid) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete the proband. Please set a different proband first.'
      });
    }
    
    // Remove person from the tree
    const originalLength = treeData.persons.length;
    treeData.persons = treeData.persons.filter(p => p.id !== pid);
    
    // Remove this person as a parent from other persons
    treeData.persons.forEach(person => {
      if (person.parents && person.parents.includes(pid)) {
        person.parents = person.parents.filter(parentId => parentId !== pid);
      }
    });
    
    // Save updated tree
    const savedTree = await saveTreeData(id, treeData);
    
    res.json({
      success: true,
      message: 'Person deleted successfully',
      deletedPersonId: pid,
      tree: savedTree
    });
    
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete person',
      details: error.message
    });
  }
});

// POST /api/cases/:id/tree/proband - Set proband
router.post('/cases/:id/tree/proband', async (req, res) => {
  try {
    const { id } = req.params;
    const { probandId } = req.body;
    
    if (!validateCaseId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format. Only alphanumeric characters, hyphens, and underscores are allowed.'
      });
    }
    
    if (!probandId) {
      return res.status(400).json({
        success: false,
        error: 'Proband ID is required.'
      });
    }
    
    // Read current tree data
    const treeData = await readTreeData(id);
    
    // Check if person exists
    const person = treeData.persons.find(p => p.id === probandId);
    if (!person) {
      return res.status(404).json({
        success: false,
        error: 'Person not found. Cannot set as proband.'
      });
    }
    
    // Update proband
    const previousProband = treeData.proband;
    treeData.proband = probandId;
    
    // Save updated tree
    const savedTree = await saveTreeData(id, treeData);
    
    res.json({
      success: true,
      message: 'Proband set successfully',
      proband: {
        id: probandId,
        name: `${person.given} ${person.surname}`
      },
      previousProband: previousProband,
      tree: savedTree
    });
    
  } catch (error) {
    console.error('Error setting proband:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set proband',
      details: error.message
    });
  }
});

export default router;