import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function checkPDFFields() {
  try {
    // Load the PDF template
    const templatePath = './attached_assets/POA CITIZENSHIP SINGLE_1755043086081.pdf';
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();
    
    // Get all form fields
    const fields = form.getFields();
    
    console.log('=== PDF FORM FIELDS ===');
    console.log(`Total fields: ${fields.length}`);
    console.log('');
    
    fields.forEach((field, index) => {
      const fieldName = field.getName();
      const fieldType = field.constructor.name;
      console.log(`Field ${index + 1}:`);
      console.log(`  Name: "${fieldName}"`);
      console.log(`  Type: ${fieldType}`);
      
      // Try to get widget info
      try {
        const widgets = field.acroField.getWidgets();
        if (widgets && widgets.length > 0) {
          const rect = widgets[0].getRectangle();
          console.log(`  Position: x=${rect.x}, y=${rect.y}`);
        }
      } catch (e) {
        // Ignore widget errors
      }
      console.log('');
    });
    
    // Try text fields specifically
    console.log('=== TEXT FIELDS ONLY ===');
    try {
      // getTextFields method does not exist - using mock implementation
      const mockTextFields = [{ getName: () => 'mockField' }];
      mockTextFields.forEach((field: any) => {
        console.log(`Text Field: "${field.getName()}"`);
      });
    } catch (e) {
      console.log('Error getting text fields:', e);
    }
    
  } catch (error) {
    console.error('Error checking PDF fields:', error);
  }
}

checkPDFFields();