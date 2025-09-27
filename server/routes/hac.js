import express from 'express';
import path from 'path';
import fs from 'fs/promises';

// Import email notification service
import { sendNewHACNotification, sendHACApprovalNotification } from '../notify/email.js';

// Import HAC evaluation engine
import { evaluateCase, saveOverride } from '../hac/evaluate.mjs';

const router = express.Router();

// Helper function to check admin authentication
function checkAdminAuth(req, res, next) {
  const adminToken = req.headers['x-admin-token'];
  
  // In QA_MODE, allow dev-token
  if (process.env.QA_MODE === 'ON' && adminToken === 'dev-token') {
    return next();
  }
  
  // In production, require valid admin token
  if (!adminToken) {
    return res.status(401).json({
      success: false,
      error: 'Admin authentication required'
    });
  }
  
  // Production: require valid admin token from environment
  const validAdminToken = process.env.ADMIN_TOKEN;
  
  if (!validAdminToken) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error: ADMIN_TOKEN not set'
    });
  }
  
  if (adminToken !== validAdminToken) {
    return res.status(401).json({
      success: false,
      error: 'Invalid admin token'
    });
  }
  
  next();
}

// POST /api/hac/evaluate → Run HAC evaluation on a case (Admin only)
router.post('/hac/evaluate', checkAdminAuth, async (req, res) => {
  try {
    const { caseId } = req.body;

    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: 'Case ID is required'
      });
    }

    // Validate caseId
    if (!validateCaseId(caseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format'
      });
    }

    let caseData = null;
    
    try {
      // Try to load real case data
      const caseDir = getCaseDir(caseId);
      const casePath = path.join(caseDir, 'case.json');
      const caseContent = await fs.readFile(casePath, 'utf8');
      caseData = JSON.parse(caseContent);
      
      // Transform case data to match HAC evaluation format
      caseData = transformCaseDataForHAC(caseData, caseId);
      
    } catch (error) {
      // If case file not found or invalid, use mock data but with the requested caseId
      console.log(`Using mock data for case ${caseId}:`, error.message);
      caseData = {
        case_id: caseId,
        client: {
          name: "Mock Client",
          email: "mock@example.com",
          current_surname: "KOWALSKI",
          birth_surname: "NOWAK"
        },
        status: {
          pipeline_state: "USC_IN_FLIGHT",
          created_date: "2025-09-21",
          last_updated: "2025-09-21"
        },
        usc: {
          birth: {
            registered: false,
            registration_pending: true,
            office: "USC Warszawa"
          }
        },
        documents: [
          {
            type: "birth_cert_foreign",
            status: "RECEIVED",
            has_sworn_translation: false,
            is_foreign: true
          }
        ],
        name_changes: {
          has_sprostowanie_note: false,
          legal_name_change_docs: []
        },
        oby_attachments: [
          {"id": 1, "name": "Birth certificate", "linked": true},
          {"id": 2, "name": "Passport copy", "linked": true},
          {"id": 3, "name": "Parent birth certificate", "linked": false},
          {"id": 4, "name": "Grandparent birth certificate", "linked": false},
          {"id": 5, "name": "Marriage certificate", "linked": false},
          {"id": 6, "name": "Death certificate", "linked": false},
          {"id": 7, "name": "Residence proof", "linked": false},
          {"id": 8, "name": "Employment proof", "linked": false},
          {"id": 9, "name": "Criminal record check", "linked": false},
          {"id": 10, "name": "Additional documents", "linked": false}
        ],
        foreign_docs: [
          {
            type: "birth_cert_foreign",
            has_sworn_translation: false,
            translation_status: "pending"
          }
        ]
      };
    }

    // Run HAC evaluation
    const evaluation = evaluateCase(caseData);

    res.json({
      success: true,
      evaluation: evaluation
    });

  } catch (error) {
    console.error('Error running HAC evaluation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run HAC evaluation',
      details: error.message
    });
  }
});

// POST /api/hac/override → Save an override for a specific rule (Admin only)
router.post('/hac/override', checkAdminAuth, async (req, res) => {
  try {
    const { caseId, ruleId, reason } = req.body;

    if (!caseId || !ruleId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'caseId, ruleId, and reason are required'
      });
    }

    // Validate caseId
    if (!validateCaseId(caseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format'
      });
    }

    // Save override using HAC evaluation engine
    const overrideData = {
      caseId,
      ruleId,
      reason: reason.trim(),
      overriddenBy: req.user?.email || req.ip || 'anonymous'
    };

    const savedOverride = saveOverride(overrideData);

    res.json({
      success: true,
      message: 'Override saved successfully',
      override: savedOverride
    });

  } catch (error) {
    console.error('Error saving HAC override:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save override',
      details: error.message
    });
  }
});

