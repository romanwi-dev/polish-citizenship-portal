// OBY (Obywatelstwo) Form Schema - Polish Citizenship Application
// TypeScript definitions for citizenship application form fields

export type FieldType = 
  | 'text' 
  | 'date' 
  | 'number' 
  | 'address' 
  | 'email' 
  | 'phone' 
  | 'boolean' 
  | 'select' 
  | 'textarea' 
  | 'file';

export interface OBYField {
  code: string;
  plLabel: string;
  enLabel: string;
  type: FieldType;
  aliases: string[];
  required?: boolean;
  category?: string;
  subcategory?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string;
  };
  options?: string[];
}

export interface OBYFormSchema {
  formType: string;
  formName: string;
  formNamePl: string;
  version: string;
  lastUpdated: string;
  fields: OBYField[];
  categories: string[];
}

// Main OBY Fields Definition
export const OBY_FIELDS: OBYField[] = [
  // APPLICANT PERSONAL INFORMATION
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
    code: "OBY-A-PREV-NATION",
    plLabel: "Poprzednie obywatelstwo",
    enLabel: "Previous Nationality",
    type: "text",
    category: "applicant",
    subcategory: "citizenship",
    aliases: ["poprzednie obywatelstwo", "previous nationality", "former citizenship"]
  },
  {
    code: "OBY-A-MAIDEN-NAME",
    plLabel: "Nazwisko panieńskie",
    enLabel: "Maiden Name",
    type: "text",
    category: "applicant",
    subcategory: "personal",
    aliases: ["nazwisko panieńskie", "maiden name", "birth name"]
  },
  {
    code: "OBY-A-EDUCATION",
    plLabel: "Wykształcenie",
    enLabel: "Education Level",
    type: "select",
    category: "applicant",
    subcategory: "background",
    options: ["Podstawowe", "Średnie", "Wyższe", "Doktorat"],
    aliases: ["wykształcenie", "education", "education level"]
  },
  {
    code: "OBY-A-PROFESSION",
    plLabel: "Zawód",
    enLabel: "Profession",
    type: "text",
    category: "applicant",
    subcategory: "background",
    aliases: ["zawód", "profession", "occupation"]
  },
  {
    code: "OBY-A-MARITAL-STATUS",
    plLabel: "Stan cywilny",
    enLabel: "Marital Status",
    type: "select",
    category: "applicant",
    subcategory: "personal",
    options: ["Kawaler/Panna", "Żonaty/Zamężna", "Rozwiedziony/a", "Wdowiec/Wdowa"],
    aliases: ["stan cywilny", "marital status"]
  },

  // FATHER INFORMATION
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
    code: "OBY-F-DD",
    plLabel: "Data śmierci ojca",
    enLabel: "Father Death Date",
    type: "date",
    category: "father",
    subcategory: "personal",
    aliases: ["data śmierci ojca", "father death date", "deceased father"]
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
    code: "OBY-F-PROFESSION",
    plLabel: "Zawód ojca",
    enLabel: "Father Profession",
    type: "text",
    category: "father",
    subcategory: "background",
    aliases: ["zawód ojca", "father profession", "father occupation"]
  },
  {
    code: "OBY-F-ADDR",
    plLabel: "Adres ojca",
    enLabel: "Father Address",
    type: "address",
    category: "father",
    subcategory: "contact",
    aliases: ["adres ojca", "father address"]
  },

  // MOTHER INFORMATION
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
    code: "OBY-M-DD",
    plLabel: "Data śmierci matki",
    enLabel: "Mother Death Date",
    type: "date",
    category: "mother",
    subcategory: "personal",
    aliases: ["data śmierci matki", "mother death date", "deceased mother"]
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
  {
    code: "OBY-M-PROFESSION",
    plLabel: "Zawód matki",
    enLabel: "Mother Profession",
    type: "text",
    category: "mother",
    subcategory: "background",
    aliases: ["zawód matki", "mother profession", "mother occupation"]
  },
  {
    code: "OBY-M-ADDR",
    plLabel: "Adres matki",
    enLabel: "Mother Address",
    type: "address",
    category: "mother",
    subcategory: "contact",
    aliases: ["adres matki", "mother address"]
  },
  {
    code: "OBY-M-MAIDEN-NAME",
    plLabel: "Nazwisko panieńskie matki",
    enLabel: "Mother Maiden Name",
    type: "text",
    category: "mother",
    subcategory: "personal",
    aliases: ["nazwisko panieńskie matki", "mother maiden name"]
  },

  // PATERNAL GRANDFATHER
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
    code: "OBY-PGF-BD",
    plLabel: "Data urodzenia dziadka ze strony ojca",
    enLabel: "Paternal Grandfather Birth Date",
    type: "date",
    category: "paternal-grandfather",
    subcategory: "personal",
    aliases: ["data urodzenia dziadka ojca", "paternal grandfather birth date"]
  },
  {
    code: "OBY-PGF-BP",
    plLabel: "Miejsce urodzenia dziadka ze strony ojca",
    enLabel: "Paternal Grandfather Birth Place",
    type: "address",
    category: "paternal-grandfather",
    subcategory: "personal",
    aliases: ["miejsce urodzenia dziadka ojca", "paternal grandfather birth place"]
  },
  {
    code: "OBY-PGF-DD",
    plLabel: "Data śmierci dziadka ze strony ojca",
    enLabel: "Paternal Grandfather Death Date",
    type: "date",
    category: "paternal-grandfather",
    subcategory: "personal",
    aliases: ["data śmierci dziadka ojca", "paternal grandfather death date"]
  },
  {
    code: "OBY-PGF-NATION",
    plLabel: "Obywatelstwo dziadka ze strony ojca",
    enLabel: "Paternal Grandfather Nationality",
    type: "text",
    category: "paternal-grandfather",
    subcategory: "citizenship",
    aliases: ["obywatelstwo dziadka ojca", "paternal grandfather nationality"]
  },

  // PATERNAL GRANDMOTHER
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
    code: "OBY-PGM-BD",
    plLabel: "Data urodzenia babci ze strony ojca",
    enLabel: "Paternal Grandmother Birth Date",
    type: "date",
    category: "paternal-grandmother",
    subcategory: "personal",
    aliases: ["data urodzenia babci ojca", "paternal grandmother birth date"]
  },
  {
    code: "OBY-PGM-BP",
    plLabel: "Miejsce urodzenia babci ze strony ojca",
    enLabel: "Paternal Grandmother Birth Place",
    type: "address",
    category: "paternal-grandmother",
    subcategory: "personal",
    aliases: ["miejsce urodzenia babci ojca", "paternal grandmother birth place"]
  },
  {
    code: "OBY-PGM-DD",
    plLabel: "Data śmierci babci ze strony ojca",
    enLabel: "Paternal Grandmother Death Date",
    type: "date",
    category: "paternal-grandmother",
    subcategory: "personal",
    aliases: ["data śmierci babci ojca", "paternal grandmother death date"]
  },
  {
    code: "OBY-PGM-NATION",
    plLabel: "Obywatelstwo babci ze strony ojca",
    enLabel: "Paternal Grandmother Nationality",
    type: "text",
    category: "paternal-grandmother",
    subcategory: "citizenship",
    aliases: ["obywatelstwo babci ojca", "paternal grandmother nationality"]
  },

  // MATERNAL GRANDFATHER
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
    code: "OBY-MGF-BD",
    plLabel: "Data urodzenia dziadka ze strony matki",
    enLabel: "Maternal Grandfather Birth Date",
    type: "date",
    category: "maternal-grandfather",
    subcategory: "personal",
    aliases: ["data urodzenia dziadka matki", "maternal grandfather birth date"]
  },
  {
    code: "OBY-MGF-BP",
    plLabel: "Miejsce urodzenia dziadka ze strony matki",
    enLabel: "Maternal Grandfather Birth Place",
    type: "address",
    category: "maternal-grandfather",
    subcategory: "personal",
    aliases: ["miejsce urodzenia dziadka matki", "maternal grandfather birth place"]
  },
  {
    code: "OBY-MGF-DD",
    plLabel: "Data śmierci dziadka ze strony matki",
    enLabel: "Maternal Grandfather Death Date",
    type: "date",
    category: "maternal-grandfather",
    subcategory: "personal",
    aliases: ["data śmierci dziadka matki", "maternal grandfather death date"]
  },
  {
    code: "OBY-MGF-NATION",
    plLabel: "Obywatelstwo dziadka ze strony matki",
    enLabel: "Maternal Grandfather Nationality",
    type: "text",
    category: "maternal-grandfather",
    subcategory: "citizenship",
    aliases: ["obywatelstwo dziadka matki", "maternal grandfather nationality"]
  },

  // MATERNAL GRANDMOTHER
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
    code: "OBY-MGM-BD",
    plLabel: "Data urodzenia babci ze strony matki",
    enLabel: "Maternal Grandmother Birth Date",
    type: "date",
    category: "maternal-grandmother",
    subcategory: "personal",
    aliases: ["data urodzenia babci matki", "maternal grandmother birth date"]
  },
  {
    code: "OBY-MGM-BP",
    plLabel: "Miejsce urodzenia babci ze strony matki",
    enLabel: "Maternal Grandmother Birth Place",
    type: "address",
    category: "maternal-grandmother",
    subcategory: "personal",
    aliases: ["miejsce urodzenia babci matki", "maternal grandmother birth place"]
  },
  {
    code: "OBY-MGM-DD",
    plLabel: "Data śmierci babci ze strony matki",
    enLabel: "Maternal Grandmother Death Date",
    type: "date",
    category: "maternal-grandmother",
    subcategory: "personal",
    aliases: ["data śmierci babci matki", "maternal grandmother death date"]
  },
  {
    code: "OBY-MGM-NATION",
    plLabel: "Obywatelstwo babci ze strony matki",
    enLabel: "Maternal Grandmother Nationality",
    type: "text",
    category: "maternal-grandmother",
    subcategory: "citizenship",
    aliases: ["obywatelstwo babci matki", "maternal grandmother nationality"]
  },

  // SPOUSE INFORMATION
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
    code: "OBY-SPOUSE-BD",
    plLabel: "Data urodzenia małżonka",
    enLabel: "Spouse Birth Date",
    type: "date",
    category: "spouse",
    subcategory: "personal",
    aliases: ["data urodzenia małżonka", "spouse birth date"]
  },
  {
    code: "OBY-SPOUSE-BP",
    plLabel: "Miejsce urodzenia małżonka",
    enLabel: "Spouse Birth Place",
    type: "address",
    category: "spouse",
    subcategory: "personal",
    aliases: ["miejsce urodzenia małżonka", "spouse birth place"]
  },
  {
    code: "OBY-SPOUSE-NATION",
    plLabel: "Obywatelstwo małżonka",
    enLabel: "Spouse Nationality",
    type: "text",
    category: "spouse",
    subcategory: "citizenship",
    aliases: ["obywatelstwo małżonka", "spouse nationality"]
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
    code: "OBY-MARRIAGE-CERT",
    plLabel: "Numer aktu ślubu",
    enLabel: "Marriage Certificate Number",
    type: "text",
    category: "marriage",
    subcategory: "documents",
    aliases: ["akt ślubu", "marriage certificate", "numer aktu ślubu"]
  },

  // CHILDREN INFORMATION
  {
    code: "OBY-CHILDREN-COUNT",
    plLabel: "Liczba dzieci",
    enLabel: "Number of Children",
    type: "number",
    category: "children",
    subcategory: "general",
    aliases: ["liczba dzieci", "number of children", "dzieci"]
  },
  {
    code: "OBY-CHILD1-GN",
    plLabel: "Imiona pierwszego dziecka",
    enLabel: "First Child Given Names",
    type: "text",
    category: "children",
    subcategory: "child1",
    aliases: ["pierwsze dziecko", "first child"]
  },
  {
    code: "OBY-CHILD1-SN",
    plLabel: "Nazwisko pierwszego dziecka",
    enLabel: "First Child Surname",
    type: "text",
    category: "children",
    subcategory: "child1",
    aliases: ["nazwisko pierwszego dziecka", "first child surname"]
  },
  {
    code: "OBY-CHILD1-BD",
    plLabel: "Data urodzenia pierwszego dziecka",
    enLabel: "First Child Birth Date",
    type: "date",
    category: "children",
    subcategory: "child1",
    aliases: ["data urodzenia pierwszego dziecka", "first child birth date"]
  },
  {
    code: "OBY-CHILD2-GN",
    plLabel: "Imiona drugiego dziecka",
    enLabel: "Second Child Given Names",
    type: "text",
    category: "children",
    subcategory: "child2",
    aliases: ["drugie dziecko", "second child"]
  },
  {
    code: "OBY-CHILD2-SN",
    plLabel: "Nazwisko drugiego dziecka",
    enLabel: "Second Child Surname",
    type: "text",
    category: "children",
    subcategory: "child2",
    aliases: ["nazwisko drugiego dziecka", "second child surname"]
  },
  {
    code: "OBY-CHILD2-BD",
    plLabel: "Data urodzenia drugiego dziecka",
    enLabel: "Second Child Birth Date",
    type: "date",
    category: "children",
    subcategory: "child2",
    aliases: ["data urodzenia drugiego dziecka", "second child birth date"]
  },

  // RESIDENCE HISTORY
  {
    code: "OBY-RESIDENCE-CURRENT",
    plLabel: "Obecne miejsce zamieszkania",
    enLabel: "Current Residence",
    type: "address",
    category: "residence",
    subcategory: "current",
    aliases: ["obecne zamieszkanie", "current residence", "present address"]
  },
  {
    code: "OBY-RESIDENCE-FROM",
    plLabel: "Data zamieszkania od",
    enLabel: "Residence From Date",
    type: "date",
    category: "residence",
    subcategory: "current",
    aliases: ["zamieszkanie od", "residence from", "living since"]
  },
  {
    code: "OBY-RESIDENCE-PREV1",
    plLabel: "Poprzednie miejsce zamieszkania 1",
    enLabel: "Previous Residence 1",
    type: "address",
    category: "residence",
    subcategory: "previous",
    aliases: ["poprzednie zamieszkanie", "previous residence", "former address"]
  },
  {
    code: "OBY-RESIDENCE-PREV1-FROM",
    plLabel: "Poprzednie zamieszkanie 1 - od",
    enLabel: "Previous Residence 1 - From",
    type: "date",
    category: "residence",
    subcategory: "previous",
    aliases: ["poprzednie zamieszkanie od", "previous residence from"]
  },
  {
    code: "OBY-RESIDENCE-PREV1-TO",
    plLabel: "Poprzednie zamieszkanie 1 - do",
    enLabel: "Previous Residence 1 - To",
    type: "date",
    category: "residence",
    subcategory: "previous",
    aliases: ["poprzednie zamieszkanie do", "previous residence to"]
  },
  {
    code: "OBY-RESIDENCE-PREV2",
    plLabel: "Poprzednie miejsce zamieszkania 2",
    enLabel: "Previous Residence 2",
    type: "address",
    category: "residence",
    subcategory: "previous",
    aliases: ["drugie poprzednie zamieszkanie", "second previous residence"]
  },
  {
    code: "OBY-RESIDENCE-PREV2-FROM",
    plLabel: "Poprzednie zamieszkanie 2 - od",
    enLabel: "Previous Residence 2 - From",
    type: "date",
    category: "residence",
    subcategory: "previous",
    aliases: ["drugie poprzednie zamieszkanie od", "second previous residence from"]
  },
  {
    code: "OBY-RESIDENCE-PREV2-TO",
    plLabel: "Poprzednie zamieszkanie 2 - do",
    enLabel: "Previous Residence 2 - To",
    type: "date",
    category: "residence",
    subcategory: "previous",
    aliases: ["drugie poprzednie zamieszkanie do", "second previous residence to"]
  },

  // MILITARY SERVICE
  {
    code: "OBY-MILITARY-STATUS",
    plLabel: "Status służby wojskowej",
    enLabel: "Military Service Status",
    type: "select",
    category: "military",
    subcategory: "service",
    options: ["Nie służył", "Odbył służbę", "Zwolniony", "Nie dotyczy"],
    aliases: ["służba wojskowa", "military service", "wojsko"]
  },
  {
    code: "OBY-MILITARY-FROM",
    plLabel: "Służba wojskowa od",
    enLabel: "Military Service From",
    type: "date",
    category: "military",
    subcategory: "service",
    aliases: ["służba od", "military from", "service from"]
  },
  {
    code: "OBY-MILITARY-TO",
    plLabel: "Służba wojskowa do",
    enLabel: "Military Service To",
    type: "date",
    category: "military",
    subcategory: "service",
    aliases: ["służba do", "military to", "service to"]
  },
  {
    code: "OBY-MILITARY-UNIT",
    plLabel: "Jednostka wojskowa",
    enLabel: "Military Unit",
    type: "text",
    category: "military",
    subcategory: "service",
    aliases: ["jednostka", "military unit", "unit"]
  },
  {
    code: "OBY-MILITARY-RANK",
    plLabel: "Stopień wojskowy",
    enLabel: "Military Rank",
    type: "text",
    category: "military",
    subcategory: "service",
    aliases: ["stopień", "rank", "military rank"]
  },

  // CRIMINAL RECORD
  {
    code: "OBY-CRIMINAL-RECORD",
    plLabel: "Skazania karne",
    enLabel: "Criminal Record",
    type: "boolean",
    category: "legal",
    subcategory: "criminal",
    aliases: ["kary", "skazania", "criminal record", "convictions"]
  },
  {
    code: "OBY-CRIMINAL-DETAILS",
    plLabel: "Szczegóły skazań",
    enLabel: "Criminal Record Details",
    type: "textarea",
    category: "legal",
    subcategory: "criminal",
    aliases: ["szczegóły kar", "conviction details", "criminal details"]
  },
  {
    code: "OBY-PENDING-CASES",
    plLabel: "Toczące się postępowania",
    enLabel: "Pending Legal Cases",
    type: "boolean",
    category: "legal",
    subcategory: "pending",
    aliases: ["postępowania", "pending cases", "legal proceedings"]
  },
  {
    code: "OBY-PENDING-DETAILS",
    plLabel: "Szczegóły postępowań",
    enLabel: "Pending Cases Details",
    type: "textarea",
    category: "legal",
    subcategory: "pending",
    aliases: ["szczegóły postępowań", "pending details", "case details"]
  },

  // EMPLOYMENT HISTORY
  {
    code: "OBY-EMPLOYMENT-CURRENT",
    plLabel: "Obecne zatrudnienie",
    enLabel: "Current Employment",
    type: "text",
    category: "employment",
    subcategory: "current",
    aliases: ["obecna praca", "current job", "employment"]
  },
  {
    code: "OBY-EMPLOYMENT-EMPLOYER",
    plLabel: "Obecny pracodawca",
    enLabel: "Current Employer",
    type: "text",
    category: "employment",
    subcategory: "current",
    aliases: ["pracodawca", "employer", "company"]
  },
  {
    code: "OBY-EMPLOYMENT-FROM",
    plLabel: "Zatrudnienie od",
    enLabel: "Employment From",
    type: "date",
    category: "employment",
    subcategory: "current",
    aliases: ["praca od", "employed since", "job from"]
  },
  {
    code: "OBY-EMPLOYMENT-PREV1",
    plLabel: "Poprzednie zatrudnienie 1",
    enLabel: "Previous Employment 1",
    type: "text",
    category: "employment",
    subcategory: "previous",
    aliases: ["poprzednia praca", "previous job", "former employment"]
  },
  {
    code: "OBY-EMPLOYMENT-PREV1-EMPLOYER",
    plLabel: "Poprzedni pracodawca 1",
    enLabel: "Previous Employer 1",
    type: "text",
    category: "employment",
    subcategory: "previous",
    aliases: ["poprzedni pracodawca", "previous employer", "former employer"]
  },
  {
    code: "OBY-EMPLOYMENT-PREV1-FROM",
    plLabel: "Poprzednie zatrudnienie 1 - od",
    enLabel: "Previous Employment 1 - From",
    type: "date",
    category: "employment",
    subcategory: "previous",
    aliases: ["poprzednia praca od", "previous job from"]
  },
  {
    code: "OBY-EMPLOYMENT-PREV1-TO",
    plLabel: "Poprzednie zatrudnienie 1 - do",
    enLabel: "Previous Employment 1 - To",
    type: "date",
    category: "employment",
    subcategory: "previous",
    aliases: ["poprzednia praca do", "previous job to"]
  },

  // EDUCATION HISTORY
  {
    code: "OBY-EDUCATION-HIGHEST",
    plLabel: "Najwyższe wykształcenie",
    enLabel: "Highest Education",
    type: "text",
    category: "education",
    subcategory: "highest",
    aliases: ["wykształcenie", "education", "degree"]
  },
  {
    code: "OBY-EDUCATION-SCHOOL",
    plLabel: "Szkoła/Uczelnia",
    enLabel: "School/University",
    type: "text",
    category: "education",
    subcategory: "highest",
    aliases: ["szkoła", "uczelnia", "university", "school"]
  },
  {
    code: "OBY-EDUCATION-FIELD",
    plLabel: "Kierunek studiów",
    enLabel: "Field of Study",
    type: "text",
    category: "education",
    subcategory: "highest",
    aliases: ["kierunek", "field of study", "major"]
  },
  {
    code: "OBY-EDUCATION-YEAR",
    plLabel: "Rok ukończenia",
    enLabel: "Graduation Year",
    type: "number",
    category: "education",
    subcategory: "highest",
    aliases: ["rok ukończenia", "graduation year", "completed"]
  },

  // TRAVEL HISTORY
  {
    code: "OBY-TRAVEL-POLAND-VISITS",
    plLabel: "Wizyty w Polsce",
    enLabel: "Visits to Poland",
    type: "number",
    category: "travel",
    subcategory: "poland",
    aliases: ["wizyty w polsce", "poland visits", "trips to poland"]
  },
  {
    code: "OBY-TRAVEL-POLAND-LAST",
    plLabel: "Ostatnia wizyta w Polsce",
    enLabel: "Last Visit to Poland",
    type: "date",
    category: "travel",
    subcategory: "poland",
    aliases: ["ostatnia wizyta", "last visit", "recent trip"]
  },
  {
    code: "OBY-TRAVEL-POLAND-DURATION",
    plLabel: "Czas pobytu w Polsce",
    enLabel: "Duration of Stay in Poland",
    type: "text",
    category: "travel",
    subcategory: "poland",
    aliases: ["czas pobytu", "duration", "length of stay"]
  },
  {
    code: "OBY-TRAVEL-POLAND-PURPOSE",
    plLabel: "Cel wizyt w Polsce",
    enLabel: "Purpose of Poland Visits",
    type: "text",
    category: "travel",
    subcategory: "poland",
    aliases: ["cel wizyty", "purpose", "reason for visit"]
  },

  // LANGUAGE SKILLS
  {
    code: "OBY-LANGUAGE-POLISH",
    plLabel: "Znajomość języka polskiego",
    enLabel: "Polish Language Skills",
    type: "select",
    category: "language",
    subcategory: "polish",
    options: ["Podstawowa", "Średnia", "Dobra", "Bardzo dobra", "Ojczysty"],
    aliases: ["polski", "polish language", "język polski"]
  },
  {
    code: "OBY-LANGUAGE-POLISH-CERT",
    plLabel: "Certyfikat języka polskiego",
    enLabel: "Polish Language Certificate",
    type: "text",
    category: "language",
    subcategory: "polish",
    aliases: ["certyfikat polskiego", "polish certificate", "language certificate"]
  },
  {
    code: "OBY-LANGUAGE-OTHER1",
    plLabel: "Inny język 1",
    enLabel: "Other Language 1",
    type: "text",
    category: "language",
    subcategory: "other",
    aliases: ["inny język", "other language", "foreign language"]
  },
  {
    code: "OBY-LANGUAGE-OTHER1-LEVEL",
    plLabel: "Poziom innego języka 1",
    enLabel: "Other Language 1 Level",
    type: "select",
    category: "language",
    subcategory: "other",
    options: ["Podstawowy", "Średni", "Dobry", "Bardzo dobry", "Ojczysty"],
    aliases: ["poziom języka", "language level"]
  },
  {
    code: "OBY-LANGUAGE-OTHER2",
    plLabel: "Inny język 2",
    enLabel: "Other Language 2",
    type: "text",
    category: "language",
    subcategory: "other",
    aliases: ["drugi język", "second language"]
  },
  {
    code: "OBY-LANGUAGE-OTHER2-LEVEL",
    plLabel: "Poziom innego języka 2",
    enLabel: "Other Language 2 Level",
    type: "select",
    category: "language",
    subcategory: "other",
    options: ["Podstawowy", "Średni", "Dobry", "Bardzo dobry", "Ojczysty"],
    aliases: ["poziom drugiego języka", "second language level"]
  },

  // POLISH CONNECTIONS
  {
    code: "OBY-POLISH-RELATIVES",
    plLabel: "Krewni w Polsce",
    enLabel: "Relatives in Poland",
    type: "boolean",
    category: "connections",
    subcategory: "relatives",
    aliases: ["krewni w polsce", "relatives poland", "family in poland"]
  },
  {
    code: "OBY-POLISH-RELATIVES-DETAILS",
    plLabel: "Szczegóły krewnych w Polsce",
    enLabel: "Polish Relatives Details",
    type: "textarea",
    category: "connections",
    subcategory: "relatives",
    aliases: ["szczegóły krewnych", "relatives details", "family details"]
  },
  {
    code: "OBY-POLISH-ORGANIZATIONS",
    plLabel: "Organizacje polskie",
    enLabel: "Polish Organizations",
    type: "text",
    category: "connections",
    subcategory: "organizations",
    aliases: ["organizacje", "polish organizations", "associations"]
  },
  {
    code: "OBY-POLISH-CULTURE",
    plLabel: "Związek z kulturą polską",
    enLabel: "Connection to Polish Culture",
    type: "textarea",
    category: "connections",
    subcategory: "culture",
    aliases: ["kultura polska", "polish culture", "cultural connection"]
  },

  // REASON FOR APPLICATION
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
    code: "OBY-REASON-FAMILY",
    plLabel: "Powody rodzinne",
    enLabel: "Family Reasons",
    type: "textarea",
    category: "application",
    subcategory: "reason",
    aliases: ["powody rodzinne", "family reasons", "family ties"]
  },
  {
    code: "OBY-REASON-PROFESSIONAL",
    plLabel: "Powody zawodowe",
    enLabel: "Professional Reasons",
    type: "textarea",
    category: "application",
    subcategory: "reason",
    aliases: ["powody zawodowe", "professional reasons", "career"]
  },
  {
    code: "OBY-REASON-CULTURAL",
    plLabel: "Powody kulturowe",
    enLabel: "Cultural Reasons",
    type: "textarea",
    category: "application",
    subcategory: "reason",
    aliases: ["powody kulturowe", "cultural reasons", "heritage"]
  },

  // DOCUMENTS
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
    code: "OBY-DOC-FATHER-BIRTH",
    plLabel: "Akt urodzenia ojca",
    enLabel: "Father Birth Certificate",
    type: "file",
    category: "documents",
    subcategory: "father",
    aliases: ["akt urodzenia ojca", "father birth certificate"]
  },
  {
    code: "OBY-DOC-MOTHER-BIRTH",
    plLabel: "Akt urodzenia matki",
    enLabel: "Mother Birth Certificate",
    type: "file",
    category: "documents",
    subcategory: "mother",
    aliases: ["akt urodzenia matki", "mother birth certificate"]
  },
  {
    code: "OBY-DOC-MARRIAGE-CERT",
    plLabel: "Akt ślubu rodziców",
    enLabel: "Parents Marriage Certificate",
    type: "file",
    category: "documents",
    subcategory: "parents",
    aliases: ["akt ślubu rodziców", "parents marriage certificate"]
  },
  {
    code: "OBY-DOC-GRANDPARENTS-BIRTH",
    plLabel: "Akty urodzenia dziadków",
    enLabel: "Grandparents Birth Certificates",
    type: "file",
    category: "documents",
    subcategory: "grandparents",
    aliases: ["akty urodzenia dziadków", "grandparents birth certificates"]
  },
  {
    code: "OBY-DOC-POLISH-RECORDS",
    plLabel: "Polskie dokumenty metrykalne",
    enLabel: "Polish Civil Records",
    type: "file",
    category: "documents",
    subcategory: "polish",
    aliases: ["dokumenty polskie", "polish records", "civil records"]
  },
  {
    code: "OBY-DOC-CRIMINAL-RECORD",
    plLabel: "Zaświadczenie o niekaralności",
    enLabel: "Criminal Record Certificate",
    type: "file",
    category: "documents",
    subcategory: "legal",
    aliases: ["niekaralność", "criminal record", "police clearance"]
  },
  {
    code: "OBY-DOC-RESIDENCE-CERT",
    plLabel: "Zaświadczenie o zameldowaniu",
    enLabel: "Residence Certificate",
    type: "file",
    category: "documents",
    subcategory: "residence",
    aliases: ["zameldowanie", "residence certificate", "address registration"]
  },
  {
    code: "OBY-DOC-PHOTOS",
    plLabel: "Zdjęcia",
    enLabel: "Photos",
    type: "file",
    required: true,
    category: "documents",
    subcategory: "general",
    aliases: ["zdjęcia", "photos", "passport photos"]
  },

  // APPLICATION DETAILS
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
  },
  {
    code: "OBY-APP-OFFICE",
    plLabel: "Urząd",
    enLabel: "Office",
    type: "text",
    category: "application",
    subcategory: "details",
    aliases: ["urząd", "office", "authority"]
  },
  {
    code: "OBY-APP-NUMBER",
    plLabel: "Numer wniosku",
    enLabel: "Application Number",
    type: "text",
    category: "application",
    subcategory: "details",
    aliases: ["numer wniosku", "application number", "reference number"]
  },
  {
    code: "OBY-APP-STATUS",
    plLabel: "Status wniosku",
    enLabel: "Application Status",
    type: "select",
    category: "application",
    subcategory: "status",
    options: ["Przygotowywany", "Złożony", "W trakcie", "Zatwierdzony", "Odrzucony"],
    aliases: ["status", "application status", "current status"]
  },
  {
    code: "OBY-APP-FEE",
    plLabel: "Opłata",
    enLabel: "Application Fee",
    type: "number",
    category: "application",
    subcategory: "payment",
    aliases: ["opłata", "fee", "application fee"]
  },
  {
    code: "OBY-APP-FEE-PAID",
    plLabel: "Opłata uiszczona",
    enLabel: "Fee Paid",
    type: "boolean",
    category: "application",
    subcategory: "payment",
    aliases: ["opłata uiszczona", "fee paid", "payment completed"]
  },
  {
    code: "OBY-APP-NOTES",
    plLabel: "Uwagi",
    enLabel: "Notes",
    type: "textarea",
    category: "application",
    subcategory: "details",
    aliases: ["uwagi", "notes", "comments", "remarks"]
  },
  {
    code: "OBY-APP-LAWYER",
    plLabel: "Pełnomocnik",
    enLabel: "Legal Representative",
    type: "text",
    category: "application",
    subcategory: "representation",
    aliases: ["pełnomocnik", "lawyer", "legal representative", "attorney"]
  },
  {
    code: "OBY-APP-LAWYER-LICENSE",
    plLabel: "Numer licencji pełnomocnika",
    enLabel: "Lawyer License Number",
    type: "text",
    category: "application",
    subcategory: "representation",
    aliases: ["licencja pełnomocnika", "lawyer license", "attorney license"]
  }
];

// Form categories
export const OBY_CATEGORIES = [
  "applicant",
  "father", 
  "mother",
  "paternal-grandfather",
  "paternal-grandmother", 
  "maternal-grandfather",
  "maternal-grandmother",
  "spouse",
  "marriage", 
  "children",
  "residence",
  "military",
  "legal",
  "employment", 
  "education",
  "travel",
  "language",
  "connections",
  "application",
  "documents"
];

// Default form schema
export const OBY_SCHEMA: OBYFormSchema = {
  formType: "OBY",
  formName: "Polish Citizenship Application",
  formNamePl: "Wniosek o nadanie obywatelstwa polskiego",
  version: "2.0.0",
  lastUpdated: new Date().toISOString(),
  fields: OBY_FIELDS,
  categories: OBY_CATEGORIES
};

export default OBY_SCHEMA;