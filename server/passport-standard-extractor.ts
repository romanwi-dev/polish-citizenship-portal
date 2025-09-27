import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export interface StandardPassportData {
  surname: string;
  givenNames: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  placeOfBirth: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  issuingAuthority: string;
}

export class PassportStandardExtractor {
  async extractFromPDF(pdfBuffer: Buffer): Promise<StandardPassportData> {
    console.log('🔍 Extracting passport data using standard international format...');
    
    // Try direct text extraction first
    console.log('📄 Attempting direct PDF text extraction...');
    const textVersions = [
      pdfBuffer.toString('latin1'),
      pdfBuffer.toString('ascii'),
      pdfBuffer.toString('utf8')
    ];
    
    let bestExtraction: StandardPassportData = {
      surname: '',
      givenNames: '',
      passportNumber: '',
      nationality: '',
      dateOfBirth: '',
      placeOfBirth: '',
      dateOfIssue: '',
      dateOfExpiry: '',
      issuingAuthority: ''
    };
    
    for (const text of textVersions) {
      const extraction = this.extractFieldsFromText(text);
      const score = this.scoreExtraction(extraction);
      
      if (score > this.scoreExtraction(bestExtraction)) {
        bestExtraction = extraction;
      }
    }
    
    // If direct extraction didn't find names (regardless of dates), try OCR on image for passport documents
    if (!bestExtraction.surname && !bestExtraction.givenNames) {
      console.log('📸 Converting PDF to image for OCR...');
      try {
        const imageExtraction = await this.convertPDFToImageAndExtract(pdfBuffer);
        if (imageExtraction.surname || imageExtraction.givenNames) {
          // Merge the results: names from image, dates from direct extraction
          bestExtraction.surname = imageExtraction.surname || bestExtraction.surname;
          bestExtraction.givenNames = imageExtraction.givenNames || bestExtraction.givenNames;
          bestExtraction.passportNumber = imageExtraction.passportNumber || bestExtraction.passportNumber;
          bestExtraction.nationality = imageExtraction.nationality || bestExtraction.nationality;
          console.log('✅ Combined extraction successful!');
        }
      } catch (error) {
        console.log('⚠️ Image conversion failed:', error.message);
        console.log('⚠️ Using direct extraction only');
      }
    }
    
    console.log('✅ Standard passport extraction completed:', bestExtraction);
    return bestExtraction;
  }
  
