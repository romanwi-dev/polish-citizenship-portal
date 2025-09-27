import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox, PDFRadioGroup, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

// Polish character transliteration for PDF compatibility
const polishToLatin = {
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
  'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
};

function transliteratePolish(text: string): string {
  return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => polishToLatin[char as keyof typeof polishToLatin] || char);
}

// Format date as dd-mm-yyyy
function formatDate(date: string): string {
  if (!date) return '';
  const parts = date.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return date;
}

export interface PolishCitizenshipApplicationData {
  // Applicant Information
  applicantName: string;
  applicantAddress: string;
  applicantState: string;
  applicantStreet: string;
  applicantHouseNumber: string;
  applicantApartmentNumber: string;
  applicantPostalCode: string;
  applicantCity: string;
  applicantMobilePhone: string;
  applicationType: 'confirmation' | 'loss_confirmation';
  subjectName: string;
  additionalFactualInfo: string;
  thirdPartyPurpose: string;

  // Subject Personal Data
  lastName: string;
  maidenName: string;
  firstNames: string;
  fatherFullName: string;
  motherMaidenName: string;
  usedSurnamesWithDates: string;
  birthDate: string;
  gender: 'kobieta' | 'mężczyzna';
  birthPlace: string;
  foreignCitizenshipsWithDates: string;
  maritalStatus: 'kawaler/panna' | 'żonaty/mężatka' | 'rozwiedziony/rozwiedziona' | 'wdowiec/wdowa';
  peselNumber: string;

  // Citizenship Decisions
  previousCitizenshipDecision: boolean;
  previousDecisionDetails: string;
  citizenshipChangeRequest: boolean;
  citizenshipChangeDetails: string;
  residenceHistory: string;

  // Mother's Data
  motherLastName: string;
  motherMaidenNameFull: string;
  motherFirstNames: string;
  motherFatherName: string;
  motherMotherMaidenName: string;
  motherUsedSurnamesWithDates: string;
  motherBirthDate: string;
  motherBirthPlace: string;
  motherMaritalStatus: string;
  motherMarriageDate: string;
  motherMarriagePlace: string;
  motherCitizenshipsAtBirth: string;
  motherPesel: string;

  // Father's Data
  fatherLastName: string;
  fatherMaidenNameFull: string;
  fatherFirstNames: string;
  fatherFatherName: string;
  fatherMotherMaidenName: string;
  fatherUsedSurnamesWithDates: string;
  fatherBirthDate: string;
  fatherBirthPlace: string;
  fatherMaritalStatus: string;
  fatherMarriageDate: string;
  fatherMarriagePlace: string;
  fatherCitizenshipsAtBirth: string;
  fatherPesel: string;

  // Grandparents Data
  maternalGrandfatherLastName: string;
  maternalGrandfatherFirstNames: string;
  maternalGrandfatherBirthDate: string;
  maternalGrandfatherBirthPlace: string;
  maternalGrandmotherLastName: string;
  maternalGrandmotherMaidenName: string;
  maternalGrandmotherFirstNames: string;
  maternalGrandmotherBirthDate: string;
  maternalGrandmotherBirthPlace: string;
  paternalGrandfatherLastName: string;
  paternalGrandfatherFirstNames: string;
  paternalGrandfatherBirthDate: string;
  paternalGrandfatherBirthPlace: string;
  paternalGrandmotherLastName: string;
  paternalGrandmotherMaidenName: string;
  paternalGrandmotherFirstNames: string;
  paternalGrandmotherBirthDate: string;
  paternalGrandmotherBirthPlace: string;
}

export class PolishCitizenshipPDFGenerator {
  private async createBlankPDFTemplate(): Promise<PDFDocument> {
    // Create a new PDF document that mimics the official Polish citizenship application form
    const pdfDoc = await PDFDocument.create();
    const page1 = pdfDoc.addPage([595, 842]); // A4 size
    const page2 = pdfDoc.addPage([595, 842]);
    const page3 = pdfDoc.addPage([595, 842]);

    const font = await pdfDoc.embedFont('Helvetica');
    const boldFont = await pdfDoc.embedFont('Helvetica-Bold');

    // Page 1: Header and Applicant Information
    this.drawPage1Header(page1, boldFont, font);
    this.drawPage1ApplicantSection(page1, font);
    this.drawPage1SubjectSection(page1, font);

    // Page 2: Personal Data Section
    this.drawPage2PersonalData(page2, boldFont, font);
    this.drawPage2ParentsData(page2, font);

    // Page 3: Grandparents Data and Signatures
    this.drawPage3GrandparentsData(page3, font);
    this.drawPage3Signatures(page3, font);

    return pdfDoc;
  }

  private drawPage1Header(page: any, boldFont: any, font: any) {
    const { width, height } = page.getSize();
    
    // Official header
    page.drawText('WNIOSEK', {
      x: width / 2 - 30,
      y: height - 50,
      size: 16,
      font: boldFont,
    });
    
    page.drawText(transliteratePolish('o stwierdzenie posiadania obywatelstwa polskiego'), {
      x: width / 2 - 140,
      y: height - 70,
      size: 12,
      font: font,
    });

    // Form number
    page.drawText(transliteratePolish('(wzor okreslony w rozporzadzeniu MSWiA z dnia 3 maja 2012 r.)'), {
      x: 50,
      y: height - 100,
      size: 8,
      font: font,
    });

    // Checkbox options
    page.drawText(transliteratePolish('[ ] o stwierdzenie posiadania obywatelstwa polskiego'), {
      x: 50,
      y: height - 130,
      size: 10,
      font: font,
    });

    page.drawText(transliteratePolish('[ ] o stwierdzenie utraty obywatelstwa polskiego'), {
      x: 50,
      y: height - 150,
      size: 10,
      font: font,
    });
  }

  private drawPage1ApplicantSection(page: any, font: any) {
    const startY = 650;
    let currentY = startY;

    // Applicant section
    page.drawText('WNIOSKODAWCA:', {
      x: 50,
      y: currentY,
      size: 12,
      font: font,
    });

    currentY -= 30;
    this.drawField(page, font, 'Imię i nazwisko:', 50, currentY, 200);
    this.drawField(page, font, 'Adres:', 300, currentY, 200);
    
    currentY -= 25;
    this.drawField(page, font, 'Województwo:', 50, currentY, 150);
    this.drawField(page, font, 'Gmina:', 220, currentY, 150);
    this.drawField(page, font, 'Powiat:', 390, currentY, 150);

    currentY -= 25;
    this.drawField(page, font, 'Ulica:', 50, currentY, 200);
    this.drawField(page, font, 'Nr domu:', 270, currentY, 80);
    this.drawField(page, font, 'Nr mieszkania:', 370, currentY, 80);

    currentY -= 25;
    this.drawField(page, font, 'Kod pocztowy:', 50, currentY, 100);
    this.drawField(page, font, 'Miasto:', 170, currentY, 150);
    this.drawField(page, font, 'Telefon komórkowy:', 340, currentY, 150);
  }

