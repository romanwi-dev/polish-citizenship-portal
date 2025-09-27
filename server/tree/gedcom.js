/**
 * GEDCOM Parser for Family Tree System
 * Parses GEDCOM files and converts them to tree.json format
 */

/**
 * Parse GEDCOM content into structured data
 * @param {string} gedcomContent - Raw GEDCOM file content
 * @returns {Object} Parsed GEDCOM data with individuals and families
 */
export function parseGedcom(gedcomContent) {
  if (!gedcomContent || typeof gedcomContent !== 'string') {
    throw new Error('Invalid GEDCOM content');
  }

  const lines = gedcomContent.split('\n').map(line => line.trim()).filter(line => line);
  const individuals = new Map();
  const families = new Map();
  
  let currentRecord = null;
  let currentSubRecord = null;
  
  for (const line of lines) {
    const match = line.match(/^(\d+)\s+([@\w]+)?\s*(.*)$/);
    if (!match) continue;
    
    const [, level, tag, value] = match;
    const levelNum = parseInt(level, 10);
    
    if (levelNum === 0) {
      // Start of new record
      if (tag && tag.startsWith('@') && tag.endsWith('@')) {
        // Record with ID like @I1@ INDI or @F1@ FAM
        const id = tag;
        const type = value;
        
        if (type === 'INDI') {
          currentRecord = { id, type: 'INDI', raw: [] };
          individuals.set(id, currentRecord);
        } else if (type === 'FAM') {
          currentRecord = { id, type: 'FAM', raw: [] };
          families.set(id, currentRecord);
        } else {
          currentRecord = null;
        }
      } else {
        currentRecord = null;
      }
      currentSubRecord = null;
    } else if (currentRecord && levelNum === 1) {
      // Level 1 tag under current record
      currentSubRecord = { level: levelNum, tag, value, children: [] };
      currentRecord.raw.push(currentSubRecord);
    } else if (currentSubRecord && levelNum === 2) {
      // Level 2 tag under current level 1 tag
      currentSubRecord.children.push({ level: levelNum, tag, value });
    }
  }
  
  // Parse individuals
  const parsedIndividuals = new Map();
  for (const [id, record] of individuals) {
    parsedIndividuals.set(id, parseIndividual(record));
  }
  
  // Parse families
  const parsedFamilies = new Map();
  for (const [id, record] of families) {
    parsedFamilies.set(id, parseFamily(record));
  }
  
  return {
    individuals: parsedIndividuals,
    families: parsedFamilies,
    metadata: {
      totalIndividuals: parsedIndividuals.size,
      totalFamilies: parsedFamilies.size,
      parsedAt: new Date().toISOString()
    }
  };
}

/**
 * Parse individual record from GEDCOM
 * @param {Object} record - Raw individual record
 * @returns {Object} Parsed individual data
 */
function parseIndividual(record) {
  const individual = {
    id: record.id,
    name: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    birthPlace: '',
    deathDate: '',
    deathPlace: '',
    sex: '',
    families: []
  };
  
  for (const tag of record.raw) {
    switch (tag.tag) {
      case 'NAME':
        individual.name = tag.value;
        // Parse name - surname is typically in slashes
        const nameMatch = tag.value.match(/^(.*?)\s*\/(.*)\/\s*(.*)$/);
        if (nameMatch) {
          individual.firstName = nameMatch[1].trim();
          individual.lastName = nameMatch[2].trim();
          individual.name = `${individual.firstName} ${individual.lastName}`.trim();
        } else {
          // Fallback - split on spaces
          const nameParts = tag.value.split(/\s+/);
          if (nameParts.length >= 2) {
            individual.firstName = nameParts.slice(0, -1).join(' ');
            individual.lastName = nameParts[nameParts.length - 1];
          } else {
            individual.firstName = tag.value;
          }
          individual.name = tag.value;
        }
        break;
        
      case 'SEX':
        individual.sex = tag.value;
        break;
        
      case 'BIRT':
        // Birth event - check children for DATE and PLAC
        for (const child of tag.children) {
          if (child.tag === 'DATE') {
            individual.birthDate = child.value;
          } else if (child.tag === 'PLAC') {
            individual.birthPlace = child.value;
          }
        }
        break;
        
      case 'DEAT':
        // Death event - check children for DATE and PLAC
        for (const child of tag.children) {
          if (child.tag === 'DATE') {
            individual.deathDate = child.value;
          } else if (child.tag === 'PLAC') {
            individual.deathPlace = child.value;
          }
        }
        break;
        
      case 'FAMS':
      case 'FAMC':
        // Family relationships
        individual.families.push({
          type: tag.tag,
          familyId: tag.value
        });
        break;
    }
  }
  
  return individual;
}

