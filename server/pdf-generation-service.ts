import { PDFDocument, PDFPage, PDFForm, PDFTextField, PDFCheckBox, PDFRadioGroup, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import type { DataEntry } from '@shared/schema';

export interface PDFGenerationResult {
  fileName: string;
  filePath: string;
  status: 'success' | 'error';
  error?: string;
}

export interface BulkPDFResult {
  generatedFiles: PDFGenerationResult[];
  totalGenerated: number;
  errors: string[];
  zipFilePath?: string;
}

export class PDFGenerationService {
  private templatesPath = path.join(process.cwd(), 'attached_assets');
  private outputPath = path.join(process.cwd(), 'generated_pdfs');

  constructor() {
    this.ensureOutputDirectory();
  }

  private async ensureOutputDirectory() {
    try {
      await fs.mkdir(this.outputPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create output directory:', error);
    }
  }

  /**
   * Generate all available Polish document PDFs for given data
   */
  async generateAllDocuments(data: Partial<DataEntry>, sessionId: string): Promise<BulkPDFResult> {
    const results: PDFGenerationResult[] = [];
    const errors: string[] = [];

    // Define all document templates to generate
    const documentsToGenerate = [
      { type: 'POA_ADULT', name: 'Power of Attorney (Adult)', required: ['applicantFirstName', 'applicantLastName'] },
      { type: 'POA_MINOR', name: 'Power of Attorney (Minor)', required: ['applicantFirstName', 'applicantLastName', 'childFirstName'] },
      { type: 'POA_SPOUSES', name: 'Power of Attorney (Spouses)', required: ['applicantFirstName', 'spouseFirstName'] },
      { type: 'CITIZENSHIP', name: 'Polish Citizenship Application', required: ['applicantFirstName', 'applicantLastName', 'applicantDateOfBirth'] },
      { type: 'CIVIL_REGISTRY_BIRTH', name: 'Civil Registry - Birth Registration', required: ['applicantFirstName', 'applicantLastName'] },
      { type: 'CIVIL_REGISTRY_MARRIAGE', name: 'Civil Registry - Marriage Registration', required: ['applicantFirstName', 'spouseFirstName'] },
      { type: 'CIVIL_SUPPLEMENT', name: 'Civil Registry - Supplement', required: ['applicantFirstName', 'applicantLastName'] },
      { type: 'CIVIL_CORRECTION', name: 'Civil Registry - Correction', required: ['applicantFirstName', 'applicantLastName'] },
      { type: 'NAME_CHANGE', name: 'Name Change Application', required: ['applicantFirstName', 'oldName', 'newName'] },
      { type: 'DOCUMENT_COPIES', name: 'Document Copies Request', required: ['applicantFirstName', 'applicantLastName'] },
      { type: 'POLISH_ID', name: 'Polish ID Application', required: ['applicantFirstName', 'applicantLastName', 'applicantDateOfBirth'] }
    ];

    for (const doc of documentsToGenerate) {
      try {
        // Check if required fields are present
        const hasRequiredFields = doc.required.every(field => 
          data[field as keyof DataEntry] && 
          String(data[field as keyof DataEntry]).trim() !== ''
        );

        if (hasRequiredFields) {
          const result = await this.generateSpecificDocument(doc.type, data, sessionId);
          results.push(result);
        } else {
          console.log(`Skipping ${doc.name} - missing required fields:`, 
            doc.required.filter(field => !data[field as keyof DataEntry]));
        }
      } catch (error) {
        const errorMessage = `Failed to generate ${doc.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMessage);
        errors.push(errorMessage);
        results.push({
          fileName: `${doc.type}_error.pdf`,
          filePath: '',
          status: 'error',
          error: errorMessage
        });
      }
    }

    // Create ZIP file with all generated PDFs
    let zipFilePath: string | undefined;
    try {
      zipFilePath = await this.createZipArchive(results.filter(r => r.status === 'success'), sessionId);
    } catch (error) {
      console.error('Failed to create ZIP archive:', error);
      errors.push(`Failed to create ZIP archive: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      generatedFiles: results,
      totalGenerated: results.filter(r => r.status === 'success').length,
      errors,
      zipFilePath
    };
  }

  /**
   * Generate a specific document type
   */
  private async generateSpecificDocument(
    documentType: string, 
    data: Partial<DataEntry>, 
    sessionId: string
  ): Promise<PDFGenerationResult> {
    try {
      switch (documentType) {
        case 'POA_ADULT':
          return await this.generatePOAAdult(data, sessionId);
        case 'POA_MINOR':
          return await this.generatePOAMinor(data, sessionId);
        case 'POA_SPOUSES':
          return await this.generatePOASpouses(data, sessionId);
        case 'CITIZENSHIP':
          return await this.generateCitizenshipApplication(data, sessionId);
        case 'CIVIL_REGISTRY_BIRTH':
          return await this.generateCivilRegistryBirth(data, sessionId);
        case 'CIVIL_REGISTRY_MARRIAGE':
          return await this.generateCivilRegistryMarriage(data, sessionId);
        case 'CIVIL_SUPPLEMENT':
          return await this.generateCivilSupplement(data, sessionId);
        case 'CIVIL_CORRECTION':
          return await this.generateCivilCorrection(data, sessionId);
        case 'NAME_CHANGE':
          return await this.generateNameChange(data, sessionId);
        case 'DOCUMENT_COPIES':
          return await this.generateDocumentCopies(data, sessionId);
        case 'POLISH_ID':
          return await this.generatePolishID(data, sessionId);
        default:
          throw new Error(`Unknown document type: ${documentType}`);
      }
    } catch (error) {
      console.error(`Error generating ${documentType}:`, error);
      throw error;
    }
  }

  /**
   * Generate Power of Attorney for Adults
   */
  private async generatePOAAdult(data: Partial<DataEntry>, sessionId: string): Promise<PDFGenerationResult> {
    const fileName = `POA_Adult_${sessionId}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputPath, fileName);

    try {
      // Create new PDF from template data
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size
      
      // Set font
      const font = await pdfDoc.embedFont('Helvetica');
      const fontSize = 12;
      
      // Add content based on Polish POA template
      const content = this.buildPOAAdultContent(data);
      
      // Draw text on PDF
      let yPosition = 800;
      for (const line of content.split('\n')) {
        if (line.trim()) {
          // Sanitize Polish characters to prevent encoding errors
          const sanitizedLine = this.sanitizePolishText(line);
          page.drawText(sanitizedLine, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
        }
        yPosition -= 20;
      }

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      return {
        fileName,
        filePath,
        status: 'success'
      };
    } catch (error) {
      console.error('Error generating POA Adult:', error);
      throw error;
    }
  }

  /**
   * Generate Power of Attorney for Minors
   */
  private async generatePOAMinor(data: Partial<DataEntry>, sessionId: string): Promise<PDFGenerationResult> {
    const fileName = `POA_Minor_${sessionId}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputPath, fileName);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont('Helvetica');
      
      const content = this.buildPOAMinorContent(data);
      
      let yPosition = 800;
      for (const line of content.split('\n')) {
        if (line.trim()) {
          // Sanitize Polish characters to prevent encoding errors
          const sanitizedLine = this.sanitizePolishText(line);
          page.drawText(sanitizedLine, {
            x: 50,
            y: yPosition,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
          });
        }
        yPosition -= 20;
      }

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      return { fileName, filePath, status: 'success' };
    } catch (error) {
      console.error('Error generating POA Minor:', error);
      throw error;
    }
  }

  /**
   * Generate Power of Attorney for Spouses
   */
  private async generatePOASpouses(data: Partial<DataEntry>, sessionId: string): Promise<PDFGenerationResult> {
    const fileName = `POA_Spouses_${sessionId}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputPath, fileName);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont('Helvetica');
      
      const content = this.buildPOASpousesContent(data);
      
      let yPosition = 800;
      for (const line of content.split('\n')) {
        if (line.trim()) {
          // Sanitize Polish characters to prevent encoding errors
          const sanitizedLine = this.sanitizePolishText(line);
          page.drawText(sanitizedLine, {
            x: 50,
            y: yPosition,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
          });
        }
        yPosition -= 20;
      }

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      return { fileName, filePath, status: 'success' };
    } catch (error) {
      console.error('Error generating POA Spouses:', error);
      throw error;
    }
  }

  /**
   * Generate Polish Citizenship Application
   */
  private async generateCitizenshipApplication(data: Partial<DataEntry>, sessionId: string): Promise<PDFGenerationResult> {
    const fileName = `Citizenship_Application_${sessionId}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputPath, fileName);

    try {
      const pdfDoc = await PDFDocument.create();
      
      // Create multiple pages for comprehensive citizenship application
      const pages = [
        pdfDoc.addPage([595, 842]),
        pdfDoc.addPage([595, 842]),
        pdfDoc.addPage([595, 842])
      ];
      
      const font = await pdfDoc.embedFont('Helvetica');
      
      // Page 1: Personal Information
      const content1 = this.buildCitizenshipPage1(data);
      this.drawTextOnPage(pages[0], content1, font);
      
      // Page 2: Family Information
      const content2 = this.buildCitizenshipPage2(data);
      this.drawTextOnPage(pages[1], content2, font);
      
      // Page 3: Additional Information
      const content3 = this.buildCitizenshipPage3(data);
      this.drawTextOnPage(pages[2], content3, font);

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      return { fileName, filePath, status: 'success' };
    } catch (error) {
      console.error('Error generating Citizenship Application:', error);
      throw error;
    }
  }

  /**
   * Generate Civil Registry documents
   */
  private async generateCivilRegistryBirth(data: Partial<DataEntry>, sessionId: string): Promise<PDFGenerationResult> {
    const fileName = `Civil_Registry_Birth_${sessionId}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputPath, fileName);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont('Helvetica');
      
      const content = this.buildCivilRegistryBirthContent(data);
      this.drawTextOnPage(page, content, font);

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      return { fileName, filePath, status: 'success' };
    } catch (error) {
      console.error('Error generating Civil Registry Birth:', error);
      throw error;
    }
  }

  private async generateCivilRegistryMarriage(data: Partial<DataEntry>, sessionId: string): Promise<PDFGenerationResult> {
    const fileName = `Civil_Registry_Marriage_${sessionId}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputPath, fileName);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont('Helvetica');
      
      const content = this.buildCivilRegistryMarriageContent(data);
      this.drawTextOnPage(page, content, font);

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      return { fileName, filePath, status: 'success' };
    } catch (error) {
      console.error('Error generating Civil Registry Marriage:', error);
      throw error;
    }
  }

  private async generateCivilSupplement(data: Partial<DataEntry>, sessionId: string): Promise<PDFGenerationResult> {
    const fileName = `Civil_Supplement_${sessionId}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputPath, fileName);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont('Helvetica');
      
      const content = this.buildCivilSupplementContent(data);
      this.drawTextOnPage(page, content, font);

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      return { fileName, filePath, status: 'success' };
    } catch (error) {
      console.error('Error generating Civil Supplement:', error);
      throw error;
    }
  }

  private async generateCivilCorrection(data: Partial<DataEntry>, sessionId: string): Promise<PDFGenerationResult> {
    const fileName = `Civil_Correction_${sessionId}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputPath, fileName);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont('Helvetica');
      
      const content = this.buildCivilCorrectionContent(data);
      this.drawTextOnPage(page, content, font);

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      return { fileName, filePath, status: 'success' };
    } catch (error) {
      console.error('Error generating Civil Correction:', error);
      throw error;
    }
  }

  private async generateNameChange(data: Partial<DataEntry>, sessionId: string): Promise<PDFGenerationResult> {
    const fileName = `Name_Change_${sessionId}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputPath, fileName);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont('Helvetica');
      
      const content = this.buildNameChangeContent(data);
      this.drawTextOnPage(page, content, font);

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      return { fileName, filePath, status: 'success' };
    } catch (error) {
      console.error('Error generating Name Change:', error);
      throw error;
    }
  }

  private async generateDocumentCopies(data: Partial<DataEntry>, sessionId: string): Promise<PDFGenerationResult> {
    const fileName = `Document_Copies_${sessionId}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputPath, fileName);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont('Helvetica');
      
      const content = this.buildDocumentCopiesContent(data);
      this.drawTextOnPage(page, content, font);

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      return { fileName, filePath, status: 'success' };
    } catch (error) {
      console.error('Error generating Document Copies:', error);
      throw error;
    }
  }

  private async generatePolishID(data: Partial<DataEntry>, sessionId: string): Promise<PDFGenerationResult> {
    const fileName = `Polish_ID_Application_${sessionId}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputPath, fileName);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont('Helvetica');
      
      const content = this.buildPolishIDContent(data);
      this.drawTextOnPage(page, content, font);

      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(filePath, pdfBytes);

      return { fileName, filePath, status: 'success' };
    } catch (error) {
      console.error('Error generating Polish ID:', error);
      throw error;
    }
  }

  /**
   * Helper method to draw text on PDF page
   */
  private drawTextOnPage(page: PDFPage, content: string, font: any, fontSize: number = 12) {
    let yPosition = 800;
    for (const line of content.split('\n')) {
      if (line.trim()) {
        // Sanitize Polish characters to prevent encoding errors
        const sanitizedLine = this.sanitizePolishText(line);
        page.drawText(sanitizedLine, {
          x: 50,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
      yPosition -= 20;
      
      // Add new page if needed
      if (yPosition < 50) {
        break;
      }
    }
  }

  private sanitizePolishText(text: string): string {
    // SECURITY: Comprehensive sanitization for Polish characters AND XSS protection
    
    // Step 1: Remove ALL HTML/script tags and dangerous content
    let sanitized = text
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
      .replace(/&lt;.*?&gt;/g, '') // Remove encoded HTML tags
      .replace(/&#x?[0-9a-f]+;?/gi, '') // Remove HTML entities
      .replace(/[<>'"&]/g, '') // Remove dangerous characters
      .trim();
    
    // Step 2: Replace Polish characters with ASCII equivalents
    const polishToAscii: Record<string, string> = {
      'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
      'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
    };
    
    sanitized = sanitized.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => polishToAscii[char] || char);
    
    // Step 3: Final security check - only allow alphanumeric, spaces, and basic punctuation
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s\.\-\,\(\)\/\:]/g, '');
    
    return sanitized;
  }

  /**
   * Build content for POA Adult document
   */
  private buildPOAAdultContent(data: Partial<DataEntry>): string {
    return `
Pełnomocnictwo (Power of Attorney)

Ja, niżej podpisany/a:
${data.applicantFirstName || ''} ${data.applicantLastName || ''}

legitymujący/a się dokumentem tożsamości nr:
${data.applicantDocumentNumber || ''}

upoważniam Romana WIŚNIEWSKIEGO, legitymującego się polskim dowodem osobistym nr
CBU675382, zamieszkałego w Warszawie, ul. Słomińskiego 17/50, do reprezentowania
mnie w Urzędzie Wojewódzkim/ Ministerstwie Spraw Wewnętrznych i Administracji celem
prowadzenia spraw o stwierdzenie posiadania/ przywrócenie obywatelstwa polskiego
przeze mnie oraz moje małoletnie dziecko:

${data.childFirstName || ''} ${data.childLastName || ''}

oraz w Urzędach Stanu Cywilnego, Archiwach Państwowych, Instytucie Pamięci Narodowej i wszelkich
innych archiwach/ instytucjach/ urzędach celem uzyskania/ sprostowania/uzupełnienia/ odtworzenia
i uzyskania poświadczonych kopii mojego/ moich krewnych polskiego aktu urodzenia/ ślubu/ zgonu oraz
innych polskich dokumentów dotyczących mnie i mojej rodziny a także transkrypcji/ umiejscowienia
zagranicznych dokumentów w polskich aktach stanu cywilnego oraz w sprawie o nadanie numeru PESEL
i zmiany imienia/ nazwiska. Wyrażam również zgodę na sprostowanie/ uzupełnienie odp. aktów stanu
cywilnego.

Jednocześnie unieważniam wszelkie inne pełnomocnictwa udzielone przeze mnie lub w moim imieniu ww/w
sprawach.

Pełnomocnik może udzielić dalszego pełnomocnictwa.




    data / date                                                                    podpis / signature
    `.trim();
  }

  /**
   * Build content for POA Minor document
   */
  private buildPOAMinorContent(data: Partial<DataEntry>): string {
    return `
Pełnomocnictwo (Power of Attorney)

Ja, niżej podpisany/a:
${data.applicantFirstName || ''} ${data.applicantLastName || ''}

legitymujący/a się dokumentem tożsamości nr:
${data.applicantDocumentNumber || ''}

upoważniam Romana WIŚNIEWSKIEGO, legitymującego się polskim dowodem osobistym nr
CBU675382, zamieszkałego w Warszawie, ul. Słomińskiego 17/50, do reprezentowania
mnie w Urzędzie Wojewódzkim/ Ministerstwie Spraw Wewnętrznych i Administracji celem
prowadzenia spraw o stwierdzenie posiadania/ przywrócenie obywatelstwa polskiego przeze
mnie oraz moje małoletnie dziecko:

${data.childFirstName || ''} ${data.childLastName || ''}

oraz w Urzędach Stanu Cywilnego, Archiwach Państwowych, Instytucie Pamięci Narodowej i wszelkich
innych archiwach/ instytucjach/ urzędach celem uzyskania/ sprostowania/uzupełnienia/ odtworzenia
i uzyskania poświadczonych kopii mojego/ moich krewnych polskiego aktu urodzenia/ ślubu/ zgonu oraz
innych polskich dokumentów dotyczących mnie i mojej rodziny a także transkrypcji/ umiejscowienia
zagranicznych dokumentów w polskich aktach stanu cywilnego oraz w sprawie o nadanie numeru
PESEL. Wyrażam również zgodę na sprostowanie/ uzupełnienie odp. aktów stanu cywilnego.

Jednocześnie unieważniam wszelkie inne pełnomocnictwa udzielone przeze mnie lub w moim imieniu w w/w
sprawach.

Pełnomocnik może udzielić dalszego pełnomocnictwa.




    data / date                                                                  podpis / signature
    `.trim();
  }

  /**
   * Build content for POA Spouses document
   */
  private buildPOASpousesContent(data: Partial<DataEntry>): string {
    return `
Oświadczenie małżonków (Spouses statement)
My, niżej podpisani:
${data.applicantFirstName || ''} ${data.applicantLastName || ''}
${data.spouseFirstName || ''} ${data.spouseLastName || ''}

legitymujący się dokumentami tożsamości nr:
${data.applicantDocumentNumber || ''}
${data.spouseDocumentNumber || ''}

upoważniamy Romana WIŚNIEWSKIEGO, legitymującego się polskim dowodem osobistym nr
CBU675382, zamieszkałego w Warszawie, ul. Słomińskiego 17/50, do reprezentowania nas
w Urzędach Stanu Cywilnego w sprawach rejestracji aktów urodzeń/ małżeństw, uzupełnienia/
sprostowania, złożenia wniosku o zastosowanie polskich znaków diakrytycznych w aktach stanu
cywilnego a także w Kościołach i Archiwach Państwowych celem uzyskania/ odtworzenia mojego/
moich krewnych polskiego aktu urodzenia/ ślubu/ zgonu oraz innych polskich dokumentów
dotyczących mnie i mojej rodziny a także transkrypcji/ umiejscowienia/ sprostowania/ uzupełnienia
zagranicznych dokumentów w polskich aktach stanu cywilnego. Zostaliśmy obydwoje poinformowani
i wyrażamy zgodę na transkrypcję aktów naszych dzieci oraz naszego aktu małżeństwa.

Oświadczamy, że po zawarciu małżeństwa nosimy następujące nazwiska:

                                         mąż: ${data.husbandSurname || ''}

                                        żona: ${data.wifeSurname || ''}

a dzieci zrodzone z małżeństwa noszą nazwisko/a:

                                       dzieci: ${data.childrenSurnames || ''}

Pełnomocnik może udzielić dalszego pełnomocnictwa.




      data / date                                                        podpis żony / wife's signature




                                                                       podpis męża / husband's signature
    `.trim();
  }

  // Continue with other content builders...
  private buildCitizenshipPage1(data: Partial<DataEntry>): string {
    return `
                                                                                         Warszawa

                                                                                     -          -     2   0      2    5

                                                                                         dd-mm-rrrr

Pieczęć organu przyjmującego wniosek                                           miejsce i data złożenia wniosku

                   PRZED WYPEŁNIENIEM WNIOSKU PROSZĘ ZAPOZNAĆ SIĘ Z
                       POUCZENIEM ZAMIESZCZONYM NA STRONIE 12

                             WNIOSEK WYPEŁNIA SIĘ W JĘZYKU POLSKIM

                                            WOJEWODA                            MAZOWIECKI
                                                       (wskazanie organu, do którego jest składany wniosek)

Wnioskodawca

        Imię i nazwisko/ nazwa podmiotu: ${data.applicantFirstName || ''} ${data.applicantLastName || ''}

                                      Adres zamieszkania/ siedziby
       Państwo/województwo: ${data.applicantCountry || ''}

                             Ulica: ${data.applicantStreet || ''}

                   Numer domu: ${data.applicantHouseNumber || ''}                           Numer lokalu: ${data.applicantApartmentNumber || ''}

                   Kod pocztowy: ${data.applicantPostalCode || ''}                                        Miejscowość: ${data.applicantCity || ''}

            Telefon komórkowy: ${data.applicantPhone || ''}

Wniosek o potwierdzenie posiadania lub utraty obywatelstwa polskiego

Wnoszę o wydanie decyzji:

     potwierdzającej posiadanie obywatelstwa polskiego przez:
                 Imię i nazwisko: ${data.applicantFirstName || ''} ${data.applicantLastName || ''}

CZĘŚĆ I
Dane osoby, której dotyczy wniosek
                       Nazwisko: ${data.applicantLastName || ''}

             Nazwisko rodowe: ${data.applicantBirthName || ''}

                   Imię / imiona: ${data.applicantFirstName || ''}

           Imię i nazwisko ojca: ${data.fatherFirstName || ''} ${data.fatherLastName || ''}

Imię i nazwisko rodowe matki: ${data.motherFirstName || ''} ${data.motherBirthName || ''}

               Data urodzenia: ${data.applicantDateOfBirth || ''}                   -              -       dd-mm-rrrr

                              Płeć:           ${data.applicantGender === 'female' ? 'kobieta' : ''}

                                             ${data.applicantGender === 'male' ? 'mężczyzna' : ''}

             Miejsce urodzenia: ${data.applicantPlaceOfBirth || ''}

             Posiadane obce obywatelstwa wraz z datą nabycia: ${data.applicantNationality || ''}

                    Stan cywilny: ${data.applicantMaritalStatus || ''}

                       Nr PESEL: ${data.applicantPesel || ''}
    `.trim();
  }

  private buildCitizenshipPage2(data: Partial<DataEntry>): string {
    return `
Dane osobowe rodziców osoby, której dotyczy wniosek
Dane dotyczące matki
                      Nazwisko: ${data.motherLastName || ''}
           Nazwisko rodowe: ${data.motherBirthName || ''}
                   Imię/ imiona: ${data.motherFirstName || ''}
         Imię i nazwisko ojca: ${data.motherGrandpaFirstName || ''} ${data.motherGrandpaLastName || ''}
    Imię i nazwisko rodowe matki: ${data.motherGrandmaFirstName || ''} ${data.motherGrandmaBirthName || ''}
               Data urodzenia: ${data.motherDateOfBirth || ''}                    -              -               dd-mm-rrrr
         Miejsce urodzenia (państwo/ miejscowość): ${data.motherPlaceOfBirth || ''}
  Obywatelstwa posiadane w dacie urodzenia osoby, której dotyczy wniosek: ${data.motherNationality || ''}
                    Nr PESEL (jeżeli został nadany): ${data.motherPesel || ''}

Dane dotyczące ojca
                      Nazwisko: ${data.fatherLastName || ''}
           Nazwisko rodowe: ${data.fatherBirthName || ''}
                   Imię/ imiona: ${data.fatherFirstName || ''}
         Imię i nazwisko ojca: ${data.fatherGrandpaFirstName || ''} ${data.fatherGrandpaLastName || ''}
    Imię i nazwisko rodowe matki: ${data.fatherGrandmaFirstName || ''} ${data.fatherGrandmaBirthName || ''}
              Data urodzenia: ${data.fatherDateOfBirth || ''}                                           dd-mm-rrrr
           Miejsce urodzenia (państwo/miejscowość): ${data.fatherPlaceOfBirth || ''}
  Obywatelstwa posiadane w dacie urodzenia osoby, której dotyczy wniosek: ${data.fatherNationality || ''}
                    Nr PESEL (jeżeli został nadany): ${data.fatherPesel || ''}
    `.trim();
  }

  private buildCitizenshipPage3(data: Partial<DataEntry>): string {
    return `
Dane osobowe dalszych wstępnych osoby, której dotyczy wniosek
Dane dotyczące dziadka ze strony matki
                      Nazwisko: ${data.motherGrandpaLastName || ''}
                   Imię/ imiona: ${data.motherGrandpaFirstName || ''}
                Data urodzenia: ${data.motherGrandpaDateOfBirth || ''}                      -          -       dd-mm-rrrr
         Miejsce urodzenia (państwo/miejscowość): ${data.motherGrandpaPlaceOfBirth || ''}

Dane dotyczące babki ze strony matki
                      Nazwisko: ${data.motherGrandmaLastName || ''}
           Nazwisko rodowe: ${data.motherGrandmaBirthName || ''}
                   Imię/ imiona: ${data.motherGrandmaFirstName || ''}
               Data urodzenia: ${data.motherGrandmaDateOfBirth || ''}                    -              -      dd-mm-rrrr
         Miejsce urodzenia (państwo/ miejscowość): ${data.motherGrandmaPlaceOfBirth || ''}

Dane dotyczące dziadka ze strony ojca
                      Nazwisko: ${data.fatherGrandpaLastName || ''}
                   Imię/ imiona: ${data.fatherGrandpaFirstName || ''}
               Data urodzenia: ${data.fatherGrandpaDateOfBirth || ''}                                          dd-mm-rrrr
         Miejsce urodzenia (państwo/ miejscowość): ${data.fatherGrandpaPlaceOfBirth || ''}

Dane dotyczące babki ze strony ojca
                      Nazwisko: ${data.fatherGrandmaLastName || ''}
           Nazwisko rodowe: ${data.fatherGrandmaBirthName || ''}
                   Imię/ imiona: ${data.fatherGrandmaFirstName || ''}
               Data urodzenia: ${data.fatherGrandmaDateOfBirth || ''}                   -              -                     dd-mm-rrrr
         Miejsce urodzenia (państwo/ miejscowość): ${data.fatherGrandmaPlaceOfBirth || ''}

CZĘŚĆ II
Życiorys osoby, której dotyczy wniosek, ze szczególnym uwzględnieniem miejsc zatrudnienia i służby
wojskowej w Polsce oraz za granicą, okoliczności wyjazdu z Polski (jeżeli mieszkała w Polsce), zmiany
imion i nazwisk, posiadanych obywatelstw obcych wraz z datą ich nabycia, posiadanych dokumentów
tożsamości.

DO WNIOSKU DOŁĄCZONO DRZEWO GENEALOGICZNE RODZINY ORAZ HISTORIĘ RODZINY

${data.notes || ''}
    `.trim();
  }

  // Additional content builders for other document types...
  private buildCivilRegistryBirthContent(data: Partial<DataEntry>): string {
    return `
                                                                                          Warszawa
 Imię i nazwisko wnioskodawcy: ${data.applicantFirstName || ''} ${data.applicantLastName || ''}                                         2   4           0    5         2    0     2   5
                                                                                  -             -
 Kraj wnioskodawcy: ${data.applicantCountry || ''}
                                                                                      dd-mm-rrrr
                                                                              miejsce i data złożenia wniosku
PEŁNOMOCNIK:
 Roman WIŚNIEWSKI

adres miejsca zamieszkania:
 Wał Zawadowski 93 A/1
 02-986 Warszawa

telefon: 880907872, 509865011

e-mail:      info@polishcitizenship.pl

                                                          KIEROWNIK URZĘDU STANU
                                                         CYWILNEGO M.ST. WARSZAWA

Wniosek o wpisanie zagranicznego aktu stanu cywilnego
Proszę o wpisanie załączonego aktu               urodzenia   do polskich ksiąg stanu cywilnego.

Zagraniczny akt stanu cywilnego został sporządzony w: ${data.eventPlace || ''}
na imię (imiona) i nazwisko/a: ${data.applicantFirstName || ''} ${data.applicantLastName || ''}
Zdarzenie nastąpiło w: ${data.eventPlace || ''}

dnia: ${data.eventDate || data.applicantDateOfBirth || ''}               -              -                      dd-mm-rrrr

Oświadczam, że ten akt nie został zarejestrowany w księgach stanu cywilnego na terenie RP.
Do podania załączam:

    1.   Oryginał aktu z tłumaczeniem przysięgłym na jęz. polski
    2.   Dowód uiszczenia opłaty skarbowej
    3.   Pełnomocnictwo
    4.   Kopia paszportu

Sposób odbioru dokumentów:
       Wysłać do pełnomocnika.

                                                                  z up.
                                                                                      podpis wnioskodawcy
    `.trim();
  }

  private buildCivilRegistryMarriageContent(data: Partial<DataEntry>): string {
    return `
                                                                                        Warszawa
 Imię i nazwisko wnioskodawcy: ${data.applicantFirstName || ''} ${data.applicantLastName || ''}                                      2   4            0    5         2    0    2   5
                                                                               -              -
 Kraj wnioskodawcy: ${data.applicantCountry || ''}
                                                                                   dd-mm-rrrr
                                                                           miejsce i data złożenia wniosku
PEŁNOMOCNIK:
 Roman WIŚNIEWSKI

adres miejsca zamieszkania:
 Wał Zawadowski 93 A/1
 02-986 Warszawa

telefon: 880907872, 509865011

e-mail:      info@polishcitizenship.pl

                                                           KIEROWNIK URZĘDU STANU
                                                          CYWILNEGO M.ST. WARSZAWA

Wniosek o wpisanie zagranicznego aktu stanu cywilnego
Proszę o wpisanie załączonego aktu               małżeństwa   do polskich ksiąg stanu cywilnego.

Zagraniczny akt stanu cywilnego został sporządzony w: ${data.marriagePlace || ''}
na imię (imiona) i nazwisko/a: ${data.applicantFirstName || ''} ${data.applicantLastName || ''} i ${data.spouseFirstName || ''} ${data.spouseLastName || ''}

Zdarzenie nastąpiło w: ${data.marriagePlace || ''}

dnia: ${data.marriageDate || ''}                -             -                       dd-mm-rrrr

Oświadczam, że ten akt nie został zarejestrowany w księgach stanu cywilnego na terenie RP.
Do podania załączam:
    1.   Oryginał aktu z tłumaczeniem przysięgłym na jęz. polski
    2.   Dowód uiszczenia opłaty skarbowej
    3.   Pełnomocnictwo
    4.   Kopia paszportu

Sposób odbioru dokumentów:
       Wysłać do pełnomocnika.

                                                                   z up.
                                                                                   podpis wnioskodawcy
    `.trim();
  }

  private buildCivilSupplementContent(data: Partial<DataEntry>): string {
    return `
                                                                          Warszawa
  Imię i nazwisko wnioskodawcy: ${data.applicantFirstName || ''} ${data.applicantLastName || ''}                                    -              -    2   0     2   5

                                                                         dd-mm-rrrr
  Kraj wnioskodawcy: ${data.applicantCountry || ''}
                                                              Miejsce i data złożenia wniosku
  PEŁNOMOCNIK:
   Roman WIŚNIEWSKI

  adres miejsca zamieszkania:
   ul. Słomińskiego Zygmunta 17/50
   00-195 Warszawa

  telefon: 505306990, 509865011

  e-mail:      info@polishcitizenship.pl

                                                 KIEROWNIK URZĘDU STANU
                                                CYWILNEGO M.ST. WARSZAWA

Podanie o uzupełnienie aktów stanu cywilnego
Proszę o uzupełnienie następującego aktu urodzenia:

Sporządzonego w Urzędzie Stanu Cywilnego m.st Warszawa pod nr: ${data.actNumber || ''}                             z roku: ${data.actYear || ''}
                   następującymi danymi:

  Nazwisko rodowe ojca: ${data.fatherBirthName || data.fatherLastName || ''}
  Nazwisko rodowe matki: ${data.motherBirthName || data.motherLastName || ''}
zgodnie z wcześniej sporządzonym aktem urodzenia/ małżeństwa, sporządzonym w Urzędzie
Stanu Cywilnego w: ${data.registryOffice || ''}                                                                   .

                                                      z up.
                                                                      podpis wnioskodawcy
    `.trim();
  }

  private buildCivilCorrectionContent(data: Partial<DataEntry>): string {
    return `
                                                                     Warszawa

Imię i nazwisko wnioskodawcy: ${data.applicantFirstName || ''} ${data.applicantLastName || ''}                                 -              -    2   0      2   5

                                                                  dd-mm-rrrr
Kraj wnioskodawcy: ${data.applicantCountry || ''}
PEŁNOMOCNIK:
                                                          Miejsce i data złożenia wniosku
 Roman WIŚNIEWSKI

adres miejsca zamieszkania:
 ul. Słomińskiego Zygmunta 17/50
 00-195 Warszawa

telefon: 505306990, 509865011

e-mail:      info@polishcitizenship.pl

                                               KIEROWNIK URZĘDU STANU
                                              CYWILNEGO M.ST. WARSZAWA

Wniosek o sprostowanie aktu stanu cywilnego
Na podstawie art. 35 ustawy prawo o aktach stanu cywilnego, proszę o sprostowanie aktu
urodzenia*, aktu małżeństwa*, aktu zgonu* dotyczącego:

          Imię i nazwisko: ${data.applicantFirstName || ''} ${data.applicantLastName || ''}

sporządzonego w Urzędzie Stanu Cywilnego pod nr: ${data.actNumber || ''}

z roku: ${data.actYear || ''}                        .
W akcie błędnie wpisano następujące dane:

${data.incorrectData || ''}

Zgodnie z wcześniej sporządzonym aktem ${data.eventType || ''} w: ${data.registryOffice || ''}
nr: ${data.actNumber || ''}                                .

                                              z up.
                                                          podpis wnioskodawcy

*niepotrzebne skreślić
    `.trim();
  }

  private buildNameChangeContent(data: Partial<DataEntry>): string {
    return `
                                                                                    Warszawa
Imię i nazwisko wnioskodawcy: ${data.applicantFirstName || ''} ${data.applicantLastName || ''}                                                                   2   0     2   5
                                                                           -              -

                                                                                  dd-mm-rrrr
Kraj zamieszkania: ${data.applicantCountry || ''}                                                      Miejsce i data złożenia wniosku

Posiada obywatelstwo polskie

                                                         KIEROWNIK URZĘDU STANU
                                                        CYWILNEGO M.ST. WARSZAWA

Wniosek o zmianę imienia i nazwiska
Na podstawie Ustawy z dn. 17 października 2008 r. o zmianie imion i nazwisk wnoszę
niniejszym o zmianę mojego imienia/ nazwiska w polskich dokumentach:
z: ${data.oldName || ''}
na: ${data.newName || ''}
Ponieważ ubiegam się o wydanie mi polskiego paszportu, pisownia i forma mojego imienia/
nazwiska powinna być ujednolicona w polskich i zagranicznych dokumentach.

Jednocześnie Ja, niżej podpisany: ${data.applicantFirstName || ''} ${data.applicantLastName || ''}

legitymujący/a się dokumentem tożsamości nr: ${data.applicantDocumentNumber || ''}

upoważniam niniejszym: Romana WIŚNIEWSKIEGO                            legitymującego /ą się polskim
dowodem osobistym nr:       CBU 675382                              , zamieszkałym/ą w:

Warszawie, ul. Słomińskiego 17/50                     do złożenia w moim imieniu:
      •   wniosku o zmianę mojego imienia/ nazwiska
      •   wniesienia wymaganych opłat,
      •   składania oświadczeń woli/ wyjaśnienia.
Ja niżej podpisany/a, oświadczam, że nie złożyłem/am wcześniej w tej samej sprawie wniosku do innego
kierownika urzędu stanu cywilnego oraz nie została wydana już decyzja odmowna.
Numer PESEL – ${data.applicantPesel || ''}                                            .
Mój stan cywilny to: ${data.applicantMaritalStatus || ''}                            .

                                                               z up.
                                                                               podpis/ signature
    `.trim();
  }

  private buildDocumentCopiesContent(data: Partial<DataEntry>): string {
    return `
                                                                                 Warszawa

Imię i nazwisko wnioskodawcy: ${data.applicantFirstName || ''} ${data.applicantLastName || ''}                                  1    0   -     0    5    -    2    0    2   5

                                                                             dd-mm-rrrr
Kraj wnioskodawcy: ${data.applicantCountry || ''}
PEŁNOMOCNIK:                                                       Miejsce i data złożenia wniosku

Roman WIŚNIEWSKI

adres miejsca zamieszkania:
ul. Słomińskiego Zygmunta 17/50
00-195 Warszawa

telefon: +48 509 865 011

e-mail:     info@polishcitizenship.pl

                                                          URZĄD STANU CYWILNEGO
                                                              W WARSZAWIE

Wniosek o wydanie odpisów aktów stanu cywilnego
Proszę o wydanie odpisu zupełnego aktu urodzenia:

                     Imię i nazwisko: ${data.applicantFirstName || ''} ${data.applicantLastName || ''}

               Miejsce zdarzenia: ${data.applicantPlaceOfBirth || ''}

                     Data zdarzenia: ${data.applicantDateOfBirth || ''}               -   -                     dd-mm-rrrr

Akt potrzebny jest do uzyskania obywatelstwa polskiego/ paszportu polskiego.

                                                           z up.
                                                                           podpis wnioskodawcy
    `.trim();
  }

  private buildPolishIDContent(data: Partial<DataEntry>): string {
    return `
         Rzeczpospolita
          Polska
                                Oznaczenie organu                                              DO/W/1

Wniosek o wydanie dowodu osobistego

Instrukcja wypełniania w trzech krokach

                           1.    WYPEŁNIAJ WIELKIMI LITERAMI
                           2.   Pole wyboru zaznaczaj z lub x
                           3.   Wypełniaj kolorem czarnym lub niebieskim

1.    Dane osoby, dla której dowód zostanie wydany

              Numer PESEL: ${data.applicantPesel || ''}

               Imię (imiona): ${data.applicantFirstName || ''}

                  Nazwisko: ${data.applicantLastName || ''}

          Nazwisko rodowe: ${data.applicantBirthName || ''}

            Data urodzenia: ${data.applicantDateOfBirth || ''}               -          -
                                i dd-mm-rrrr

          Miejsce urodzenia: ${data.applicantPlaceOfBirth || ''}

             Obywatelstwo:           polskie

                       Płeć:         ${data.applicantGender === 'female' ? 'kobieta' : ''}
                                    ${data.applicantGender === 'male' ? 'mężczyzna' : ''}

                                Dane rodziców

        Imię ojca (pierwsze): ${data.fatherFirstName || ''}

       Imię matki (pierwsze): ${data.motherFirstName || ''}

     Nazwisko rodowe matki: ${data.motherBirthName || ''}

2.    Dane kontaktowe osoby składającej wniosek
                                Wpisz poniżej adres do korespondencji:

                       Ulica: ${data.applicantStreet || ''}

              Numer domu: ${data.applicantHouseNumber || ''}                                                   Numer lokalu: ${data.applicantApartmentNumber || ''}

             Kod pocztowy: ${data.applicantPostalCode || ''}                -                  Miejscowość: ${data.applicantCity || ''}

           Numer telefonu: ${data.applicantPhone || ''}

               Adres e-mail: ${data.applicantEmail || ''}

4.    Powód ubiegania się o wydanie dowodu

                                  pierwszy dowód
                                  zmiana danych zawartych w dowodzie
                                  upływ terminu ważności dowodu
                                  utrata dowodu
                                  zmiana wizerunku twarzy
                                  uszkodzenie dowodu
                                  inny (wpisz jaki)

              Miejscowość:                             Warszawa
                      Data:             -          -
                              i dd-mm-rrrr

     Własnoręczny czytelny
     podpis wnioskodawcy
    `.trim();
  }

  /**
   * Create ZIP archive with all generated PDFs
   */
  private async createZipArchive(results: PDFGenerationResult[], sessionId: string): Promise<string> {
    const zipFileName = `Polish_Documents_${sessionId}_${Date.now()}.zip`;
    const zipPath = path.join(this.outputPath, zipFileName);
    
    return new Promise(async (resolve, reject) => {
      const fs = await import('fs');
      const archiverModule = await import('archiver');
      const archiver = archiverModule.default;
      
      const output = fs.default.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`ZIP archive created: ${zipPath} (${archive.pointer()} bytes)`);
        resolve(zipPath);
      });

      archive.on('error', (err) => {
        console.error('ZIP creation error:', err);
        reject(err);
      });

      archive.pipe(output);

      // Add successful PDF files to the archive
      for (const result of results) {
        if (result.status === 'success' && fs.default.existsSync(result.filePath)) {
          archive.file(result.filePath, { name: result.fileName });
        }
      }

      archive.finalize();
    });
  }
}