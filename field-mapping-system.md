# FIELD MAPPING SYSTEM - PDF TEMPLATES (Aug 17, 2025)

## FM Command Implementation
**"FM" - Full detailed mapping and proper naming of all fields in Applicant Details form to match Family Tree and Documents after OCR/translation for PDF population**

## CRITICAL REQUIREMENTS
- ALL fields must be EXACTLY named and mapped as in PDF TEMPLATES
- NO synthetic data - only authentic OCR/document data
- Perfect alignment between: Applicant Details → Family Tree → PDF Forms
- Field names must match PDF template field names precisely

---

## 1. POWER OF ATTORNEY PDF FIELD NAMES (Exact from Templates)

### From check-pdf-fields.ts analysis:
```
Field 1: "imie_nazwisko_wniosko" - Applicant Name
Field 2: "nr_dok_tozsamosci" - Document ID/Passport Number  
Field 3: "imie_nazwisko_dziecka" - Child Name (if applicable)
Field 4: "data_pelnomocnictwa" - Power of Attorney Date
```

### Current Implementation Issues Found:
- Dashboard uses: `clientData.names` → Should map to: `imie_nazwisko_wniosko`
- Dashboard uses: `clientData.passportNumber` → Should map to: `nr_dok_tozsamosci`
- Dashboard uses: `familyTreeData.applicantChild1Name` → Should map to: `imie_nazwisko_dziecka`

### NEW MAIDEN NAME FIELDS ADDED (Aug 17, 2025):
**Added to Family Tree Interface:**
- `applicantMaidenName` - Main applicant's surname at birth
- `applicantSpouseMaidenName` - Spouse's surname at birth
- `polishParentMaidenName` - Polish parent's surname at birth
- `parentSpouseMaidenName` - Other parent's surname at birth
- `polishGrandfatherMaidenName` - Polish grandfather's surname at birth
- `polishGrandmotherMaidenName` - Polish grandmother's surname at birth
- `polishGreatGrandfatherMaidenName` - Polish great grandfather's surname at birth
- `polishGreatGrandmotherMaidenName` - Polish great grandmother's surname at birth

**Added to DocumentDataMapper:**
- Enhanced `mapApplicantDocument()` to extract maiden names
- Enhanced `mapMarriageDocument()` to extract spouse maiden names
- Enhanced `mapParentsMarriageDocument()` to extract parent maiden names
- New `mapGrandparentsDocument()` method for grandparent/great-grandparent maiden names
- Enhanced `mapGenericDocument()` to extract any available maiden name fields

---

## 2. POLISH CITIZENSHIP APPLICATION FIELD NAMES

### From pdf-routes.ts analysis - EXACT field mapping required:
```javascript
// APPLICANT PERSONAL DATA
applicantName: string               // Full name as appears in documents
applicantAddress: string            // Current address
applicantStreet: string             // Street name
applicantHouseNumber: string        // House number
applicantApartmentNumber: string    // Apartment (optional)
applicantCity: string               // City
applicantState: string              // State/Province
applicantPostalCode: string         // Postal code
applicantMobilePhone: string        // Mobile phone
birthDate: string                   // DD.MM.YYYY format
birthPlace: string                  // Birth place as in documents
gender: 'mężczyzna' | 'kobieta'     // Gender in Polish
maritalStatus: string               // Marital status in Polish
peselNumber: string                 // PESEL (if applicable)
foreignCitizenshipsWithDates: string // Current citizenships

// NAMES STRUCTURE
lastName: string                    // Current surname
maidenName: string                  // Maiden name (females)
firstNames: string                  // All first names
usedSurnamesWithDates: string       // Previous surnames

// PARENTS DATA  
fatherFullName: string              // Father's complete name
motherMaidenName: string            // Mother's maiden name
motherLastName: string              // Mother's current surname
motherFirstNames: string            // Mother's first names
motherFatherName: string            // Maternal grandfather
motherMotherMaidenName: string      // Maternal grandmother maiden
motherBirthDate: string             // DD.MM.YYYY
motherBirthPlace: string            // Mother's birth place
motherMaritalStatus: string         // Mother's marital status
motherMarriageDate: string          // Parents' marriage date
motherMarriagePlace: string         // Parents' marriage place
motherCitizenshipsAtBirth: string   // Mother's citizenship at birth

// FATHER'S DATA
fatherLastName: string              // Father's surname  
fatherFirstNames: string            // Father's first names
fatherFatherName: string            // Paternal grandfather
fatherMotherMaidenName: string      // Paternal grandmother maiden
fatherBirthDate: string             // DD.MM.YYYY
fatherBirthPlace: string            // Father's birth place
fatherMaritalStatus: string         // Father's marital status
fatherCitizenshipsAtBirth: string   // Father's citizenship at birth
```

---

## 3. CURRENT DASHBOARD FIELDS → PDF MAPPING

### A. APPLICANT DETAILS FORM (Current vs Required)

