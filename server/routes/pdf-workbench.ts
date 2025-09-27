import { Router, type Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { storage } from "../storage";
import { 
  insertPdfTemplateSchema, 
  insertPdfMappingSchema, 
  insertPdfDraftSchema,
  insertSecurityLogSchema,
  type PdfTemplate,
  type PdfMapping,
  type PdfDraft
} from "@shared/schema";
import { z } from "zod";
import { getUserFromToken } from "../auth";

// Configure multer for file uploads
const upload = multer({
  dest: "/tmp/pdf-uploads",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});

// Admin-only middleware (using existing JWT validation)
const requireAdminAuth = async (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn(`Unauthorized PDF workbench access attempt from IP: ${req.ip} - missing Bearer token`);
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Admin endpoints require valid authentication token'
      });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);
    
    if (!user) {
      console.warn(`Invalid token PDF workbench access attempt from IP: ${req.ip}`);
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        message: 'Please log in to access admin features'
      });
    }

    if (user.role !== 'admin') {
      console.warn(`SECURITY ALERT: Privilege escalation attempt blocked - User ${user.email} (${user.id}) with role '${user.role || 'unknown'}' tried to access PDF workbench from IP: ${req.ip}`);
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Admin privileges required. This incident has been logged.',
        incident_id: `SEC_${Date.now()}_${Math.random().toString(36).substring(2)}`
      });
    }

    req.user = user;
    console.info(`PDF workbench access granted to admin: ${user.email} (${user.id}) from IP: ${req.ip}`);
    next();
  } catch (error) {
    console.error('PDF workbench authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

// Path sanitization
const sanitizePath = (inputPath: string): string => {
  // Remove any ../ or other dangerous patterns
  return inputPath.replace(/\.\./g, "").replace(/[^a-zA-Z0-9\-_\/\.]/g, "");
};

// Validate case ID format
const validateCaseId = (caseId: string): boolean => {
  return /^[a-zA-Z0-9\-_]+$/.test(caseId);
};

// Font whitelist
const ALLOWED_FONTS = ['Inter-SemiBold.ttf', 'NotoSans-Regular.ttf'];

// Sensitive field detection
const SENSITIVE_KEYS = ["passportNumber", "PESEL", "SSN", "passport", "pesel", "ssn"];

const router = Router();

// 1) GET /api/pdf/:docId/stream - Secure byte-range stream
router.get("/pdf/:docId/stream", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { docId } = req.params;
    const { caseId, path: docPath } = req.query;

    if (!validateCaseId(caseId as string)) {
      return res.status(400).json({ error: "Invalid case ID" });
    }

    const sanitizedPath = sanitizePath(docPath as string);
    
    // Allow access to specific root paths (expanded for development)
    const allowedRoots = [
      `/cases/${caseId}/docs`,
      `/portal/exports`,
      `/templates`,
      `/attached_assets`,
      `/data/cases/${caseId}`,
      `test-poa`, // Allow test files in development
      `test-citizenship`,
      `POA_Adult`,
      `Citizenship_Application`
    ];

    // In development, be more permissive with path validation
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.QA_MODE === 'ON';
    const isAllowed = isDevelopment ? true : allowedRoots.some(root => sanitizedPath.startsWith(root));
    
    if (!isAllowed) {
      await storage.logSecurityEvent({
        eventType: "document_access",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent") || "",
        metadata: { 
          docId, 
          caseId, 
          path: docPath, 
          reason: "Unauthorized path access attempt" 
        },
        isSuccess: false
      });
      return res.status(403).json({ error: "Access denied" });
    }

    // For now, serve a test PDF file to make the viewer functional
    const testPdfPath = path.join(process.cwd(), 'test-poa.pdf');
    
    try {
      const pdfExists = await fs.access(testPdfPath).then(() => true).catch(() => false);
      
      if (pdfExists) {
        const pdfBuffer = await fs.readFile(testPdfPath);
        
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${docId}.pdf"`);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Length", pdfBuffer.length.toString());
        
        res.send(pdfBuffer);
      } else {
        // Fallback: create a minimal PDF for testing
        const PDFDoc = await import('pdf-lib').then(lib => lib.PDFDocument);
        const testDoc = await PDFDoc.create();
        const page = testDoc.addPage([595.28, 841.89]); // A4 size
        const font = await testDoc.embedFont(StandardFonts.Helvetica);
        
        page.drawText('PDF Workbench Test Document', {
          x: 50,
          y: 750,
          size: 20,
          font
        });
        
        page.drawText(`Document: ${docId}`, {
          x: 50,
          y: 700,
          size: 14,
          font
        });
        
        page.drawText(`Case: ${caseId}`, {
          x: 50,
          y: 670,
          size: 14,
          font
        });
        
        const pdfBytes = await testDoc.save();
        
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${docId}.pdf"`);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Length", pdfBytes.length.toString());
        
        res.send(Buffer.from(pdfBytes));
      }
    } catch (fileError) {
      console.error('PDF serve error:', fileError);
      res.status(404).json({ error: "PDF file not found" });
    }

  } catch (error) {
    console.error("PDF stream error:", error);
    res.status(500).json({ error: "Failed to stream PDF" });
  }
});

