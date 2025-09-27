import { PDFDocument, PDFForm } from 'pdf-lib';
import { PDFFieldMapping } from '@/features/familyTree/pdfMapper';

/**
 * PDF Helper Functions for Family Tree Export
 * Fills PDF form fields and preserves editability
 */

export interface PDFExportOptions {
  templatePath: string;
  fieldMapping: PDFFieldMapping;
  filename?: string;
}

export interface PDFExportResult {
  success: boolean;
  blob?: Blob;
  filename: string;
  error?: string;
}

/**
 * Fill PDF form fields with family tree data
 * Preserves form field editability for Acrobat
 */
export const fillPDFTemplate = async (options: PDFExportOptions): Promise<PDFExportResult> => {
  try {
    const { templatePath, fieldMapping, filename } = options;
    
    // Fetch the PDF template
    const templateBytes = await fetch(templatePath).then(res => {
      if (!res.ok) throw new Error(`Failed to fetch PDF template: ${res.statusText}`);
      return res.arrayBuffer();
    });

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    // Get all form fields for debugging
    const fields = form.getFields();
    console.log('Available PDF fields:', fields.map(field => field.getName()));

    // Fill each field with mapped data
    let filledFieldCount = 0;
    Object.entries(fieldMapping).forEach(([fieldName, value]) => {
      try {
        const field = form.getField(fieldName);
        
        if (field) {
          // Set the field value
          field.setText(value);
          filledFieldCount++;
          console.log(`Filled field "${fieldName}" with value: "${value}"`);
        } else {
          console.warn(`PDF field "${fieldName}" not found in template`);
        }
      } catch (error) {
        console.warn(`Error filling field "${fieldName}":`, error);
      }
    });

    console.log(`Successfully filled ${filledFieldCount} fields out of ${Object.keys(fieldMapping).length} attempted`);

    // Save the PDF with form fields preserved (editable)
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false, // Ensures better Acrobat compatibility
      updateFieldAppearances: true // Updates field appearances
    });

    // Create blob for download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    return {
      success: true,
      blob,
      filename: filename || generateFilename()
    };

  } catch (error) {
    console.error('PDF export error:', error);
    return {
      success: false,
      filename: filename || generateFilename(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Generate filename for exported PDF
 */
const generateFilename = (caseCode?: string): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const code = caseCode || 'CASE';
  return `FAMILY_TREE_${code}_${date}.pdf`;
};

/**
 * Download PDF blob as file
 */
export const downloadPDF = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Open PDF blob in new tab for preview
 */
export const previewPDF = (blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');
  
  if (!newWindow) {
    console.warn('Popup blocked - PDF could not be opened in new tab');
    // Fallback to download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'family_tree_preview.pdf';
    link.click();
  }
  
  // Clean up URL after a delay to allow the new tab to load
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

/**
 * Validate PDF template has required form fields
 */
export const validatePDFTemplate = async (templatePath: string, requiredFields: string[]): Promise<{
  valid: boolean;
  missingFields: string[];
  availableFields: string[];
}> => {
  try {
    const templateBytes = await fetch(templatePath).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    const availableFields = fields.map(field => field.getName());
    const missingFields = requiredFields.filter(field => !availableFields.includes(field));

    return {
      valid: missingFields.length === 0,
      missingFields,
      availableFields
    };
  } catch (error) {
    console.error('PDF template validation error:', error);
    return {
      valid: false,
      missingFields: requiredFields,
      availableFields: []
    };
  }
};