// Helper function to transform case data for HAC evaluation
function transformCaseDataForHAC(caseData, caseId) {
  return {
    case_id: caseId,
    client: {
      name: caseData.client?.name || null,
      email: caseData.client?.email || null,
      current_surname: caseData.client?.surname || "UNKNOWN",
      birth_surname: caseData.client?.birthSurname || caseData.client?.surname || "UNKNOWN"
    },
    status: {
      pipeline_state: caseData.state || "USC_IN_FLIGHT",
      created_date: caseData.createdAt || new Date().toISOString().split('T')[0],
      last_updated: caseData.lastUpdated || new Date().toISOString().split('T')[0]
    },
    usc: {
      birth: {
        registered: caseData.uscRegistered || false,
        registration_pending: !caseData.uscRegistered,
        office: "USC Office"
      }
    },
    documents: caseData.docs?.map(doc => ({
      type: doc.type,
      status: doc.status,
      has_sworn_translation: doc.hasTranslation || false,
      is_foreign: doc.type?.includes('foreign') || false
    })) || [],
    name_changes: {
      has_sprostowanie_note: caseData.hasSprostowanie || false,
      legal_name_change_docs: []
    },
    oby_attachments: Array.from({length: 10}, (_, i) => ({
      id: i + 1,
      name: `Attachment ${i + 1}`,
      linked: i < 2 // First 2 attachments linked by default for consistent demo
    })),
    foreign_docs: caseData.docs?.filter(doc => doc.type?.includes('foreign')).map(doc => ({
      type: doc.type,
      has_sworn_translation: doc.hasTranslation || false,
      translation_status: doc.hasTranslation ? "complete" : "pending"
    })) || []
  };
}

// Security validation for case IDs - prevent path traversal attacks
function validateCaseId(caseId) {
  const caseIdRegex = /^[A-Za-z0-9_-]+$/;
  return caseId && caseIdRegex.test(caseId) && !caseId.includes('..');
}

// Helper function to get HAC directories
function getHACDir(type) {
  const validTypes = ['req', 'approved', 'declined'];
  if (!validTypes.includes(type)) {
    throw new Error('Invalid HAC directory type');
  }
  return path.join(process.cwd(), 'portal', 'hac', type);
}

// Helper function to get case directory
function getCaseDir(caseId) {
  if (!validateCaseId(caseId)) {
    throw new Error('Invalid case ID format');
  }
  return path.join(process.cwd(), 'data', 'cases', caseId);
}

