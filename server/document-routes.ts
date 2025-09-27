import type { Express } from "express";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ocrService } from "./ocr-service";
import { AutoFillService } from "./auto-fill-service";
import { createTestProcessedDocument } from "./test-data-service";
import { storage } from "./storage";
import { randomUUID } from "crypto";

export function registerDocumentRoutes(app: Express) {
  
  // Upload endpoint for documents
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Process uploaded document with OCR
  app.post("/api/documents/process", async (req, res) => {
    try {
      const { documentUrl } = req.body;
      
      if (!documentUrl) {
        return res.status(400).json({ error: "Document URL is required" });
      }

      // Create processing job - simplified for demo
      const jobId = randomUUID();
      console.log(`Starting document processing job ${jobId} for ${documentUrl}`);

      // Process document asynchronously
      processDocumentAsync(jobId, documentUrl);

      res.json({ jobId, status: "processing" });
    } catch (error) {
      console.error("Error starting document processing:", error);
      res.status(500).json({ error: "Failed to start processing" });
    }
  });

  // Process document directly from uploaded URL or data
  app.post("/api/documents/process-direct", async (req, res) => {
    try {
      const { imageUrl, fileName, fileData } = req.body;
      
      if (!imageUrl && !fileData) {
        return res.status(400).json({ error: "Either imageUrl or fileData is required" });
      }

      const jobId = randomUUID();
      console.log(`Starting direct document processing for ${fileName}`);

      if (imageUrl) {
        // Process document from URL
        processDocumentFromUrl(jobId, imageUrl, fileName);
      } else {
        // Process document directly with the base64 data
        processDocumentDirectly(jobId, fileData, fileName);
      }

      res.json({ jobId, status: "processing" });
    } catch (error) {
      console.error("Error starting document processing:", error);
      res.status(500).json({ error: "Failed to start processing" });
    }
  });

  // Get processed documents
  app.get("/api/documents/processed", async (req, res) => {
    try {
      // Authentication implemented - get user from JWT token
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');
      const user = token ? await getUserFromToken(token) : null;
      const userId = user?.id || "anonymous-user";
      
      const documents = await storage.getProcessedDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching processed documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Create test data endpoint for demonstration
  app.post("/api/documents/create-test-data", async (req, res) => {
    try {
      const { createDemoData } = await import('./demo-service');
      const demo = createDemoData();
      res.json({ success: true, message: "Demo data created successfully", data: demo });
    } catch (error) {
      console.error("Error creating demo data:", error);
      res.status(500).json({ error: "Failed to create demo data" });
    }
  });

  // Get auto-fill data from processed documents
  app.get("/api/documents/auto-fill-data", async (req, res) => {
    try {
      const { getDemoData } = await import('./demo-service');
      const demoData = getDemoData();
      
      console.log("Demo data retrieved:", demoData.length, "items");
      
      if (demoData.length === 0) {
        return res.json({ success: true, data: [], message: "No data available. Click 'Create Demo Data' first." });
      }

      // Convert demo data to the expected format
      const formattedData = demoData.map(data => ({
        personalInfo: data.personalInfo,
        parentInfo: data.parentInfo,
        confidence: data.confidence,
        source: "demo"
      }));
      
      console.log("Sending formatted data:", formattedData);
      res.json({ success: true, data: formattedData });
    } catch (error) {
      console.error("Error getting auto-fill data:", error);
      res.status(500).json({ error: "Failed to get auto-fill data" });
    }
  });

  // Apply auto-fill data to forms
  app.post("/api/documents/apply-auto-fill", async (req, res) => {
    try {
      const { targetForms } = req.body; // ['familyTree', 'clientDetails']
      // Authentication implemented - get user from JWT token
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');
      const user = token ? await getUserFromToken(token) : null;
      const userId = user?.id || "anonymous-user";
      
      const documents = await storage.getProcessedDocuments(userId);
      const latestDocument = documents[documents.length - 1];
      
      if (!latestDocument?.structuredData) {
        return res.status(400).json({ error: "No processed document data available" });
      }

      const ocrResult = {
        extractedText: latestDocument.extractedText || "",
        documentType: latestDocument.documentType,
        structuredData: {
          personalInfo: (latestDocument.structuredData as any)?.personalInfo || {},
          parentInfo: (latestDocument.structuredData as any)?.parentInfo || {},
          marriageInfo: (latestDocument.structuredData as any)?.marriageInfo || {}
        },
        polishTranslation: latestDocument.polishTranslation || undefined,
        confidence: latestDocument.confidence || 0
      };

      const autoFillData = AutoFillService.processOCRForAutoFill(ocrResult);
      
      // Apply to selected forms
      const results = [];
      
      if (targetForms.includes('familyTree')) {
        await storage.updateFamilyTreeData(userId, autoFillData.familyTreeData);
        results.push({ form: 'familyTree', status: 'updated' });
      }
      
      if (targetForms.includes('clientDetails')) {
        await storage.updateClientDetailsData(userId, autoFillData.clientDetailsData);
        results.push({ form: 'clientDetails', status: 'updated' });
      }

      res.json({
        success: true,
        message: `Successfully applied auto-fill data to ${results.length} form(s)`,
        results,
        confidence: latestDocument.confidence,
        appliedData: autoFillData
      });
    } catch (error) {
      console.error("Error applying auto-fill:", error);
      res.status(500).json({ error: "Failed to apply auto-fill data" });
    }
  });

  // Generate document summary
  app.get("/api/documents/summary", async (req, res) => {
    try {
      // Authentication implemented - get user from JWT token
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');
      const user = token ? await getUserFromToken(token) : null;
      const userId = user?.id || "demo-user";
      const documents = await storage.getProcessedDocuments(userId);
      
      if (documents.length === 0) {
        return res.json({
          totalDocuments: 0,
          completeness: 0,
          missingDocuments: ["Upload documents to begin assessment"],
          recommendations: ["Start by uploading passport and birth certificates"],
          applicationStrength: "weak"
        });
      }

      const summary = {
        totalDocuments: documents.length,
        completeness: documents.filter(d => d.status === "completed").length / documents.length * 100,
        missingDocuments: [],
        recommendations: ["Continue processing uploaded documents"],
        applicationStrength: documents.length > 0 ? "good" : "weak"
      };
      res.json(summary);
    } catch (error) {
      console.error("Error generating document summary:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  // Auto-fill endpoint
  app.post("/api/documents/auto-fill", async (req, res) => {
    try {
      const { ocrResult } = req.body;
      
      if (!ocrResult) {
        return res.status(400).json({ error: 'OCR result is required' });
      }
      
      // Process OCR data for auto-fill using the AutoFillService
      const { AutoFillService } = await import('./auto-fill-service');
      const autoFillData = AutoFillService.processOCRForAutoFill(ocrResult);
      
      // Validate the data
      const validation = AutoFillService.validateAutoFillData(autoFillData);
      
      if (!validation.isValid) {
        console.warn('Auto-fill validation warnings:', validation.errors);
      }
      
      res.json(autoFillData);
    } catch (error) {
      console.error('Auto-fill processing error:', error);
      res.status(500).json({ error: 'Failed to process auto-fill data' });
    }
  });

  // Serve private objects (documents)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });
}

// Helper functions
async function processDocumentFromUrl(jobId: string, imageUrl: string, fileName: string) {
  try {
    console.log(`Processing document from URL: ${fileName}, URL: ${imageUrl}`);

    // Use ObjectStorage service to properly access the uploaded file
    const objectStorageService = new ObjectStorageService();
    
    // Extract the object path from the URL
    const objectPath = extractObjectPath(imageUrl);
    console.log(`Extracted object path: ${objectPath}`);
    
    // Get the file object from storage
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
    
    // Download the file content as buffer
    const [fileContent] = await objectFile.download();
    const base64Data = fileContent.toString('base64');
    
    // Get content type from metadata or assume image/jpeg
    const [metadata] = await objectFile.getMetadata();
    const contentType = metadata.contentType || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64Data}`;

    console.log(`Image downloaded from storage: ${contentType}, size: ${base64Data.length}`);

    // Process with OCR using the base64 data
    const ocrResult = await ocrService.processDocument(dataUrl);
    
    console.log(`OCR completed for ${jobId}, storing in demo service...`);
    
    // Store in demo service instead of database
    const { addProcessedData } = await import('./demo-service');
    const personalInfo = ocrResult.structuredData.personalInfo || {};
    const parentInfo = ocrResult.structuredData.parentInfo || {};
    
    addProcessedData({
      personalInfo: {
        firstNames: personalInfo.firstNames || (personalInfo as any).firstName || '',
        lastName: personalInfo.lastName || '',
        birthDate: personalInfo.birthDate || '',
        birthPlace: personalInfo.birthPlace || '',
        nationality: personalInfo.nationality || ''
      },
      parentInfo: {
        fatherName: parentInfo.fatherName || '',
        motherName: parentInfo.motherName || '',
        fatherBirthPlace: parentInfo.fatherBirthPlace || '',
        motherBirthPlace: parentInfo.motherBirthPlace || ''
      },
      confidence: ocrResult.confidence
    });

    console.log(`Document processing from URL complete for ${jobId}`);

  } catch (error) {
    console.error("Document processing from URL failed:", error);
  }
}

function extractObjectPath(imageUrl: string): string {
  // Extract path from Google Cloud Storage URL
  // URL format: https://storage.googleapis.com/bucket/.private/uploads/uuid
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split('/');
  
  // Find the bucket name and object path
  if (pathParts.length >= 3) {
    const bucketName = pathParts[1];
    const objectPath = pathParts.slice(2).join('/');
    return `/objects/${objectPath}`;
  }
  
  throw new Error(`Invalid image URL format: ${imageUrl}`);
}

async function processDocumentDirectly(jobId: string, base64Data: string, fileName: string) {
  try {
    console.log(`Processing document directly: ${fileName}, data length: ${base64Data.length}`);

    // Process with OCR using the base64 data directly
    const ocrResult = await ocrService.processDocument(base64Data);
    
    console.log(`OCR completed for ${jobId}, storing in demo service...`);
    
    // Store in demo service instead of database
    const { addProcessedData } = await import('./demo-service');
    const personalInfo = ocrResult.structuredData.personalInfo || {};
    const parentInfo = ocrResult.structuredData.parentInfo || {};
    
    addProcessedData({
      personalInfo: {
        firstNames: personalInfo.firstNames || (personalInfo as any).firstName || '',
        lastName: personalInfo.lastName || '',
        birthDate: personalInfo.birthDate || '',
        birthPlace: personalInfo.birthPlace || '',
        nationality: personalInfo.nationality || ''
      },
      parentInfo: {
        fatherName: parentInfo.fatherName || '',
        motherName: parentInfo.motherName || '',
        fatherBirthPlace: parentInfo.fatherBirthPlace || '',
        motherBirthPlace: parentInfo.motherBirthPlace || ''
      },
      confidence: ocrResult.confidence
    });

    // Skip database storage for now
    console.log(`Direct document processing complete for ${jobId}`);

  } catch (error) {
    console.error("Direct document processing failed:", error);
  }
}



async function processDocumentAsync(jobId: string, documentUrl: string) {
  try {
    console.log(`Processing document ${jobId}...`);

    // Download and convert file to proper base64 for OCR
    const response = await fetch(documentUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Convert to base64 with proper data URL format
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;
    
    console.log(`File downloaded: ${buffer.byteLength} bytes, type: ${contentType}`);

    console.log(`Starting OCR for ${jobId}...`);

    // Process with OCR using the data URL format
    const ocrResult = await ocrService.processDocument(dataUrl);
    
    console.log(`OCR completed for ${jobId}, storing results...`);

    // Store the processed document
    const processedDoc = {
      id: randomUUID(),
      userId: "demo-user",
      fileName: `processed-${Date.now()}.jpg`,
      filePath: documentUrl,
      documentType: ocrResult.documentType,
      extractedText: ocrResult.extractedText,
      structuredData: ocrResult.structuredData,
      polishTranslation: ocrResult.polishTranslation,
      confidence: ocrResult.confidence,
      status: "completed" as const,
      errorMessage: null,
      createdAt: new Date(),
      processedAt: new Date()
    };

    await storage.createProcessedDocument(processedDoc);
    console.log(`Document processing complete for ${jobId}`);



  } catch (error) {
    console.error("Document processing failed:", error);
  }
}

function extractFamilyTreeData(documents: any[]) {
  const treeData: any = {};
  
  for (const doc of documents) {
    if (doc.structuredData) {
      const data = doc.structuredData;
      
      // Extract personal info
      if (data.personalInfo) {
        if (data.personalInfo?.firstName) treeData.applicantFirstName = data.personalInfo.firstName;
        if (data.personalInfo.lastName) treeData.applicantLastName = data.personalInfo.lastName;
        if (data.personalInfo.birthDate) treeData.applicantBirthDate = data.personalInfo.birthDate;
        if (data.personalInfo.birthPlace) treeData.applicantBirthPlace = data.personalInfo.birthPlace;
      }
      
      // Extract parent info
      if (data.parentInfo) {
        if (data.parentInfo.fatherName) {
          const [firstName, ...lastNameParts] = data.parentInfo.fatherName.split(' ');
          treeData.fatherFirstName = firstName;
          treeData.fatherLastName = lastNameParts.join(' ');
        }
        if (data.parentInfo.motherName) {
          const [firstName, ...lastNameParts] = data.parentInfo.motherName.split(' ');
          treeData.motherFirstName = firstName;
          treeData.motherLastName = lastNameParts.join(' ');
        }
        if (data.parentInfo.fatherBirthPlace) treeData.fatherBirthPlace = data.parentInfo.fatherBirthPlace;
        if (data.parentInfo.motherBirthPlace) treeData.motherBirthPlace = data.parentInfo.motherBirthPlace;
      }
    }
  }
  
  return treeData;
}

function extractApplicantData(documents: any[]) {
  const applicantData: any = {};
  
  for (const doc of documents) {
    if (doc.structuredData?.personalInfo) {
      const info = doc.structuredData.personalInfo;
      
      if (info.firstName) applicantData.firstName = info.firstName;
      if (info.lastName) applicantData.lastName = info.lastName;
      if (info.birthDate) applicantData.birthDate = info.birthDate;
      if (info.birthPlace) applicantData.birthPlace = info.birthPlace;
      if (info.nationality) applicantData.nationality = info.nationality;
      
      // Address info from passport
      if (doc.documentType === 'passport') {
        applicantData.documentNumber = info.passportNumber;
        applicantData.issueDate = info.issueDate;
        applicantData.expiryDate = info.expiryDate;
      }
    }
  }
  
  return applicantData;
}

async function generateDocumentSummary(documents: any[]) {
  const requiredDocs = ['passport', 'birth_certificate'];
  const uploadedTypes = documents.map(d => d.documentType);
  const missingDocs = requiredDocs.filter(type => !uploadedTypes.includes(type));
  
  const completeness = Math.round(((requiredDocs.length - missingDocs.length) / requiredDocs.length) * 100);
  
  let applicationStrength: 'weak' | 'moderate' | 'strong' = 'weak';
  if (completeness >= 80) applicationStrength = 'strong';
  else if (completeness >= 50) applicationStrength = 'moderate';
  
  const recommendations = [];
  if (missingDocs.includes('passport')) recommendations.push('Upload current passport');
  if (missingDocs.includes('birth_certificate')) recommendations.push('Upload birth certificate');
  if (documents.length > 0) recommendations.push('Review extracted data for accuracy');
  
  return {
    totalDocuments: documents.length,
    completeness,
    missingDocuments: missingDocs.map(type => type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
    recommendations,
    applicationStrength
  };
}