import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import multer from 'multer';

const router = express.Router();

// Configure multer for portal file uploads with enhanced security
const portalUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Use enhanced file type validation (extension + MIME type)
    if (validateFileType(file)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. File extension and MIME type must match allowed formats: PDF, DOC, DOCX, JPG, JPEG, PNG, TIFF.'));
    }
  }
});

// Helper function to generate secure tokens
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to sanitize filenames and prevent path traversal attacks
function sanitizeFileName(fileName) {
  if (!fileName) return 'unnamed';
  
  // Remove path separators and dangerous characters
  let sanitized = fileName
    .replace(/[\/\\:*?"<>|]/g, '') // Remove dangerous characters
    .replace(/\.\./g, '') // Remove path traversal attempts
    .replace(/^\.+/, '') // Remove leading dots
    .trim();
  
  // Ensure filename isn't empty after sanitization
  if (!sanitized || sanitized.length === 0) {
    sanitized = 'unnamed';
  }
  
  // Limit filename length to prevent filesystem issues
  if (sanitized.length > 200) {
    const ext = path.extname(sanitized);
    const base = path.basename(sanitized, ext);
    sanitized = base.substring(0, 200 - ext.length) + ext;
  }
  
  return sanitized;
}

// Enhanced MIME type validation beyond extension checking
function validateFileType(file) {
  const allowedExtensions = /\.(pdf|doc|docx|jpg|jpeg|png|tiff|tif)$/i;
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/tiff',
    'image/tif'
  ];
  
  // Check both extension and MIME type for security
  const extensionValid = allowedExtensions.test(file.originalname);
  const mimeValid = allowedMimeTypes.includes(file.mimetype.toLowerCase());
  
  return extensionValid && mimeValid;
}

// Token validation middleware for client routes
export async function validateClientToken(req, res, next) {
  try {
    // Check both query param and header for token (normalize token location)
    const token = req.query.token || req.headers['x-client-token'];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required',
        redirectTo: '/client/login'
      });
    }
    
    // Check if token file exists in portal/auth directory
    const authDir = path.join(process.cwd(), 'portal', 'auth');
    const authFiles = await fs.readdir(authDir);
    
    // Find token file
    let tokenFound = false;
    let userEmail = null;
    
    for (const file of authFiles) {
      try {
        const tokenData = JSON.parse(await fs.readFile(path.join(authDir, file), 'utf8'));
        if (tokenData.token === token) {
          // Check token expiry (24 hours)
          const tokenAge = Date.now() - tokenData.timestamp;
          const tokenExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          
          if (tokenAge < tokenExpiry) {
            tokenFound = true;
            userEmail = tokenData.email;
            break;
          }
        }
      } catch (e) {
        // Skip invalid token files
        continue;
      }
    }
    
    if (!tokenFound) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        redirectTo: '/client/login'
      });
    }
    
    // Add user email to request for downstream use
    req.clientEmail = userEmail;
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      redirectTo: '/client/login'
    });
  }
}

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