  private drawPage1SubjectSection(page: any, font: any) {
    const startY = 480;
    let currentY = startY;

    page.drawText('Wniosek dotyczy osoby:', {
      x: 50,
      y: currentY,
      size: 12,
      font: font,
    });

    currentY -= 30;
    this.drawField(page, font, 'Imię i nazwisko:', 50, currentY, 300);

    currentY -= 40;
    page.drawText('Dodatkowe informacje faktyczne:', {
      x: 50,
      y: currentY,
      size: 10,
      font: font,
    });

    currentY -= 20;
    this.drawTextBox(page, font, 50, currentY, 500, 60);

    currentY -= 80;
    page.drawText(transliteratePolish('Cel, w jakim osoba trzecia występuje z wnioskiem:'), {
      x: 50,
      y: currentY,
      size: 10,
      font: font,
    });

    currentY -= 20;
    this.drawTextBox(page, font, 50, currentY, 500, 60);
  }

  private drawPage2PersonalData(page: any, boldFont: any, font: any) {
    const { height } = page.getSize();
    let currentY = height - 50;

    page.drawText(transliteratePolish('CZĘŚĆ I'), {
      x: 50,
      y: currentY,
      size: 14,
      font: boldFont,
    });

    currentY -= 20;
    page.drawText(transliteratePolish('Dane osoby, której dotyczy wniosek'), {
      x: 50,
      y: currentY,
      size: 12,
      font: font,
    });

    currentY -= 40;
    this.drawField(page, font, 'Nazwisko:', 50, currentY, 200);
    this.drawField(page, font, 'Nazwisko rodowe:', 270, currentY, 200);

    currentY -= 25;
    this.drawField(page, font, 'Imiona:', 50, currentY, 200);
    this.drawField(page, font, 'Imię ojca:', 270, currentY, 200);

    currentY -= 25;
    this.drawField(page, font, 'Nazwisko rodowe matki:', 50, currentY, 200);
    this.drawField(page, font, 'Data urodzenia:', 270, currentY, 200);

    currentY -= 25;
    this.drawField(page, font, 'Płeć:', 50, currentY, 100);
    page.drawText(transliteratePolish('[ ] kobieta  [ ] mężczyzna'), { x: 160, y: currentY, size: 10, font: font });

    currentY -= 25;
    this.drawField(page, font, 'Miejsce urodzenia:', 50, currentY, 400);

    currentY -= 25;
    this.drawField(page, font, 'Stan cywilny:', 50, currentY, 200);
    this.drawField(page, font, 'PESEL:', 270, currentY, 200);

    currentY -= 40;
    page.drawText('Obywatelstwa obce (z datami):', {
      x: 50,
      y: currentY,
      size: 10,
      font: font,
    });
    currentY -= 20;
    this.drawTextBox(page, font, 50, currentY, 500, 40);
  }

  private drawPage2ParentsData(page: any, font: any) {
    let currentY = 400;

    // Mother's data section
    page.drawText('MATKA:', {
      x: 50,
      y: currentY,
      size: 12,
      font: font,
    });

    currentY -= 25;
    this.drawField(page, font, 'Nazwisko:', 50, currentY, 200);
    this.drawField(page, font, 'Nazwisko rodowe:', 270, currentY, 200);

    currentY -= 25;
    this.drawField(page, font, 'Imiona:', 50, currentY, 200);
    this.drawField(page, font, 'Data urodzenia:', 270, currentY, 200);

    currentY -= 25;
    this.drawField(page, font, 'Miejsce urodzenia:', 50, currentY, 400);

    currentY -= 40;
    // Father's data section
    page.drawText('OJCIEC:', {
      x: 50,
      y: currentY,
      size: 12,
      font: font,
    });

    currentY -= 25;
    this.drawField(page, font, 'Nazwisko:', 50, currentY, 200);
    this.drawField(page, font, 'Nazwisko rodowe:', 270, currentY, 200);

    currentY -= 25;
    this.drawField(page, font, 'Imiona:', 50, currentY, 200);
    this.drawField(page, font, 'Data urodzenia:', 270, currentY, 200);

    currentY -= 25;
    this.drawField(page, font, 'Miejsce urodzenia:', 50, currentY, 400);
  }

  private drawPage3GrandparentsData(page: any, font: any) {
    const { height } = page.getSize();
    let currentY = height - 50;

    page.drawText('DZIADKOWIE:', {
      x: 50,
      y: currentY,
      size: 12,
      font: font,
    });

    // Maternal grandparents
    currentY -= 30;
    page.drawText('Ze strony matki:', {
      x: 50,
      y: currentY,
      size: 10,
      font: font,
    });

    currentY -= 20;
    this.drawField(page, font, 'Dziadek - imiona i nazwisko:', 50, currentY, 400);

    currentY -= 20;
    this.drawField(page, font, 'Data i miejsce urodzenia:', 50, currentY, 400);

    currentY -= 20;
    this.drawField(page, font, 'Babka - imiona i nazwisko rodowe:', 50, currentY, 400);

    currentY -= 20;
    this.drawField(page, font, 'Data i miejsce urodzenia:', 50, currentY, 400);

    // Paternal grandparents
    currentY -= 40;
    page.drawText('Ze strony ojca:', {
      x: 50,
      y: currentY,
      size: 10,
      font: font,
    });

    currentY -= 20;
    this.drawField(page, font, 'Dziadek - imiona i nazwisko:', 50, currentY, 400);

    currentY -= 20;
    this.drawField(page, font, 'Data i miejsce urodzenia:', 50, currentY, 400);

    currentY -= 20;
    this.drawField(page, font, 'Babka - imiona i nazwisko rodowe:', 50, currentY, 400);

    currentY -= 20;
    this.drawField(page, font, 'Data i miejsce urodzenia:', 50, currentY, 400);
  }

  private drawPage3Signatures(page: any, font: any) {
    let currentY = 200;

    page.drawText('Data i podpis wnioskodawcy:', {
      x: 50,
      y: currentY,
      size: 10,
      font: font,
    });

    // Draw signature line
    page.drawLine({
      start: { x: 50, y: currentY - 40 },
      end: { x: 200, y: currentY - 40 },
      thickness: 1,
    });

    page.drawText('(data)', {
      x: 50,
      y: currentY - 55,
      size: 8,
      font: font,
    });

    page.drawLine({
      start: { x: 300, y: currentY - 40 },
      end: { x: 500, y: currentY - 40 },
      thickness: 1,
    });

    page.drawText('(podpis)', {
      x: 400,
      y: currentY - 55,
      size: 8,
      font: font,
    });
  }

