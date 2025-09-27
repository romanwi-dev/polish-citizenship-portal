// Service to create test data for demonstrating auto-fill functionality
import { storage } from './storage';

export async function createTestProcessedDocument() {
  const testDocument = {
    id: `test-doc-${Date.now()}`,
    userId: "demo-user",
    fileName: "sample-birth-certificate.jpg",
    filePath: "/sample/path/birth-cert.jpg", 
    documentType: "birth_certificate" as const,
    extractedText: "CERTIFICATE OF BIRTH\nFull Name: John Michael Smith\nDate of Birth: March 15, 1985\nPlace of Birth: Warsaw, Poland\nFather: Robert James Smith\nMother: Maria Anna Kowalski\nRegistration Number: BC123456789",
    structuredData: {
      personalInfo: {
        firstNames: "JOHN",           // ALIGNED WITH PDF TEMPLATES (CAPS)
        lastName: "SMITH",            // ALIGNED WITH PDF TEMPLATES (CAPS)
        birthDate: "15.03.1985",      // ALIGNED WITH PDF FORMAT (DD.MM.YYYY)
        birthPlace: "WARSAW, POLAND", // ALIGNED WITH PDF TEMPLATES (CAPS)
        nationality: "Polish"
      },
      parentInfo: {
        fatherName: "Robert James Smith",
        motherName: "Maria Anna Kowalski",
        fatherBirthPlace: "Krakow, Poland", 
        motherBirthPlace: "Gdansk, Poland"
      }
    },
    polishTranslation: "AKT URODZENIA\nImię i nazwisko: John Michael Smith\nData urodzenia: 15 marca 1985\nMiejsce urodzenia: Warszawa, Polska\nOjciec: Robert James Smith\nMatka: Maria Anna Kowalski",
    confidence: 95,
    status: "completed" as const,
    errorMessage: null,
    createdAt: new Date(),
    processedAt: new Date()
  };

  // Store the test document
  await storage.createProcessedDocument(testDocument);
  return testDocument;
}