// Helper function to compute lineage string from tree data
function computeLineageFromTree(treeData) {
  if (!treeData || !treeData.persons || treeData.persons.length === 0) {
    return '';
  }

  // Find the proband (applicant/self)
  const proband = treeData.persons.find(p => p.relation === 'self') || treeData.persons[0];
  
  if (!proband) {
    return '';
  }

  // Build lineage chain from proband backwards through Polish ancestors
  // Prioritize paternal line (father relationships) for Polish citizenship lineage
  let lineageChain = [proband];
  let currentPerson = proband;

  // Follow parent relationships to build lineage, prioritizing paternal line
  while (currentPerson && lineageChain.length < 5) { // Limit to 5 generations for readability
    // First, try to find father relationship
    let parentRelationship = treeData.relationships?.find(rel => 
      rel.child === currentPerson.id && rel.type === 'father'
    );
    
    // If no father found, fall back to generic parent
    if (!parentRelationship) {
      parentRelationship = treeData.relationships?.find(rel => 
        rel.child === currentPerson.id && rel.type === 'parent'
      );
    }
    
    // Only use mother as last resort if no father or parent relationship exists
    if (!parentRelationship) {
      parentRelationship = treeData.relationships?.find(rel => 
        rel.child === currentPerson.id && rel.type === 'mother'
      );
    }
    
    if (parentRelationship) {
      const parent = treeData.persons.find(p => p.id === parentRelationship.parent);
      if (parent && !lineageChain.some(p => p.id === parent.id)) {
        lineageChain.push(parent);
        currentPerson = parent;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Format lineage string
  return lineageChain.map(person => {
    const name = person.name || 'Unknown';
    const relation = person.relation || (person === proband ? 'self' : 'ancestor');
    const birthInfo = person.birthDate ? ` (b. ${person.birthDate})` : '';
    return `${name}${birthInfo} (${relation})`;
  }).join(' → ');
}

// Helper function to determine case stage and timing estimates
function getCaseStageInfo(caseId) {
  // Realistic Polish citizenship process stages with honest timing estimates
  const stages = {
    'INTAKE': {
      stageMsg: 'Initial consultation and document collection',
      eta: '2-4 weeks',
      initialDecisionWindow: '12-15 months',
      overallRange: '18 months - several years',
      note: 'Timeline depends on document availability and complexity of your case'
    },
    'USC_IN_FLIGHT': {
      stageMsg: 'Searching Polish archives for ancestral records',
      eta: '4-12 weeks',
      initialDecisionWindow: '12-15 months',
      overallRange: '18 months - several years',
      note: 'Archive response times vary significantly by region and record availability'
    },
    'OBY_DRAFTING': {
      stageMsg: 'Preparing citizenship application documents',
      eta: '2-3 weeks',
      initialDecisionWindow: '12-15 months',
      overallRange: '18 months - several years',
      note: 'Application complexity affects preparation time'
    },
    'USC_READY': {
      stageMsg: 'Documents ready for submission to archives',
      eta: '1-2 weeks',
      initialDecisionWindow: '12-15 months',
      overallRange: '18 months - several years',
      note: 'Awaiting optimal submission timing and final document verification'
    },
    'OBY_SUBMITTABLE': {
      stageMsg: 'Application ready for submission to authorities',
      eta: '1-2 weeks',
      initialDecisionWindow: '12-15 months',
      overallRange: '18 months - several years',
      note: 'Government processing times vary and are beyond our control'
    },
    'OBY_SUBMITTED': {
      stageMsg: 'Application submitted to Polish authorities',
      eta: 'Pending government review',
      initialDecisionWindow: '12-15 months',
      overallRange: '18 months - several years',
      note: 'Processing time depends on government workload and case complexity'
    },
    'DECISION_RECEIVED': {
      stageMsg: 'Decision received from authorities',
      eta: 'Complete',
      initialDecisionWindow: 'Complete',
      overallRange: 'Complete',
      note: 'Case completed - please review your decision documentation'
    }
  };

  // For demo purposes, determine stage from case ID pattern or default to INTAKE
  let currentStage = 'INTAKE';
  
  // Simple heuristic based on case ID to simulate different stages
  if (caseId.includes('USC')) {
    currentStage = 'USC_IN_FLIGHT';
  } else if (caseId.includes('OBY')) {
    currentStage = 'OBY_DRAFTING';
  } else if (caseId.includes('TEST')) {
    currentStage = 'USC_READY';
  }

  const stageInfo = stages[currentStage] || stages['INTAKE'];
  
  // Return both stage info and current stage for consistency
  return {
    ...stageInfo,
    currentStage: currentStage
  };
}

// GET /api/client/:id/tracker → Returns client case tracking information with lineage
router.get('/client/:id/tracker', validateClientToken, async (req, res) => {
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
    
    // Try to load case data for preferredLanguage
    let preferredLanguage = 'en';
    const caseJsonPath = path.join(caseDir, 'portal', 'case.json');
    try {
      const caseData = await fs.readFile(caseJsonPath, 'utf8');
      const parsedCase = JSON.parse(caseData);
      preferredLanguage = parsedCase.preferredLanguage || 'en';
    } catch (error) {
      // Case file doesn't exist or is invalid - use default language
      console.log(`No case data found for ${id}, using default language:`, error.message);
    }
    
    // Try to load tree data for lineage computation
    let lineageString = '';
    try {
      const treeData = await fs.readFile(treePath, 'utf8');
      const parsedTree = JSON.parse(treeData);
      lineageString = computeLineageFromTree(parsedTree);
    } catch (error) {
      // Tree file doesn't exist or is invalid - lineage will remain empty
      console.log(`No tree data found for case ${id}:`, error.message);
    }
    
    // Get stage information with realistic timing estimates
    const stageInfo = getCaseStageInfo(id);
    
    // Mock client data - in a real application this would come from database
    const clientData = {
      caseId: id,
      clientName: 'Anonymous Client',
      email: 'client@example.com',
      status: stageInfo.currentStage,
      lastUpdated: new Date().toISOString(),
      lineage: lineageString,
      preferredLanguage: preferredLanguage,
      stage: stageInfo,
      progress: {
        completedSteps: 3,
        totalSteps: 8,
        percentage: Math.round((3 / 8) * 100)
      },
      documents: {
        received: 5,
        expected: 12,
        percentage: Math.round((5 / 12) * 100)
      },
      nextActions: [
        'Awaiting archive response from Kraków',
        'Birth certificate translation in progress',
        'Marriage documentation review scheduled'
      ]
    };
    
    res.json({
      success: true,
      client: clientData
    });
  } catch (error) {
    console.error('Error fetching client tracker data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client tracking information',
      details: error.message
    });
  }
});

// GET /api/client/:id/status → Returns simplified status for quick checks
router.get('/client/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateCaseId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format.'
      });
    }
    
    const stageInfo = getCaseStageInfo(id);
    
    res.json({
      success: true,
      caseId: id,
      status: stageInfo.currentStage,
      stageMsg: stageInfo.stageMsg,
      eta: stageInfo.eta,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching client status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client status',
      details: error.message
    });
  }
});