  private async convertPDFToImageAndExtract(pdfBuffer: Buffer): Promise<StandardPassportData> {
    const tempDir = '/tmp';
    const timestamp = Date.now();
    const pdfPath = path.join(tempDir, `passport_${timestamp}.pdf`);
    const imagePath = path.join(tempDir, `passport_${timestamp}.png`);
    
    try {
      // Write PDF to temp file
      fs.writeFileSync(pdfPath, pdfBuffer);
      
      // Convert PDF to PNG using poppler-utils
      console.log('🔧 Converting PDF to PNG...');
      const command = `pdftoppm -png -singlefile -r 300 "${pdfPath}" "${imagePath.replace('.png', '')}"`;
      console.log('🔧 Command:', command);
      
      const { stdout, stderr } = await execAsync(command);
      console.log('🔧 pdftoppm stdout:', stdout);
      console.log('🔧 pdftoppm stderr:', stderr);
      
      // Read the generated image
      console.log('🔧 Checking for image at:', imagePath);
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        
        // Use OpenAI Vision to extract text from image
        const extractedText = await this.extractTextFromImage(imageBuffer);
        const result = this.extractFieldsFromText(extractedText);
        
        // Cleanup
        fs.unlinkSync(pdfPath);
        fs.unlinkSync(imagePath);
        
        return result;
      } else {
        throw new Error('Image conversion failed');
      }
    } catch (error) {
      // Cleanup on error
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      throw error;
    }
  }
  
  private async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const base64Image = imageBuffer.toString('base64');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this passport document. Focus on finding: SURNAME, GIVEN NAMES, PASSPORT NUMBER, NATIONALITY, dates. Return all visible text exactly as it appears."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 1000,
    });
    
    return response.choices[0].message.content || '';
  }
  
  private extractFieldsFromText(text: string): StandardPassportData {
    // Standard passport field patterns used internationally
    const patterns = {
      // Surname patterns (multiple languages and formats)
      surname: [
        /(?:SURNAME|APELLIDOS?|NAZWISKO|ФАМИЛИЯ|Family\s+name|Last\s+name)\s*:?\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\-\s]{2,40})/gi,
        /(?:^|\n)\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\-]{3,30})\s*(?=\n|$)/gm
      ],
      
      // Given names patterns
      givenNames: [
        /(?:GIVEN\s+NAMES?|FIRST\s+NAMES?|IMIONA|NOMBRE|ИМЯ|Forenames?|Prenames?)\s*:?\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\-\s]{2,50})/gi,
        /(?:Christian\s+names?|Middle\s+names?)\s*:?\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\-\s]{2,50})/gi
      ],
      
      // Passport number patterns (international standards)
      passportNumber: [
        /(?:PASSPORT\s+(?:NO|NUMBER)|NÚMERO|NUMER|DOCUMENT\s+NO|DOC\s+NO)\s*:?\s*([A-Z0-9\-\s]{6,15})/gi,
        /(?:^|\n)\s*([A-Z]{1,3}[0-9]{6,9})\s*(?=\n|$)/gm,
        /([A-Z]{2}\s*[0-9]{7})/g,
        /([A-Z][0-9]{8})/g
      ],
      
      // Nationality patterns
      nationality: [
        /(?:NATIONALITY|NACIONALIDAD|OBYWATELSTWO|CITIZEN|CIUDADANO)\s*:?\s*([A-Z\s]{3,20})/gi,
        /(?:COUNTRY|PAYS|PAÍS)\s*:?\s*([A-Z\s]{3,20})/gi
      ],
      
      // Date patterns (birth, issue, expiry)
      dates: [
        /(\d{2}[.\/-]\d{2}[.\/-]\d{4})/g,
        /(\d{4}[.\/-]\d{2}[.\/-]\d{2})/g,
        /(\d{2}\s+[A-Z]{3}\s+\d{4})/g // 01 JAN 1990 format
      ],
      
      // Birth date specific patterns
      dateOfBirth: [
        /(?:DATE\s+OF\s+BIRTH|BIRTH\s+DATE|FECHA\s+NACIMIENTO|DATA\s+URODZENIA)\s*:?\s*(\d{2}[.\/-]\d{2}[.\/-]\d{4})/gi,
        /(?:BORN|NACIDO|URODZONY)\s*:?\s*(\d{2}[.\/-]\d{2}[.\/-]\d{4})/gi
      ],
      
      // Issue date patterns
      dateOfIssue: [
        /(?:DATE\s+OF\s+ISSUE|ISSUE\s+DATE|FECHA\s+EXPEDICIÓN|DATA\s+WYDANIA)\s*:?\s*(\d{2}[.\/-]\d{2}[.\/-]\d{4})/gi,
        /(?:ISSUED|EXPEDIDO|WYDANY)\s*:?\s*(\d{2}[.\/-]\d{2}[.\/-]\d{4})/gi
      ],
      
      // Expiry date patterns
      dateOfExpiry: [
        /(?:DATE\s+OF\s+EXPIRY|EXPIRY\s+DATE|FECHA\s+VENCIMIENTO|DATA\s+WAŻNOŚCI)\s*:?\s*(\d{2}[.\/-]\d{2}[.\/-]\d{4})/gi,
        /(?:EXPIRES|EXPIRA|WYGASA)\s*:?\s*(\d{2}[.\/-]\d{2}[.\/-]\d{4})/gi
      ],
      
      // Place of birth patterns
      placeOfBirth: [
        /(?:PLACE\s+OF\s+BIRTH|BIRTH\s+PLACE|LUGAR\s+NACIMIENTO|MIEJSCE\s+URODZENIA)\s*:?\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\-\s,]{2,50})/gi
      ],
      
      // Issuing authority patterns
      issuingAuthority: [
        /(?:ISSUING\s+AUTHORITY|AUTHORITY|AUTORIDAD|ORGAN\s+WYDAJĄCY)\s*:?\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\-\s,]{2,50})/gi
      ]
    };
    
    const result: StandardPassportData = {
      surname: '',
      givenNames: '',
      passportNumber: '',
      nationality: '',
      dateOfBirth: '',
      placeOfBirth: '',
      dateOfIssue: '',
      dateOfExpiry: '',
      issuingAuthority: ''
    };
    
    // Extract surname
    for (const pattern of patterns.surname) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const surname = matches[0][1].trim().toUpperCase();
        if (this.isValidName(surname)) {
          result.surname = surname;
          console.log('🎯 Found SURNAME:', surname);
          break;
        }
      }
    }
    
    // Extract given names
    for (const pattern of patterns.givenNames) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const givenNames = matches[0][1].trim().toUpperCase();
        if (this.isValidName(givenNames) && givenNames !== result.surname) {
          result.givenNames = givenNames;
          console.log('🎯 Found GIVEN NAMES:', givenNames);
          break;
        }
      }
    }
    
    // Extract passport number
    for (const pattern of patterns.passportNumber) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const passportNum = matches[0][1].replace(/\s/g, '').trim().toUpperCase();
        if (this.isValidPassportNumber(passportNum)) {
          result.passportNumber = passportNum;
          console.log('🎯 Found PASSPORT NUMBER:', passportNum);
          break;
        }
      }
    }
    
    // Extract nationality
    for (const pattern of patterns.nationality) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const nationality = matches[0][1].trim().toUpperCase();
        if (this.isValidNationality(nationality)) {
          result.nationality = nationality;
          console.log('🎯 Found NATIONALITY:', nationality);
          break;
        }
      }
    }
    
    // Extract specific dates
    for (const pattern of patterns.dateOfBirth) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        result.dateOfBirth = matches[0][1];
        console.log('🎯 Found DATE OF BIRTH:', result.dateOfBirth);
        break;
      }
    }
    
    for (const pattern of patterns.dateOfIssue) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        result.dateOfIssue = matches[0][1];
        console.log('🎯 Found DATE OF ISSUE:', result.dateOfIssue);
        break;
      }
    }
    
    for (const pattern of patterns.dateOfExpiry) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        result.dateOfExpiry = matches[0][1];
        console.log('🎯 Found DATE OF EXPIRY:', result.dateOfExpiry);
        break;
      }
    }
    
    // If no specific dates found, try to extract any dates
    if (!result.dateOfBirth && !result.dateOfIssue && !result.dateOfExpiry) {
      const allDates = [];
      for (const pattern of patterns.dates) {
        const matches = [...text.matchAll(pattern)];
        allDates.push(...matches.map(m => m[1]));
      }
      
      if (allDates.length >= 1) result.dateOfBirth = allDates[0];
      if (allDates.length >= 2) result.dateOfIssue = allDates[1];
      if (allDates.length >= 3) result.dateOfExpiry = allDates[2];
    }
    
    return result;
  }
  
  private isValidName(name: string): boolean {
    return name.length >= 2 && 
           name.length <= 50 && 
           /^[A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\-\s]+$/.test(name) &&
           !['PDF', 'TYPE', 'CODE', 'PASSPORT', 'DATE', 'PLACE', 'DOCUMENT', 'PAGE', 'XML', 'RDF'].includes(name);
  }
  
  private isValidPassportNumber(num: string): boolean {
    return num.length >= 6 && 
           num.length <= 15 && 
           /^[A-Z0-9]+$/.test(num) &&
           !['PDF', 'XML', 'RDF'].includes(num);
  }
  
  private isValidNationality(nationality: string): boolean {
    const validNationalities = [
      'POLISH', 'POLAND', 'AMERICAN', 'USA', 'BRITISH', 'UK', 'GERMAN', 'GERMANY',
      'FRENCH', 'FRANCE', 'ITALIAN', 'ITALY', 'SPANISH', 'SPAIN', 'CANADIAN', 'CANADA'
    ];
    return nationality.length >= 3 && 
           (validNationalities.includes(nationality) || nationality.length <= 20);
  }
  
  private scoreExtraction(data: StandardPassportData): number {
    let score = 0;
    if (data.surname) score += 3;
    if (data.givenNames) score += 3;
    if (data.passportNumber) score += 4;
    if (data.nationality) score += 2;
    if (data.dateOfBirth) score += 1;
    if (data.dateOfIssue) score += 1;
    if (data.dateOfExpiry) score += 1;
    return score;
  }
}