/**
 * Parse family record from GEDCOM
 * @param {Object} record - Raw family record
 * @returns {Object} Parsed family data
 */
function parseFamily(record) {
  const family = {
    id: record.id,
    husband: '',
    wife: '',
    children: [],
    marriageDate: '',
    marriagePlace: ''
  };
  
  for (const tag of record.raw) {
    switch (tag.tag) {
      case 'HUSB':
        family.husband = tag.value;
        break;
      case 'WIFE':
        family.wife = tag.value;
        break;
      case 'CHIL':
        family.children.push(tag.value);
        break;
      case 'MARR':
        // Marriage event - check children for DATE and PLAC
        for (const child of tag.children) {
          if (child.tag === 'DATE') {
            family.marriageDate = child.value;
          } else if (child.tag === 'PLAC') {
            family.marriagePlace = child.value;
          }
        }
        break;
    }
  }
  
  return family;
}

/**
 * Convert parsed GEDCOM data to tree.json format
 * @param {Object} gedcomData - Parsed GEDCOM data from parseGedcom()
 * @returns {Object} Tree data in tree.json format
 */
export function toTreeJson(gedcomData) {
  const { individuals, families } = gedcomData;
  
  // Find the root/proband person (typically the first individual or one with specific criteria)
  let rootPerson = null;
  const allPersons = Array.from(individuals.values());
  
  // Try to find a good root person - prefer someone who is a child in a family (has FAMC)
  rootPerson = allPersons.find(person => 
    person.families.some(f => f.type === 'FAMC')
  );
  
  // If no child found, use the first person
  if (!rootPerson && allPersons.length > 0) {
    rootPerson = allPersons[0];
  }
  
  if (!rootPerson) {
    throw new Error('No individuals found in GEDCOM file');
  }
  
  // Convert individuals to tree format with generation calculation
  const persons = [];
  const personToGeneration = new Map();
  
  // Start with root person at generation 0
  calculateGenerations(rootPerson.id, 0, individuals, families, personToGeneration);
  
  // Convert all individuals to tree format
  for (const individual of individuals.values()) {
    const generation = personToGeneration.get(individual.id) || 0;
    const relation = determineRelation(individual.id, rootPerson.id, individuals, families);
    
    persons.push({
      id: individual.id,
      name: individual.name || `${individual.firstName} ${individual.lastName}`.trim(),
      birthDate: individual.birthDate || '',
      birthPlace: individual.birthPlace || '',
      deathDate: individual.deathDate || '',
      deathPlace: individual.deathPlace || '',
      sex: individual.sex || '',
      relation: relation,
      generation: generation,
      originalId: individual.id
    });
  }
  
  // Generate relationships array
  const relationships = [];
  for (const family of families.values()) {
    if (family.husband && family.wife) {
      relationships.push({
        from: family.husband,
        to: family.wife,
        type: 'spouse'
      });
    }
    
    // Parent-child relationships
    const parents = [family.husband, family.wife].filter(Boolean);
    for (const parent of parents) {
      for (const child of family.children) {
        relationships.push({
          from: parent,
          to: child,
          type: 'parent'
        });
      }
    }
  }
  
  // Generate lineage string
  const lineage = generateLineageString(rootPerson, persons, families);
  
  return {
    persons: persons,
    relationships: relationships,
    lineage: lineage,
    metadata: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      source: 'GEDCOM Import',
      rootPersonId: rootPerson.id,
      totalPersons: persons.length,
      totalRelationships: relationships.length,
      originalData: {
        totalIndividuals: gedcomData.metadata.totalIndividuals,
        totalFamilies: gedcomData.metadata.totalFamilies,
        parsedAt: gedcomData.metadata.parsedAt
      }
    }
  };
}

/**
 * Calculate generations for all persons relative to root
 * @param {string} personId - Current person ID
 * @param {number} generation - Current generation level
 * @param {Map} individuals - Map of all individuals
 * @param {Map} families - Map of all families
 * @param {Map} personToGeneration - Map to store person to generation mapping
 */
