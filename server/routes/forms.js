import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Import OBY schema from TypeScript file (will need to be converted to JSON or imported)
// For now, we'll recreate the essential fields data
const OBY_FIELDS = [
  {
    code: "OBY-A-GN",
    plLabel: "Imiona wnioskodawcy",
    enLabel: "Applicant Given Names",
    type: "text",
    required: true,
    category: "applicant",
    subcategory: "personal",
    aliases: ["imiona", "imię", "given names", "first names", "christian names", "forenames", "wnioskodawca"]
  },
  {
    code: "OBY-A-SN",
    plLabel: "Nazwisko wnioskodawcy",
    enLabel: "Applicant Surname",
    type: "text",
    required: true,
    category: "applicant",
    subcategory: "personal",
    aliases: ["nazwisko", "surname", "family name", "last name"]
  },
  {
    code: "OBY-A-BD",
    plLabel: "Data urodzenia wnioskodawcy",
    enLabel: "Applicant Birth Date",
    type: "date",
    required: true,
    category: "applicant",
    subcategory: "personal",
    aliases: ["data urodzenia", "birth date", "date of birth", "urodzony", "urodzona", "born"]
  },
  {
    code: "OBY-A-BP",
    plLabel: "Miejsce urodzenia wnioskodawcy",
    enLabel: "Applicant Birth Place",
    type: "address",
    required: true,
    category: "applicant",
    subcategory: "personal",
    aliases: ["miejsce urodzenia", "birth place", "place of birth", "born in", "urodzony w", "urodzona w"]
  },
  {
    code: "OBY-A-GENDER",
    plLabel: "Płeć wnioskodawcy",
    enLabel: "Applicant Gender",
    type: "select",
    required: true,
    category: "applicant",
    subcategory: "personal",
    options: ["Mężczyzna", "Kobieta"],
    aliases: ["płeć", "gender", "sex"]
  },
  {
    code: "OBY-A-ADDR",
    plLabel: "Adres wnioskodawcy",
    enLabel: "Applicant Address",
    type: "address",
    required: true,
    category: "applicant",
    subcategory: "contact",
    aliases: ["adres", "address", "zamieszkały", "zamieszkała", "residing at", "residing"]
  },
  {
    code: "OBY-A-POSTAL",
    plLabel: "Kod pocztowy wnioskodawcy",
    enLabel: "Applicant Postal Code",
    type: "text",
    category: "applicant",
    subcategory: "contact",
    aliases: ["kod pocztowy", "postal code", "zip code"]
  },
  {
    code: "OBY-A-CITY",
    plLabel: "Miasto wnioskodawcy",
    enLabel: "Applicant City",
    type: "text",
    required: true,
    category: "applicant",
    subcategory: "contact",
    aliases: ["miasto", "city", "miejscowość"]
  },
  {
    code: "OBY-A-COUNTRY",
    plLabel: "Kraj wnioskodawcy",
    enLabel: "Applicant Country",
    type: "text",
    required: true,
    category: "applicant",
    subcategory: "contact",
    aliases: ["kraj", "country", "państwo"]
  },
  {
    code: "OBY-A-PHONE",
    plLabel: "Telefon wnioskodawcy",
    enLabel: "Applicant Phone",
    type: "phone",
    category: "applicant",
    subcategory: "contact",
    aliases: ["telefon", "phone", "numer telefonu"]
  },
  {
    code: "OBY-A-EMAIL",
    plLabel: "Email wnioskodawcy",
    enLabel: "Applicant Email",
    type: "email",
    category: "applicant",
    subcategory: "contact",
    aliases: ["email", "e-mail", "adres email"]
  },
  {
    code: "OBY-A-PESEL",
    plLabel: "PESEL wnioskodawcy",
    enLabel: "Applicant PESEL",
    type: "number",
    category: "applicant",
    subcategory: "identification",
    aliases: ["pesel", "nr pesel", "numer pesel"]
  },
  {
    code: "OBY-A-PASSPORT",
    plLabel: "Numer paszportu wnioskodawcy",
    enLabel: "Applicant Passport Number",
    type: "text",
    category: "applicant",
    subcategory: "identification",
    aliases: ["paszport", "passport", "numer paszportu"]
  },
  {
    code: "OBY-A-ID-NUMBER",
    plLabel: "Numer dowodu osobistego",
    enLabel: "ID Card Number",
    type: "text",
    category: "applicant",
    subcategory: "identification",
    aliases: ["dowód", "id card", "numer dowodu"]
  },
  {
    code: "OBY-A-NATION",
    plLabel: "Obecne obywatelstwo",
    enLabel: "Current Nationality",
    type: "text",
    required: true,
    category: "applicant",
    subcategory: "citizenship",
    aliases: ["obywatelstwo", "nationality", "citizenship", "current citizenship", "obecne obywatelstwo"]
  },
  {
    code: "OBY-F-GN",
    plLabel: "Imiona ojca",
    enLabel: "Father Given Names",
    type: "text",
    required: true,
    category: "father",
    subcategory: "personal",
    aliases: ["imiona ojca", "imię ojca", "father names", "father given names", "ojciec"]
  },
  {
    code: "OBY-F-SN",
    plLabel: "Nazwisko ojca",
    enLabel: "Father Surname",
    type: "text",
    required: true,
    category: "father",
    subcategory: "personal",
    aliases: ["nazwisko ojca", "father surname", "father family name"]
  },
  {
    code: "OBY-F-BD",
    plLabel: "Data urodzenia ojca",
    enLabel: "Father Birth Date",
    type: "date",
    category: "father",
    subcategory: "personal",
    aliases: ["data urodzenia ojca", "father birth date", "father date of birth"]
  },
  {
    code: "OBY-F-BP",
    plLabel: "Miejsce urodzenia ojca",
    enLabel: "Father Birth Place",
    type: "address",
    category: "father",
    subcategory: "personal",
    aliases: ["miejsce urodzenia ojca", "father birth place", "father place of birth"]
  },
  {
    code: "OBY-F-NATION",
    plLabel: "Obywatelstwo ojca",
    enLabel: "Father Nationality",
    type: "text",
    category: "father",
    subcategory: "citizenship",
    aliases: ["obywatelstwo ojca", "father nationality", "father citizenship"]
  },
  {
    code: "OBY-M-GN",
    plLabel: "Imiona matki",
    enLabel: "Mother Given Names",
    type: "text",
    required: true,
    category: "mother",
    subcategory: "personal",
    aliases: ["imiona matki", "imię matki", "mother names", "mother given names", "matka"]
  },
  {
    code: "OBY-M-SN",
    plLabel: "Nazwisko matki",
    enLabel: "Mother Surname",
    type: "text",
    required: true,
    category: "mother",
    subcategory: "personal",
    aliases: ["nazwisko matki", "mother surname", "mother family name", "nazwisko panieńskie"]
  },
  {
    code: "OBY-M-BD",
    plLabel: "Data urodzenia matki",
    enLabel: "Mother Birth Date",
    type: "date",
    category: "mother",
    subcategory: "personal",
    aliases: ["data urodzenia matki", "mother birth date", "mother date of birth"]
  },
  {
    code: "OBY-M-BP",
    plLabel: "Miejsce urodzenia matki",
    enLabel: "Mother Birth Place",
    type: "address",
    category: "mother",
    subcategory: "personal",
    aliases: ["miejsce urodzenia matki", "mother birth place", "mother place of birth"]
  },
  {
    code: "OBY-M-NATION",
    plLabel: "Obywatelstwo matki",
    enLabel: "Mother Nationality",
    type: "text",
    category: "mother",
    subcategory: "citizenship",
    aliases: ["obywatelstwo matki", "mother nationality", "mother citizenship"]
  },
  // Add additional essential fields to reach reasonable coverage
  {
    code: "OBY-PGF-GN",
    plLabel: "Imiona dziadka ze strony ojca",
    enLabel: "Paternal Grandfather Given Names",
    type: "text",
    category: "paternal-grandfather",
    subcategory: "personal",
    aliases: ["dziadek ojca", "paternal grandfather", "grandfather father side"]
  },
  {
    code: "OBY-PGF-SN",
    plLabel: "Nazwisko dziadka ze strony ojca",
    enLabel: "Paternal Grandfather Surname",
    type: "text",
    category: "paternal-grandfather",
    subcategory: "personal",
    aliases: ["nazwisko dziadka ojca", "paternal grandfather surname"]
  },
  {
    code: "OBY-PGM-GN",
    plLabel: "Imiona babci ze strony ojca",
    enLabel: "Paternal Grandmother Given Names",
    type: "text",
    category: "paternal-grandmother",
    subcategory: "personal",
    aliases: ["babcia ojca", "paternal grandmother", "grandmother father side"]
  },
  {
    code: "OBY-PGM-SN",
    plLabel: "Nazwisko babci ze strony ojca",
    enLabel: "Paternal Grandmother Surname",
    type: "text",
    category: "paternal-grandmother",
    subcategory: "personal",
    aliases: ["nazwisko babci ojca", "paternal grandmother surname"]
  },
  {
    code: "OBY-MGF-GN",
    plLabel: "Imiona dziadka ze strony matki",
    enLabel: "Maternal Grandfather Given Names",
    type: "text",
    category: "maternal-grandfather",
    subcategory: "personal",
    aliases: ["dziadek matki", "maternal grandfather", "grandfather mother side"]
  },
  {
    code: "OBY-MGF-SN",
    plLabel: "Nazwisko dziadka ze strony matki",
    enLabel: "Maternal Grandfather Surname",
    type: "text",
    category: "maternal-grandfather",
    subcategory: "personal",
    aliases: ["nazwisko dziadka matki", "maternal grandfather surname"]
  },
  {
    code: "OBY-MGM-GN",
    plLabel: "Imiona babci ze strony matki",
    enLabel: "Maternal Grandmother Given Names",
    type: "text",
    category: "maternal-grandmother",
    subcategory: "personal",
    aliases: ["babcia matki", "maternal grandmother", "grandmother mother side"]
  },
  {
    code: "OBY-MGM-SN",
    plLabel: "Nazwisko babci ze strony matki",
    enLabel: "Maternal Grandmother Surname",
    type: "text",
    category: "maternal-grandmother",
    subcategory: "personal",
    aliases: ["nazwisko babci matki", "maternal grandmother surname"]
  },
  {
    code: "OBY-SPOUSE-GN",
    plLabel: "Imiona małżonka",
    enLabel: "Spouse Given Names",
    type: "text",
    category: "spouse",
    subcategory: "personal",
    aliases: ["imiona małżonka", "spouse names", "małżonek", "małżonka"]
  },
  {
    code: "OBY-SPOUSE-SN",
    plLabel: "Nazwisko małżonka",
    enLabel: "Spouse Surname",
    type: "text",
    category: "spouse",
    subcategory: "personal",
    aliases: ["nazwisko małżonka", "spouse surname"]
  },
  {
    code: "OBY-MARRIAGE-DATE",
    plLabel: "Data ślubu",
    enLabel: "Marriage Date",
    type: "date",
    category: "marriage",
    subcategory: "event",
    aliases: ["data ślubu", "marriage date", "date of marriage", "ślub", "married"]
  },
  {
    code: "OBY-MARRIAGE-PLACE",
    plLabel: "Miejsce ślubu",
    enLabel: "Marriage Place",
    type: "address",
    category: "marriage",
    subcategory: "event",
    aliases: ["miejsce ślubu", "marriage place", "place of marriage"]
  },
  {
    code: "OBY-REASON-PRIMARY",
    plLabel: "Główny powód wniosku",
    enLabel: "Primary Reason for Application",
    type: "textarea",
    required: true,
    category: "application",
    subcategory: "reason",
    aliases: ["powód", "reason", "główny powód", "primary reason"]
  },
  {
    code: "OBY-DOC-BIRTH-CERT",
    plLabel: "Akt urodzenia wnioskodawcy",
    enLabel: "Applicant Birth Certificate",
    type: "file",
    required: true,
    category: "documents",
    subcategory: "applicant",
    aliases: ["akt urodzenia", "birth certificate", "certificate of birth"]
  },
  {
    code: "OBY-DOC-PASSPORT",
    plLabel: "Paszport wnioskodawcy",
    enLabel: "Applicant Passport",
    type: "file",
    required: true,
    category: "documents",
    subcategory: "applicant",
    aliases: ["paszport", "passport", "travel document"]
  },
  {
    code: "OBY-APP-DATE",
    plLabel: "Data złożenia wniosku",
    enLabel: "Application Date",
    type: "date",
    required: true,
    category: "application",
    subcategory: "details",
    aliases: ["data wniosku", "application date", "submission date"]
  },
  {
    code: "OBY-APP-PLACE",
    plLabel: "Miejsce złożenia wniosku",
    enLabel: "Application Place",
    type: "text",
    required: true,
    category: "application",
    subcategory: "details",
    aliases: ["miejsce wniosku", "application place", "submission place"]
  }
];

