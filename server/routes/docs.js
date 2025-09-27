import express from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import { PDFDocument } from 'pdf-lib';
import pdf2pic from 'pdf2pic';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Shared Tesseract worker for better performance
let sharedWorker = null;
let workerQueue = [];
let workerBusy = false;

// Initialize shared worker
const initializeWorker = async () => {
  if (!sharedWorker) {
    sharedWorker = await Tesseract.createWorker('eng+pol');
  }
  return sharedWorker;
};

// Process OCR job with shared worker
const processOCRJob = async (buffer, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const job = { buffer, resolve, reject, timeout };
    workerQueue.push(job);
    processQueue();
  });
};

// Queue processor for OCR jobs
const processQueue = async () => {
  if (workerBusy || workerQueue.length === 0) return;
  
  workerBusy = true;
  const job = workerQueue.shift();
  
  try {
    const worker = await initializeWorker();
    
    // Set up timeout for this specific job
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('OCR processing took too long. Please try with a smaller or clearer document.'));
      }, job.timeout);
    });
    
    // Perform OCR
    const ocrPromise = worker.recognize(job.buffer);
    
    const result = await Promise.race([ocrPromise, timeoutPromise]);
    job.resolve(result);
  } catch (error) {
    job.reject(error);
  } finally {
    workerBusy = false;
    // Process next job in queue
    if (workerQueue.length > 0) {
      processQueue();
    }
  }
};

// Health check endpoint for docs routes
router.get('/docs/_status', (req, res) => {
  res.json({
    success: true,
    message: 'Document tools API is operational',
    endpoints: [
      'POST /api/docs/ocr',
      'POST /api/docs/map', 
      'POST /api/docs/explain'
    ],
    timestamp: new Date().toISOString()
  });
});

// Configure multer for document file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for document files
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, images, and common document types
    const allowedExtensions = /\.(pdf|jpg|jpeg|png|tiff|tif|doc|docx)$/i;
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/tiff',
      'image/tif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedExtensions.test(file.originalname) || allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'));
    }
  }
});