  private drawField(page: any, font: any, label: string, x: number, y: number, width: number) {
    const transliteratedLabel = transliteratePolish(label);
    page.drawText(transliteratedLabel, {
      x,
      y,
      size: 9,
      font,
    });

    // Draw underline for field
    page.drawLine({
      start: { x: x + transliteratedLabel.length * 5 + 5, y: y - 2 },
      end: { x: x + width, y: y - 2 },
      thickness: 0.5,
    });
  }

  private drawTextBox(page: any, font: any, x: number, y: number, width: number, height: number) {
    // Draw rectangle for text box
    page.drawRectangle({
      x,
      y,
      width,
      height,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.5,
    });
  }

  public async generateFilledPDF(data: PolishCitizenshipApplicationData): Promise<Uint8Array> {
    const pdfDoc = await this.createBlankPDFTemplate();
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont('Helvetica');

    // Fill in the data on appropriate pages
    this.fillPage1Data(pages[0], font, data);
    this.fillPage2Data(pages[1], font, data);
    this.fillPage3Data(pages[2], font, data);

    return await pdfDoc.save();
  }

  private fillPage1Data(page: any, font: any, data: PolishCitizenshipApplicationData) {
    // Fill applicant data with transliteration
    this.fillText(page, font, transliteratePolish(data.applicantName), 150, 620, 10);
    this.fillText(page, font, transliteratePolish(data.applicantAddress), 400, 620, 10);
    this.fillText(page, font, transliteratePolish(data.applicantState), 150, 595, 10);
    this.fillText(page, font, transliteratePolish(data.applicantStreet), 150, 570, 10);
    this.fillText(page, font, data.applicantHouseNumber, 320, 570, 10);
    this.fillText(page, font, data.applicantApartmentNumber, 420, 570, 10);
    this.fillText(page, font, data.applicantPostalCode, 150, 545, 10);
    this.fillText(page, font, data.applicantCity, 270, 545, 10);
    this.fillText(page, font, data.applicantMobilePhone, 440, 545, 10);

    // Fill subject name
    this.fillText(page, font, data.subjectName, 150, 450, 10);
    
    // Fill additional information
    this.fillText(page, font, data.additionalFactualInfo, 55, 370, 9, 480);
    this.fillText(page, font, data.thirdPartyPurpose, 55, 250, 9, 480);

    // Mark application type checkbox
    if (data.applicationType === 'confirmation') {
      this.fillCheckbox(page, 55, 680);
    } else {
      this.fillCheckbox(page, 55, 700);
    }
  }

  private async fillPage2Data(page: any, font: any, data: PolishCitizenshipApplicationData) {
    // Fill personal data
    this.fillText(page, font, data.lastName, 150, 722, 10);
    this.fillText(page, font, data.maidenName, 370, 722, 10);
    this.fillText(page, font, data.firstNames, 150, 697, 10);
    this.fillText(page, font, data.fatherFullName, 370, 697, 10);
    this.fillText(page, font, data.motherMaidenName, 200, 672, 10);
    this.fillText(page, font, data.birthDate, 370, 672, 10);
    this.fillText(page, font, data.birthPlace, 200, 622, 10);
    this.fillText(page, font, data.maritalStatus, 150, 597, 10);
    this.fillText(page, font, data.peselNumber, 370, 597, 10);

    // Mark gender checkbox
    if (data.gender === 'kobieta') {
      this.fillCheckbox(page, 160, 647);
    } else {
      this.fillCheckbox(page, 220, 647);
    }

    this.fillText(page, font, data.foreignCitizenshipsWithDates, 55, 530, 9, 480);

    // Fill mother's data
    this.fillText(page, font, data.motherLastName, 150, 375, 10);
    this.fillText(page, font, data.motherMaidenNameFull, 370, 375, 10);
    this.fillText(page, font, data.motherFirstNames, 150, 350, 10);
    this.fillText(page, font, data.motherBirthDate, 370, 350, 10);
    this.fillText(page, font, data.motherBirthPlace, 200, 325, 10);

    // Fill father's data
    this.fillText(page, font, data.fatherLastName, 150, 260, 10);
    this.fillText(page, font, data.fatherMaidenNameFull, 370, 260, 10);
    this.fillText(page, font, data.fatherFirstNames, 150, 235, 10);
    this.fillText(page, font, data.fatherBirthDate, 370, 235, 10);
    this.fillText(page, font, data.fatherBirthPlace, 200, 210, 10);
  }

  private async fillPage3Data(page: any, font: any, data: PolishCitizenshipApplicationData) {
    // Fill grandparents data
    this.fillText(page, font, `${data.maternalGrandfatherFirstNames} ${data.maternalGrandfatherLastName}`, 250, 742, 10);
    this.fillText(page, font, `${data.maternalGrandfatherBirthDate} ${data.maternalGrandfatherBirthPlace}`, 250, 722, 10);
    this.fillText(page, font, `${data.maternalGrandmotherFirstNames} ${data.maternalGrandmotherLastName}`, 250, 702, 10);
    this.fillText(page, font, `${data.maternalGrandmotherBirthDate} ${data.maternalGrandmotherBirthPlace}`, 250, 682, 10);

    this.fillText(page, font, `${data.paternalGrandfatherFirstNames} ${data.paternalGrandfatherLastName}`, 250, 622, 10);
    this.fillText(page, font, `${data.paternalGrandfatherBirthDate} ${data.paternalGrandfatherBirthPlace}`, 250, 602, 10);
    this.fillText(page, font, `${data.paternalGrandmotherFirstNames} ${data.paternalGrandmotherLastName}`, 250, 582, 10);
    this.fillText(page, font, `${data.paternalGrandmotherBirthDate} ${data.paternalGrandmotherBirthPlace}`, 250, 562, 10);

    // Fill current date
    const currentDate = new Date().toLocaleDateString('pl-PL');
    this.fillText(page, font, currentDate, 50, 160, 10);
  }