// Default OBY draft template
const DEFAULT_OBY_DRAFT = {
  formType: "OBY",
  formName: "Polish Citizenship Application Draft",
  formNamePl: "Szkic wniosku o nadanie obywatelstwa polskiego",
  version: "2.0.0",
  created: new Date().toISOString().split('T')[0],
  status: "draft",
  mappedFields: {},
  fieldCount: 0,
  completedFields: 0,
  missingFields: [],
  validationErrors: [],
  lastUpdated: "",
  metadata: {
    generatedBy: "OBY Forms API",
    purpose: "Polish Citizenship Application Field Mapping",
    categories: [
      "applicant", "father", "mother", "paternal-grandfather", "paternal-grandmother", 
      "maternal-grandfather", "maternal-grandmother", "spouse", "marriage", "children",
      "residence", "military", "legal", "employment", "education", "travel",
      "language", "connections", "application", "documents"
    ]
  }
};

// Initialize empty mappedFields for all OBY field codes
OBY_FIELDS.forEach(field => {
  DEFAULT_OBY_DRAFT.mappedFields[field.code] = "";
});
DEFAULT_OBY_DRAFT.fieldCount = Object.keys(DEFAULT_OBY_DRAFT.mappedFields).length;

/**
 * GET /api/forms/oby/schema
 * Returns the OBY field definitions
 */
