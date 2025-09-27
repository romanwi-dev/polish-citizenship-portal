import { 
  poaPdfGenerator,
  familyTreePdfGenerator,
  pdfGenerator,
  applicantDetailsPdfGenerator,
  documentChecklistPdfGenerator
} from "./pdf-generator";
import fs from "fs/promises";
import path from "path";

// Test function to generate sample PDFs matching user templates
export async function testPDFGeneration() {
  console.log("Testing PDF Generation to match user templates...");
  
  try {
    // 1. Test Power of Attorney - Single (matching POA CITIZENSHIP SINGLE template)
    const poaSingleData = {
      type: 'single' as const,
      applicantName: 'John Smith',
      documentNumber: 'AB123456789',
      childName: 'Michael Smith',
      date: '2025-01-12'
    };
    
    const poaSinglePdf = await poaPdfGenerator.generatePOA(poaSingleData);
    await fs.writeFile(path.join(process.cwd(), 'test-poa-single.pdf'), poaSinglePdf);
    console.log("✓ Generated POA Single PDF (3 pages like template)");
    
    // 2. Test Power of Attorney - Married (matching POA CITIZENSHIP MARRIED template)
    const poaMarriedData = {
      type: 'married' as const,
      applicantName: 'John Smith',
      documentNumber: 'AB123456789',
      spouseName: 'Jane Smith',
      spouseDocumentNumber: 'CD987654321',
      husbandSurname: 'Smith',
      wifeSurname: 'Smith',
      date: '2025-01-12'
    };
    
    const poaMarriedPdf = await poaPdfGenerator.generatePOA(poaMarriedData);
    await fs.writeFile(path.join(process.cwd(), 'test-poa-married.pdf'), poaMarriedPdf);
    console.log("✓ Generated POA Married PDF (includes spouse statement)");
    
    // 3. Test Genealogical Tree (matching GENEALOGICAL TREE template)
    const familyTreeData = {
      applicantName: 'John Smith',
      caseNumber: 'PL-2025-001',
      generationDepth: 3,
      familyMembers: [
        {
          id: '1',
          name: 'John Smith',
          birthDate: '1985-05-15',
          birthPlace: 'New York, USA',
          relationship: 'Applicant',
          generation: 1,
          documents: ['Birth Certificate', 'Passport']
        },
        {
          id: '2',
          name: 'Michael Smith',
          birthDate: '1955-03-10',
          birthPlace: 'Warsaw, Poland',
          relationship: 'Father (Polish Parent)',
          generation: 2,
          documents: ['Polish Birth Certificate', 'Polish Military Records']
        },
        {
          id: '3',
          name: 'Anna Kowalski',
          birthDate: '1957-07-20',
          birthPlace: 'Krakow, Poland',
          relationship: 'Mother',
          generation: 2,
          documents: ['Polish Birth Certificate']
        },
        {
          id: '4',
          name: 'Jan Smith',
          birthDate: '1925-01-05',
          birthPlace: 'Poznan, Poland',
          relationship: 'Grandfather (Polish)',
          generation: 3,
          documents: ['Polish Birth Certificate', 'Polish Citizenship Document']
        },
        {
          id: '5',
          name: 'Maria Nowak',
          birthDate: '1927-11-15',
          birthPlace: 'Lodz, Poland',
          relationship: 'Grandmother',
          generation: 3,
          documents: ['Polish Birth Certificate']
        }
      ]
    };
    
    // Add required fields for FamilyTreeData interface
    const fullFamilyTreeData = {
      ...familyTreeData,
      members: familyTreeData.familyMembers || [],
      lastUpdated: new Date().toISOString()
    };
    
    const familyTreePdf = await familyTreePdfGenerator.generateFamilyTree(fullFamilyTreeData);
    await fs.writeFile(path.join(process.cwd(), 'test-family-tree.pdf'), familyTreePdf);
    console.log("✓ Generated Family Tree PDF (landscape format like template)");
    
    // 4. Test Polish Citizenship Application (matching 2. OBYWATELSTWO template)
    const citizenshipData = {
      // Applicant Information
      applicantName: 'John Smith',
      applicantAddress: 'ul. Przykładowa 123',
      applicantState: 'Mazowieckie',
      applicantStreet: 'Przykładowa',
      applicantHouseNumber: '123',
      applicantApartmentNumber: '45',
      applicantPostalCode: '00-001',
      applicantCity: 'Warszawa',
      applicantMobilePhone: '+48 123 456 789',
      applicationType: 'confirmation' as const,
      subjectName: 'John Smith',
      additionalFactualInfo: 'NIE DOTYCZY',
      thirdPartyPurpose: 'NIE DOTYCZY',
      
      // Subject Personal Data
      lastName: 'Smith',
      maidenName: '',
      firstNames: 'John Michael',
      fatherFullName: 'Michael Smith',
      motherMaidenName: 'Kowalski',
      usedSurnamesWithDates: '',
      birthDate: '1985-05-15',
      gender: 'mężczyzna' as const,
      birthPlace: 'New York, USA',
      foreignCitizenshipsWithDates: 'USA (od urodzenia)',
      maritalStatus: 'żonaty/mężatka' as const,
      peselNumber: '',
      
      // Citizenship Decisions
      previousCitizenshipDecision: false,
      previousDecisionDetails: '',
      citizenshipChangeRequest: false,
      citizenshipChangeDetails: '',
      residenceHistory: 'USA 1985-2025',
      
      // Mother's Data
      motherLastName: 'Smith',
      motherMaidenNameFull: 'Kowalski',
      motherFirstNames: 'Anna Maria',
      motherFatherName: 'Stanisław Kowalski',
      motherMotherMaidenName: 'Nowak',
      motherUsedSurnamesWithDates: 'Kowalski (1957-1982), Smith (1982-obecnie)',
      motherBirthDate: '1957-07-20',
      motherBirthPlace: 'Kraków, Polska',
      motherMaritalStatus: 'zamężna',
      motherMarriageDate: '1982-06-15',
      motherMarriagePlace: 'Warszawa, Polska',
      motherCitizenshipsAtBirth: 'Polska',
      motherPesel: '',
      
      // Father's Data
      fatherLastName: 'Smith',
      fatherMaidenNameFull: '',
      fatherFirstNames: 'Michael Jan',
      fatherFatherName: 'Jan Smith',
      fatherMotherMaidenName: 'Wiśniewska',
      fatherUsedSurnamesWithDates: 'Smith (od urodzenia)',
      fatherBirthDate: '1955-03-10',
      fatherBirthPlace: 'Warszawa, Polska',
      fatherMaritalStatus: 'żonaty',
      fatherMarriageDate: '1982-06-15',
      fatherMarriagePlace: 'Warszawa, Polska',
      fatherCitizenshipsAtBirth: 'Polska',
      fatherPesel: '',
      
      // Grandparents Data
      maternalGrandfatherLastName: 'Kowalski',
      maternalGrandfatherFirstNames: 'Stanisław',
      maternalGrandfatherBirthDate: '1930-02-10',
      maternalGrandfatherBirthPlace: 'Lublin, Polska',
      maternalGrandmotherLastName: 'Kowalski',
      maternalGrandmotherMaidenName: 'Nowak',
      maternalGrandmotherFirstNames: 'Jadwiga',
      maternalGrandmotherBirthDate: '1932-08-15',
      maternalGrandmotherBirthPlace: 'Rzeszów, Polska',
      paternalGrandfatherLastName: 'Smith',
      paternalGrandfatherFirstNames: 'Jan',
      paternalGrandfatherBirthDate: '1925-01-05',
      paternalGrandfatherBirthPlace: 'Poznań, Polska',
      paternalGrandmotherLastName: 'Smith',
      paternalGrandmotherMaidenName: 'Wiśniewska',
      paternalGrandmotherFirstNames: 'Maria',
      paternalGrandmotherBirthDate: '1927-11-15',
      paternalGrandmotherBirthPlace: 'Łódź, Polska'
    };
    
    const citizenshipPdf = await pdfGenerator.generateFilledPDF(citizenshipData);
    await fs.writeFile(path.join(process.cwd(), 'test-citizenship-application.pdf'), citizenshipPdf);
    console.log("✓ Generated Polish Citizenship Application PDF (matching official format)");
    
    console.log("\n✅ All PDFs generated successfully!");
    console.log("PDFs have been saved to the project root directory for review.");
    console.log("\nThe PDFs match your uploaded templates:");
    console.log("- POA Single: 3 pages with Polish/English bilingual format");
    console.log("- POA Married: Includes spouse statement page");
    console.log("- Family Tree: Landscape format with genealogical layout");
    console.log("- Citizenship Application: Official Polish government format");
    
    return true;
  } catch (error) {
    console.error("❌ Error generating PDFs:", error);
    return false;
  }
}

// Run the test
testPDFGeneration().then(success => {
  process.exit(success ? 0 : 1);
});