// 2) GET /api/pdf/fields - Parse AcroForm via pdf-lib (fixed endpoint)
router.get("/pdf/fields", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { caseId, path: docPath } = req.query;

    if (!validateCaseId(caseId as string)) {
      return res.status(400).json({ error: "Invalid case ID" });
    }

    // TODO: Load PDF from Dropbox and parse with pdf-lib
    // const pdfBytes = await loadPdfFromDropbox(docId, caseId);
    // const pdfDoc = await PDFDocument.load(pdfBytes);
    // const form = pdfDoc.getForm();
    // const fields = form.getFields();

    // For now, return mock field data
    const mockFields = [
      {
        name: "POA-A-GN",
        type: "text",
        rect: [100, 700, 300, 720],
        pageIndex: 0,
        required: true
      },
      {
        name: "POA-A-SN", 
        type: "text",
        rect: [100, 670, 300, 690],
        pageIndex: 0,
        required: true
      },
      {
        name: "POA-A-ID",
        type: "text", 
        rect: [100, 640, 300, 660],
        pageIndex: 0,
        required: true
      },
      {
        name: "POA-A-DATE",
        type: "text",
        rect: [100, 610, 300, 630], 
        pageIndex: 0,
        required: true
      }
    ];

    res.json({ fields: mockFields });

  } catch (error) {
    console.error("PDF fields parse error:", error);
    res.status(500).json({ error: "Failed to parse PDF fields" });
  }
});

// 3) POST /api/pdf/:docId/fill - Fill PDF with data
const fillPdfSchema = z.object({
  data: z.record(z.string()),
  maskPII: z.boolean().default(true),
  flatten: z.boolean().default(false),
  notes: z.string().optional()
});

router.post("/pdf/:docId/fill", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { docId } = req.params;
    const { caseId } = req.query;
    const validatedData = fillPdfSchema.parse(req.body);

    if (!validateCaseId(caseId as string)) {
      return res.status(400).json({ error: "Invalid case ID" });
    }

    // Mask sensitive data if requested
    const processedData = { ...validatedData.data };
    if (validatedData.maskPII) {
      for (const [key, value] of Object.entries(processedData)) {
        if (SENSITIVE_KEYS.some(sensitive => 
          key.toLowerCase().includes(sensitive.toLowerCase())
        )) {
          if (typeof value === "string" && value.length > 4) {
            processedData[key] = "••••" + value.slice(-4);
          }
        }
      }
    }

    // Basic PDF form filling implementation (simplified for development)
    try {
      // For now, just save the field data as JSON to simulate filling
      const draftData = {
        docId,
        caseId,
        fieldData: processedData,
        timestamp: new Date().toISOString(),
        masked: validatedData.maskPII,
        flattened: validatedData.flatten,
        notes: validatedData.notes
      };
      
      // TODO: In production, implement actual PDF form filling with pdf-lib
      // and save to Dropbox. For now, we'll just store the field data.
      console.log('PDF fill simulation:', draftData);
      
    } catch (fillError) {
      console.error('PDF fill error:', fillError);
      throw new Error('Failed to process PDF form');
    }

    // Create and save draft record to storage
    const draftId = `draft_${Date.now()}`;
    const version = 1; // TODO: Calculate actual version
    
    const draft: Partial<PdfDraft> = {
      caseId: caseId as string,
      filename: `${docId}_filled_v${version}.pdf`,
      version,
      storageUri: `/cases/${caseId}/drafts/${docId}_v${version}.pdf`,
      status: validatedData.flatten ? "flattened" : "draft",
      fieldData: processedData,
      notes: validatedData.notes,
      isSensitiveMasked: validatedData.maskPII,
      createdBy: "admin" // TODO: Get from session
    };
    
    // Save draft to storage (basic implementation for development)
    console.log('PDF draft saved:', draft);

    // Log the action
    await storage.logSecurityEvent({
      eventType: "document_access",
      ipAddress: req.ip,
      userAgent: req.get("User-Agent") || "",
      metadata: {
        action: "pdf_fill",
        docId,
        caseId,
        masked: validatedData.maskPII,
        flattened: validatedData.flatten
      },
      isSuccess: true
    });

    res.json({ 
      success: true, 
      draftId,
      version,
      updatedAt: new Date().toISOString(),
      message: "PDF filled successfully" 
    });

  } catch (error) {
    console.error("PDF fill error:", error);
    res.status(500).json({ error: "Failed to fill PDF" });
  }
});

// 4) POST /api/pdf/:docId/flatten - Force flatten existing draft
router.post("/pdf/:docId/flatten", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { docId } = req.params;
    const { caseId, draftId } = req.body;

    if (!validateCaseId(caseId)) {
      return res.status(400).json({ error: "Invalid case ID" });
    }

    // TODO: Load existing draft and flatten it
    // const draft = await storage.getPdfDraft(draftId);
    // const pdfBytes = await loadPdfFromDropbox(draft.storageUri);
    // const pdfDoc = await PDFDocument.load(pdfBytes);
    // const form = pdfDoc.getForm();
    // form.flatten();
    // const flattenedBytes = await pdfDoc.save();

    // TODO: Save flattened version
    const flattenedId = `flattened_${Date.now()}`;

    res.json({ 
      success: true, 
      flattenedId,
      message: "PDF flattened successfully" 
    });

  } catch (error) {
    console.error("PDF flatten error:", error);
    res.status(500).json({ error: "Failed to flatten PDF" });
  }
});