router.get('/oby/schema', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        formType: "OBY",
        formName: "Polish Citizenship Application",
        formNamePl: "Wniosek o nadanie obywatelstwa polskiego",
        version: "2.0.0",
        fields: OBY_FIELDS,
        totalFields: OBY_FIELDS.length
      }
    });
  } catch (error) {
    console.error('Error fetching OBY schema:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch OBY schema'
    });
  }
});

/**
 * GET /api/forms/oby/draft/:id
 * Loads OBY draft from /portal/drafts/oby.json or returns default
 */
router.get('/oby/draft/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Construct path to case portal drafts
    const draftPath = path.join(process.cwd(), 'data', 'cases', id, 'portal', 'drafts', 'oby.json');
    
    let draft;
    try {
      // Try to load existing draft
      const draftData = await fs.readFile(draftPath, 'utf8');
      draft = JSON.parse(draftData);
    } catch (error) {
      // If file doesn't exist or is invalid, return default draft
      draft = { ...DEFAULT_OBY_DRAFT };
      draft.lastUpdated = new Date().toISOString();
    }
    
    res.json({
      success: true,
      data: draft
    });
  } catch (error) {
    console.error('Error loading OBY draft:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load OBY draft'
    });
  }
});

/**
 * POST /api/forms/oby/draft/:id
 * Merges patch data with existing draft and saves
 */
