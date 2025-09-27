import type { Express } from 'express';
import multer from 'multer';
import { microsoftService } from './microsoft-service';
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

export function registerMicrosoftRoutes(app: Express) {
  
  // Upload document to OneDrive
  app.post('/api/microsoft/upload', upload.single('document'), async (req, res) => {
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
        await microsoftService.initializeClientFolder(clientId, clientName);
      }

      // Upload document
      const result = await microsoftService.uploadClientDocument(
        clientId,
        req.file.originalname,
        req.file.buffer,
        documentType as 'passport' | 'birth_certificate' | 'marriage_certificate' | 'other'
      );

      res.json(result);
    } catch (error) {
      console.error('Microsoft upload error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  // List client documents
  app.get('/api/microsoft/documents/:clientId', async (req, res) => {
    try {
      const { clientId } = req.params;
      const result = await microsoftService.listClientDocuments(clientId);
      res.json(result);
    } catch (error) {
      console.error('Microsoft list documents error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to list documents' 
      });
    }
  });

  // Download document
  app.get('/api/microsoft/download', async (req, res) => {
    try {
      const { fileId } = req.query;

      if (!fileId || typeof fileId !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'File ID is required' 
        });
      }

      const result = await microsoftService.downloadDocument(fileId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      // Set appropriate headers for file download
      res.setHeader('Content-Type', result.metadata?.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${result.metadata?.name}"`);
      res.setHeader('Content-Length', result.metadata?.size || 0);

      res.send(result.fileBuffer);
    } catch (error) {
      console.error('Microsoft download error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Download failed' 
      });
    }
  });

  // Delete document
  app.delete('/api/microsoft/delete', async (req, res) => {
    try {
      const { fileId } = req.body;

      if (!fileId) {
        return res.status(400).json({ 
          success: false, 
          error: 'File ID is required' 
        });
      }

      const result = await microsoftService.deleteDocument(fileId);
      res.json(result);
    } catch (error) {
      console.error('Microsoft delete error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Delete failed' 
      });
    }
  });

  // Get account info
  app.get('/api/microsoft/account', async (req, res) => {
    try {
      const result = await microsoftService.getAccountInfo();
      res.json(result);
    } catch (error) {
      console.error('Microsoft account info error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get account info' 
      });
    }
  });

  // Search documents
  app.get('/api/microsoft/search', async (req, res) => {
    try {
      const { query, clientId } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Search query is required' 
        });
      }

      const result = await microsoftService.searchDocuments(
        query, 
        clientId as string | undefined
      );
      
      res.json(result);
    } catch (error) {
      console.error('Microsoft search error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Search failed' 
      });
    }
  });

  // Initialize client folder
  app.post('/api/microsoft/initialize-client', validateInput, async (req, res) => {
    try {
      const { clientId, clientName } = req.body;

      if (!clientId || !clientName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Client ID and name are required' 
        });
      }

      const result = await microsoftService.initializeClientFolder(clientId, clientName);
      res.json(result);
    } catch (error) {
      console.error('Microsoft initialize client error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to initialize client folder' 
      });
    }
  });

  // Create Word document
  app.post('/api/microsoft/create-word', validateInput, async (req, res) => {
    try {
      const { clientId, templateData } = req.body;

      if (!clientId || !templateData) {
        return res.status(400).json({ 
          success: false, 
          error: 'Client ID and template data are required' 
        });
      }

      const result = await microsoftService.createWordDocument(clientId, templateData);
      res.json(result);
    } catch (error) {
      console.error('Microsoft Word creation error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create Word document' 
      });
    }
  });
}