function calculateGenerations(personId, generation, individuals, families, personToGeneration) {
  if (personToGeneration.has(personId)) return;
  
  personToGeneration.set(personId, generation);
  const person = individuals.get(personId);
  if (!person) return;
  
  // Find parents (FAMC families)
  for (const familyRef of person.families) {
    if (familyRef.type === 'FAMC') {
      const family = families.get(familyRef.familyId);
      if (family) {
        // Parents are one generation up
        if (family.husband) {
          calculateGenerations(family.husband, generation + 1, individuals, families, personToGeneration);
        }
        if (family.wife) {
          calculateGenerations(family.wife, generation + 1, individuals, families, personToGeneration);
        }
      }
    }
  }
  
  // Find children (FAMS families)
  for (const familyRef of person.families) {
    if (familyRef.type === 'FAMS') {
      const family = families.get(familyRef.familyId);
      if (family) {
        // Children are one generation down
        for (const childId of family.children) {
          calculateGenerations(childId, generation - 1, individuals, families, personToGeneration);
        }
      }
    }
  }
}

/**
 * Determine relationship to root person
 * @param {string} personId - Person to determine relation for
 * @param {string} rootPersonId - Root/proband person ID
 * @param {Map} individuals - Map of all individuals
 * @param {Map} families - Map of all families
 * @returns {string} Relation description
 */
function determineRelation(personId, rootPersonId, individuals, families) {
  if (personId === rootPersonId) {
    return 'self';
  }
  
  const person = individuals.get(personId);
  const rootPerson = individuals.get(rootPersonId);
  
  if (!person || !rootPerson) return 'unknown';
  
  // Simple relation determination based on family connections
  // This is a basic implementation - could be enhanced for more complex relationships
  
  // Check if this person is a parent of root
  for (const familyRef of rootPerson.families) {
    if (familyRef.type === 'FAMC') {
      const family = families.get(familyRef.familyId);
      if (family) {
        if (family.husband === personId) return 'father';
        if (family.wife === personId) return 'mother';
      }
    }
  }
  
  // Check if this person is a child of root
  for (const familyRef of person.families) {
    if (familyRef.type === 'FAMC') {
      const family = families.get(familyRef.familyId);
      if (family) {
        if (family.husband === rootPersonId || family.wife === rootPersonId) {
          return person.sex === 'M' ? 'son' : person.sex === 'F' ? 'daughter' : 'child';
        }
      }
    }
  }
  
  // Check if this person is a spouse of root
  for (const familyRef of rootPerson.families) {
    if (familyRef.type === 'FAMS') {
      const family = families.get(familyRef.familyId);
      if (family) {
        if (family.husband === personId || family.wife === personId) {
          return person.sex === 'M' ? 'husband' : person.sex === 'F' ? 'wife' : 'spouse';
        }
      }
    }
  }
  
  // Default relations based on naming patterns
  return 'relative';
}

/**
 * Generate lineage string from tree data
 * @param {Object} rootPerson - Root person data
 * @param {Array} persons - Array of all persons
 * @param {Map} families - Map of families
 * @returns {string} Lineage string
 */
function generateLineageString(rootPerson, persons, families) {
  if (!rootPerson || !persons.length) return '';
  
  // Sort persons by generation (highest to lowest - ancestors first)
  const sortedPersons = persons
    .filter(p => p.name && p.name.trim())
    .sort((a, b) => b.generation - a.generation);
  
  // Create lineage showing the ancestral line
  const lineageParts = sortedPersons
    .slice(0, 10) // Limit to avoid very long strings
    .map(person => {
      const relationPart = person.relation !== 'unknown' ? ` (${person.relation})` : '';
      return `${person.name}${relationPart}`;
    });
  
  return lineageParts.join(' → ');
}

/**
 * Validate GEDCOM file content
 * @param {string} content - GEDCOM file content
 * @returns {Object} Validation result
 */
export function validateGedcom(content) {
  const errors = [];
  const warnings = [];
  
  if (!content || typeof content !== 'string') {
    errors.push('Invalid file content');
    return { valid: false, errors, warnings };
  }
  
  const lines = content.split('\n');
  if (lines.length < 3) {
    errors.push('File too short to be a valid GEDCOM');
    return { valid: false, errors, warnings };
  }
  
  // Check for GEDCOM header
  const firstLine = lines[0].trim();
  if (!firstLine.includes('HEAD')) {
    warnings.push('File does not start with HEAD record - may not be a standard GEDCOM');
  }
  
  // Check for individuals
  const hasIndividuals = content.includes('INDI');
  if (!hasIndividuals) {
    errors.push('No individual records found in GEDCOM file');
  }
  
  // Basic structure validation
  let validStructure = true;
  for (let i = 0; i < Math.min(lines.length, 100); i++) {
    const line = lines[i].trim();
    if (line && !line.match(/^\d+\s/)) {
      validStructure = false;
      break;
    }
  }
  
  if (!validStructure) {
    warnings.push('File structure may not follow GEDCOM format standards');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}