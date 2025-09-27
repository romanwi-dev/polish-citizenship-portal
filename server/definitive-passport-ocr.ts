import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export interface PassportExtractionResult {
  success: boolean;
  surname: string;
  givenNames: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  extractionMethod: string;
  confidence: number;
}

export class DefinitivePassportOCR {
  async extractFromDocument(buffer: Buffer, mimeType: string): Promise<PassportExtractionResult> {
    
    // For image files, use OpenAI Vision directly
    if (mimeType.startsWith('image/')) {
      return await this.extractFromImage(buffer);
    }
    
    // For PDF files, first check if it has readable text content
    if (mimeType === 'application/pdf') {
      // Step 1: Try direct text extraction
      const textResult = await this.extractFromPDFText(buffer);
      
      // If text extraction found meaningful passport content, use it
      if (this.isRealPassportData(textResult)) {
        return textResult;
      }
      
      // Step 2: PDF likely contains scanned image - convert to image and use Vision OCR
      return await this.extractFromPDFViaImage(buffer);
    }
    
    return this.createEmptyResult('Unsupported file type');
  }
  
  private async extractFromImage(imageBuffer: Buffer): Promise<PassportExtractionResult> {
    
    try {
      const OpenAI = (await import('openai')).default;
      // Use OpenAI API key from environment variables
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        return this.createEmptyResult('OpenAI API key not configured');
      }
      const openai = new OpenAI({ apiKey });
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract passport information from this image. Return JSON format:
{
  "surname": "exact surname from document",
  "givenNames": "exact given names from document", 
  "passportNumber": "exact passport number",
  "nationality": "nationality if visible",
  "dateOfBirth": "birth date if visible",
  "dateOfIssue": "issue date if visible", 
  "dateOfExpiry": "expiry date if visible"
}

Focus on finding SURNAME, GIVEN NAMES, and PASSPORT NUMBER as these are mandatory fields on all international passports.`
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}` }
            }
          ],
        }],
        max_tokens: 800,
      });
      
      const content = response.choices[0].message.content || '';
      console.log('🔍 OpenAI Vision response:', content);
      
      // Parse the JSON response
      const parsed = this.parseOpenAIResponse(content);
      
      return {
        success: !!(parsed.surname || parsed.givenNames || parsed.passportNumber),
        surname: parsed.surname,
        givenNames: parsed.givenNames,
        passportNumber: parsed.passportNumber,
        nationality: parsed.nationality,
        dateOfBirth: parsed.dateOfBirth,
        dateOfIssue: parsed.dateOfIssue,
        dateOfExpiry: parsed.dateOfExpiry,
        extractionMethod: 'OpenAI Vision API',
        confidence: this.calculateConfidence(parsed)
      };
      
    } catch (error: any) {
      console.log('❌ OpenAI Vision extraction failed:', error.message);
      return this.createEmptyResult('OpenAI Vision API error');
    }
  }
  
  private async extractFromPDFText(pdfBuffer: Buffer): Promise<PassportExtractionResult> {
    console.log('📄 Extracting text from PDF directly...');
    
    // Try multiple text encodings
    const encodings = ['utf8', 'latin1', 'ascii'];
    let bestResult = this.createEmptyResult('No text found');
    
    for (const encoding of encodings) {
      const text = pdfBuffer.toString(encoding as BufferEncoding);
      const extracted = this.parsePassportTextContent(text);
      
      if (this.calculateConfidence(extracted) > bestResult.confidence) {
        bestResult = {
          success: !!(extracted.surname || extracted.givenNames || extracted.passportNumber),
          surname: extracted.surname,
          givenNames: extracted.givenNames,
          passportNumber: extracted.passportNumber,
          nationality: extracted.nationality,
          dateOfBirth: extracted.dateOfBirth,
          dateOfIssue: extracted.dateOfIssue,
          dateOfExpiry: extracted.dateOfExpiry,
          extractionMethod: `PDF Text (${encoding})`,
          confidence: this.calculateConfidence(extracted)
        };
      }
    }
    
    console.log('📄 PDF text extraction result:', bestResult);
    return bestResult;
  }
  
  private async extractFromPDFViaImage(pdfBuffer: Buffer): Promise<PassportExtractionResult> {
    console.log('🔄 Converting PDF to image for OCR...');
    
    const tempDir = '/tmp';
    const timestamp = Date.now();
    const pdfPath = path.join(tempDir, `passport_${timestamp}.pdf`);
    const imagePath = path.join(tempDir, `passport_${timestamp}.png`);
    
    try {
      // Write PDF to temp file
      fs.writeFileSync(pdfPath, pdfBuffer);
      
      // Convert first page to optimized PNG (150 DPI for speed)
      const command = `pdftoppm -png -singlefile -r 150 "${pdfPath}" "${imagePath.replace('.png', '')}"`;
      console.log('🔧 Running optimized command:', command);
      
      // Add timeout to prevent hanging (15 second max)
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('PDF conversion timeout - please try JPG photo instead')), 15000)
      );
      
      await Promise.race([execAsync(command), timeoutPromise]);
      
      if (fs.existsSync(imagePath)) {
        console.log('✅ PDF converted to image successfully');
        const imageBuffer = fs.readFileSync(imagePath);
        
        // Clean up temp files
        fs.unlinkSync(pdfPath);
        fs.unlinkSync(imagePath);
        
        // Extract from the converted image
        const result = await this.extractFromImage(imageBuffer);
        result.extractionMethod = 'PDF to Image + OpenAI Vision';
        
        return result;
      } else {
        throw new Error('Image conversion failed - no output file');
      }
      
    } catch (error: any) {
      console.log('❌ PDF to image conversion failed:', error.message);
      
      // Clean up on error
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      
      return this.createEmptyResult(`PDF conversion error: ${error.message}`);
    }
  }
  
  private parsePassportTextContent(text: string): any {
    const result = {
      surname: '',
      givenNames: '',
      passportNumber: '',
      nationality: '',
      dateOfBirth: '',
      dateOfIssue: '',
      dateOfExpiry: ''
    };
    
    // International passport field patterns
    const patterns = {
      passportNumber: [
        /(?:PASSPORT\s+(?:NO|NUMBER)|DOCUMENT\s+NO)\s*:?\s*([A-Z0-9]{6,15})/gi,
        /\b([A-Z]{1,3}[0-9]{6,9})\b/g,
        /\b([A-Z]{2}\s*[0-9]{7})\b/g
      ],
      
      surname: [
        /(?:SURNAME|APELLIDOS?|NAZWISKO)\s*:?\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\s]{2,30})/gi,
        /(?:FAMILY\s+NAME|LAST\s+NAME)\s*:?\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\s]{2,30})/gi
      ],
      
      givenNames: [
        /(?:GIVEN\s+NAMES?|FIRST\s+NAMES?|IMIONA)\s*:?\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\s]{2,50})/gi,
        /(?:FORENAMES?|CHRISTIAN\s+NAMES?)\s*:?\s*([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\s]{2,50})/gi
      ],
      
      dates: [
        /(\d{2}[.\/-]\d{2}[.\/-]\d{4})/g,
        /(\d{4}[.\/-]\d{2}[.\/-]\d{2})/g
      ]
    };
    
    // Extract passport number
    for (const pattern of patterns.passportNumber) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const num = matches[0][1].replace(/\s/g, '');
        if (this.isValidPassportNumber(num)) {
          result.passportNumber = num;
          break;
        }
      }
    }
    
    // Extract surname
    for (const pattern of patterns.surname) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const surname = matches[0][1].trim().toUpperCase();
        if (this.isValidName(surname)) {
          result.surname = surname;
          break;
        }
      }
    }
    
    // Extract given names
    for (const pattern of patterns.givenNames) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const givenNames = matches[0][1].trim().toUpperCase();
        if (this.isValidName(givenNames) && givenNames !== result.surname) {
          result.givenNames = givenNames;
          break;
        }
      }
    }
    
    // Extract dates
    const allDates = [];
    for (const pattern of patterns.dates) {
      const matches = Array.from(text.matchAll(pattern));
      allDates.push(...matches.map(m => m[1]));
    }
    
    if (allDates.length >= 1) result.dateOfBirth = allDates[0];
    if (allDates.length >= 2) result.dateOfIssue = allDates[1];
    if (allDates.length >= 3) result.dateOfExpiry = allDates[2];
    
    return result;
  }
  
  private parseOpenAIResponse(content: string): any {
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.log('⚠️ Failed to parse JSON response');
      }
    }
    
    // If no JSON, try to extract from markdown format
    const markdownMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      try {
        return JSON.parse(markdownMatch[1]);
      } catch (e) {
        console.log('⚠️ Failed to parse markdown JSON');
      }
    }
    
    // Fallback: empty result
    return {
      surname: '',
      givenNames: '',
      passportNumber: '',
      nationality: '',
      dateOfBirth: '',
      dateOfIssue: '',
      dateOfExpiry: ''
    };
  }
  
  private isRealPassportData(result: PassportExtractionResult): boolean {
    // Check if extracted data contains actual names (not metadata like XMP, RGB)
    const metadataTerms = ['XMP', 'RGB', 'PDF', 'XML', 'RDF', 'META', 'XMLNS', 'HTTP'];
    
    if (result.surname && metadataTerms.includes(result.surname.toUpperCase())) {
      return false;
    }
    
    if (result.givenNames && metadataTerms.includes(result.givenNames.toUpperCase())) {
      return false;
    }
    
    // Real passport data should have at least one name field
    return !!(result.surname || result.givenNames);
  }
  
  private isValidName(name: string): boolean {
    return name.length >= 2 && 
           name.length <= 50 && 
           /^[A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ\s\-']+$/.test(name);
  }
  
  private isValidPassportNumber(num: string): boolean {
    return num.length >= 6 && 
           num.length <= 15 && 
           /^[A-Z0-9]+$/.test(num);
  }
  
  private calculateConfidence(data: any): number {
    let score = 0;
    if (data.surname) score += 30;
    if (data.givenNames) score += 30;
    if (data.passportNumber) score += 40;
    return Math.min(score, 100) / 100;
  }
  
  private createEmptyResult(method: string): PassportExtractionResult {
    return {
      success: false,
      surname: '',
      givenNames: '',
      passportNumber: '',
      nationality: '',
      dateOfBirth: '',
      dateOfIssue: '',
      dateOfExpiry: '',
      extractionMethod: method,
      confidence: 0
    };
  }
}