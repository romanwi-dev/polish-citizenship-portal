import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export interface PassportData {
  surname: string;
  givenNames: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  dateOfIssue: string;
  dateOfExpiry: string;
}

export class ReliablePassportExtractor {
  async extractFromPDF(pdfBuffer: Buffer): Promise<PassportData> {
    console.log('🎯 RELIABLE PASSPORT EXTRACTOR: Processing PDF...');
    
    // Method 1: Direct text extraction using multiple approaches
    const textExtraction = await this.extractTextDirectly(pdfBuffer);
    console.log('📄 Direct text extraction result:', textExtraction);
    
    // Method 2: Convert to image and use OpenAI Vision
    let imageExtraction: PassportData = { surname: '', givenNames: '', passportNumber: '', nationality: '', dateOfBirth: '', dateOfIssue: '', dateOfExpiry: '' };
    
    try {
      console.log('🖼️ Converting PDF to image for Vision OCR...');
      imageExtraction = await this.convertAndExtractViaImage(pdfBuffer);
      console.log('🖼️ Image OCR result:', imageExtraction);
    } catch (error) {
      console.log('⚠️ Image conversion failed, continuing with text-only');
    }
    
    // Combine results intelligently
    const result = this.mergeExtractions(textExtraction, imageExtraction);
    console.log('✅ FINAL MERGED RESULT:', result);
    
    return result;
  }
  
  private async extractTextDirectly(pdfBuffer: Buffer): Promise<PassportData> {
    // Try different encoding methods to extract text
    const encodings = ['latin1', 'ascii', 'utf8'];
    let bestResult: PassportData = { surname: '', givenNames: '', passportNumber: '', nationality: '', dateOfBirth: '', dateOfIssue: '', dateOfExpiry: '' };
    
    for (const encoding of encodings) {
      const text = pdfBuffer.toString(encoding as BufferEncoding);
      const extracted = this.parsePassportText(text);
      
      if (this.scoreExtraction(extracted) > this.scoreExtraction(bestResult)) {
        bestResult = extracted;
      }
    }
    
    return bestResult;
  }
  