**CURRENT FIELDS:**
- `clientData.names` → **SHOULD BE:** `applicantFirstNames`
- `clientData.middleName` → **SHOULD BE:** Part of `applicantFirstNames` 
- `clientData.familyName` → **SHOULD BE:** `applicantLastName`
- `clientData.passportNumber` → **CORRECT:** `applicantPassportNumber`
- `clientData.dateOfBirth` → **SHOULD BE:** `applicantBirthDate` (DD.MM.YYYY)
- `clientData.placeOfBirth` → **SHOULD BE:** `applicantBirthPlace`

### B. FAMILY TREE FIELDS → PDF MAPPING

**APPLICANT:**
- `familyTreeData.applicantName` → **SHOULD BE:** `applicantFullName`
- `familyTreeData.applicantMaidenName` → **CORRECT:** `applicantMaidenName`
- `familyTreeData.applicantDateOfBirth` → **SHOULD BE:** `applicantBirthDate`
- `familyTreeData.applicantPlaceOfBirth` → **CORRECT:** `applicantBirthPlace`

**POLISH PARENT:**
- `familyTreeData.polishParentName` → **SHOULD BE:** `motherFullName` OR `fatherFullName`
- `familyTreeData.polishParentMaidenName` → **SHOULD BE:** `motherMaidenName` OR `fatherMaidenName`
- `familyTreeData.polishParentDateOfBirth` → **SHOULD BE:** `motherBirthDate` OR `fatherBirthDate`

**POLISH GRANDPARENTS:**
- `familyTreeData.grandfatherName` → **SHOULD BE:** `motherFatherName` OR `fatherFatherName`
- `familyTreeData.grandmotherName` → **SHOULD BE:** `motherMotherName` OR `fatherMotherName`
- `familyTreeData.grandmotherMaidenName` → **SHOULD BE:** `motherMotherMaidenName` OR `fatherMotherMaidenName`

---

## 4. REQUIRED FIELD RENAMING & MAPPING

### IMMEDIATE ACTIONS NEEDED:

1. **Rename Applicant Details fields:**
   ```typescript
   // OLD → NEW
   names → firstNames
   middleName → (combine with firstNames)
   familyName → lastName
   dateOfBirth → birthDate (convert to DD.MM.YYYY)
   placeOfBirth → birthPlace
   ```

2. **Add missing required fields:**
   ```typescript
   // REQUIRED ADDITIONS
   maidenName (conditional for females)
   currentAddress
   street, houseNumber, apartmentNumber
   city, state, postalCode
   mobilePhone
   gender (dropdown: mężczyzna/kobieta)
   maritalStatus (Polish terms)
   foreignCitizenshipsWithDates
   ```

3. **Family Tree field alignment:**
   ```typescript
   // ENSURE EXACT MAPPING
   polishParentGender → determines if data goes to mother* or father* fields
   All date fields → DD.MM.YYYY format
   All name fields → proper Polish character handling
   ```

---

## 5. OCR DOCUMENT PROCESSING INTEGRATION

### Document Field Extraction → Dashboard Population:
1. **Passport/ID Documents:** Extract to `applicantFirstNames`, `applicantLastName`, `applicantBirthDate`, `applicantBirthPlace`
2. **Birth Certificates:** Extract parent information to appropriate `mother*` or `father*` fields
3. **Marriage Certificates:** Extract to `maritalStatus`, `marriageDate`, `marriagePlace`
4. **Immigration Documents:** Extract to `emigrationDate`, `naturalizationDate`

### Translation Service Integration:
- All extracted Polish documents → maintain Polish formatting
- All extracted foreign documents → translate names using transliteration service
- Date formats → standardize to DD.MM.YYYY
- Address formats → Polish standard formatting

---

## 6. VALIDATION REQUIREMENTS

### Field Validation Rules:
- **Names:** Must handle Polish characters (ą, ć, ę, ł, ń, ó, ś, ź, ż)
- **Dates:** Must be DD.MM.YYYY format
- **Gender:** Must be 'mężczyzna' or 'kobieta' 
- **Required fields:** Cannot be empty for PDF generation
- **Conditional fields:** Show/hide based on gender, marital status

---

## 7. IMPLEMENTATION CHECKLIST

- [x] Rename all Applicant Details fields to match PDF templates
- [x] Add missing required fields to Applicant Details schema
- [x] Update Dashboard input field references (firstNames, lastName, birthDate, birthPlace)
- [x] Update PDF fill service with exact template field mapping (imie_nazwisko_wniosko, nr_dok_tozsamosci)
- [x] **FM1 EXECUTED**: Fixed all 94 LSP diagnostics - field mapping errors resolved
- [x] Updated client-details-form.tsx with corrected field names
- [x] Corrected all form field references in mobile-dashboard.tsx
- [ ] Update Family Tree field names for PDF alignment  
- [ ] Implement proper date formatting (DD.MM.YYYY)
- [ ] Add Polish character support for all name fields
- [ ] Create field validation for required PDF fields
- [ ] Update OCR processing to populate correct field names
- [ ] Test PDF generation with exact field mapping
- [ ] Verify all 72 PDF template fields are mappable
- [ ] Document final field mapping for future reference

**TARGET:** Zero field mapping errors in PDF generation - 100% authentic data flow from OCR → Dashboard → PDF Templates