// POST /api/client/:id/update → Update client case information
router.post('/client/:id/update', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateCaseId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format.'
      });
    }
    
    const updateData = req.body;
    
    // In a real application, this would update the database
    console.log(`Updating case ${id}:`, updateData);
    
    res.json({
      success: true,
      message: 'Client case updated successfully',
      caseId: id,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating client case:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update client case',
      details: error.message
    });
  }
});

// POST /api/client/auth/magic-link → Generate magic link token
router.post('/client/auth/magic-link', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email format
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Valid email address is required'
      });
    }
    
    // Generate secure token
    const token = generateSecureToken();
    const timestamp = Date.now();
    
    // Create token data
    const tokenData = {
      email,
      token,
      timestamp,
      expiresAt: timestamp + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    // Ensure auth directory exists
    const authDir = path.join(process.cwd(), 'portal', 'auth');
    await fs.mkdir(authDir, { recursive: true });
    
    // Save token to file
    const tokenFileName = `${email}.json`;
    const tokenFilePath = path.join(authDir, tokenFileName);
    await fs.writeFile(tokenFilePath, JSON.stringify(tokenData, null, 2));
    
    // Log token for development purposes
    console.log('🔐 MAGIC LINK TOKEN GENERATED:');
    console.log(`Email: ${email}`);
    console.log(`Token: ${token}`);
    console.log(`Access URL: /client/home?token=${token}`);
    console.log(`Expires: ${new Date(tokenData.expiresAt).toISOString()}`);
    console.log('─'.repeat(60));
    
    res.json({
      success: true,
      message: 'Magic link token generated successfully',
      email: email,
      expiresIn: '24 hours',
      // For development, include the token in response
      ...(process.env.NODE_ENV === 'development' && { 
        developmentToken: token,
        developmentUrl: `/client/home?token=${token}`
      })
    });
    
  } catch (error) {
    console.error('Magic link generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate magic link',
      details: error.message
    });
  }
});

// POST /api/uploads → Handle secure file uploads to portal
router.post('/uploads', validateClientToken, portalUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    // Verify client is authenticated (validateClientToken middleware should have set this)
    if (!req.clientEmail) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required - no client email found',
        redirectTo: '/client/login'
      });
    }
    
    // Sanitize filename to prevent path traversal attacks
    const sanitizedOriginalName = sanitizeFileName(req.file.originalname);
    
    // Generate unique filename to prevent collisions
    const timestamp = Date.now();
    const fileExtension = path.extname(sanitizedOriginalName);
    const baseName = path.basename(sanitizedOriginalName, fileExtension);
    const uniqueFileName = `${baseName}_${timestamp}${fileExtension}`;
    
    // Create user-specific uploads directory (email-scoped)
    const userUploadsDir = path.join(process.cwd(), 'portal', 'uploads', req.clientEmail);
    await fs.mkdir(userUploadsDir, { recursive: true });
    
    // Write file to user-specific directory
    const filePath = path.join(userUploadsDir, uniqueFileName);
    await fs.writeFile(filePath, req.file.buffer);
    
    // Create file metadata
    const fileMetadata = {
      originalName: req.file.originalname,
      sanitizedName: sanitizedOriginalName,
      fileName: uniqueFileName,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      clientEmail: req.clientEmail,
      filePath: `/portal/uploads/${req.clientEmail}/${uniqueFileName}`
    };
    
    // Log successful upload with security details
    console.log('📁 SECURE FILE UPLOADED TO PORTAL:');
    console.log(`Client: ${req.clientEmail}`);
    console.log(`Original: ${req.file.originalname}`);
    console.log(`Sanitized: ${sanitizedOriginalName}`);
    console.log(`Saved as: ${uniqueFileName}`);
    console.log(`Size: ${Math.round(req.file.size / 1024)} KB`);
    console.log(`MIME: ${req.file.mimetype}`);
    console.log(`Path: ${fileMetadata.filePath}`);
    console.log('─'.repeat(60));
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: fileMetadata
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      details: error.message
    });
  }
});

export default router;