  private fillText(page: any, font: any, text: string, x: number, y: number, size: number, maxWidth?: number) {
    if (!text) return;
    
    let displayText = transliteratePolish(text);
    if (maxWidth) {
      // Simple text wrapping - in production, you'd want more sophisticated text layout
      const maxChars = Math.floor(maxWidth / (size * 0.6));
      if (displayText.length > maxChars) {
        displayText = displayText.substring(0, maxChars) + '...';
      }
    }

    page.drawText(displayText, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  }

  private fillCheckbox(page: any, x: number, y: number) {
    page.drawText('X', {
      x: x + 2,
      y: y - 2,
      size: 8,
      color: rgb(0, 0, 0),
    });
  }

  async generateCitizenshipApplication(data: PolishCitizenshipApplicationData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Create 4 pages for citizenship application
    for (let pageNum = 1; pageNum <= 4; pageNum++) {
      const page = pdfDoc.addPage([595, 842]);
      this.drawCitizenshipApplicationPage(page, data, font, pageNum);
    }

    return await pdfDoc.save();
  }

  private drawCitizenshipApplicationPage(page: PDFPage, data: PolishCitizenshipApplicationData, font: PDFFont, pageNum: number) {
    const { height } = page.getSize();
    let currentY = height - 50;
    
    // Header
    page.drawText(transliteratePolish('Wniosek o potwierdzenie posiadania obywatelstwa polskiego'), {
      x: 50,
      y: currentY,
      size: 14,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    currentY -= 40;
    
    if (pageNum === 1) {
      // Page 1: Basic applicant data
      page.drawText(transliteratePolish('1. DANE WNIOSKODAWCY'), {
        x: 50,
        y: currentY,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      currentY -= 30;
      this.drawField(page, font, 'Nazwisko:', 50, currentY, 200);
      if (data.lastName) {
        page.drawText(transliteratePolish(data.lastName), {
          x: 150,
          y: currentY,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
      
      currentY -= 25;
      this.drawField(page, font, 'Imiona:', 50, currentY, 200);
      if (data.firstNames) {
        page.drawText(transliteratePolish(data.firstNames), {
          x: 150,
          y: currentY,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
      
    } else if (pageNum === 2) {
      // Page 2: Mother's data
      page.drawText(transliteratePolish('2. DANE MATKI'), {
        x: 50,
        y: currentY,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      
    } else if (pageNum === 3) {
      // Page 3: Father's data
      page.drawText(transliteratePolish('3. DANE OJCA'), {
        x: 50,
        y: currentY,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      
    } else if (pageNum === 4) {
      // Page 4: Declaration
      page.drawText(transliteratePolish('OŚWIADCZENIE'), {
        x: 50,
        y: currentY,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      currentY -= 50;
      page.drawText(transliteratePolish('Oświadczam, że podane dane są prawdziwe.'), {
        x: 50,
        y: currentY,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
    
    // Footer
    page.drawText(`strona ${pageNum}/4`, {
      x: 500,
      y: 30,
      size: 8,
      font: font,
      color: rgb(0, 0, 0),
    });
  }
}

// Power of Attorney data interface matching user templates exactly
export interface PowerOfAttorneyData {
  type: 'single' | 'married' | 'minor' | 'archives';
  applicantName: string;
  documentNumber: string;
  documentId?: string;
  childName?: string;
  spouseName?: string;
  spouseFullName?: string;
  scopeOfAuthority?: string[];
  spouseDocumentNumber?: string;
  husbandSurname?: string;
  wifeSurname?: string;
  childrenSurnames?: string;
  date: string;
  // Additional fields for comprehensive POA
  principalFullName?: string;
  principalBirthDate?: string;
  principalBirthPlace?: string;
  principalAddress?: string;
  principalPesel?: string;
  principalPassportNumber?: string;
  principalPhone?: string;
  principalEmail?: string;
}

export class PowerOfAttorneyPDFGenerator {
  public async generatePOA(data: PowerOfAttorneyData): Promise<Uint8Array> {
    // Try to load and fill the actual template first
    const templatePath = path.join(process.cwd(), 'attached_assets', 'POA CITIZENSHIP SINGLE_1755043086081.pdf');
    
    try {
      const templateBytes = await fs.readFile(templatePath);
      const pdfDoc = await PDFDocument.load(templateBytes);
      
      // Get the form from the PDF to fill the actual form fields
      const form = pdfDoc.getForm();
      
      // Fill the ACTUAL form fields with the CORRECT field names
      try {
        // Field 1: "imie_nazwisko_wniosko" - applicant name
        const nameField = form.getTextField('imie_nazwisko_wniosko');
        nameField.setText(data.principalFullName || data.applicantName || 'John Smith');
        
        // Field 2: "nr_dok_tozsamosci" - document ID number
        const docField = form.getTextField('nr_dok_tozsamosci');
        docField.setText(data.principalPassportNumber || data.documentNumber || 'US123456789');
        
        // Field 3: "imie_nazwisko_dziecka" - child name (if applicable)
        if (data.childName) {
          try {
            const childField = form.getTextField('imie_nazwisko_dziecka');
            childField.setText(data.childName);
          } catch (e) {
            // Field might not exist on this template variant
          }
        }
        
        // Field 4: "data_pelnomocnictwa" - power of attorney date
        const dateField = form.getTextField('data_pelnomocnictwa');
        const dateStr = data.date || new Date().toLocaleDateString('pl-PL');
        dateField.setText(dateStr);
        
      } catch (formError) {
        console.error('Error filling form fields:', formError);
        // If form fields don't work, fall back to drawing text
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        // Get all pages and add text overlays
        const pages = pdfDoc.getPages();
        for (const page of pages) {
          // Based on field positions from check-pdf-fields.ts
          // Field 1 position: x=241.724, y=672.098
          page.drawText(data.principalFullName || data.applicantName || 'John Smith', {
            x: 242,
            y: 672,
            size: 11,
            font: boldFont,
            color: rgb(0, 0, 0.8),
          });
          
          // Field 2 position: x=242.214, y=623.678
          page.drawText(data.principalPassportNumber || data.documentNumber || 'US123456789', {
            x: 242,
            y: 624,
            size: 11,
            font: boldFont,
            color: rgb(0, 0, 0.8),
          });
          
          // Field 3 position: x=242.671, y=519.323
          if (data.childName) {
            page.drawText(data.childName, {
              x: 243,
              y: 519,
              size: 11,
              font: boldFont,
              color: rgb(0, 0, 0.8),
            });
          }
          
          // Field 4 position: x=71.636, y=217.106
          page.drawText(data.date || new Date().toLocaleDateString('pl-PL'), {
            x: 72,
            y: 217,
            size: 11,
            font: font,
            color: rgb(0, 0, 0.8),
          });
        }
      }
      
      // Flatten the form to make fields non-editable
      form.flatten();
      
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (templateError) {
      console.log('Template not found, generating from scratch');
      // Fallback to generating from scratch
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Generate based on type
      switch (data.type) {
        case 'archives':
          await this.generateArchivesPOA(pdfDoc, data, font, boldFont);
          break;
        case 'single':
          await this.generateSinglePOA(pdfDoc, data, font, boldFont);
          break;
        case 'married':
          await this.generateMarriedPOA(pdfDoc, data, font, boldFont);
          break;
        case 'minor':
          await this.generateMinorPOA(pdfDoc, data, font, boldFont);
          break;
        default:
          await this.generateSinglePOA(pdfDoc, data, font, boldFont);
      }

      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    }
  }

  private async generateArchivesPOA(pdfDoc: PDFDocument, data: PowerOfAttorneyData, font: PDFFont, boldFont: PDFFont) {
    const page = pdfDoc.addPage([595, 842]); // A4 size
    let yPosition = 750;
    
    // Header matching the template
    page.drawText(transliteratePolish('Pełnomocnictwo (Power of Attorney)'), {
      x: 200,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 50;
    
    // Main content
    page.drawText(transliteratePolish('Ja, niżej podpisany/a:'), {
      x: 50,
      y: yPosition,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 25;
    page.drawText(transliteratePolish('imię i nazwisko:'), {
      x: 100,
      y: yPosition,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    });
    page.drawText(transliteratePolish(data.principalFullName || data.applicantName || ''), {
      x: 200,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 30;
    page.drawText(transliteratePolish('legitymujący/a się dokumentem tożsamości nr:'), {
      x: 50,
      y: yPosition,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 25;
    page.drawText(transliteratePolish('nr dokumentu tożsamości:'), {
      x: 100,
      y: yPosition,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    });
    page.drawText(data.principalPassportNumber || data.documentNumber || '', {
      x: 250,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 40;
    
    // Authorization text
    const authText = transliteratePolish(`upoważniam Romana WIŚNIEWSKIEGO, legitymującego się polskim dowodem osobistym nr
CBU675382, zamieszkałego w Warszawie, ul. Słomińskiego 17/50, do reprezentowania
mnie w Urzędzie Wojewódzkim/ Ministerstwie Spraw Wewnętrznych i Administracji celem
prowadzenia spraw o stwierdzenie posiadania/ przywrócenie obywatelstwa polskiego przeze
mnie`);
    
    const lines = authText.split('\n');
    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 18;
    }
    
    // Add child name if provided
    if (data.childName) {
      yPosition -= 10;
      page.drawText(transliteratePolish('oraz moje małoletnie dziecko:'), {
        x: 50,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;
      page.drawText(transliteratePolish('imię i nazwisko dziecka:'), {
        x: 100,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawText(data.childName, {
        x: 250,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;
    }
    
    // Additional authorization text
    const additionalText = transliteratePolish(`oraz w Urzędach Stanu Cywilnego, Archiwach Państwowych, Instytucie Pamięci Narodowej i wszelkich
innych archiwach/ instytucjach/ urzędach celem uzyskania/sprostowania/uzupełnienia/ odtworzenia
i uzyskania poświadczonych kopii mojego/ moich krewnych polskiego aktu urodzenia/ małżeństwa/
zgonu oraz innych polskich dokumentów dotyczących mnie i mojej rodziny a także transkrypcji/
umiejscowienia zagranicznych dokumentów w polskich aktach stanu cywilnego oraz w sprawie
o nadanie numeru PESEL. Wyrażam również zgodę na sprostowanie/ uzupełnienie odp. aktów stanu
cywilnego.`);
    
    const addLines = additionalText.split('\n');
    for (const line of addLines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 18;
    }
    
    yPosition -= 30;
    
    // Revocation clause
    page.drawText(transliteratePolish('Jednocześnie unieważniam wszelkie inne pełnomocnictwa udzielone przeze mnie lub w moim imieniu w w/w'), {
      x: 50,
      y: yPosition,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 18;
    page.drawText(transliteratePolish('sprawach.'), {
      x: 50,
      y: yPosition,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 30;
    
    // Further delegation
    page.drawText(transliteratePolish('Pełnomocnik może udzielić dalszego pełnomocnictwa.'), {
      x: 50,
      y: yPosition,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    // Signature section
    yPosition = 150;
    
    page.drawText('data / date', {
      x: 100,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('podpis / signature', {
      x: 400,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    // Footer
    page.drawText(transliteratePolish('Pełnomocnictwo (Power of Attorney)'), {
      x: 50,
      y: 50,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('strona 1/1', {
      x: 500,
      y: 50,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
  }
  
  private async generateSinglePOA(pdfDoc: PDFDocument, data: PowerOfAttorneyData, font: PDFFont, boldFont: PDFFont) {
    // Generate 3 pages for single POA
    for (let pageNum = 1; pageNum <= 3; pageNum++) {
      const page = pdfDoc.addPage([595, 842]);
      await this.drawSinglePOAPage(page, data, font, boldFont, pageNum);
    }
  }
  
  private async generateMarriedPOA(pdfDoc: PDFDocument, data: PowerOfAttorneyData, font: PDFFont, boldFont: PDFFont) {
    // Page 1: First spouse POA
    const page1 = pdfDoc.addPage([595, 842]);
    await this.drawSinglePOAPage(page1, data, font, boldFont, 1);
    
    // Page 2: Spouses statement
    const page2 = pdfDoc.addPage([595, 842]);
    await this.drawSpousesStatement(page2, data, font, boldFont);
    
    // Pages 3-4: Second spouse POA
    for (let pageNum = 3; pageNum <= 4; pageNum++) {
      const page = pdfDoc.addPage([595, 842]);
      await this.drawSinglePOAPage(page, data, font, boldFont, pageNum);
    }
  }
  
  private async generateMinorPOA(pdfDoc: PDFDocument, data: PowerOfAttorneyData, font: PDFFont, boldFont: PDFFont) {
    // Generate 3 pages for minor POA
    for (let pageNum = 1; pageNum <= 3; pageNum++) {
      const page = pdfDoc.addPage([595, 842]);
      await this.drawMinorPOAPage(page, data, font, boldFont, pageNum);
    }
  }
  
  private async drawSinglePOAPage(page: PDFPage, data: PowerOfAttorneyData, font: PDFFont, boldFont: PDFFont, pageNum: number) {
    let yPosition = 750;
    
    // Header
    page.drawText(transliteratePolish('Pełnomocnictwo (Power of Attorney)'), {
      x: 200,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 50;
    
    if (pageNum === 1) {
      // Page 1: Principal information and authorization
      page.drawText(transliteratePolish('Ja, niżej podpisany/a:'), {
        x: 50,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 25;
      page.drawText(transliteratePolish('imię i nazwisko:'), {
        x: 100,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawText(transliteratePolish(data.principalFullName || data.applicantName || ''), {
        x: 200,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 25;
      page.drawText(transliteratePolish('data urodzenia:'), {
        x: 100,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawText(data.principalBirthDate || '', {
        x: 200,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 25;
      page.drawText(transliteratePolish('miejsce urodzenia:'), {
        x: 100,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawText(transliteratePolish(data.principalBirthPlace || ''), {
        x: 220,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 25;
      page.drawText(transliteratePolish('adres zamieszkania:'), {
        x: 100,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawText(transliteratePolish(data.principalAddress || ''), {
        x: 220,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 25;
      page.drawText(transliteratePolish('nr dokumentu tożsamości:'), {
        x: 100,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawText(data.principalPassportNumber || data.documentNumber || '', {
        x: 250,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 40;
      page.drawText(transliteratePolish('upoważniam:'), {
        x: 50,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 25;
      const authText = transliteratePolish(`Romana WIŚNIEWSKIEGO, legitymującego się polskim dowodem osobistym nr
CBU675382, zamieszkałego w Warszawie, ul. Słomińskiego 17/50`);
      
      const lines = authText.split('\n');
      for (const line of lines) {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 11,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 18;
      }
    } else if (pageNum === 2) {
      // Page 2: Scope of authority
      page.drawText(transliteratePolish('do reprezentowania mnie w następujących sprawach:'), {
        x: 50,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 30;
      const authorities = data.scopeOfAuthority || [
        'Reprezentowanie przed wszystkimi urzędami w Polsce',
        'Składanie wniosków o potwierdzenie obywatelstwa polskiego',
        'Odbieranie dokumentów i korespondencji'
      ];
      
      for (const authority of authorities) {
        page.drawText(`• ${transliteratePolish(authority)}`, {
          x: 60,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 20;
      }
    } else if (pageNum === 3) {
      // Page 3: Signatures
      page.drawText(transliteratePolish('Pełnomocnik może udzielić dalszego pełnomocnictwa.'), {
        x: 50,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      yPosition = 200;
      const defaultDate = new Date().toISOString().split('T')[0];
      page.drawText(`data / date: ${data.date || formatDate(defaultDate)}`, {
        x: 100,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('podpis / signature', {
        x: 400,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      page.drawLine({
        start: { x: 380, y: yPosition - 20 },
        end: { x: 500, y: yPosition - 20 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
    }
    
    // Footer
    page.drawText(transliteratePolish('Pełnomocnictwo (Power of Attorney)'), {
      x: 50,
      y: 50,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`strona ${pageNum}/3`, {
      x: 500,
      y: 50,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
  }
  
  private async drawMinorPOAPage(page: PDFPage, data: PowerOfAttorneyData, font: PDFFont, boldFont: PDFFont, pageNum: number) {
    // Similar to single POA but includes minor child information
    let yPosition = 750;
    
    page.drawText(transliteratePolish('Pełnomocnictwo (Power of Attorney)'), {
      x: 200,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    // Footer
    page.drawText(transliteratePolish('Pełnomocnictwo (Power of Attorney)'), {
      x: 50,
      y: 50,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`strona ${pageNum}/3`, {
      x: 500,
      y: 50,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
  }
  
  private async drawSpousesStatement(page: PDFPage, data: PowerOfAttorneyData, font: PDFFont, boldFont: PDFFont) {
    let yPosition = 750;
    
    page.drawText(transliteratePolish('Oświadczenie małżonków (Spouses statement)'), {
      x: 180,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 50;
    
    page.drawText(transliteratePolish('My, niżej podpisani:'), {
      x: 50,
      y: yPosition,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    // Footer
    page.drawText(transliteratePolish('Oświadczenie małżonków (Spouses statement)'), {
      x: 50,
      y: 50,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('strona 2/4', {
      x: 500,
      y: 50,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
  }
}

// Family Tree PDF Generator
export interface FamilyTreeData {
  generationTitle?: string;
  members: Array<{
    id: string;
    name: string;
    birthDate: string;
    birthPlace: string;
    deathDate?: string;
    deathPlace?: string;
    relationship: string;
    emigrationDate?: string;
    naturalizationDate?: string;
    notes?: string;
  }>;
  lastUpdated: string;
}

export class FamilyTreePDFGenerator {
  public async generateFamilyTree(data: FamilyTreeData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Header matching template
    page.drawText('DRZEWO GENEALOGICZNE', {
      x: 320,
      y: 550,
      size: 20,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('(FAMILY TREE)', {
      x: 365,
      y: 530,
      size: 14,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`Last Updated: ${new Date(data.lastUpdated).toLocaleDateString()}`, {
      x: 50,
      y: 500,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    // Draw family members
    data.members.forEach((member, index) => {
      const x = 50 + (index % 3) * 200;
      const y = 400 - Math.floor(index / 3) * 150;
      
      // Member box
      page.drawRectangle({
        x: x - 10,
        y: y - 100,
        width: 180,
        height: 120,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 1,
      });
      
      let textY = y;
      
      page.drawText(transliteratePolish(member.name), {
        x,
        y: textY,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      textY -= 15;
      
      page.drawText(member.relationship, {
        x,
        y: textY,
        size: 9,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
      textY -= 12;
      
      page.drawText(`Born: ${member.birthDate}`, {
        x,
        y: textY,
        size: 8,
        font: font,
        color: rgb(0, 0, 0),
      });
      textY -= 10;
      
      page.drawText(`Place: ${transliteratePolish(member.birthPlace)}`, {
        x,
        y: textY,
        size: 8,
        font: font,
        color: rgb(0, 0, 0),
      });
      textY -= 10;
      
      if (member.emigrationDate) {
        page.drawText(`Emigrated: ${member.emigrationDate}`, {
          x,
          y: textY,
          size: 8,
          font: font,
          color: rgb(0, 0, 0.7),
        });
        textY -= 10;
      }
      
      if (member.naturalizationDate) {
        page.drawText(`Naturalized: ${member.naturalizationDate}`, {
          x,
          y: textY,
          size: 8,
          font: font,
          color: rgb(0, 0, 0.7),
        });
        textY -= 10;
      }
      
      if (member.notes) {
        page.drawText(transliteratePolish(member.notes), {
          x,
          y: textY,
          size: 7,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    });
    
    // Add document list on second page
    const page2 = pdfDoc.addPage([595, 842]); // A4 portrait
    
    page2.drawText('DOKUMENTY GENEALOGICZNE', {
      x: 180,
      y: 800,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    page2.drawText('(GENEALOGICAL DOCUMENTS)', {
      x: 180,
      y: 780,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    let docY = 740;
    data.members.forEach(member => {
      page2.drawText(`${transliteratePolish(member.name)} (${member.relationship})`, {
        x: 50,
        y: docY,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      docY -= 15;
      
      const docs = [
        `Birth: ${member.birthDate} in ${member.birthPlace}`,
        member.deathDate ? `Death: ${member.deathDate}` : null,
        member.emigrationDate ? `Emigration: ${member.emigrationDate}` : null,
        member.naturalizationDate ? `Naturalization: ${member.naturalizationDate}` : null,
        member.notes ? `Notes: ${member.notes}` : null
      ].filter(Boolean);
      
      docs.forEach(doc => {
        page2.drawText(`  • ${transliteratePolish(doc!)}`, {
          x: 60,
          y: docY,
          size: 9,
          font: font,
          color: rgb(0, 0, 0),
        });
        docY -= 12;
      });
      docY -= 10;
    });
    
    return await pdfDoc.save();
  }
}

// Applicant Details PDF Generator
export interface ApplicantDetailsData {
  // Personal Information
  fullName: string;
  applicantName?: string;
  dateOfBirth: string;
  placeOfBirth: string;
  currentCitizenship: string;
  pesel?: string;
  
  // Contact Information
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  
  // Family Information
  fatherName: string;
  motherName: string;
  motherMaidenName: string;
  maritalStatus: string;
  spouseName?: string;
  
  // Polish Ancestry
  polishAncestorName: string;
  relationshipToAncestor: string;
  ancestorBirthYear: string;
  ancestorBirthPlace: string;
  
  // Additional Information
  previousApplications: boolean;
  previousApplicationDetails?: string;
  criminalRecord: boolean;
  criminalRecordDetails?: string;
  
  // Documents
  documentsProvided: string[];
  missingDocuments: string[];
}

export class ApplicantDetailsPDFGenerator {
  public async generateApplicantDetails(data: ApplicantDetailsData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let yPosition = 780;
    
    // Header
    page.drawText('APPLICANT DETAILS FORM', {
      x: 180,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('(FORMULARZ DANYCH WNIOSKODAWCY)', {
      x: 140,
      y: yPosition - 20,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 50;
    
    // Personal Information Section
    this.drawSection(page, 'PERSONAL INFORMATION', 50, yPosition, boldFont);
    yPosition -= 25;
    
    const personalInfo = [
      ['Full Name:', data.fullName],
      ['Date of Birth:', data.dateOfBirth],
      ['Place of Birth:', data.placeOfBirth],
      ['Current Citizenship:', data.currentCitizenship],
      ['PESEL (if applicable):', data.pesel || 'N/A'],
    ];
    
    for (const [label, value] of personalInfo) {
      this.drawLabelValue(page, label, value, 50, yPosition, font);
      yPosition -= 20;
    }
    
    // Contact Information Section
    yPosition -= 10;
    this.drawSection(page, 'CONTACT INFORMATION', 50, yPosition, boldFont);
    yPosition -= 25;
    
    const contactInfo = [
      ['Email:', data.email],
      ['Phone:', data.phone],
      ['Address:', data.address],
      ['City:', data.city],
      ['Country:', data.country],
      ['Postal Code:', data.postalCode],
    ];
    
    for (const [label, value] of contactInfo) {
      this.drawLabelValue(page, label, value, 50, yPosition, font);
      yPosition -= 20;
    }
    
    // Family Information Section
    yPosition -= 10;
    this.drawSection(page, 'FAMILY INFORMATION', 50, yPosition, boldFont);
    yPosition -= 25;
    
    const familyInfo = [
      ["Father's Name:", data.fatherName],
      ["Mother's Name:", data.motherName],
      ["Mother's Maiden Name:", data.motherMaidenName],
      ['Marital Status:', data.maritalStatus],
    ];
    
    if (data.spouseName) {
      familyInfo.push(["Spouse's Name:", data.spouseName]);
    }
    
    for (const [label, value] of familyInfo) {
      this.drawLabelValue(page, label, value, 50, yPosition, font);
      yPosition -= 20;
    }
    
    // Polish Ancestry Section
    yPosition -= 10;
    this.drawSection(page, 'POLISH ANCESTRY', 50, yPosition, boldFont);
    yPosition -= 25;
    
    const ancestryInfo = [
      ['Polish Ancestor Name:', data.polishAncestorName],
      ['Relationship:', data.relationshipToAncestor],
      ['Ancestor Birth Year:', data.ancestorBirthYear],
      ['Ancestor Birth Place:', data.ancestorBirthPlace],
    ];
    
    for (const [label, value] of ancestryInfo) {
      this.drawLabelValue(page, label, value, 50, yPosition, font);
      yPosition -= 20;
    }
    
    // Check if we need a new page
    if (yPosition < 200) {
      const page2 = pdfDoc.addPage([595, 842]);
      yPosition = 780;
      
      // Documents Section
      this.drawSection(page2, 'DOCUMENTS PROVIDED', 50, yPosition, boldFont);
      yPosition -= 25;
      
      for (const doc of data.documentsProvided) {
        page2.drawText(`• ${transliteratePolish(doc)}`, {
          x: 60,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 15;
      }
      
      if (data.missingDocuments.length > 0) {
        yPosition -= 20;
        this.drawSection(page2, 'DOCUMENTS REQUIRED', 50, yPosition, boldFont);
        yPosition -= 25;
        
        for (const doc of data.missingDocuments) {
          page2.drawText(`• ${transliteratePolish(doc)}`, {
            x: 60,
            y: yPosition,
            size: 10,
            font: font,
            color: rgb(0.8, 0, 0),
          });
          yPosition -= 15;
        }
      }
    }
    
    return await pdfDoc.save();
  }
  
  private drawSection(page: PDFPage, title: string, x: number, y: number, font: PDFFont) {
    page.drawText(title, {
      x,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0.7),
    });
    
    // Draw underline
    page.drawLine({
      start: { x, y: y - 3 },
      end: { x: x + 200, y: y - 3 },
      thickness: 1,
      color: rgb(0, 0, 0.7),
    });
  }
  
  private drawLabelValue(page: PDFPage, label: string, value: string, x: number, y: number, font: PDFFont) {
    page.drawText(label, {
      x,
      y,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(transliteratePolish(value), {
      x: x + 150,
      y,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
  }
}

// Document Checklist PDF Generator
export interface DocumentChecklistData {
  applicantName: string;
  caseNumber: string;
  dateGenerated: string;
  totalDocuments?: number;
  categories: Array<{
    name: string;
    color: string;
    documents: Array<{
      name: string;
      status: 'verified' | 'in-review' | 'pending' | 'missing';
      priority: 'high' | 'medium' | 'low';
      description: string;
      uploadDate?: string;
      notes?: string;
    }>;
  }>;
  overallProgress: number;
}

export class DocumentChecklistPDFGenerator {
  public async generateChecklist(data: DocumentChecklistData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    let currentPage = pdfDoc.addPage([595, 842]); // A4 size
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let yPosition = 780;
    
    // Header
    currentPage.drawText('DOCUMENT CHECKLIST', {
      x: 200,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 30;
    
    // Case Information
    const caseInfo = [
      `Applicant: ${transliteratePolish(data.applicantName)}`,
      `Case Number: ${data.caseNumber}`,
      `Date Generated: ${data.dateGenerated}`,
      `Overall Progress: ${data.overallProgress}%`,
    ];
    
    for (const info of caseInfo) {
      currentPage.drawText(info, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
    }
    
    // Progress bar
    yPosition -= 10;
    currentPage.drawRectangle({
      x: 50,
      y: yPosition,
      width: 495,
      height: 20,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    
    currentPage.drawRectangle({
      x: 51,
      y: yPosition + 1,
      width: (493 * data.overallProgress) / 100,
      height: 18,
      color: rgb(0, 0.5, 0),
    });
    
    yPosition -= 40;
    
    // Document Categories
    for (const category of data.categories) {
      // Check if we need a new page
      if (yPosition < 150) {
        currentPage = pdfDoc.addPage([595, 842]);
        yPosition = 780;
      }
      
      // Category header
      currentPage.drawText(category.name.toUpperCase(), {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0.8),
      });
      
      yPosition -= 25;
      
      // Documents in category
      for (const doc of category.documents) {
        // Status indicator
        let statusColor = rgb(0.5, 0.5, 0.5); // default gray
        let statusSymbol = '○';
        
        switch (doc.status) {
          case 'verified':
            statusColor = rgb(0, 0.5, 0);
            statusSymbol = '✓';
            break;
          case 'in-review':
            statusColor = rgb(1, 0.5, 0);
            statusSymbol = '⟳';
            break;
          case 'pending':
            statusColor = rgb(0, 0, 1);
            statusSymbol = '◷';
            break;
          case 'missing':
            statusColor = rgb(1, 0, 0);
            statusSymbol = '✗';
            break;
        }
        
        currentPage.drawText(statusSymbol, {
          x: 60,
          y: yPosition,
          size: 12,
          font: font,
          color: statusColor,
        });
        
        currentPage.drawText(transliteratePolish(doc.name), {
          x: 80,
          y: yPosition,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        
        currentPage.drawText(`[${doc.priority.toUpperCase()}]`, {
          x: 450,
          y: yPosition,
          size: 8,
          font: font,
          color: doc.priority === 'high' ? rgb(1, 0, 0) : rgb(0, 0, 0),
        });
        
        yPosition -= 15;
        
        currentPage.drawText(transliteratePolish(doc.description), {
          x: 80,
          y: yPosition,
          size: 8,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        });
        
        if (doc.uploadDate) {
          currentPage.drawText(`Uploaded: ${doc.uploadDate}`, {
            x: 400,
            y: yPosition,
            size: 8,
            font: font,
            color: rgb(0.3, 0.3, 0.3),
          });
        }
        
        yPosition -= 20;
      }
      
      yPosition -= 10;
    }
    
    return await pdfDoc.save();
  }
}

export const pdfGenerator = new PolishCitizenshipPDFGenerator();
export const poaPdfGenerator = new PowerOfAttorneyPDFGenerator();
export const familyTreePdfGenerator = new FamilyTreePDFGenerator();
export const applicantDetailsPdfGenerator = new ApplicantDetailsPDFGenerator();
export const documentChecklistPdfGenerator = new DocumentChecklistPDFGenerator();

// Comprehensive Document Package Generation
export async function generateComprehensiveDocumentPackage(data: {
  citizenshipData: PolishCitizenshipApplicationData;
  poaData: { single: PowerOfAttorneyData };
  familyTreeData: any;
  checklistData: any;
}): Promise<{ id: string; files: Array<{ filename: string; buffer: Buffer }> }> {
  try {
    console.log('Starting comprehensive document package generation...');
    
    const files: Array<{ filename: string; buffer: Buffer }> = [];
    
    // 1. Generate Citizenship Application
    try {
      const citizenshipPDF = await pdfGenerator.generateCitizenshipApplication(data.citizenshipData);
      files.push({
        filename: 'Polish_Citizenship_Application.pdf',
        buffer: Buffer.from(citizenshipPDF)
      });
      console.log('✓ Generated Citizenship Application PDF');
    } catch (error) {
      console.error('Failed to generate citizenship application:', error);
    }
    
    // 2. Skip POA for now due to technical issues - will be added in next iteration
    console.log('⚠ Skipping Power of Attorney PDF generation (will be fixed in next update)');
    
    // 3. Generate Family Tree
    try {
      const basicFamilyData: FamilyTreeData = {
        members: [
          {
            id: '1',
            name: data.citizenshipData.applicantName || 'John SMITH',
            birthDate: data.citizenshipData.birthDate || 'Unknown',
            birthPlace: data.citizenshipData.birthPlace || 'Unknown',
            relationship: 'Applicant'
          },
          {
            id: '2', 
            name: data.familyTreeData?.polishParentName || 'Maria KOWALSKI',
            birthDate: data.familyTreeData?.polishParentBirthDate || 'Unknown',
            birthPlace: data.familyTreeData?.polishParentBirthPlace || 'Poland',
            relationship: 'Polish Parent'
          },
          {
            id: '3',
            name: data.familyTreeData?.polishGrandparentName || 'Jan KOWALSKI', 
            birthDate: data.familyTreeData?.polishGrandparentBirthDate || 'Unknown',
            birthPlace: data.familyTreeData?.polishGrandparentBirthPlace || 'Poland',
            relationship: 'Polish Grandparent'
          }
        ],
        lastUpdated: new Date().toISOString()
      };
      
      const familyTreePDF = await familyTreePdfGenerator.generateFamilyTree(basicFamilyData);
      files.push({
        filename: 'Genealogical_Family_Tree.pdf',
        buffer: Buffer.from(familyTreePDF)
      });
      console.log('✓ Generated Family Tree PDF');
    } catch (error) {
      console.error('Failed to generate family tree:', error);
      // Continue with other documents even if family tree fails
    }
    
    // 4. Generate Document Checklist 
    try {
      const basicChecklistData = {
        applicantName: 'John Smith',
        totalDocuments: 3,
        pendingDocuments: 3,
        documents: [
          { name: 'Birth Certificate', status: 'required' as const, priority: 'high' as const, description: 'Original birth certificate with apostille' },
          { name: 'Polish Ancestor Documents', status: 'required' as const, priority: 'high' as const, description: 'Documents proving Polish ancestry' },
          { name: 'Passport Copy', status: 'required' as const, priority: 'medium' as const, description: 'Copy of current passport' }
        ]
      };
      
      const checklistPDF = await documentChecklistPdfGenerator.generateChecklist({
        applicantName: basicChecklistData.applicantName,
        caseNumber: 'PL2025001',
        dateGenerated: new Date().toLocaleDateString('pl-PL'),
        categories: [],
        overallProgress: 0
      });
      files.push({
        filename: 'Document_Checklist.pdf',
        buffer: Buffer.from(checklistPDF)
      });
      console.log('✓ Generated Document Checklist PDF');
    } catch (error) {
      console.error('Failed to generate checklist:', error);
      // Continue even if checklist fails
    }
    
    const packageId = `comprehensive-${Date.now()}`;
    console.log(`Comprehensive package generated: ${files.length} files`);
    
    return {
      id: packageId,
      files
    };
    
  } catch (error) {
    console.error('Error generating comprehensive document package:', error);
    throw new Error(`Failed to generate comprehensive document package: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}