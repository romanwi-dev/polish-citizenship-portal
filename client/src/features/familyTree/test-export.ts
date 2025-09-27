// Test script for Family Tree PDF export functionality
import { FamilyTreeData, createEmptyFamilyTree } from './types';
import { mapFamilyTreeToPDFFields, getSampleMapping } from './pdfMapper';
import { validateEligibility, generateCAPItems } from './eligibilityLogic';

// Create sample family tree data for testing
export const createSampleFamilyTree = (): FamilyTreeData => {
  const sampleData = createEmptyFamilyTree();
  
  // APPLICANT
  sampleData.applicant.applicant_full_name = "John Michael Smith";
  sampleData.applicant.applicant_date_of_birth = "1985-03-15T00:00:00.000Z";
  sampleData.applicant.applicant_place_of_birth = "Chicago, Illinois, USA";
  sampleData.applicant.applicant_date_of_marriage = "2010-06-20T00:00:00.000Z";
  sampleData.applicant.applicant_place_of_marriage = "New York, NY, USA";
  sampleData.applicant.applicant_spouse_full_name_and_maiden_name = "Sarah Elizabeth Johnson";

  // Minor child
  sampleData.minorChildren = [{
    minor_full_name: "Emma Grace Smith",
    minor_date_of_birth: "2015-09-10T00:00:00.000Z",
    minor_place_of_birth: "Boston, MA, USA"
  }];

  // POLISH PARENT
  sampleData.polishParent.polish_parent_full_name = "Maria Anna Kowalska";
  sampleData.polishParent.polish_parent_date_of_birth = "1960-11-25T00:00:00.000Z";
  sampleData.polishParent.polish_parent_place_of_birth = "Kraków, Poland";
  sampleData.polishParent.polish_parent_date_of_marriage = "1983-08-14T00:00:00.000Z";
  sampleData.polishParent.polish_parent_place_of_marriage = "Warsaw, Poland";
  sampleData.polishParent.polish_parent_date_of_emigration = "1984-05-12T00:00:00.000Z";
  sampleData.polishParent.polish_parent_date_of_naturalization = "1990-07-04T00:00:00.000Z";
  sampleData.polishParent.polish_parent_spouse_full_name = "Robert James Smith";

  // POLISH GRANDPARENT
  sampleData.polishGrandparent.polish_grandparent_full_name = "Stanisław Kowalski";
  sampleData.polishGrandparent.polish_grandparent_date_of_birth = "1935-04-18T00:00:00.000Z";
  sampleData.polishGrandparent.polish_grandparent_place_of_birth = "Gdańsk, Poland";
  sampleData.polishGrandparent.polish_grandparent_date_of_mariage = "1958-10-12T00:00:00.000Z";
  sampleData.polishGrandparent.polish_grandparent_place_of_mariage = "Kraków, Poland";
  sampleData.polishGrandparent.polish_grandparent_date_of_emigration = "1959-03-05T00:00:00.000Z";
  sampleData.polishGrandparent.polish_grandparent_spouse_full_name = "Anna Nowak";

  // GREAT GRANDPARENTS
  sampleData.greatGrandparents.great_grandfather_full_name = "Jan Kowalski";
  sampleData.greatGrandparents.great_grandfather_date_of_birth = "1910-12-03T00:00:00.000Z";
  sampleData.greatGrandparents.great_grandfather_place_of_birth = "Poznań, Poland";
  sampleData.greatGrandparents.great_grandfather_date_of_marriage = "1933-05-28T00:00:00.000Z";
  sampleData.greatGrandparents.great_grandfather_place_of_marriage = "Gdańsk, Poland";
  sampleData.greatGrandparents.great_grandfather_date_of_emigartion = "1934-09-15T00:00:00.000Z";
  sampleData.greatGrandparents.great_grandfather_date_of_naturalization = "1940-01-20T00:00:00.000Z";
  sampleData.greatGrandparents.great_grandmother_full_name = "Katarzyna Wiśniewska";

  return sampleData;
};

// Test eligibility logic
export const testEligibilityLogic = () => {
  const completeData = createSampleFamilyTree();
  const incompleteData = createEmptyFamilyTree();

  console.log('=== Testing Complete Family Tree ===');
  const completeEligibility = validateEligibility(completeData);
  console.log('Eligibility:', completeEligibility);
  
  const completeCAPItems = generateCAPItems(completeData);
  console.log('CAP Items (Complete):', completeCAPItems);

  console.log('\n=== Testing Incomplete Family Tree ===');
  const incompleteEligibility = validateEligibility(incompleteData);
  console.log('Eligibility:', incompleteEligibility);
  
  const incompleteCAPItems = generateCAPItems(incompleteData);
  console.log('CAP Items (Incomplete):', incompleteCAPItems);

  return {
    complete: { eligibility: completeEligibility, capItems: completeCAPItems },
    incomplete: { eligibility: incompleteEligibility, capItems: incompleteCAPItems }
  };
};

// Test PDF mapping
export const testPDFMapping = () => {
  const sampleData = createSampleFamilyTree();
  const mapping = mapFamilyTreeToPDFFields(sampleData);
  const sampleMappingText = getSampleMapping(sampleData);
  
  console.log('=== PDF Field Mapping Test ===');
  console.log('Total fields mapped:', Object.keys(mapping).length);
  console.log('Non-empty fields:', Object.values(mapping).filter(v => v.trim()).length);
  console.log('\nSample mapping:');
  console.log(sampleMappingText);
  
  return { mapping, sampleMappingText };
};

// Export test results for report
export const generateTestReport = () => {
  const eligibilityTests = testEligibilityLogic();
  const pdfTests = testPDFMapping();
  
  return {
    eligibility: eligibilityTests,
    pdf: pdfTests,
    timestamp: new Date().toISOString()
  };
};