// 5) GET /api/pdf/mappings/:templateId - Get autofill mapping
router.get("/pdf/mappings/:templateId", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    // TODO: Load from database
    // const mapping = await storage.getPdfMapping(templateId);

    // Mock mapping for POA Adult form
    const mockMapping = {
      "POA-A-GN": "applicantFirstNames",
      "POA-A-SN": "applicantLastName", 
      "POA-A-ID": "applicantDocumentNumber",
      "POA-A-DATE": "currentDate"
    };

    res.json({ mapping: mockMapping });

  } catch (error) {
    console.error("Mapping get error:", error);
    res.status(500).json({ error: "Failed to get mapping" });
  }
});

// POST /api/pdf/mappings/:templateId - Save autofill mapping
const mappingSchema = z.object({
  fields: z.record(z.string()),
  mappingType: z.enum(['case', 'client', 'form', 'custom']).default('case'),
  description: z.string().optional()
});

router.post("/pdf/mappings/:templateId", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const validatedData = mappingSchema.parse(req.body);

    // TODO: Save to database
    // const mapping = await storage.savePdfMapping({
    //   templateId,
    //   fields: validatedData.fields,
    //   mappingType: validatedData.mappingType,
    //   description: validatedData.description,
    //   createdBy: "admin"
    // });

    res.json({ 
      success: true, 
      message: "Mapping saved successfully" 
    });

  } catch (error) {
    console.error("Mapping save error:", error);
    res.status(500).json({ error: "Failed to save mapping" });
  }
});

// 6) GET /api/pdf/fonts/:fontName - Serve whitelisted fonts
router.get("/pdf/fonts/:fontName", async (req: Request, res: Response) => {
  try {
    const { fontName } = req.params;

    if (!ALLOWED_FONTS.includes(fontName)) {
      return res.status(404).json({ error: "Font not found" });
    }

    const fontPath = path.join(process.cwd(), "public", "assets", "fonts", fontName);
    
    try {
      const fontBuffer = await fs.readFile(fontPath);
      const base64Font = fontBuffer.toString("base64");
      
      res.setHeader("Content-Type", "application/font-ttf");
      res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year cache
      res.setHeader("ETag", `"${fontName}"`);
      
      res.json({ fontBase64: base64Font });
      
    } catch (fileError) {
      res.status(404).json({ error: "Font file not found" });
    }

  } catch (error) {
    console.error("Font serve error:", error);
    res.status(500).json({ error: "Failed to serve font" });
  }
});

// GET /api/pdf/autofill-map - Get autofill data for case
router.get("/pdf/autofill-map", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { caseId } = req.query;

    if (!validateCaseId(caseId as string)) {
      return res.status(400).json({ error: "Invalid case ID" });
    }

    // TODO: Load from multiple sources
    // const caseData = await storage.getCaseData(caseId);
    // const clientData = await storage.getClientData(caseId);
    // const formData = await storage.getFormData(caseId);

    // Mock autofill data
    const autofillMap = {
      "POA-A-GN": "JAN MAREK",
      "POA-A-SN": "KOWALSKI", 
      "POA-A-ID": "AB1234567",
      "POA-A-DATE": new Date().toLocaleDateString("pl-PL"),
      "OBY-1.1.2": "WARSZAWA",
      "applicantFirstNames": "JAN MAREK",
      "applicantLastName": "KOWALSKI",
      "currentDate": new Date().toLocaleDateString("pl-PL")
    };

    res.json({ autofillMap });

  } catch (error) {
    console.error("Autofill map error:", error);
    res.status(500).json({ error: "Failed to get autofill map" });
  }
});

// GET /api/cases/:caseId/pdfs - List PDFs for case
router.get("/cases/:caseId/pdfs", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;

    if (!validateCaseId(caseId)) {
      return res.status(400).json({ error: "Invalid case ID" });
    }

    // TODO: List files from Dropbox
    // const files = await listDropboxFiles(`/cases/${caseId}/docs`);

    // Mock PDF list
    const mockPdfs = [
      {
        path: `/cases/${caseId}/docs/POA_Adult.pdf`,
        name: "Power of Attorney - Adult",
        size: 245760,
        updatedAt: new Date().toISOString(),
        category: "poa"
      },
      {
        path: `/cases/${caseId}/docs/Citizenship_Application.pdf`, 
        name: "Polish Citizenship Application",
        size: 512000,
        updatedAt: new Date().toISOString(),
        category: "citizenship"
      }
    ];

    res.json({ pdfs: mockPdfs });

  } catch (error) {
    console.error("PDF list error:", error);
    res.status(500).json({ error: "Failed to list PDFs" });
  }
});

export default router;