router.post('/oby/draft/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patch = req.body;
    
    if (!patch || typeof patch !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid patch data provided'
      });
    }
    
    // Construct paths
    const caseDir = path.join(process.cwd(), 'data', 'cases', id);
    const portalDir = path.join(caseDir, 'portal');
    const draftsDir = path.join(portalDir, 'drafts');
    const draftPath = path.join(draftsDir, 'oby.json');
    
    // Ensure directories exist
    await fs.mkdir(draftsDir, { recursive: true });
    
    let existingDraft;
    try {
      // Try to load existing draft
      const draftData = await fs.readFile(draftPath, 'utf8');
      existingDraft = JSON.parse(draftData);
    } catch (error) {
      // If file doesn't exist, start with default
      existingDraft = { ...DEFAULT_OBY_DRAFT };
    }
    
    // Merge patch with existing draft
    const updatedDraft = {
      ...existingDraft,
      ...patch,
      mappedFields: {
        ...existingDraft.mappedFields,
        ...(patch.mappedFields || {})
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Update field counts
    const completedFields = Object.values(updatedDraft.mappedFields).filter(value => 
      value && value.toString().trim() !== ''
    ).length;
    
    updatedDraft.completedFields = completedFields;
    updatedDraft.fieldCount = Object.keys(updatedDraft.mappedFields).length;
    
    // Identify missing required fields
    const requiredFields = OBY_FIELDS.filter(field => field.required).map(field => field.code);
    const missingFields = requiredFields.filter(fieldCode => 
      !updatedDraft.mappedFields[fieldCode] || 
      updatedDraft.mappedFields[fieldCode].toString().trim() === ''
    );
    
    updatedDraft.missingFields = missingFields;
    
    // Save updated draft
    await fs.writeFile(draftPath, JSON.stringify(updatedDraft, null, 2), 'utf8');
    
    res.json({
      success: true,
      data: updatedDraft,
      message: `OBY draft updated successfully. ${completedFields}/${updatedDraft.fieldCount} fields completed.`
    });
    
  } catch (error) {
    console.error('Error saving OBY draft:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save OBY draft'
    });
  }
});

export default router;