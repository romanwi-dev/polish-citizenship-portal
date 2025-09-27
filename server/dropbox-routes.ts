import type { Express } from 'express';
import multer from 'multer';
import { dropboxService } from './dropbox-service';
import { validateInput } from './security-middleware';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and Word documents allowed.'));
    }
  }
});

export function registerDropboxRoutes(app: Express) {
  
  // Upload document to Dropbox
  app.post('/api/dropbox/upload', upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file provided' 
        });
      }

      const { clientId, documentType = 'other', clientName } = req.body;

      if (!clientId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Client ID is required' 
        });
      }

      // Initialize client folder if first upload
      if (clientName) {
        await dropboxService.initializeClientFolder(clientId, clientName);
      }

      // Upload document
      const result = await dropboxService.uploadClientDocument(
        clientId,
        req.file.originalname,
        req.file.buffer,
        documentType as 'passport' | 'birth_certificate' | 'marriage_certificate' | 'other'
      );

      res.json(result);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  // List client documents
  app.get('/api/dropbox/documents/:clientId', async (req, res) => {
    try {
      const { clientId } = req.params;
      const result = await dropboxService.listClientDocuments(clientId);
      res.json(result);
    } catch (error) {
      console.error('List documents error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to list documents' 
      });
    }
  });

  // Download document
  app.get('/api/dropbox/download', async (req, res) => {
    try {
      const { filePath } = req.query;

      if (!filePath || typeof filePath !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'File path is required' 
        });
      }

      const result = await dropboxService.downloadDocument(filePath);

      if (!result.success) {
        return res.status(404).json(result);
      }

      // Set appropriate headers for file download
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${result.metadata?.name}"`);
      res.setHeader('Content-Length', result.metadata?.size || 0);

      res.send(result.fileBuffer);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Download failed' 
      });
    }
  });

  // Delete document
  app.delete('/api/dropbox/delete', async (req, res) => {
    try {
      const { filePath } = req.body;

      if (!filePath) {
        return res.status(400).json({ 
          success: false, 
          error: 'File path is required' 
        });
      }

      const result = await dropboxService.deleteDocument(filePath);
      res.json(result);
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Delete failed' 
      });
    }
  });

  // Get account info and storage usage
  app.get('/api/dropbox/account', async (req, res) => {
    try {
      const result = await dropboxService.getAccountInfo();
      res.json(result);
    } catch (error) {
      console.error('Account info error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get account info' 
      });
    }
  });

  // Search documents
  app.get('/api/dropbox/search', async (req, res) => {
    try {
      const { query, clientId } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Search query is required' 
        });
      }

      const result = await dropboxService.searchDocuments(
        query, 
        clientId as string | undefined
      );
      
      res.json(result);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Search failed' 
      });
    }
  });

  // Initialize client folder
  app.post('/api/dropbox/initialize-client', validateInput, async (req, res) => {
    try {
      const { clientId, clientName } = req.body;

      if (!clientId || !clientName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Client ID and name are required' 
        });
      }

      const result = await dropboxService.initializeClientFolder(clientId, clientName);
      res.json(result);
    } catch (error) {
      console.error('Initialize client error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to initialize client folder' 
      });
    }
  });

  // Get shareable link for a document
  app.post('/api/dropbox/share', async (req, res) => {
    try {
      const { filePath } = req.body;

      if (!filePath) {
        return res.status(400).json({ 
          success: false, 
          error: 'File path is required' 
        });
      }

      const result = await dropboxService.createShareableLink(filePath);
      res.json({ 
        success: true, 
        shareLink: result 
      });
    } catch (error) {
      console.error('Share link error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create share link' 
      });
    }
  });
}