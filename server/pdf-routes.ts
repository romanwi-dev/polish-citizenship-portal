import type { Express, Request, Response } from "express";
import { 
  pdfGenerator, 
  type PolishCitizenshipApplicationData,
  poaPdfGenerator,
  type PowerOfAttorneyData,
  familyTreePdfGenerator,
  type FamilyTreeData,
  applicantDetailsPdfGenerator,
  type ApplicantDetailsData,
  documentChecklistPdfGenerator,
  type DocumentChecklistData,
  generateComprehensiveDocumentPackage
} from "./pdf-generator";
import { adobePDFEditingService } from "./adobe-pdf-editing-service";
import { z } from "zod";
import crypto from "crypto";

// Store generated PDFs temporarily (in production, use Redis or similar)
const pdfCache = new Map<string, { buffer: Buffer, filename: string, createdAt: Date }>();

// Clean up old PDFs every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [id, pdf] of Array.from(pdfCache.entries())) {
    if (now.getTime() - pdf.createdAt.getTime() > 10 * 60 * 1000) { // 10 minutes
      pdfCache.delete(id);
    }
  }
}, 5 * 60 * 1000);

// One-Click Comprehensive Document Compilation (Legacy - replaced by improved version)
async function generateLegacyComprehensiveDocumentPackage(data: any): Promise<{ id: string, files: Array<{ filename: string, buffer: Buffer }> }> {
  const packageId = crypto.randomUUID();
  const files: Array<{ filename: string, buffer: Buffer }> = [];
  
  try {
    console.log('Generating comprehensive document package:', packageId);

    // 1. Polish Citizenship Application
    if (data.citizenshipData) {
      const citizenshipPdf = await pdfGenerator.generateCitizenshipApplication(data.citizenshipData);
      files.push({
        filename: `01-polish-citizenship-application-${packageId.slice(0, 8)}.pdf`,
        buffer: Buffer.from(citizenshipPdf)
      });
      console.log('Generated Polish Citizenship Application PDF');
    }

    // 2. Power of Attorney (Single - always included)
    if (data.poaData?.single) {
      const singlePoaPdf = await poaPdfGenerator.generatePOA(data.poaData.single);
      files.push({
        filename: `02-power-of-attorney-single-${packageId.slice(0, 8)}.pdf`,
        buffer: Buffer.from(singlePoaPdf)
      });
      console.log('Generated Single POA PDF');
    }

    // 3. Power of Attorney (Married - if married)
    if (data.poaData?.married) {
      const marriedPoaPdf = await poaPdfGenerator.generatePOA(data.poaData.married);
      files.push({
        filename: `03-power-of-attorney-married-${packageId.slice(0, 8)}.pdf`,
        buffer: Buffer.from(marriedPoaPdf)
      });
      console.log('Generated Married POA PDF');
    }

    // 4. Power of Attorney (Minor - if has children)
    if (data.poaData?.minor) {
      const minorPoaPdf = await poaPdfGenerator.generatePOA(data.poaData.minor);
      files.push({
        filename: `04-power-of-attorney-minor-${packageId.slice(0, 8)}.pdf`,
        buffer: Buffer.from(minorPoaPdf)
      });
      console.log('Generated Minor POA PDF');
    }

    // 5. Family Tree
    if (data.familyTreeData) {
      const familyTreePdf = await familyTreePdfGenerator.generateFamilyTree(data.familyTreeData);
      files.push({
        filename: `05-family-tree-genealogy-${packageId.slice(0, 8)}.pdf`,
        buffer: Buffer.from(familyTreePdf)
      });
      console.log('Generated Family Tree PDF');
    }

    // 6. Document Checklist
    if (data.checklistData) {
      const checklistPdf = await documentChecklistPdfGenerator.generateChecklist(data.checklistData);
      files.push({
        filename: `06-document-checklist-${packageId.slice(0, 8)}.pdf`,
        buffer: Buffer.from(checklistPdf)
      });
      console.log('Generated Document Checklist PDF');
    }

    console.log(`Generated ${files.length} PDFs in package ${packageId}`);
    return { id: packageId, files };
  } catch (error) {
    console.error('Comprehensive PDF generation failed:', error);
    throw new Error(`Document package generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Validation schema for PDF generation
const CitizenshipApplicationSchema = z.object({
  // Applicant Information
  applicantName: z.string().min(1, "Applicant name is required"),
  applicantAddress: z.string().optional().default(""),
  applicantState: z.string().optional().default(""),
  applicantStreet: z.string().optional().default(""),
  applicantHouseNumber: z.string().optional().default(""),
  applicantApartmentNumber: z.string().optional().default(""),
  applicantPostalCode: z.string().optional().default(""),
  applicantCity: z.string().optional().default(""),
  applicantMobilePhone: z.string().optional().default(""),
  applicationType: z.enum(['confirmation', 'loss_confirmation']).default('confirmation'),
  subjectName: z.string().min(1, "Subject name is required"),
  additionalFactualInfo: z.string().optional().default(""),
  thirdPartyPurpose: z.string().optional().default(""),

  // Subject Personal Data
  lastName: z.string().min(1, "Last name is required"),
  maidenName: z.string().optional().default(""),
  firstNames: z.string().min(1, "First names are required"),
  fatherFullName: z.string().optional().default(""),
  motherMaidenName: z.string().optional().default(""),
  usedSurnamesWithDates: z.string().optional().default(""),
  birthDate: z.string().min(1, "Birth date is required"),
  gender: z.enum(['kobieta', 'mężczyzna']).default('kobieta'),
  birthPlace: z.string().min(1, "Birth place is required"),
  foreignCitizenshipsWithDates: z.string().optional().default(""),
  maritalStatus: z.enum(['kawaler/panna', 'żonaty/mężatka', 'rozwiedziony/rozwiedziona', 'wdowiec/wdowa']).default('kawaler/panna'),
  peselNumber: z.string().optional().default(""),

  // Citizenship Decisions
  previousCitizenshipDecision: z.boolean().default(false),
  previousDecisionDetails: z.string().optional().default(""),
  citizenshipChangeRequest: z.boolean().default(false),
  citizenshipChangeDetails: z.string().optional().default(""),
  residenceHistory: z.string().optional().default(""),

  // Mother's Data
  motherLastName: z.string().optional().default(""),
  motherMaidenNameFull: z.string().optional().default(""),
  motherFirstNames: z.string().optional().default(""),
  motherFatherName: z.string().optional().default(""),
  motherMotherMaidenName: z.string().optional().default(""),
  motherUsedSurnamesWithDates: z.string().optional().default(""),
  motherBirthDate: z.string().optional().default(""),
  motherBirthPlace: z.string().optional().default(""),
  motherMaritalStatus: z.string().optional().default(""),
  motherMarriageDate: z.string().optional().default(""),
  motherMarriagePlace: z.string().optional().default(""),
  motherCitizenshipsAtBirth: z.string().optional().default(""),
  motherPesel: z.string().optional().default(""),

  // Father's Data
  fatherLastName: z.string().optional().default(""),
  fatherMaidenNameFull: z.string().optional().default(""),
  fatherFirstNames: z.string().optional().default(""),
  fatherFatherName: z.string().optional().default(""),
  fatherMotherMaidenName: z.string().optional().default(""),
  fatherUsedSurnamesWithDates: z.string().optional().default(""),
  fatherBirthDate: z.string().optional().default(""),
  fatherBirthPlace: z.string().optional().default(""),
  fatherMaritalStatus: z.string().optional().default(""),
  fatherMarriageDate: z.string().optional().default(""),
  fatherMarriagePlace: z.string().optional().default(""),
  fatherCitizenshipsAtBirth: z.string().optional().default(""),
  fatherPesel: z.string().optional().default(""),

  // Grandparents Data
  maternalGrandfatherLastName: z.string().optional().default(""),
  maternalGrandfatherFirstNames: z.string().optional().default(""),
  maternalGrandfatherBirthDate: z.string().optional().default(""),
  maternalGrandfatherBirthPlace: z.string().optional().default(""),
  maternalGrandmotherLastName: z.string().optional().default(""),
  maternalGrandmotherMaidenName: z.string().optional().default(""),
  maternalGrandmotherFirstNames: z.string().optional().default(""),
  maternalGrandmotherBirthDate: z.string().optional().default(""),
  maternalGrandmotherBirthPlace: z.string().optional().default(""),
  paternalGrandfatherLastName: z.string().optional().default(""),
  paternalGrandfatherFirstNames: z.string().optional().default(""),
  paternalGrandfatherBirthDate: z.string().optional().default(""),
  paternalGrandfatherBirthPlace: z.string().optional().default(""),
  paternalGrandmotherLastName: z.string().optional().default(""),
  paternalGrandmotherMaidenName: z.string().optional().default(""),
  paternalGrandmotherFirstNames: z.string().optional().default(""),
  paternalGrandmotherBirthDate: z.string().optional().default(""),
  paternalGrandmotherBirthPlace: z.string().optional().default(""),
});

export function registerPDFRoutes(app: Express) {
  // GET endpoints for direct PDF generation with demo data
  app.get("/api/pdf/family-tree", async (req: Request, res: Response) => {
    try {
      const demoData: FamilyTreeData = {
        members: [
          {
            id: '1',
            name: 'Jan KOWALSKI',
            relationship: 'Father',
            birthDate: '1960-05-15',
            birthPlace: 'Warsaw, Poland',
            emigrationDate: '1985-03-10',
            naturalizationDate: '1990-07-20',
            notes: 'Polish citizen by birth'
          },
          {
            id: '2', 
            name: 'Maria NOWAK',
            relationship: 'Mother',
            birthDate: '1962-08-22',
            birthPlace: 'Krakow, Poland',
            emigrationDate: '1985-03-10',
            naturalizationDate: '1990-07-20',
            notes: 'Polish citizen by birth'
          }
        ],
        lastUpdated: new Date().toISOString()
      };

      const pdfBuffer = await familyTreePdfGenerator.generateFamilyTree(demoData);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Family_Tree_Demo.pdf"',
        'Content-Length': pdfBuffer.length.toString()
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating family tree PDF:', error);
      res.status(500).json({ error: 'Failed to generate family tree PDF' });
    }
  });

  app.get("/api/pdf/poa/single", async (req: Request, res: Response) => {
    try {
      const demoData: PowerOfAttorneyData = {
        type: 'single',
        applicantName: "John DOE",
        documentNumber: "ABC123456",
        date: new Date().toLocaleDateString('en-GB'),
        childName: "Jane DOE"
      };

      const pdfBuffer = await poaPdfGenerator.generatePOA(demoData);
      
      res.set({
        'Content-Type': 'application/pdf', 
        'Content-Disposition': 'inline; filename="Power_of_Attorney_Single_Demo.pdf"',
        'Content-Length': pdfBuffer.length.toString()
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating single POA PDF:', error);
      res.status(500).json({ error: 'Failed to generate single POA PDF' });
    }
  });

  app.get("/api/pdf/poa/married", async (req: Request, res: Response) => {
    try {
      const demoData: PowerOfAttorneyData = {
        type: 'married',
        applicantName: "John DOE",
        documentNumber: "ABC123456",
        date: new Date().toLocaleDateString('en-GB'),
        spouseName: "Jane DOE",
        childName: "Jack DOE"
      };

      const pdfBuffer = await poaPdfGenerator.generatePOA(demoData);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Power_of_Attorney_Married_Demo.pdf"',
        'Content-Length': pdfBuffer.length.toString()
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating married POA PDF:', error);
      res.status(500).json({ error: 'Failed to generate married POA PDF' });
    }
  });

  app.get("/api/pdf/poa/archives", async (req: Request, res: Response) => {
    try {
      const demoData: PowerOfAttorneyData = {
        type: 'archives',
        applicantName: "John DOE",
        documentNumber: "ABC123456",
        date: new Date().toLocaleDateString('en-GB')
      };

      const pdfBuffer = await poaPdfGenerator.generatePOA(demoData);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Power_of_Attorney_Archives_Demo.pdf"',
        'Content-Length': pdfBuffer.length.toString()
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating archives POA PDF:', error);
      res.status(500).json({ error: 'Failed to generate archives POA PDF' });
    }
  });

  // Polish Citizenship Application PDF Generation
  app.get("/api/pdf/citizenship-application", async (req: Request, res: Response) => {
    try {
      const demoData = {
        applicantName: "Jan KOWALSKI",
        birthPlace: "Warsaw, Poland",
        currentAddress: "123 Main Street, New York, NY",
        parentName: "Maria NOWAK",
        parentBirthPlace: "Krakow, Poland"
      };

      // Skip problematic demo generation for now - interface mismatch
      const pdfBuffer = Buffer.from('Demo PDF placeholder');
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Polish_Citizenship_Application_Demo.pdf"',
        'Content-Length': pdfBuffer.length.toString()
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating citizenship application PDF:', error);
      res.status(500).json({ error: 'Failed to generate citizenship application PDF' });
    }
  });

  // GET endpoint for serving cached PDFs (mobile-friendly)
  app.get("/api/pdf/view/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const pdf = pdfCache.get(id);
    
    if (!pdf) {
      res.status(404).json({ error: "PDF not found or expired" });
      return;
    }
    
    // Set headers for mobile browser handling
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.filename}"`);
    res.setHeader('Content-Length', pdf.buffer.length.toString());
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send the PDF buffer
    res.send(pdf.buffer);
  });

  // POA Single endpoint (for dashboard)
  app.post("/api/pdf/poa/single", async (req: Request, res: Response) => {
    try {
      const applicantData = req.body.applicantData || {};
      const data: PowerOfAttorneyData = {
        type: 'single',
        principalFullName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
        principalBirthDate: applicantData.birthDate || 'DD.MM.YYYY',
        principalBirthPlace: applicantData.birthPlace || 'MIEJSCE URODZENIA',
        principalAddress: applicantData.currentAddress || 'ADRES ZAMIESZKANIA',
        principalPassportNumber: applicantData.passportNumber || 'NUMER DOKUMENTU',
        principalPhone: applicantData.mobilePhone || 'TELEFON',
        principalEmail: applicantData.email || 'EMAIL@EXAMPLE.COM',
        applicantName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
        documentNumber: applicantData.passportNumber || 'NUMER DOKUMENTU',
        date: new Date().toLocaleDateString('pl-PL')
      };

      const pdfBytes = await poaPdfGenerator.generatePOA(data);
      
      // For mobile: store PDF and return URL
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
      
      if (isMobile || req.body.returnUrl) {
        // Generate unique ID and store PDF
        const pdfId = crypto.randomBytes(16).toString('hex');
        pdfCache.set(pdfId, {
          buffer: Buffer.from(pdfBytes),
          filename: 'Power_of_Attorney_Single.pdf',
          createdAt: new Date()
        });
        
        // Return URL for mobile viewing
        const protocol = req.protocol;
        const host = req.get('host');
        const viewUrl = `${protocol}://${host}/api/pdf/view/${pdfId}`;
        
        res.json({ url: viewUrl, id: pdfId });
      } else {
        // Desktop: direct download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Power_of_Attorney_Single.pdf"');
        res.send(Buffer.from(pdfBytes));
      }
    } catch (error) {
      console.error("Error generating POA Single PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // POA Married endpoint
  app.post("/api/pdf/poa/married", async (req: Request, res: Response) => {
    try {
      const applicantData = req.body.applicantData || {};
      const data: PowerOfAttorneyData = {
        type: 'married',
        principalFullName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
        principalBirthDate: applicantData.birthDate || 'DD.MM.YYYY',
        principalBirthPlace: applicantData.birthPlace || 'MIEJSCE URODZENIA',
        principalAddress: applicantData.currentAddress || 'ADRES ZAMIESZKANIA',
        principalPassportNumber: applicantData.passportNumber || 'NUMER DOKUMENTU',
        principalPhone: applicantData.mobilePhone || 'TELEFON',
        principalEmail: applicantData.email || 'EMAIL@EXAMPLE.COM',
        spouseName: `${applicantData.spouseFirstNames || ''} ${applicantData.spouseLastName || ''}`.trim() || 'MAŁŻONEK NAZWISKO IMIONA',
        spouseDocumentNumber: applicantData.spousePassportNumber || 'NUMER DOKUMENTU MAŁŻONKA',
        applicantName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
        documentNumber: applicantData.passportNumber || 'NUMER DOKUMENTU',
        date: new Date().toLocaleDateString('pl-PL')
      };

      const pdfBytes = await poaPdfGenerator.generatePOA(data);
      
      // Mobile handling
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
      
      if (isMobile || req.body.returnUrl) {
        const pdfId = crypto.randomBytes(16).toString('hex');
        pdfCache.set(pdfId, {
          buffer: Buffer.from(pdfBytes),
          filename: 'Power_of_Attorney_Married.pdf',
          createdAt: new Date()
        });
        
        const protocol = req.protocol;
        const host = req.get('host');
        const viewUrl = `${protocol}://${host}/api/pdf/view/${pdfId}`;
        
        res.json({ url: viewUrl, id: pdfId });
      } else {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Power_of_Attorney_Married.pdf"');
        res.send(Buffer.from(pdfBytes));
      }
    } catch (error) {
      console.error("Error generating POA Married PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // POA Archives endpoint
  app.post("/api/pdf/poa/archives", async (req: Request, res: Response) => {
    try {
      const data: PowerOfAttorneyData = {
        type: 'archives',
        principalFullName: req.body.applicantData?.name || '',
        principalBirthDate: '15.01.1990',
        principalBirthPlace: req.body.applicantData?.birthPlace || 'New York, USA',
        principalAddress: req.body.applicantData?.currentAddress || '123 Main St, New York, NY 10001',
        principalPassportNumber: 'US123456789',
        principalPhone: '+1-555-123-4567',
        principalEmail: req.body.applicantData?.email || '',
        applicantName: req.body.applicantData?.name || '',
        documentNumber: 'US123456789',
        date: new Date().toLocaleDateString('pl-PL')
      };

      const pdfBytes = await poaPdfGenerator.generatePOA(data);
      
      // Mobile handling
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
      
      if (isMobile || req.body.returnUrl) {
        const pdfId = crypto.randomBytes(16).toString('hex');
        pdfCache.set(pdfId, {
          buffer: Buffer.from(pdfBytes),
          filename: 'Power_of_Attorney_Archives.pdf',
          createdAt: new Date()
        });
        
        const protocol = req.protocol;
        const host = req.get('host');
        const viewUrl = `${protocol}://${host}/api/pdf/view/${pdfId}`;
        
        res.json({ url: viewUrl, id: pdfId });
      } else {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Power_of_Attorney_Archives.pdf"');
        res.send(Buffer.from(pdfBytes));
      }
    } catch (error) {
      console.error("Error generating POA Archives PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Family Tree endpoint
  app.post("/api/pdf/family-tree", async (req: Request, res: Response) => {
    try {
      const data: FamilyTreeData = {
        members: [
          { id: '1', name: req.body.applicantData?.name || '', birthDate: '1990-01-01', birthPlace: 'New York', relationship: 'Applicant' },
          { id: '2', name: req.body.familyData?.father?.name || '', birthDate: '1960-01-01', birthPlace: 'Chicago', relationship: 'Father' },
          { id: '3', name: req.body.familyData?.mother?.name || 'Anna Kowalski', birthDate: '1962-01-01', birthPlace: 'Warsaw', relationship: 'Mother' },
          { id: '4', name: 'Jan Kowalski', birthDate: '1930-01-01', birthPlace: 'Krakow', relationship: 'Grandfather' }
        ],
        lastUpdated: new Date().toISOString()
      };

      const pdfBytes = await familyTreePdfGenerator.generateFamilyTree(data);
      
      // Mobile handling
      const userAgent = req.headers['user-agent'] || '';
      const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
      
      if (isMobile || req.body.returnUrl) {
        const pdfId = crypto.randomBytes(16).toString('hex');
        pdfCache.set(pdfId, {
          buffer: Buffer.from(pdfBytes),
          filename: 'Family_Tree.pdf',
          createdAt: new Date()
        });
        
        const protocol = req.protocol;
        const host = req.get('host');
        const viewUrl = `${protocol}://${host}/api/pdf/view/${pdfId}`;
        
        res.json({ url: viewUrl, id: pdfId });
      } else {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Family_Tree.pdf"');
        res.send(Buffer.from(pdfBytes));
      }
    } catch (error) {
      console.error("Error generating Family Tree PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Document Checklist endpoint
  app.post("/api/pdf/checklist", async (req: Request, res: Response) => {
    try {
      const data: DocumentChecklistData = {
        applicantName: req.body.applicantData?.name || '',
        caseNumber: 'PL2025001',
        dateGenerated: new Date().toLocaleDateString('pl-PL'),
        categories: [],
        overallProgress: 75
      };

      const pdfBytes = await documentChecklistPdfGenerator.generateChecklist(data);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="Document_Checklist.pdf"');
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error generating Checklist PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Citizenship Application endpoint
  app.post("/api/pdf/citizenship-application", async (req: Request, res: Response) => {
    try {
      const fullData = {
        // Required applicant fields from unified dashboard
        applicantName: req.body.applicantData?.applicantName || '',
        applicantAddress: req.body.applicantData?.currentAddress || '',
        applicantStreet: '123 Main St',
        applicantHouseNumber: '123',
        applicantApartmentNumber: '',
        applicantCity: 'New York',
        applicantState: 'NY',
        applicantPostalCode: '10001',
        applicantMobilePhone: '+1-555-123-4567',
        
        // Application details
        applicationType: 'confirmation' as const,
        subjectName: req.body.applicantData?.name || '',
        additionalFactualInfo: '',
        thirdPartyPurpose: '',
        
        // Personal data
        lastName: '',
        maidenName: '',
        firstNames: '',
        fatherFullName: '',
        motherMaidenName: 'Kowalska',
        usedSurnamesWithDates: '',
        birthDate: req.body.applicantData?.birthDate || '15.01.1990',
        birthPlace: req.body.applicantData?.birthPlace || 'New York, USA',
        gender: 'mężczyzna' as const,
        maritalStatus: 'kawaler/panna' as const,
        peselNumber: '',
        foreignCitizenshipsWithDates: 'USA - od urodzenia',
        
        // Citizenship decisions
        previousCitizenshipDecision: false,
        previousDecisionDetails: '',
        citizenshipChangeRequest: false,
        citizenshipChangeDetails: '',
        residenceHistory: '',
        
        // Mother's complete data
        motherLastName: 'Kowalska',
        motherMaidenNameFull: 'Kowalska',
        motherFirstNames: req.body.familyData?.mother?.name || 'Anna',
        motherFatherName: 'Jan Kowalski',
        motherMotherMaidenName: 'Nowak',
        motherUsedSurnamesWithDates: '',
        motherBirthDate: req.body.familyData?.mother?.birthDate || '10.07.1962',
        motherBirthPlace: req.body.familyData?.mother?.birthPlace || 'Warsaw',
        motherMaritalStatus: 'mężatka',
        motherMarriageDate: '15.06.1988',
        motherMarriagePlace: 'Warsaw',
        motherCitizenshipsAtBirth: 'Polska',
        motherPesel: '',
        
        // Father's complete data
        fatherLastName: '',
        fatherMaidenNameFull: '',
        fatherFirstNames: req.body.familyData?.father?.name || 'Michael',
        fatherFatherName: '',
        fatherMotherMaidenName: 'Johnson',
        fatherUsedSurnamesWithDates: '',
        fatherBirthDate: req.body.familyData?.father?.birthDate || '20.03.1960',
        fatherBirthPlace: req.body.familyData?.father?.birthPlace || 'Chicago',
        fatherMaritalStatus: 'żonaty',
        fatherMarriageDate: '15.06.1988',
        fatherMarriagePlace: 'Warsaw',
        fatherCitizenshipsAtBirth: 'USA',
        fatherPesel: '',
        
        // Grandparents data
        maternalGrandfatherLastName: 'Kowalski',
        maternalGrandfatherFirstNames: 'Jan',
        maternalGrandfatherBirthDate: '01.01.1930',
        maternalGrandfatherBirthPlace: 'Krakow',
        maternalGrandmotherLastName: 'Nowak',
        maternalGrandmotherMaidenName: 'Nowak',
        maternalGrandmotherFirstNames: 'Maria',
        maternalGrandmotherBirthDate: '15.05.1932',
        maternalGrandmotherBirthPlace: 'Warsaw',
        paternalGrandfatherLastName: '',
        paternalGrandfatherFirstNames: 'Robert',
        paternalGrandfatherBirthDate: '10.10.1928',
        paternalGrandfatherBirthPlace: 'Chicago',
        paternalGrandmotherLastName: 'Johnson',
        paternalGrandmotherMaidenName: 'Johnson',
        paternalGrandmotherFirstNames: 'Elizabeth',
        paternalGrandmotherBirthDate: '20.12.1930',
        paternalGrandmotherBirthPlace: 'Boston'
      };
      
      const data: PolishCitizenshipApplicationData = fullData;

      const pdfBytes = await pdfGenerator.generateFilledPDF(data);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="Citizenship_Application.pdf"');
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error generating Citizenship PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Generate filled PDF from citizenship application data
  app.post("/api/generate-citizenship-pdf", async (req: Request, res: Response) => {
    try {
      console.log("Received PDF generation request:", req.body);
      
      // Validate the request body
      const validatedData = CitizenshipApplicationSchema.parse(req.body);
      
      console.log("Validated data:", validatedData);

      // Generate the PDF
      const pdfBytes = await pdfGenerator.generateFilledPDF(validatedData as PolishCitizenshipApplicationData);

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="wniosek-obywatelstwo-polskie.pdf"');
      res.setHeader('Content-Length', pdfBytes.length.toString());

      // Send the PDF
      res.send(Buffer.from(pdfBytes));
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }

      return res.status(500).json({
        error: "Failed to generate PDF",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate blank PDF template for preview/printing
  app.get("/api/blank-citizenship-pdf", async (req: Request, res: Response) => {
    try {
      // Generate blank PDF template
      const blankPdf = new (await import("./pdf-generator")).PolishCitizenshipPDFGenerator();
      const pdfDoc = await (blankPdf as any).createBlankPDFTemplate();
      const pdfBytes = await pdfDoc.save();

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="blank-wniosek-obywatelstwo-polskie.pdf"');
      res.setHeader('Content-Length', pdfBytes.length.toString());

      // Send the PDF
      res.send(Buffer.from(pdfBytes));
      
    } catch (error) {
      console.error("Error generating blank PDF:", error);
      return res.status(500).json({
        error: "Failed to generate blank PDF",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Preview PDF data endpoint (for debugging)
  app.post("/api/preview-citizenship-data", async (req: Request, res: Response) => {
    try {
      const validatedData = CitizenshipApplicationSchema.parse(req.body);
      
      // Return formatted data for preview
      res.json({
        success: true,
        data: validatedData,
        preview: {
          applicantSection: `${validatedData.applicantName} z ${validatedData.applicantCity}`,
          subjectSection: `Wniosek dotyczy: ${validatedData.subjectName}`,
          personalData: `${validatedData.firstNames} ${validatedData.lastName}, ur. ${validatedData.birthDate} w ${validatedData.birthPlace}`,
          parentsData: `Matka: ${validatedData.motherFirstNames} ${validatedData.motherLastName}, Ojciec: ${validatedData.fatherFirstNames} ${validatedData.fatherLastName}`,
          grandparentsData: `Dziadkowie: ${validatedData.maternalGrandfatherFirstNames} ${validatedData.maternalGrandfatherLastName}, ${validatedData.maternalGrandmotherFirstNames} ${validatedData.maternalGrandmotherLastName}`
        }
      });
    } catch (error) {
      console.error("Error previewing data:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors
        });
      }

      return res.status(500).json({
        error: "Failed to preview data",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate Power of Attorney PDF
  app.post("/api/generate-poa-pdf", async (req: Request, res: Response) => {
    try {
      const data: PowerOfAttorneyData = {
        principalFullName: req.body.principalFullName || '',
        principalBirthDate: req.body.principalBirthDate || '',
        principalBirthPlace: req.body.principalBirthPlace || '',
        principalAddress: req.body.principalAddress || '',
        principalPesel: req.body.principalPesel,
        principalPassportNumber: req.body.principalPassportNumber || '',
        principalPhone: req.body.principalPhone || '',
        principalEmail: req.body.principalEmail || '',
        type: req.body.poaType || 'single',
        spouseFullName: req.body.spouseFullName,
        scopeOfAuthority: req.body.scopeOfAuthority || [
          'Reprezentowanie przed wszystkimi urzędami w Polsce',
          'Składanie wniosków o potwierdzenie obywatelstwa polskiego',
          'Odbieranie dokumentów i korespondencji',
          'Składanie odwołań i zażaleń',
          'Dostęp do akt sprawy'
        ],
        date: new Date().toLocaleDateString('pl-PL'),
        // Add backward compatibility fields
        applicantName: req.body.applicantName || req.body.principalFullName || '',
        documentNumber: req.body.documentNumber || req.body.principalPassportNumber || '',
        childName: req.body.childName
      };

      const pdfBytes = await poaPdfGenerator.generatePOA(data);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="pelnomocnictwo-power-of-attorney.pdf"');
      res.setHeader('Content-Length', pdfBytes.length.toString());

      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error generating POA PDF:", error);
      return res.status(500).json({
        error: "Failed to generate POA PDF",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate Family Tree PDF
  app.post("/api/generate-family-tree-pdf", async (req: Request, res: Response) => {
    try {
      const data: FamilyTreeData = {
        members: [
          {
            id: '1',
            name: req.body.applicantName || '',
            birthDate: req.body.birthDate || '1990-01-01',
            birthPlace: req.body.birthPlace || 'New York',
            relationship: 'Applicant'
          }
        ],
        lastUpdated: new Date().toISOString()
      };

      const pdfBytes = await familyTreePdfGenerator.generateFamilyTree(data);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="drzewo-genealogiczne-family-tree.pdf"');
      res.setHeader('Content-Length', pdfBytes.length.toString());

      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error generating Family Tree PDF:", error);
      return res.status(500).json({
        error: "Failed to generate Family Tree PDF",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate Applicant Details PDF
  app.post("/api/generate-applicant-details-pdf", async (req: Request, res: Response) => {
    try {
      const data: ApplicantDetailsData = {
        fullName: req.body.fullName || '',
        dateOfBirth: req.body.dateOfBirth || '',
        placeOfBirth: req.body.placeOfBirth || '',
        currentCitizenship: req.body.currentCitizenship || '',
        pesel: req.body.pesel,
        email: req.body.email || '',
        phone: req.body.phone || '',
        address: req.body.address || '',
        city: req.body.city || '',
        country: req.body.country || '',
        postalCode: req.body.postalCode || '',
        fatherName: req.body.fatherName || '',
        motherName: req.body.motherName || '',
        motherMaidenName: req.body.motherMaidenName || '',
        maritalStatus: req.body.maritalStatus || '',
        spouseName: req.body.spouseName,
        polishAncestorName: req.body.polishAncestorName || '',
        relationshipToAncestor: req.body.relationshipToAncestor || '',
        ancestorBirthYear: req.body.ancestorBirthYear || '',
        ancestorBirthPlace: req.body.ancestorBirthPlace || '',
        previousApplications: req.body.previousApplications || false,
        previousApplicationDetails: req.body.previousApplicationDetails,
        criminalRecord: req.body.criminalRecord || false,
        criminalRecordDetails: req.body.criminalRecordDetails,
        documentsProvided: req.body.documentsProvided || [],
        missingDocuments: req.body.missingDocuments || []
      };

      const pdfBytes = await applicantDetailsPdfGenerator.generateApplicantDetails(data);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="dane-wnioskodawcy-applicant-details.pdf"');
      res.setHeader('Content-Length', pdfBytes.length.toString());

      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error generating Applicant Details PDF:", error);
      return res.status(500).json({
        error: "Failed to generate Applicant Details PDF",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate Document Checklist PDF
  app.post("/api/generate-checklist-pdf", async (req: Request, res: Response) => {
    try {
      const data: DocumentChecklistData = {
        applicantName: req.body.applicantName || '',
        caseNumber: req.body.caseNumber || `CASE-${Date.now()}`,
        dateGenerated: new Date().toLocaleDateString('pl-PL'),
        categories: req.body.categories || [],
        overallProgress: req.body.overallProgress || 0
      };

      const pdfBytes = await documentChecklistPdfGenerator.generateChecklist(data);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="lista-dokumentow-document-checklist.pdf"');
      res.setHeader('Content-Length', pdfBytes.length.toString());

      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Error generating Document Checklist PDF:", error);
      return res.status(500).json({
        error: "Failed to generate Document Checklist PDF",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // *** ONE-CLICK COMPREHENSIVE DOCUMENT COMPILATION ***
  app.post("/api/pdf/comprehensive-package", async (req: Request, res: Response) => {
    try {
      console.log('Starting comprehensive document package generation...');

      const { applicantData, familyTreeData, spouseData, children = [] } = req.body;

      // Use real data from FORM and TREE sections
      const comprehensiveData = {
        citizenshipData: {
          applicantName: `${applicantData?.firstNames || ''} ${applicantData?.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
          applicantAddress: applicantData?.currentAddress || 'ADRES ZAMIESZKANIA',
          applicantMobilePhone: applicantData?.mobilePhone || 'TELEFON',
          subjectName: `${applicantData?.firstNames || ''} ${applicantData?.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
          lastName: applicantData?.lastName || 'NAZWISKO',
          firstNames: applicantData?.firstNames || 'IMIONA',
          birthDate: applicantData?.birthDate || 'DD.MM.YYYY',
          birthPlace: applicantData?.birthPlace || 'MIEJSCE URODZENIA',
          motherLastName: familyTreeData?.polishParentLastName || familyTreeData?.polishParentName?.split(' ').pop() || 'NAZWISKO MATKI',
          motherFirstNames: familyTreeData?.polishParentFirstNames || familyTreeData?.polishParentName?.split(' ').slice(0, -1).join(' ') || 'IMIONA MATKI',
          motherBirthDate: familyTreeData?.polishParentBirthDate || 'DD.MM.YYYY',
          motherBirthPlace: familyTreeData?.polishParentBirthPlace || 'MIEJSCE URODZENIA MATKI',
          applicationType: 'confirmation' as const,
          gender: applicantData?.gender === 'mężczyzna' ? 'mężczyzna' as const : 'kobieta' as const,
          maritalStatus: applicantData?.maritalStatus === 'YES' ? 'żonaty/mężatka' as const : 'kawaler/panna' as const,
        },
        poaData: {
          single: {
            type: 'single' as const,
            principalFullName: `${applicantData?.firstNames || ''} ${applicantData?.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
            principalBirthDate: applicantData?.birthDate || 'DD.MM.YYYY',
            principalBirthPlace: applicantData?.birthPlace || 'MIEJSCE URODZENIA',
            principalAddress: applicantData?.currentAddress || 'ADRES ZAMIESZKANIA',
            principalPassportNumber: applicantData?.passportNumber || 'NUMER DOKUMENTU',
            principalPhone: applicantData?.mobilePhone || 'TELEFON',
            principalEmail: applicantData?.email || 'EMAIL@EXAMPLE.COM',
            applicantName: `${applicantData?.firstNames || ''} ${applicantData?.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
            documentNumber: applicantData?.passportNumber || 'NUMER DOKUMENTU',
            date: new Date().toLocaleDateString('pl-PL')
          }
        },
        familyTreeData,
        checklistData: {
          applicantName: `${applicantData?.firstNames || ''} ${applicantData?.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
          completionDate: new Date().toLocaleDateString('pl-PL'),
          totalDocuments: 6,
          completedDocuments: 4,
          pendingDocuments: 2
        }
      };

      console.log('Comprehensive data prepared, generating PDF package...');

      const result = await generateLegacyComprehensiveDocumentPackage(comprehensiveData);
      const fileLinks: Array<{ filename: string, url: string }> = [];
      
      for (const file of result.files) {
        const pdfId = crypto.randomUUID();
        pdfCache.set(pdfId, {
          buffer: file.buffer,
          filename: file.filename,
          createdAt: new Date()
        });
        
        const protocol = req.protocol;
        const host = req.get('host');
        const viewUrl = `${protocol}://${host}/api/pdf/view/${pdfId}`;
        
        fileLinks.push({
          filename: file.filename,
          url: viewUrl
        });
      }

      console.log(`Generated ${result.files.length} PDFs successfully`);

      res.json({
        success: true,
        packageId: result.id,
        totalFiles: result.files.length,
        files: fileLinks,
        message: `Successfully generated ${result.files.length} Polish citizenship documents`
      });

    } catch (error) {
      console.error("Comprehensive PDF generation failed:", error);
      res.status(500).json({ 
        error: "Failed to generate comprehensive document package", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // *** ADOBE PDF EDITING SERVICE ROUTES ***
  
  // Create client account
  app.post("/api/pdf/client-account", async (req: Request, res: Response) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ error: "Email and name are required" });
      }

      const account = await adobePDFEditingService.getOrCreateClientAccount(email, name);
      
      res.json({
        success: true,
        account: {
          id: account.id,
          email: account.email,
          name: account.name,
          savedDocuments: account.savedDocuments.length
        }
      });
    } catch (error) {
      console.error("Error creating client account:", error);
      res.status(500).json({ error: "Failed to create client account" });
    }
  });

  // Simple editable PDF (no account required)
  app.post("/api/pdf/create-editable-simple", async (req: Request, res: Response) => {
    try {
      const { pdfType, applicantData, familyTreeData } = req.body;
      
      if (!pdfType) {
        return res.status(400).json({ error: "PDF type is required" });
      }

      console.log('Creating simple editable PDF:', pdfType);
      
      // Generate the PDF first
      let pdfBuffer: Buffer;
      
      if (pdfType === 'poa-single') {
        const { poaPdfGenerator } = await import('./pdf-generator');
        const poaData = {
          applicantName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim(),
          principalFullName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim(),
          principalPassportNumber: applicantData.passportNumber || '',
          documentNumber: applicantData.passportNumber || '',
          type: 'single',
          date: new Date().toLocaleDateString('pl-PL')
        };
        const pdfBytes = await poaPdfGenerator.generatePOA(poaData);
        pdfBuffer = Buffer.from(pdfBytes);
      } else if (pdfType === 'poa-married') {
        const { poaPdfGenerator } = await import('./pdf-generator');
        const poaData = {
          applicantName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim(),
          principalFullName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim(),
          principalPassportNumber: applicantData.passportNumber || '',
          documentNumber: applicantData.passportNumber || '',
          spouseName: `${applicantData.spouseFirstNames || ''} ${applicantData.spouseLastName || ''}`.trim(),
          type: 'married',
          date: new Date().toLocaleDateString('pl-PL')
        };
        const pdfBytes = await poaPdfGenerator.generatePOA(poaData);
        pdfBuffer = Buffer.from(pdfBytes);
      } else {
        return res.status(400).json({ error: "Invalid PDF type" });
      }

      // Upload to Adobe PDF Services without account requirement
      const uploadResult = await adobePDFEditingService.uploadPDFSimple(pdfBuffer, `${pdfType}-${Date.now()}.pdf`);
      
      res.json({
        editableUrl: uploadResult.editableUrl,
        documentId: uploadResult.documentId,
        message: "Editable PDF created successfully (no account required)"
      });

    } catch (error) {
      console.error('Simple editable PDF creation error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Create editable PDF template (for existing template files)
  app.post("/api/pdf/create-editable-template", async (req: Request, res: Response) => {
    try {
      const { templatePath, templateName, applicantData, familyTreeData } = req.body;
      
      if (!templatePath) {
        return res.status(400).json({ error: "Template path is required" });
      }

      console.log('Creating editable template:', templateName);
      
      // Read the template file from the attached assets
      const fs = await import('fs');
      const path = await import('path');
      const fullPath = path.join(process.cwd(), 'attached_assets', path.basename(templatePath));
      
      let pdfBuffer: Buffer;
      try {
        pdfBuffer = await fs.promises.readFile(fullPath);
      } catch (fileError) {
        console.error('Error reading template file:', fileError);
        return res.status(404).json({ error: "Template file not found" });
      }

      // Upload to Adobe PDF Services without account requirement
      const uploadResult = await adobePDFEditingService.uploadPDFSimple(pdfBuffer, templateName || 'template.pdf');
      
      res.json({
        editableUrl: uploadResult.editableUrl,
        documentId: uploadResult.documentId,
        message: "Editable template created successfully"
      });

    } catch (error) {
      console.error('Editable template creation error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Create editable PDF
  app.post("/api/pdf/create-editable", async (req: Request, res: Response) => {
    try {
      const { pdfType, clientAccountId, clientEmail, clientName } = req.body;
      
      if (!clientAccountId && (!clientEmail || !clientName)) {
        return res.status(400).json({ error: "Client account ID or email/name required" });
      }

      // Get or create client account
      let account;
      if (clientAccountId) {
        const accounts = Array.from(adobePDFEditingService.getClientAccounts().entries());
        const foundAccount = accounts.find(([id, acc]) => id === clientAccountId);
        account = foundAccount ? { id: foundAccount[0], ...foundAccount[1] } : null;
        
        if (!account) {
          return res.status(404).json({ error: "Client account not found" });
        }
      } else {
        account = await adobePDFEditingService.getOrCreateClientAccount(clientEmail, clientName);
      }

      // Generate PDF based on type
      let pdfBuffer: Buffer;
      let filename: string;
      
      const applicantData = req.body.applicantData || {};
      const familyTreeData = req.body.familyTreeData || {};

      switch (pdfType) {
        case 'citizenship-application':
          const citizenshipData = {
            applicantName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
            applicantAddress: applicantData.currentAddress || 'ADRES ZAMIESZKANIA',
            applicantMobilePhone: applicantData.mobilePhone || 'TELEFON',
            subjectName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
            lastName: applicantData.lastName || 'NAZWISKO',
            firstNames: applicantData.firstNames || 'IMIONA',
            birthDate: applicantData.birthDate || 'DD.MM.YYYY',
            birthPlace: applicantData.birthPlace || 'MIEJSCE URODZENIA',
            motherLastName: familyTreeData.polishParentLastName || 'NAZWISKO MATKI',
            motherFirstNames: familyTreeData.polishParentFirstNames || 'IMIONA MATKI',
            motherBirthDate: familyTreeData.polishParentBirthDate || 'DD.MM.YYYY',
            motherBirthPlace: familyTreeData.polishParentBirthPlace || 'MIEJSCE URODZENIA MATKI',
            applicationType: 'confirmation' as const,
            gender: applicantData.gender === 'mężczyzna' ? 'mężczyzna' as const : 'kobieta' as const,
            maritalStatus: applicantData.maritalStatus === 'YES' ? 'żonaty/mężatka' as const : 'kawaler/panna' as const,
          } as PolishCitizenshipApplicationData;
          
          const citizenshipPdf = await pdfGenerator.generateCitizenshipApplication(citizenshipData);
          pdfBuffer = Buffer.from(citizenshipPdf);
          filename = 'Polish_Citizenship_Application_Editable.pdf';
          break;

        case 'poa-single':
          const poaData: PowerOfAttorneyData = {
            type: 'single',
            principalFullName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
            principalBirthDate: applicantData.birthDate || 'DD.MM.YYYY',
            principalBirthPlace: applicantData.birthPlace || 'MIEJSCE URODZENIA',
            principalAddress: applicantData.currentAddress || 'ADRES ZAMIESZKANIA',
            principalPassportNumber: applicantData.passportNumber || 'NUMER DOKUMENTU',
            principalPhone: applicantData.mobilePhone || 'TELEFON',
            principalEmail: applicantData.email || 'EMAIL@EXAMPLE.COM',
            applicantName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
            documentNumber: applicantData.passportNumber || 'NUMER DOKUMENTU',
            date: new Date().toLocaleDateString('pl-PL')
          };
          
          const poaPdf = await poaPdfGenerator.generatePOA(poaData);
          pdfBuffer = Buffer.from(poaPdf);
          filename = 'Power_of_Attorney_Single_Editable.pdf';
          break;

        case 'poa-married':
          const poaMarriedData: PowerOfAttorneyData = {
            type: 'married',
            principalFullName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
            principalBirthDate: applicantData.birthDate || 'DD.MM.YYYY',
            principalBirthPlace: applicantData.birthPlace || 'MIEJSCE URODZENIA',
            principalAddress: applicantData.currentAddress || 'ADRES ZAMIESZKANIA',
            principalPassportNumber: applicantData.passportNumber || 'NUMER DOKUMENTU',
            principalPhone: applicantData.mobilePhone || 'TELEFON',
            principalEmail: applicantData.email || 'EMAIL@EXAMPLE.COM',
            spouseName: `${applicantData.spouseFirstNames || ''} ${applicantData.spouseLastName || ''}`.trim() || 'MAŁŻONEK NAZWISKO IMIONA',
            spouseDocumentNumber: applicantData.spousePassportNumber || 'NUMER DOKUMENTU MAŁŻONKA',
            applicantName: `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim() || 'NAZWISKO IMIONA',
            documentNumber: applicantData.passportNumber || 'NUMER DOKUMENTU',
            date: new Date().toLocaleDateString('pl-PL')
          };
          
          const poaMarriedPdf = await poaPdfGenerator.generatePOA(poaMarriedData);
          pdfBuffer = Buffer.from(poaMarriedPdf);
          filename = 'Power_of_Attorney_Married_Editable.pdf';
          break;

        default:
          return res.status(400).json({ error: "Invalid PDF type" });
      }

      // Create editable PDF
      const result = await adobePDFEditingService.createEditablePDF(
        pdfBuffer,
        filename,
        pdfType,
        account.id
      );

      console.log(`Created editable PDF: ${pdfType} for client: ${account.email}`);

      res.json({
        success: true,
        editableUrl: result.editableUrl,
        viewUrl: result.viewUrl,
        documentId: result.documentId,
        filename,
        message: `Editable ${pdfType} created successfully`
      });

    } catch (error) {
      console.error("Error creating editable PDF:", error);
      res.status(500).json({ 
        error: "Failed to create editable PDF",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Serve editable PDF page
  app.get("/pdf-editor/:documentId", async (req: Request, res: Response) => {
    try {
      const { documentId } = req.params;
      const { client: clientAccountId } = req.query;

      if (!clientAccountId || typeof clientAccountId !== 'string') {
        return res.status(400).send("Client account ID required");
      }

      // Find the document and client account
      const accounts = Array.from(adobePDFEditingService.getClientAccounts().entries());
      const accountEntry = accounts.find(([id]) => id === clientAccountId);
      
      if (!accountEntry) {
        return res.status(404).send("Client account not found");
      }

      const account = accountEntry[1];
      const document = account.savedDocuments.find((doc: any) => doc.id === documentId);
      
      if (!document) {
        return res.status(404).send("Document not found");
      }

      // Get original PDF from cache (you might need to store this differently)
      const pdfCacheEntry = Array.from(pdfCache.entries()).find(([id, data]) => 
        data.filename.includes(document.filename.split('_')[0])
      );

      if (!pdfCacheEntry) {
        return res.status(404).send("PDF data not found");
      }

      const pdfBase64 = pdfCacheEntry[1].buffer.toString('base64');
      
      // Generate Adobe PDF Embed HTML
      const html = adobePDFEditingService.generateEmbedHTML(
        pdfBase64,
        document.filename,
        documentId,
        clientAccountId
      );

      res.setHeader('Content-Type', 'text/html');
      res.send(html);

    } catch (error) {
      console.error("Error serving PDF editor:", error);
      res.status(500).send("Failed to load PDF editor");
    }
  });

  // Save edited PDF
  app.post("/api/pdf/save-edited", async (req: Request, res: Response) => {
    try {
      const { clientAccountId, documentId, annotations } = req.body;

      const result = await adobePDFEditingService.saveEditedPDF(
        clientAccountId,
        documentId,
        Buffer.from('') // Placeholder - in real implementation, you'd reconstruct the PDF
      );

      res.json(result);

    } catch (error) {
      console.error("Error saving edited PDF:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to save document" 
      });
    }
  });

  // Get client documents
  app.get("/api/pdf/client-documents/:clientAccountId", async (req: Request, res: Response) => {
    try {
      const { clientAccountId } = req.params;
      
      const documents = await adobePDFEditingService.getClientDocuments(clientAccountId);
      
      res.json({
        success: true,
        documents
      });

    } catch (error) {
      console.error("Error fetching client documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });
}