  private parsePassportText(text: string): PassportData {
    const result: PassportData = {
      surname: '',
      givenNames: '',
      passportNumber: '',
      nationality: '',
      dateOfBirth: '',
      dateOfIssue: '',
      dateOfExpiry: ''
    };
    
    // Standard international passport patterns
    const patterns = {
      // Passport number - international standard formats
      passportNumber: [
        /(?:PASSPORT\s+(?:NO|NUMBER)|DOCUMENT\s+NO|DOC\s+NO)\s*:?\s*([A-Z0-9\-\s]{6,15})/gi,
        /([A-Z]{1,3}[0-9]{6,9})/g,
        /([A-Z]{2}\s*[0-9]{7})/g
      ],
      
      // Dates in various formats
      dates: [
        /(\d{2}[.\/-]\d{2}[.\/-]\d{4})/g,
        /(\d{4}[.\/-]\d{2}[.\/-]\d{2})/g,
        /(\d{2}\s+[A-Z]{3}\s+\d{4})/g
      ],
      
      // Names - uppercase words that are likely names
      names: [
        /([A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ]{3,}(?:\s+[A-ZÄÖÜÁÉÍÓÚČĎĚŇŘŠŤŽŁŚ]{2,})*)/g
      ]
    };
    
    // Extract passport number
    for (const pattern of patterns.passportNumber) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        const passportNum = matches[0][1].replace(/\s/g, '').toUpperCase();
        if (this.isValidPassportNumber(passportNum)) {
          result.passportNumber = passportNum;
          break;
        }
      }
    }
    
    // Extract all dates
    const allDates = [];
    for (const pattern of patterns.dates) {
      const matches = [...text.matchAll(pattern)];
      allDates.push(...matches.map(m => m[1]));
    }
    
    // Assign dates (usually birth, issue, expiry)
    if (allDates.length >= 1) result.dateOfBirth = allDates[0];
    if (allDates.length >= 2) result.dateOfIssue = allDates[1];
    if (allDates.length >= 3) result.dateOfExpiry = allDates[2];
    
    // Extract names (filter out common non-name words)
    const excludeWords = ['PDF', 'TYPE', 'CODE', 'PASSPORT', 'DATE', 'PLACE', 'DOCUMENT', 'PAGE', 'XML', 'RDF', 'XMLNS', 'HTTP', 'META'];
    const nameMatches = [];
    
    for (const pattern of patterns.names) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const name = match[1].trim();
        if (name.length >= 2 && name.length <= 30 && !excludeWords.includes(name)) {
          nameMatches.push(name);
        }
      }
    }
    
    // Assign the first two valid names as surname and given names
    if (nameMatches.length >= 1) result.surname = nameMatches[0];
    if (nameMatches.length >= 2) result.givenNames = nameMatches[1];
    
    return result;
  }
  
  private async convertAndExtractViaImage(pdfBuffer: Buffer): Promise<PassportData> {
    const tempDir = '/tmp';
    const timestamp = Date.now();
    const pdfPath = path.join(tempDir, `passport_${timestamp}.pdf`);
    const imagePath = path.join(tempDir, `passport_${timestamp}.png`);
    
    try {
      // Write PDF to temp file
      fs.writeFileSync(pdfPath, pdfBuffer);
      
      // Convert to image using poppler-utils
      const command = `pdftoppm -png -singlefile -r 300 "${pdfPath}" "${imagePath.replace('.png', '')}"`;
      await execAsync(command);
      
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        
        // Use OpenAI Vision API
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract passport data from this image. Return JSON with: surname, givenNames, passportNumber, nationality, dateOfBirth, dateOfIssue, dateOfExpiry. Use exact text from document."
              },
              {
                type: "image_url",
                image_url: { url: `data:image/png;base64,${imageBuffer.toString('base64')}` }
              }
            ],
          }],
          max_tokens: 500,
        });
        
        const content = response.choices[0].message.content || '';
        
        // Parse JSON response
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              surname: parsed.surname || '',
              givenNames: parsed.givenNames || '',
              passportNumber: parsed.passportNumber || '',
              nationality: parsed.nationality || '',
              dateOfBirth: parsed.dateOfBirth || '',
              dateOfIssue: parsed.dateOfIssue || '',
              dateOfExpiry: parsed.dateOfExpiry || ''
            };
          }
        } catch (parseError) {
          console.log('⚠️ Failed to parse Vision API JSON response');
        }
        
        // Cleanup
        fs.unlinkSync(pdfPath);
        fs.unlinkSync(imagePath);
      }
    } catch (error) {
      console.log('⚠️ Image conversion/OCR error:', error.message);
      // Cleanup on error
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    
    return { surname: '', givenNames: '', passportNumber: '', nationality: '', dateOfBirth: '', dateOfIssue: '', dateOfExpiry: '' };
  }
  
  private mergeExtractions(textResult: PassportData, imageResult: PassportData): PassportData {
    return {
      surname: imageResult.surname || textResult.surname,
      givenNames: imageResult.givenNames || textResult.givenNames,
      passportNumber: imageResult.passportNumber || textResult.passportNumber,
      nationality: imageResult.nationality || textResult.nationality,
      dateOfBirth: imageResult.dateOfBirth || textResult.dateOfBirth,
      dateOfIssue: imageResult.dateOfIssue || textResult.dateOfIssue,
      dateOfExpiry: imageResult.dateOfExpiry || textResult.dateOfExpiry
    };
  }
  
  private isValidPassportNumber(num: string): boolean {
    return num.length >= 6 && num.length <= 15 && /^[A-Z0-9]+$/.test(num);
  }
  
  private scoreExtraction(data: PassportData): number {
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