/**
 * Tree Documents API Routes
 * Provides document matrix data for Family Tree Document Radar
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { buildDocMatrix } from '../tree/docMatrix.js';
import { getAccessToken } from '../integrations/dropbox-oauth.js';
import { getUserFromToken } from '../auth.ts';
import { apiRateLimit, fileUploadSecurity } from '../security-middleware.ts';

const router = express.Router();

// Document types validation - allowed enum list
const ALLOWED_DOC_TYPES = [
  'PL_BIRTH',
  'PL_MARRIAGE', 
  'PL_DEATH',
  'PL_NATURALIZATION',
  'FOREIGN_BIRTH',
  'FOREIGN_MARRIAGE',
  'FOREIGN_DEATH', 
  'NATURALIZATION_CERT',
  'NO_NATURALIZATION_PROOF',
  'NAME_CHANGE_DECREE',
  'MILITARY_SERVICE'
];

// Authentication middleware
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Case access validation middleware - prevent horizontal privilege escalation
async function validateCaseAccess(req, res, next) {
  try {
    const { id: caseId } = req.params;
    const user = req.user;

    if (!user?.email || !user?.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'User authentication required for case access' 
      });
    }

    // Basic case ID validation
    const caseIdRegex = /^[A-Za-z0-9_-]+$/;
    if (!caseId || !caseIdRegex.test(caseId) || caseId.includes('..')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format'
      });
    }

    // Import storage to validate case ownership
    const { storage } = await import('../storage.ts');
    
    try {
      // Check if user has access to this case via caseProgress table
      const caseProgress = await storage.getCaseProgress(user.id);
      
      if (!caseProgress || caseProgress.caseId !== caseId) {
        console.warn(`Access denied: User ${user.email} (${user.id}) attempted to access unauthorized case ${caseId}`);
        return res.status(403).json({
          success: false,
          error: 'Access denied: You do not have permission to access this case'
        });
      }
      
      console.log(`Case access granted: User ${user.email} accessing authorized case ${caseId}`);
      next();
    } catch (dbError) {
      console.error('Database error during case access validation:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Failed to validate case access permissions'
      });
    }
  } catch (error) {
    console.error('Case access validation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Case access validation failed' 
    });
  }
}

// Filename sanitization function
function sanitizeFilename(originalName) {
  if (!originalName || typeof originalName !== 'string') {
    throw new Error('Invalid filename');
  }

  // Get file extension
  const ext = path.extname(originalName).toLowerCase();
  const nameWithoutExt = path.basename(originalName, ext);

  // Strip dangerous characters and path separators
  const sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9\-_\s]/g, '') // Only allow alphanumeric, hyphens, underscores, spaces
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 100); // Limit length

  if (!sanitized) {
    throw new Error('Filename contains only invalid characters');
  }

  return sanitized + ext;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(pdf|jpg|jpeg|png|tiff|doc|docx)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and documents are allowed.'));
    }
  }
});

// GET /api/cases/:id/tree/doc-matrix
// Returns document matrix for family tree document radar
router.get('/cases/:id/tree/doc-matrix', requireAuth, validateCaseAccess, apiRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate case ID format
    const caseIdRegex = /^[A-Za-z0-9_-]+$/;
    if (!id || !caseIdRegex.test(id) || id.includes('..')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format. Only alphanumeric characters, hyphens, and underscores are allowed.'
      });
    }

    // Build document matrix
    const matrixResult = await buildDocMatrix(id);
    
    if (!matrixResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to build document matrix',
        details: matrixResult.error
      });
    }

    // Return successful result
    res.json(matrixResult);

  } catch (error) {
    console.error('Tree doc-matrix API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error building document matrix',
      details: error.message
    });
  }
});

// POST /api/cases/:id/tree/doc-upload
// Upload document file for specific person and document type
router.post('/cases/:id/tree/doc-upload', requireAuth, validateCaseAccess, apiRateLimit, fileUploadSecurity, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { personId, docType } = req.body;
    const file = req.file;

    // Validate case ID format
    const caseIdRegex = /^[A-Za-z0-9_-]+$/;
    if (!id || !caseIdRegex.test(id) || id.includes('..')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid case ID format'
      });
    }

    if (!personId || !docType || !file) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: personId, docType, or file'
      });
    }

    // Validate docType against allowed enum list
    if (!ALLOWED_DOC_TYPES.includes(docType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid document type. Allowed types: ${ALLOWED_DOC_TYPES.join(', ')}`
      });
    }

    // Sanitize filename to prevent path traversal attacks
    let sanitizedFilename;
    try {
      sanitizedFilename = sanitizeFilename(file.originalname);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: `Invalid filename: ${error.message}`
      });
    }

    // Get Dropbox access token using OAuth integration
    let accessToken;
    try {
      accessToken = await getAccessToken();
    } catch (error) {
      console.error('Dropbox OAuth error:', error);
      return res.status(503).json({
        success: false,
        error: 'Dropbox integration not configured or token expired. Please reconnect your Dropbox account.'
      });
    }

    const { Dropbox } = await import('dropbox');
    const dbx = new Dropbox({ 
      accessToken,
      fetch: fetch
    });

    // Determine file path based on document type using sanitized filename
    const isPolishDoc = docType.startsWith('PL_');
    const category = isPolishDoc ? 'pl' : 'foreign';
    const dropboxPath = `/CASES/${id}/portal/docs/${category}/${personId}/${sanitizedFilename}`;

    try {
      // Upload file to Dropbox
      const response = await dbx.filesUpload({
        path: dropboxPath,
        contents: file.buffer,
        mode: 'overwrite',
        autorename: true
      });

      // SECURITY: Do not create public shared links to prevent PII exposure
      // Links containing sensitive personal information should not be publicly accessible
      // If sharing is needed, it should be gated with proper authentication
      const shareLink = null; // Explicitly disabled for security

      res.json({
        success: true,
        message: 'Document uploaded successfully',
        file: {
          name: response.result.name,
          path: response.result.path_display,
          size: response.result.size,
          id: response.result.id,
          shareLink
        }
      });

    } catch (uploadError) {
      console.error('Dropbox upload error:', uploadError);
      res.status(500).json({
        success: false,
        error: 'Failed to upload file to Dropbox',
        details: uploadError.message
      });
    }

  } catch (error) {
    console.error('Document upload API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during file upload',
      details: error.message
    });
  }
});

export default router;