// POST /api/docs/ocr → File upload for OCR processing
router.post('/docs/ocr', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No document file uploaded. Please select a file.'
      });
    }
    
    const { originalname, mimetype, size } = req.file;
    let extractedText = '';
    let detectedLanguage = 'english';
    
    // Handle different file types
    if (mimetype === 'application/pdf') {
      try {
        console.log('Processing PDF document:', originalname);
        
        // First, try to extract native text from PDF
        let nativeText = '';
        try {
          // Dynamic import of pdf-parse to handle potential module issues
          const pdfParseModule = await import('pdf-parse');
          const pdfParse = pdfParseModule.default;
          const pdfData = await pdfParse(req.file.buffer);
          nativeText = pdfData.text.trim();
          console.log('Extracted native PDF text length:', nativeText.length);
        } catch (pdfError) {
          console.log('Native PDF text extraction failed:', pdfError.message);
          console.log('Falling back to OCR-only mode for PDF processing');
        }
        
        // If we got substantial text from native extraction, use it
        if (nativeText && nativeText.length > 50) {
          extractedText = nativeText;
          console.log('Using native PDF text extraction');
        } else {
          console.log('Minimal text found (length:', nativeText.length, '), converting PDF to images for OCR...');
          
          // Convert PDF to images and OCR them
          try {
            // Configure pdf2pic to convert PDF pages to images
            const convert = pdf2pic.fromBuffer(req.file.buffer, {
              density: 200,           // 200 DPI for good quality
              saveFilename: "page",
              savePath: "/tmp",
              format: "png",
              width: 2000,           // Max width for good OCR
              height: 2000          // Max height for good OCR  
            });
            
            // Convert first 1-2 pages to images
            const maxPages = 2;
            let ocrTexts = [];
            
            for (let i = 1; i <= maxPages; i++) {
              try {
                console.log(`Converting PDF page ${i} to image for OCR...`);
                const result = await convert(i, { responseType: "buffer" });
                
                if (result && result.buffer) {
                  console.log(`Successfully converted page ${i}, performing OCR...`);
                  
                  // OCR the image buffer
                  try {
                    const ocrResult = await processOCRJob(result.buffer, 30000);
                    if (ocrResult.data.text.trim()) {
                      ocrTexts.push(ocrResult.data.text.trim());
                      console.log(`OCR extracted ${ocrResult.data.text.trim().length} characters from page ${i}`);
                    }
                  } catch (pageOcrError) {
                    console.log(`OCR failed for page ${i}:`, pageOcrError.message);
                  }
                } else {
                  console.log(`Failed to convert page ${i} to image`);
                }
              } catch (pageError) {
                console.log(`Error processing page ${i}:`, pageError.message);
                // Continue to next page
              }
            }
            
            // Combine OCR results from all pages
            if (ocrTexts.length > 0) {
              extractedText = ocrTexts.join('\n\n').trim();
              console.log('Successfully used PDF rasterization OCR from', ocrTexts.length, 'pages');
            } else {
              throw new Error('Could not extract text from any PDF pages using image conversion');
            }
          } catch (conversionError) {
            console.log('PDF rasterization failed:', conversionError.message);
            throw new Error('Could not extract text from this PDF. The document may be a scanned image that requires better image quality, the PDF may be password protected, or the file may be corrupted.');
          }
        }
        
        // If we still have no text, throw an error
        if (!extractedText || extractedText.length < 10) {
          throw new Error('Could not extract readable text from this PDF. Please ensure the document contains text or clear images.');
        }
      } catch (pdfProcessingError) {
        throw new Error(pdfProcessingError.message || 'Failed to process PDF document');
      }
    } else if (mimetype.startsWith('image/')) {
      // Handle image files with OCR
      console.log('Processing image document:', originalname);
      
      try {
        const result = await processOCRJob(req.file.buffer, 30000);
        extractedText = result.data.text.trim();
        
        if (!extractedText || extractedText.length < 5) {
          throw new Error('Could not extract text from this image. Please ensure the image is clear, well-lit, and contains readable text.');
        }
      } catch (ocrError) {
        throw new Error(ocrError.message || 'Failed to extract text from image');
      }
    } else {
      throw new Error('This file type is not supported for OCR. Please use images (JPG, PNG, TIFF) or PDF files.');
    }
    
    // Detect language based on Polish characters
    detectedLanguage = extractedText.match(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/) ? 'polish' : 'english';
    
    const responseData = {
      text: extractedText,
      language: detectedLanguage
    };
    
    res.json({
      success: true,
      filename: originalname,
      size: size,
      mimetype: mimetype,
      ocr: responseData,
      processedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('OCR processing error:', error);
    
    // Provide user-friendly error messages
    let userMessage = 'Failed to process document for OCR';
    if (error.message.includes('took too long') || error.message.includes('timeout')) {
      userMessage = 'OCR processing took too long. Please try with a smaller or clearer document.';
    } else if (error.message.includes('not supported') || error.message.includes('file type')) {
      userMessage = 'This file type is not supported for OCR. Please use images (JPG, PNG, TIFF) or PDF files.';
    } else if (error.message.includes('extract text') || error.message.includes('readable text')) {
      userMessage = error.message; // Use the specific error message
    } else if (error.message.includes('password protected')) {
      userMessage = 'This PDF appears to be password protected or corrupted. Please try a different document.';
    }
    
    res.status(500).json({
      success: false,
      error: userMessage
    });
  }
});