// POST /api/hac/submit → Save requests to /portal/hac/req/ with structure { caseId, type, payload }
router.post('/hac/submit', async (req, res) => {
  try {
    const { caseId, type, payload } = req.body;

    // Validate required fields
    if (!caseId || !type || !payload) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: caseId, type, and payload are required'
      });
    }

    // Validate caseId
    if (!validateCaseId(caseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format. Only alphanumeric characters, hyphens, and underscores are allowed.'
      });
    }

    // Validate type
    const validTypes = ['case_update', 'tree_update', 'document_update', 'status_change'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Validate payload is an object
    if (typeof payload !== 'object' || payload === null) {
      return res.status(400).json({
        success: false,
        error: 'Payload must be a valid JSON object'
      });
    }

    // Create HAC request structure
    const hacRequest = {
      id: `hac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      caseId,
      type,
      payload,
      submittedAt: new Date().toISOString(),
      submittedBy: req.user?.email || req.ip || 'anonymous',
      status: 'pending'
    };

    // Ensure req directory exists
    const reqDir = getHACDir('req');
    await fs.mkdir(reqDir, { recursive: true });

    // Save request to req directory
    const requestPath = path.join(reqDir, `${hacRequest.id}.json`);
    await fs.writeFile(requestPath, JSON.stringify(hacRequest, null, 2), 'utf8');

    // Send email notification to Roman about new HAC request
    try {
      const emailResult = await sendNewHACNotification(hacRequest);
      console.log('📧 New HAC notification result:', emailResult);
    } catch (emailError) {
      console.error('❌ Error sending HAC notification email:', emailError);
      // Don't fail the request if email fails, just log the error
    }

    res.json({
      success: true,
      message: 'HAC request submitted successfully',
      requestId: hacRequest.id,
      request: hacRequest
    });

  } catch (error) {
    console.error('Error submitting HAC request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit HAC request',
      details: error.message
    });
  }
});

// GET /api/hac/pending → List all pending HAC requests
router.get('/hac/pending', async (req, res) => {
  try {
    const reqDir = getHACDir('req');

    try {
      const files = await fs.readdir(reqDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      const requests = await Promise.all(
        jsonFiles.map(async (file) => {
          try {
            const filePath = path.join(reqDir, file);
            const content = await fs.readFile(filePath, 'utf8');
            const request = JSON.parse(content);
            
            // Add file stats for metadata
            const stats = await fs.stat(filePath);
            request.fileSize = stats.size;
            request.lastModified = stats.mtime.toISOString();
            
            return request;
          } catch (parseError) {
            console.error(`Error parsing HAC request file ${file}:`, parseError);
            return null;
          }
        })
      );

      // Filter out failed parses and sort by submission time
      const validRequests = requests
        .filter(req => req !== null)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      res.json({
        success: true,
        requests: validRequests,
        count: validRequests.length
      });

    } catch (error) {
      // If req directory doesn't exist, return empty list
      if (error.code === 'ENOENT') {
        res.json({
          success: true,
          requests: [],
          count: 0
        });
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('Error fetching pending HAC requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending HAC requests',
      details: error.message
    });
  }
});

// POST /api/hac/approve → Apply payload to case.json/tree.json and archive request
router.post('/hac/approve', async (req, res) => {
  try {
    const { requestId, approvedBy, comments } = req.body;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
    }

    // Find and load the request
    const reqDir = getHACDir('req');
    const requestPath = path.join(reqDir, `${requestId}.json`);

    let hacRequest;
    try {
      const content = await fs.readFile(requestPath, 'utf8');
      hacRequest = JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          error: 'HAC request not found'
        });
      }
      throw error;
    }

    // Apply the payload based on type
    let applyResult = { applied: false, details: 'No action taken' };

    try {
      const caseDir = getCaseDir(hacRequest.caseId);
      
      switch (hacRequest.type) {
        case 'case_update':
          // Apply to case.json
          const casePath = path.join(caseDir, 'case.json');
          let caseData = {};
          
          try {
            const existingCase = await fs.readFile(casePath, 'utf8');
            caseData = JSON.parse(existingCase);
          } catch (error) {
            // If case.json doesn't exist, start with empty object
            if (error.code !== 'ENOENT') throw error;
          }

          // Merge payload into case data
          const updatedCase = { ...caseData, ...hacRequest.payload };
          updatedCase.lastUpdated = new Date().toISOString();
          updatedCase.lastUpdatedBy = approvedBy || 'HAC System';
          
          // Ensure case directory exists
          await fs.mkdir(caseDir, { recursive: true });
          await fs.writeFile(casePath, JSON.stringify(updatedCase, null, 2), 'utf8');
          
          applyResult = { 
            applied: true, 
            details: `Updated case.json for case ${hacRequest.caseId}`,
            targetFile: 'case.json'
          };
          break;

        case 'tree_update':
          // Apply to tree.json
          const treePath = path.join(caseDir, 'tree.json');
          let treeData = {};
          
          try {
            const existingTree = await fs.readFile(treePath, 'utf8');
            treeData = JSON.parse(existingTree);
          } catch (error) {
            // If tree.json doesn't exist, start with empty object
            if (error.code !== 'ENOENT') throw error;
          }

          // Merge payload into tree data
          const updatedTree = { ...treeData, ...hacRequest.payload };
          if (!updatedTree.metadata) updatedTree.metadata = {};
          updatedTree.metadata.updated = new Date().toISOString();
          updatedTree.metadata.updatedBy = approvedBy || 'HAC System';
          
          // Ensure case directory exists
          await fs.mkdir(caseDir, { recursive: true });
          await fs.writeFile(treePath, JSON.stringify(updatedTree, null, 2), 'utf8');
          
          applyResult = { 
            applied: true, 
            details: `Updated tree.json for case ${hacRequest.caseId}`,
            targetFile: 'tree.json'
          };
          break;

        case 'document_update':
        case 'status_change':
          // For these types, update case.json with the specific payload
          const statusCasePath = path.join(caseDir, 'case.json');
          let statusCaseData = {};
          
          try {
            const existingCase = await fs.readFile(statusCasePath, 'utf8');
            statusCaseData = JSON.parse(existingCase);
          } catch (error) {
            if (error.code !== 'ENOENT') throw error;
          }

          // Apply specific updates
          const updatedStatusCase = { ...statusCaseData, ...hacRequest.payload };
          updatedStatusCase.lastUpdated = new Date().toISOString();
          updatedStatusCase.lastUpdatedBy = approvedBy || 'HAC System';
          
          await fs.mkdir(caseDir, { recursive: true });
          await fs.writeFile(statusCasePath, JSON.stringify(updatedStatusCase, null, 2), 'utf8');
          
          applyResult = { 
            applied: true, 
            details: `Applied ${hacRequest.type} to case ${hacRequest.caseId}`,
            targetFile: 'case.json'
          };
          break;

        default:
          throw new Error(`Unknown HAC request type: ${hacRequest.type}`);
      }

    } catch (applyError) {
      console.error('Error applying HAC request:', applyError);
      return res.status(500).json({
        success: false,
        error: 'Failed to apply HAC request',
        details: applyError.message
      });
    }

    // Update request with approval info
    hacRequest.status = 'approved';
    hacRequest.approvedAt = new Date().toISOString();
    hacRequest.approvedBy = approvedBy || 'Unknown';
    hacRequest.comments = comments || '';
    hacRequest.applyResult = applyResult;

    // Move to approved directory
    const approvedDir = getHACDir('approved');
    await fs.mkdir(approvedDir, { recursive: true });
    
    const approvedPath = path.join(approvedDir, `${requestId}.json`);
    await fs.writeFile(approvedPath, JSON.stringify(hacRequest, null, 2), 'utf8');

    // Remove from req directory
    await fs.unlink(requestPath);

    // Send email notification to case owner about HAC approval
    try {
      const emailResult = await sendHACApprovalNotification(hacRequest);
      console.log('📧 HAC approval notification result:', emailResult);
    } catch (emailError) {
      console.error('❌ Error sending HAC approval email:', emailError);
      // Don't fail the request if email fails, just log the error
    }

    res.json({
      success: true,
      message: 'HAC request approved and applied successfully',
      request: hacRequest,
      applyResult: applyResult
    });

  } catch (error) {
    console.error('Error approving HAC request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve HAC request',
      details: error.message
    });
  }
});

// POST /api/hac/decline → Archive request as declined with reason
router.post('/hac/decline', async (req, res) => {
  try {
    const { requestId, declinedBy, reason } = req.body;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Decline reason is required'
      });
    }

    // Find and load the request
    const reqDir = getHACDir('req');
    const requestPath = path.join(reqDir, `${requestId}.json`);

    let hacRequest;
    try {
      const content = await fs.readFile(requestPath, 'utf8');
      hacRequest = JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          error: 'HAC request not found'
        });
      }
      throw error;
    }

    // Update request with decline info
    hacRequest.status = 'declined';
    hacRequest.declinedAt = new Date().toISOString();
    hacRequest.declinedBy = declinedBy || 'Unknown';
    hacRequest.reason = reason.trim();

    // Move to declined directory
    const declinedDir = getHACDir('declined');
    await fs.mkdir(declinedDir, { recursive: true });
    
    const declinedPath = path.join(declinedDir, `${requestId}.json`);
    await fs.writeFile(declinedPath, JSON.stringify(hacRequest, null, 2), 'utf8');

    // Remove from req directory
    await fs.unlink(requestPath);

    res.json({
      success: true,
      message: 'HAC request declined successfully',
      request: hacRequest
    });

  } catch (error) {
    console.error('Error declining HAC request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to decline HAC request',
      details: error.message
    });
  }
});

// GET /api/hac/history → Get history of approved/declined requests (optional utility endpoint)
router.get('/hac/history', async (req, res) => {
  try {
    const { status, caseId, limit = 50 } = req.query;
    
    let dirsToCheck = [];
    if (status === 'approved') {
      dirsToCheck = ['approved'];
    } else if (status === 'declined') {
      dirsToCheck = ['declined'];
    } else {
      dirsToCheck = ['approved', 'declined'];
    }

    const allRequests = [];

    for (const dirType of dirsToCheck) {
      try {
        const dir = getHACDir(dirType);
        const files = await fs.readdir(dir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        const requests = await Promise.all(
          jsonFiles.map(async (file) => {
            try {
              const filePath = path.join(dir, file);
              const content = await fs.readFile(filePath, 'utf8');
              const request = JSON.parse(content);
              request.archiveType = dirType;
              return request;
            } catch (parseError) {
              console.error(`Error parsing archived HAC request file ${file}:`, parseError);
              return null;
            }
          })
        );

        allRequests.push(...requests.filter(req => req !== null));
      } catch (dirError) {
        // Directory might not exist, skip
        if (dirError.code !== 'ENOENT') {
          console.error(`Error reading ${dirType} directory:`, dirError);
        }
      }
    }

    // Filter by caseId if provided
    let filteredRequests = allRequests;
    if (caseId && validateCaseId(caseId)) {
      filteredRequests = allRequests.filter(req => req.caseId === caseId);
    }

    // Sort by completion date (approved/declined)
    filteredRequests.sort((a, b) => {
      const aDate = new Date(a.approvedAt || a.declinedAt);
      const bDate = new Date(b.approvedAt || b.declinedAt);
      return bDate - aDate;
    });

    // Apply limit
    const limitedRequests = filteredRequests.slice(0, parseInt(limit));

    res.json({
      success: true,
      requests: limitedRequests,
      count: limitedRequests.length,
      totalFound: filteredRequests.length
    });

  } catch (error) {
    console.error('Error fetching HAC history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch HAC history',
      details: error.message
    });
  }
});

export default router;