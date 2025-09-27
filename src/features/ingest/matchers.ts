/**
 * Case and document slot matching heuristics
 */

export interface SlotMatch {
  key: string;
  confidence: number;
}

// Document slot keys that match the existing DocumentsTab structure
export const DOCUMENT_SLOTS = [
  'doc_birth',
  'doc_marriage', 
  'doc_naturalization',
  'doc_passport',
  'doc_death',
  'doc_residence',
  'doc_military',
  'doc_education',
  'doc_employment',
  'doc_criminal',
  'doc_other',
  'doc_misc'
] as const;

export type DocumentSlotKey = typeof DOCUMENT_SLOTS[number];

const SLOT_PATTERNS: Record<DocumentSlotKey, string[]> = {
  doc_birth: ['birth', 'urodzeni', 'urodz', 'birth_cert', 'akt_urodzenia', 'birth_certificate'],
  doc_marriage: ['marriage', 'slub', 'małżeńst', 'marriage_cert', 'akt_malzenstwa', 'wedding'],
  doc_naturalization: ['natural', 'obywatel', 'citizenship', 'citizen', 'naturaliz'],
  doc_passport: ['passport', 'paszport', 'pass', 'travel_doc'],
  doc_death: ['death', 'zgon', 'śmierć', 'smierc', 'death_cert', 'akt_zgonu'],
  doc_residence: ['residence', 'zamieszkanie', 'address', 'meldunek', 'resident'],
  doc_military: ['military', 'wojsko', 'army', 'służba', 'sluzba', 'wojskow'],
  doc_education: ['education', 'edukacja', 'school', 'university', 'diploma', 'cert'],
  doc_employment: ['employment', 'praca', 'work', 'job', 'zatrudnienie', 'employer'],
  doc_criminal: ['criminal', 'crime', 'police', 'court', 'sąd', 'sad', 'karna'],
  doc_other: ['other', 'inne', 'various', 'mixed', 'additional'],
  doc_misc: ['misc', 'miscellaneous', 'różne', 'rozne', 'general']
};

function removeDiacritics(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function tokenizeFilename(filename: string): string[] {
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  return removeDiacritics(nameWithoutExt)
    .split(/[\s_\-\(\)\[\]\.]+/)
    .filter(token => token.length > 1);
}

export function guessSlots(filename: string, mimeType: string): SlotMatch[] {
  const tokens = tokenizeFilename(filename);
  const matches: SlotMatch[] = [];
  
  for (const [slotKey, patterns] of Object.entries(SLOT_PATTERNS)) {
    let score = 0;
    let matchCount = 0;
    
    for (const pattern of patterns) {
      for (const token of tokens) {
        if (token.includes(pattern) || pattern.includes(token)) {
          score += pattern.length === token.length ? 1.0 : 0.7;
          matchCount++;
        }
      }
    }
    
    if (score > 0) {
      // Normalize confidence by number of tokens and patterns
      const confidence = Math.min(score / Math.max(tokens.length, 2), 1.0);
      
      if (confidence > 0.3) {
        matches.push({
          key: slotKey as DocumentSlotKey,
          confidence: Math.round(confidence * 100) / 100
        });
      }
    }
  }
  
  // Sort by confidence descending
  matches.sort((a, b) => b.confidence - a.confidence);
  
  // Return top 3 matches, or fallback to misc if no good matches
  if (matches.length === 0) {
    return [{ key: 'doc_misc', confidence: 0.1 }];
  }
  
  return matches.slice(0, 3);
}

export function guessCaseId(folderPath: string, availableCases: Array<{id: string, name: string, code?: string}>): string | null {
  const caseCode = extractCaseCodeFromPath(folderPath);
  if (!caseCode) return null;
  
  // Try exact case code match first
  for (const case_ of availableCases) {
    if (case_.code === caseCode) {
      return case_.id;
    }
  }
  
  // Try name patterns like LASTNAME_FIRSTNAME
  if (caseCode.includes('_')) {
    const [lastName, firstName] = caseCode.split('_');
    for (const case_ of availableCases) {
      const name = removeDiacritics(case_.name);
      if (name.includes(removeDiacritics(lastName)) && 
          name.includes(removeDiacritics(firstName))) {
        return case_.id;
      }
    }
  }
  
  return null;
}

function extractCaseCodeFromPath(path: string): string | null {
  const match = path.match(/\/CASES\/([^\/]+)\//i);
  return match ? match[1] : null;
}