// Load field definitions from JSON files
const loadFieldDefinitions = (target) => {
  try {
    const fileName = target.toLowerCase() === 'poa' ? 'poa.json' : 'oby.json';
    const filePath = path.join(process.cwd(), 'data', 'fields', fileName);
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Failed to load field definitions for ${target}:`, error);
    throw new Error(`Could not load field definitions for ${target}`);
  }
};

// Tokenize text for better matching
const tokenizeText = (text) => {
  // Split on whitespace, punctuation, and common delimiters
  const tokens = text.toLowerCase()
    .split(/[\s\.,\:\;\-\(\)\[\]\/\\]+/)
    .filter(token => token.length > 0);
  return tokens;
};

// Find field matches using labels and aliases
const findFieldMatches = (text, fieldDefinitions) => {
  const tokens = tokenizeText(text);
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const results = [];
  
  for (const field of fieldDefinitions.fields) {
    const matches = findValueForField(text, lines, tokens, field);
    if (matches.value) {
      results.push({
        code: field.code,
        value: matches.value,
        confidence: matches.confidence
      });
    }
  }
  
  return results;
};

// Find value for a specific field using multiple strategies
const findValueForField = (fullText, lines, tokens, field) => {
  let bestMatch = { value: null, confidence: 0 };
  
  // Strategy 1: Look for label-value patterns in lines
  for (const line of lines) {
    const lineMatch = findLabelValueInLine(line, field);
    if (lineMatch.confidence > bestMatch.confidence) {
      bestMatch = lineMatch;
    }
  }
  
  // Strategy 2: Look for patterns based on field type
  if (bestMatch.confidence < 70) {
    const patternMatch = findPatternBasedValue(fullText, field);
    if (patternMatch.confidence > bestMatch.confidence) {
      bestMatch = patternMatch;
    }
  }
  
  // Strategy 3: Context-based extraction for specific fields
  if (bestMatch.confidence < 60) {
    const contextMatch = findContextBasedValue(fullText, lines, field);
    if (contextMatch.confidence > bestMatch.confidence) {
      bestMatch = contextMatch;
    }
  }
  
  return bestMatch;
};

// Find label-value pairs in a single line
const findLabelValueInLine = (line, field) => {
  const lowerLine = line.toLowerCase();
  
  // Check all labels and aliases
  const allLabels = [
    field.plLabel.toLowerCase(),
    field.enLabel.toLowerCase(),
    ...field.aliases.map(alias => alias.toLowerCase())
  ];
  
  for (const label of allLabels) {
    // Look for pattern like "Label: Value" or "Label Value"
    const patterns = [
      new RegExp(`${escapeRegex(label)}\\s*:+\\s*(.+)`, 'i'),
      new RegExp(`${escapeRegex(label)}\\s+([A-ZŻĄĆĘŁŃÓŚŹŻ][A-Za-zżąćęłńóśźżĄĆĘŁŃÓŚŹŻ\\s\\-\\.]+)`, 'i'),
      new RegExp(`${escapeRegex(label)}\\s*[\\-–]\\s*(.+)`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim();
        if (value.length > 1 && isValidValueForField(value, field)) {
          const confidence = calculateConfidence(value, field, label, line);
          return { value, confidence };
        }
      }
    }
  }
  
  return { value: null, confidence: 0 };
};

// Find values using field type-specific patterns
const findPatternBasedValue = (text, field) => {
  let patterns = [];
  
  switch (field.type) {
    case 'date':
      patterns = [
        /(\d{1,2}[\s\.\-\/]\d{1,2}[\s\.\-\/]\d{4})/g,
        /(\d{1,2}\s+[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]{3,}\s+\d{4})/g,
        /(\d{4}[\s\.\-\/]\d{1,2}[\s\.\-\/]\d{1,2})/g
      ];
      break;
    case 'number':
      patterns = [
        /\b(\d{11})\b/g, // PESEL
        /\b([A-Z]{3}\s*\d{6})\b/g, // ID patterns
      ];
      break;
    case 'text':
      if (field.code.includes('-GN') || field.code.includes('-SN')) {
        patterns = [
          /\b([A-ZŻĄĆĘŁŃÓŚŹŻ][a-zżąćęłńóśźż]+(?:\s+[A-ZŻĄĆĘŁŃÓŚŹŻ][a-zżąćęłńóśźż]+)*)\b/g
        ];
      }
      break;
    case 'address':
      patterns = [
        /\b([A-ZŻĄĆĘŁŃÓŚŹŻ][a-zżąćęłńóśźż]+(?:\s+\d+)*(?:\s*,\s*\d{2}-\d{3}\s*[A-ZŻĄĆĘŁŃÓŚŹŻ][a-zżąćęłńóśźż]+)*)/g
      ];
      break;
  }
  
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const value = match[1].trim();
      if (isValidValueForField(value, field)) {
        const confidence = 50 + (field.type === 'date' ? 20 : 10);
        return { value, confidence };
      }
    }
  }
  
  return { value: null, confidence: 0 };
};

// Find values using contextual clues
const findContextBasedValue = (fullText, lines, field) => {
  // Look for values near field-related keywords
  const keywords = [field.plLabel.toLowerCase(), field.enLabel.toLowerCase(), ...field.aliases];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    for (const keyword of keywords) {
      if (line.includes(keyword.toLowerCase())) {
        // Check current line for value after keyword
        const parts = lines[i].split(/[:–\-]/);
        if (parts.length > 1) {
          const value = parts[1].trim();
          if (isValidValueForField(value, field)) {
            return { value, confidence: 40 };
          }
        }
        
        // Check next line for potential value
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (isValidValueForField(nextLine, field)) {
            return { value: nextLine, confidence: 35 };
          }
        }
      }
    }
  }
  
  return { value: null, confidence: 0 };
};

// Calculate confidence score based on various factors
const calculateConfidence = (value, field, matchedLabel, line) => {
  let confidence = 60; // Base confidence
  
  // Boost for exact label match
  if (matchedLabel === field.plLabel.toLowerCase() || matchedLabel === field.enLabel.toLowerCase()) {
    confidence += 20;
  }
  
  // Boost for proper formatting
  if (field.type === 'date' && /\d{1,2}[\s\.\-\/]\d{1,2}[\s\.\-\/]\d{4}/.test(value)) {
    confidence += 15;
  }
  
  // Boost for capitalized names
  if ((field.code.includes('-GN') || field.code.includes('-SN')) && /^[A-ZŻĄĆĘŁŃÓŚŹŻ]/.test(value)) {
    confidence += 10;
  }
  
  // Penalty for very short values (unless it's a valid short field)
  if (value.length < 2) {
    confidence -= 30;
  }
  
  // Penalty for very long values that might be overmatched
  if (value.length > 100) {
    confidence -= 20;
  }
  
  return Math.min(Math.max(confidence, 0), 100);
};

// Validate if a value is appropriate for a field type
const isValidValueForField = (value, field) => {
  if (!value || value.length < 1) return false;
  
  // Remove obvious OCR artifacts
  if (/^[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9]+$/.test(value)) return false;
  
  switch (field.type) {
    case 'date':
      return /\d/.test(value) && value.length >= 4;
    case 'number':
      return /\d/.test(value);
    case 'text':
      return /[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(value) && value.length >= 2;
    case 'address':
      return /[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(value) && value.length >= 3;
    default:
      return true;
  }
};

// Escape special regex characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// POST /api/docs/map → Real field mapping using field definitions
router.post('/docs/map', async (req, res) => {
  try {
    const { text, target } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text content is required for mapping'
      });
    }
    
    if (!target || !['POA', 'OBY'].includes(target.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Target must be either "POA" or "OBY"'
      });
    }
    
    // Load field definitions from JSON files
    const fieldDefinitions = loadFieldDefinitions(target.toUpperCase());
    
    // Find field matches using real field matching
    const mappedFields = findFieldMatches(text, fieldDefinitions);
    
    // Sort by confidence (highest first)
    mappedFields.sort((a, b) => b.confidence - a.confidence);
    
    res.json({
      success: true,
      mappings: {
        fields: mappedFields
      },
      target: target.toUpperCase(),
      totalMatches: mappedFields.length,
      processedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mapping error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate field mappings',
      details: error.message
    });
  }
});

// POST /api/docs/explain → Return static explanations for Polish legal processes
router.post('/docs/explain', async (req, res) => {
  try {
    const { step } = req.body;
    
    if (!step) {
      return res.status(400).json({
        success: false,
        error: 'Step parameter is required'
      });
    }
    
    const explanations = {
      umiejscowienie: {
        title: 'Umiejscowienie (Record Locating)',
        description: 'The process of locating ancestral records in Polish archives',
        details: [
          'Archives search is conducted in the region where your ancestor was born or lived',
          'We submit formal requests to parish registers (księgi parafialne) and civil registers (USC)',
          'Response times vary from 2-12 weeks depending on archive workload and record availability',
          'Some records may be damaged, incomplete, or lost due to historical events',
          'Alternative sources like census records or military documents may be consulted if primary records are unavailable'
        ],
        timeframe: '4-12 weeks typically',
        requirements: [
          'Approximate birth/death dates of ancestor',
          'Town or village name (even if approximate)',
          'Religion (Catholic, Jewish, Protestant) if known',
          'Any family names or alternative spellings'
        ]
      },
      uzupelnienie: {
        title: 'Uzupełnienie (Document Completion)',
        description: 'Completing and preparing all required documentation',
        details: [
          'All foreign documents must be apostilled in their country of origin',
          'Documents must be translated by sworn translators (tłumacz przysięgły)',
          'Missing documents may require affidavit statements (oświadczenie) with witness signatures',
          'All applications must include complete family lineage documentation',
          'Recent photographs and current identity documents are required'
        ],
        timeframe: '2-6 weeks for preparation',
        requirements: [
          'Birth certificates of applicant and Polish ancestor',
          'Marriage certificates (if applicable)',
          'Death certificates of deceased family members',
          'Proof of Polish citizenship of ancestor',
          'Current passport and identity documents'
        ]
      },
      obywatelstwo: {
        title: 'Obywatelstwo (Citizenship Process)',
        description: 'The formal citizenship application and decision process',
        details: [
          'Applications are submitted to the appropriate Voivode (wojewoda) office',
          'Decision timeline is legally set at 6 months but often extends to 12-18 months',
          'Applications may be approved, rejected, or returned for additional documentation',
          'Approval results in a decision certificate that must be used to obtain Polish documents',
          'The process cannot be expedited regardless of urgency or payment offers'
        ],
        timeframe: '6-18 months for decision',
        requirements: [
          'Complete application package with all required documents',
          'Payment of government fees (currently around 219 PLN)',
          'Proof of legal residence status (if applying from outside Poland)',
          'No criminal record certificate from countries of residence',
          'Photographs meeting Polish passport requirements'
        ]
      },
      sprostowanie: {
        title: 'Sprostowanie (Record Corrections)',
        description: 'Process for correcting errors in official documents',
        details: [
          'Corrections can be made to birth dates, names, or places if documentary evidence exists',
          'Court proceedings may be required for significant changes to vital records',
          'Historical name variations (e.g., German/Polish versions) are generally acceptable',
          'Date discrepancies of 1-2 years are common in historical records and often acceptable',
          'Evidence from multiple sources strengthens correction requests'
        ],
        timeframe: '1-6 months depending on complexity',
        requirements: [
          'Original document containing the error',
          'Evidence supporting the correct information',
          'Formal request explaining the discrepancy',
          'Additional documentation from alternative sources',
          'Payment of correction fees if required'
        ]
      }
    };
    
    const explanation = explanations[step.toLowerCase()];
    
    if (!explanation) {
      return res.status(404).json({
        success: false,
        error: 'Unknown process step. Valid steps are: umiejscowienie, uzupelnienie, obywatelstwo, sprostowanie'
      });
    }
    
    res.json({
      success: true,
      step: step,
      explanation: explanation,
      providedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to provide process explanation',
      details: error.message
    });
  }
});

// Helper functions for text extraction and processing
function extractPattern(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

function combineNameFields(text) {
  const givenNames = extractPattern(text, /Imiona?[:\s]+([A-ZŻĄĆĘŁŃÓŚŹŻ\s]+)/i) || extractPattern(text, /Given names[:\s]+([A-Z\s]+)/i);
  const surname = extractPattern(text, /Nazwisko[:\s]+([A-ZŻĄĆĘŁŃÓŚŹŻ]+)/i) || extractPattern(text, /Surname[:\s]+([A-Z]+)/i);
  
  if (givenNames && surname) {
    return `${givenNames} ${surname}`;
  }
  return givenNames || surname || null;
}

function combineBirthInfo(text) {
  const date = extractPattern(text, /Data urodzenia[:\s]+(\d{1,2}[\s\.-]\w{3,9}[\s\.-]\d{4})/i) || extractPattern(text, /Date of birth[:\s]+(\d{1,2}\s\w{3}\s\d{4})/i);
  const place = extractPattern(text, /Miejsce urodzenia[:\s]+([A-ZŻĄĆĘŁŃÓŚŹŻ\s,]+)/i) || extractPattern(text, /Place of birth[:\s]+([A-Z\s,]+)/i);
  
  if (date && place) {
    return `${date}, ${place}`;
  }
  return date || place || null;
}

function extractParentInfo(text) {
  const father = extractPattern(text, /Imię ojca[:\s]+([A-ZŻĄĆĘŁŃÓŚŹŻ\s]+)/i);
  const mother = extractPattern(text, /Imię matki[:\s]+([A-ZŻĄĆĘŁŃÓŚŹŻ\s]+)/i);
  
  const parentInfo = [];
  if (father) parentInfo.push(`Father: ${father}`);
  if (mother) parentInfo.push(`Mother: ${mother}`);
  
  return parentInfo.length > 0 ? parentInfo.join(', ') : null;
}

function determineDocumentType(text) {
  if (text.includes('Akt urodzenia') || text.includes('Birth Certificate')) {
    return 'Birth Certificate';
  }
  if (text.includes('PASZPORT') || text.includes('PASSPORT')) {
    return 'Passport';
  }
  if (text.includes('Akt małżeństwa') || text.includes('Marriage Certificate')) {
    return 'Marriage Certificate';
  }
  if (text.includes('Akt zgonu') || text.includes('Death Certificate')) {
    return 'Death Certificate';
  }
  return 'Unknown Document Type';
}

export default router;