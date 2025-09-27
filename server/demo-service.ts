// Simple in-memory demo service to bypass database issues
interface DemoAutoFillData {
  personalInfo: {
    firstNames: string;           // ALIGNED WITH PDF TEMPLATES
    lastName: string;             // ALIGNED WITH PDF TEMPLATES  
    birthDate: string;            // ALIGNED WITH PDF TEMPLATES (DD.MM.YYYY)
    birthPlace: string;           // ALIGNED WITH PDF TEMPLATES
    nationality: string;
  };
  parentInfo: {
    fatherName: string;
    motherName: string;
    fatherBirthPlace: string;
    motherBirthPlace: string;
  };
  confidence: number;
}

// In-memory storage for demo
let demoData: DemoAutoFillData[] = [];

export function createDemoData(): DemoAutoFillData {
  const demo: DemoAutoFillData = {
    personalInfo: {
      firstNames: "Jan",
      lastName: "Kowalski",
      birthDate: "1985-03-15",
      birthPlace: "Warsaw, Poland",
      nationality: "Polish"
    },
    parentInfo: {
      fatherName: "Piotr Kowalski",
      motherName: "Anna Kowalska",
      fatherBirthPlace: "Krakow, Poland",
      motherBirthPlace: "Gdansk, Poland"
    },
    confidence: 0.95
  };

  // Clear existing and add demo data
  demoData = [demo];
  return demo;
}

export function getDemoData(): DemoAutoFillData[] {
  return demoData;
}

export function clearDemoData(): void {
  demoData = [];
}

export function addProcessedData(data: DemoAutoFillData): void {
  demoData.push(data);
}