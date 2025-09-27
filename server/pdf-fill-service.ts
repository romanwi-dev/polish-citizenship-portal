import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface FillData {
  templateName: string;
  templateUrl: string;
  applicantData: any;
  familyTreeData: any;
}

export class PDFillService {
  
  async fillTemplate(data: FillData): Promise<Buffer> {
    console.log('Starting PDF fill for:', data.templateName);
    
    try {
      // Get the PDF file path from URL
      const pdfPath = this.getLocalPDFPath(data.templateUrl);
      
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`PDF template not found: ${pdfPath}`);
      }
      
      // Load the PDF
      const existingPdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Get the form if it exists
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      console.log(`Found ${fields.length} form fields in PDF`);
      
      // Map data based on template type
      const mappedData = this.mapDataToTemplate(data);
      
      // Fill the form fields
      this.fillFormFields(form, mappedData);
      
      // If no fillable fields, add text overlays
      if (fields.length === 0) {
        await this.addTextOverlays(pdfDoc, mappedData, data.templateName);
      }
      
      // Save the filled PDF
      const pdfBytes = await pdfDoc.save();
      console.log('PDF filled successfully');
      
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      console.error('Error filling PDF:', error);
      throw error;
    }
  }
  
  private getLocalPDFPath(templateUrl: string): string {
    // Convert URL to local file path
    const fileName = templateUrl.replace('/attached_assets/', '');
    return path.join(process.cwd(), 'attached_assets', fileName);
  }
  
  private mapDataToTemplate(data: FillData): Record<string, string> {
    const { applicantData, familyTreeData } = data;
    const mapped: Record<string, string> = {};
    
    // UPDATED APPLICANT DATA MAPPING TO MATCH PDF TEMPLATES EXACTLY
    if (applicantData) {
      // PDF Template field mapping (EXACT field names from templates)
      mapped['imie_nazwisko_wniosko'] = `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim();
      mapped['nr_dok_tozsamosci'] = applicantData.passportNumber || '';
      mapped['data_pelnomocnictwa'] = new Date().toLocaleDateString('pl-PL');
      
      // Polish Citizenship Application field mapping
      mapped['firstNames'] = applicantData.firstNames || '';
      mapped['lastName'] = applicantData.lastName || '';
      mapped['maidenName'] = applicantData.maidenName || '';
      mapped['fullName'] = `${applicantData.firstNames || ''} ${applicantData.lastName || ''}`.trim();
      mapped['email'] = applicantData.email || '';
      mapped['mobilePhone'] = applicantData.mobilePhone || '';
      mapped['currentAddress'] = applicantData.currentAddress || '';
      mapped['street'] = applicantData.street || '';
      mapped['houseNumber'] = applicantData.houseNumber || '';
      mapped['apartmentNumber'] = applicantData.apartmentNumber || '';
      mapped['city'] = applicantData.city || '';
      mapped['state'] = applicantData.state || '';
      mapped['postalCode'] = applicantData.postalCode || '';
      mapped['birthDate'] = applicantData.birthDate || '';
      mapped['birthPlace'] = applicantData.birthPlace || '';
      mapped['gender'] = applicantData.gender || '';
      mapped['maritalStatus'] = applicantData.maritalStatus || '';
      mapped['foreignCitizenshipsWithDates'] = applicantData.foreignCitizenshipsWithDates || '';
      mapped['passportNumber'] = applicantData.passportNumber || '';
    }
    
    // Family tree data mapping
    if (familyTreeData) {
      // Applicant
      mapped['applicantName'] = familyTreeData.applicantName || '';
      mapped['applicantBirthDate'] = familyTreeData.applicantBirthDate || '';
      mapped['applicantBirthPlace'] = familyTreeData.applicantBirthPlace || '';
      
      // Polish Parent
      mapped['polishParentName'] = familyTreeData.polishParentName || '';
      mapped['polishParentBirthDate'] = familyTreeData.polishParentBirthDate || '';
      mapped['polishParentBirthPlace'] = familyTreeData.polishParentBirthPlace || '';
      mapped['polishParentEmigrationDate'] = familyTreeData.polishParentEmigrationDate || '';
      mapped['polishParentNaturalizationDate'] = familyTreeData.polishParentNaturalizationDate || '';
      
      // Polish Grandparents
      mapped['polishGrandfatherName'] = familyTreeData.polishGrandfatherName || '';
      mapped['polishGrandfatherBirthDate'] = familyTreeData.polishGrandfatherBirthDate || '';
      mapped['polishGrandfatherBirthPlace'] = familyTreeData.polishGrandfatherBirthPlace || '';
      
      mapped['polishGrandmotherName'] = familyTreeData.polishGrandmotherName || '';
      mapped['polishGrandmotherBirthDate'] = familyTreeData.polishGrandmotherBirthDate || '';
      mapped['polishGrandmotherBirthPlace'] = familyTreeData.polishGrandmotherBirthPlace || '';
      
      // Great Grandparents
      mapped['greatGrandfatherName'] = familyTreeData.greatGrandfatherName || '';
      mapped['greatGrandmotherName'] = familyTreeData.greatGrandmotherName || '';
    }
    
    return mapped;
  }
  
  private fillFormFields(form: PDFForm, data: Record<string, string>): void {
    const fields = form.getFields();
    
    fields.forEach(field => {
      const fieldName = field.getName();
      
      // Try to find matching data for this field
      const value = this.findMatchingValue(fieldName, data);
      
      if (value) {
        try {
          if (field instanceof PDFTextField) {
            field.setText(value);
          } else if (field instanceof PDFCheckBox) {
            // For checkboxes, check if value indicates it should be checked
            const shouldCheck = value.toLowerCase() === 'true' || 
                               value.toLowerCase() === 'yes' || 
                               value.toLowerCase() === 'x' ||
                               value === '1';
            if (shouldCheck) {
              field.check();
            }
          }
        } catch (error) {
          console.warn(`Error filling field ${fieldName}:`, error);
        }
      }
    });
  }
  
  private findMatchingValue(fieldName: string, data: Record<string, string>): string | null {
    const lowerFieldName = fieldName.toLowerCase();
    
    // Direct match
    if (data[fieldName]) return data[fieldName];
    if (data[lowerFieldName]) return data[lowerFieldName];
    
    // Fuzzy matching for common field patterns
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      if (lowerFieldName.includes(lowerKey) || lowerKey.includes(lowerFieldName)) {
        return value;
      }
      
      // Special patterns
      if (lowerFieldName.includes('name') && lowerKey.includes('name')) return value;
      if (lowerFieldName.includes('date') && lowerKey.includes('date')) return value;
      if (lowerFieldName.includes('place') && lowerKey.includes('place')) return value;
      if (lowerFieldName.includes('birth') && lowerKey.includes('birth')) return value;
      if (lowerFieldName.includes('email') && lowerKey.includes('email')) return value;
      if (lowerFieldName.includes('phone') && lowerKey.includes('phone')) return value;
      if (lowerFieldName.includes('address') && lowerKey.includes('address')) return value;
    }
    
    return null;
  }
  
  private async addTextOverlays(pdfDoc: PDFDocument, data: Record<string, string>, templateName: string): Promise<void> {
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    // Add basic information overlay (you can customize positions based on template)
    let yPosition = height - 100;
    const xPosition = 50;
    const lineHeight = 20;
    
    // Add key data points as text overlay
    const overlayData = [
      `Name: ${data.fullName || data.applicantName || ''}`,
      `Birth Date: ${data.birthDate || data.applicantBirthDate || ''}`,
      `Birth Place: ${data.birthPlace || data.applicantBirthPlace || ''}`,
      `Email: ${data.email || ''}`,
      `Phone: ${data.phone || ''}`,
    ].filter(line => line.split(': ')[1]); // Only include lines with data
    
    overlayData.forEach(text => {
      if (yPosition > 50) { // Make sure we don't go off the page
        firstPage.drawText(text, {
          x: xPosition,
          y: yPosition,
          size: 10,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;
      }
    });
  }
}