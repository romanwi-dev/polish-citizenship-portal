/**
 * Document Matrix Builder for Family Tree Document Radar
 * Builds comprehensive document status matrix for Polish citizenship cases
 */

import fs from 'fs/promises';
import path from 'path';
import { Dropbox } from 'dropbox';
import { getAccessToken } from '../integrations/dropbox-oauth.js';

// Document types for Polish citizenship applications
const DOCUMENT_TYPES = {
  PL_BIRTH: { 
    label: 'Polish Birth Certificate', 
    category: 'pl',
    required: true 
  },
  PL_MARRIAGE: { 
    label: 'Polish Marriage Certificate', 
    category: 'pl',
    required: false 
  },
  PL_DEATH: { 
    label: 'Polish Death Certificate', 
    category: 'pl',
    required: false 
  },
  FOREIGN_BIRTH: { 
    label: 'Foreign Birth Certificate', 
    category: 'foreign',
    required: true 
  },
  FOREIGN_MARRIAGE: { 
    label: 'Foreign Marriage Certificate', 
    category: 'foreign',
    required: false 
  },
  FOREIGN_DEATH: { 
    label: 'Foreign Death Certificate', 
    category: 'foreign',
    required: false 
  },
  NATURALIZATION_CERT: { 
    label: 'Naturalization Certificate', 
    category: 'foreign',
    required: false 
  },
  NO_NATURALIZATION_PROOF: { 
    label: 'No Naturalization Proof', 
    category: 'foreign',
    required: false 
  },
  NAME_CHANGE_DECREE: { 
    label: 'Name Change Decree', 
    category: 'foreign',
    required: false 
  },
  MILITARY_SERVICE: { 
    label: 'Military Service Records', 
    category: 'foreign',
    required: false 
  }
};

// Status types for document tracking
const DOCUMENT_STATUS = {
  HAVE: 'have',
  IN_PROGRESS: 'in_progress',
  NEEDED: 'needed'
};

class DocumentMatrixBuilder {
  constructor() {
    this.dbx = null;
    // Note: initializeDropbox() is now async and called before each use
  }

  async initializeDropbox() {
    try {
      const accessToken = await getAccessToken();
      if (accessToken) {
        this.dbx = new Dropbox({ 
          accessToken,
          fetch: fetch
        });
      }
    } catch (error) {
      console.error('Failed to initialize Dropbox with OAuth token:', error);
      this.dbx = null;
    }
  }

  /**
   * Build document matrix for a case
   * @param {string} caseId - The case ID
   * @returns {Promise<Object>} Document matrix with person docs and summary
   */
  async buildDocMatrix(caseId) {
    try {
      // Validate case ID
      if (!this.validateCaseId(caseId)) {
        throw new Error('Invalid case ID format');
      }

      // Load tree data
      const treeData = await this.loadTreeData(caseId);
      
      // Get target persons (proband + parents + grandparents, max 8)
      const targetPersons = this.getTargetPersons(treeData);
      
      // Build document matrix for each person
      const personMatrices = [];
      for (const person of targetPersons) {
        const personMatrix = await this.buildPersonDocuments(caseId, person);
        personMatrices.push(personMatrix);
      }

      // Generate summary statistics
      const summary = this.generateSummary(personMatrices);

      return {
        success: true,
        caseId,
        persons: personMatrices,
        summary,
        metadata: {
          generatedAt: new Date().toISOString(),
          totalPersons: personMatrices.length,
          documentTypes: Object.keys(DOCUMENT_TYPES)
        }
      };

    } catch (error) {
      console.error('Document matrix build failed:', error);
      return {
        success: false,
        error: error.message,
        caseId
      };
    }
  }

  /**
   * Load tree data from case directory
   * @param {string} caseId - The case ID
   * @returns {Promise<Object>} Tree data object
   */
  async loadTreeData(caseId) {
    const caseDir = path.join(process.cwd(), 'data', 'cases', caseId);
    const treePath = path.join(caseDir, 'tree.json');

    try {
      const treeContent = await fs.readFile(treePath, 'utf8');
      return JSON.parse(treeContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Return default tree structure if file doesn't exist
        return {
          persons: [
            {
              id: 'applicant',
              name: 'Applicant',
              relation: 'self',
              generation: 0
            }
          ],
          relationships: [],
          proband: 'applicant'
        };
      }
      throw error;
    }
  }

  /**
   * Get target persons for document tracking (proband + parents + grandparents)
   * @param {Object} treeData - Tree data object
   * @returns {Array} Array of person objects to track documents for
   */
  getTargetPersons(treeData) {
    if (!treeData.persons || treeData.persons.length === 0) {
      return [];
    }

    // Find proband (main applicant)
    let proband = null;
    if (treeData.proband) {
      proband = treeData.persons.find(p => p.id === treeData.proband);
    } else {
      // Fallback: use first person or person with generation 0
      proband = treeData.persons.find(p => p.generation === 0) || treeData.persons[0];
    }

    if (!proband) {
      return [];
    }

    const targetPersons = [proband];
    
    // Find parents (generation 1) and grandparents (generation 2)
    const parents = treeData.persons.filter(p => p.generation === 1);
    const grandparents = treeData.persons.filter(p => p.generation === 2);
    
    targetPersons.push(...parents, ...grandparents);
    
    // Limit to max 8 persons total
    return targetPersons.slice(0, 8);
  }

  /**
   * Build document matrix for a single person
   * @param {string} caseId - The case ID
   * @param {Object} person - Person object from tree data
   * @returns {Promise<Object>} Person document matrix
   */
  async buildPersonDocuments(caseId, person) {
    const personMatrix = {
      personId: person.id,
      name: person.name || 'Unknown',
      relation: person.relation || this.getRelationFromGeneration(person.generation),
      generation: person.generation || 0,
      documents: {},
      completionStats: {
        have: 0,
        inProgress: 0,
        needed: 0,
        total: 0
      }
    };

    // Check each document type
    for (const [docType, docInfo] of Object.entries(DOCUMENT_TYPES)) {
      const docStatus = await this.checkDocumentStatus(caseId, person.id, docType);
      
      personMatrix.documents[docType] = {
        type: docType,
        label: docInfo.label,
        category: docInfo.category,
        required: docInfo.required,
        status: docStatus.status,
        files: docStatus.files,
        notes: docStatus.notes,
        source: docStatus.source,
        lastUpdated: docStatus.lastUpdated
      };

      // Update completion stats
      personMatrix.completionStats.total++;
      switch (docStatus.status) {
        case DOCUMENT_STATUS.HAVE:
          personMatrix.completionStats.have++;
          break;
        case DOCUMENT_STATUS.IN_PROGRESS:
          personMatrix.completionStats.inProgress++;
          break;
        case DOCUMENT_STATUS.NEEDED:
          personMatrix.completionStats.needed++;
          break;
      }
    }

    return personMatrix;
  }

  /**
   * Check document status for a person and document type
   * @param {string} caseId - The case ID
   * @param {string} personId - Person ID
   * @param {string} docType - Document type
   * @returns {Promise<Object>} Document status object
   */
  async checkDocumentStatus(caseId, personId, docType) {
    const docInfo = DOCUMENT_TYPES[docType];
    const category = docInfo.category;
    
    // Check for files in Dropbox
    const dropboxFiles = await this.checkDropboxFiles(caseId, personId, category, docType);
    
    // Check for progress indicators (notes, events mentioning "ordered" or "requested")
    const progressInfo = await this.checkProgressIndicators(caseId, personId, docType);

    let status = DOCUMENT_STATUS.NEEDED;
    let files = [];
    let notes = '';
    let source = '';
    let lastUpdated = null;

    if (dropboxFiles.length > 0) {
      status = DOCUMENT_STATUS.HAVE;
      files = dropboxFiles;
      lastUpdated = dropboxFiles[0].modified || null;
    } else if (progressInfo.hasProgress) {
      status = DOCUMENT_STATUS.IN_PROGRESS;
      notes = progressInfo.notes;
      source = progressInfo.source;
      lastUpdated = progressInfo.lastUpdated;
    }

    return {
      status,
      files,
      notes,
      source,
      lastUpdated
    };
  }

  /**
   * Check for files in Dropbox for specific document type
   * @param {string} caseId - The case ID
   * @param {string} personId - Person ID
   * @param {string} category - Document category (pl/foreign)
   * @param {string} docType - Document type
   * @returns {Promise<Array>} Array of file objects
   */
  async checkDropboxFiles(caseId, personId, category, docType) {
    // Ensure Dropbox is initialized with fresh OAuth token
    if (!this.dbx) {
      await this.initializeDropbox();
    }
    
    if (!this.dbx) {
      console.warn('Dropbox not available, skipping file check');
      return [];
    }

    try {
      // Check multiple possible paths for documents
      const searchPaths = [
        `/CASES/${caseId}/portal/docs/${category}/${personId}`,
        `/CASES/${caseId}/portal/docs/${personId}/${category}`,
        `/CASES/${caseId}/portal/docs/${personId}`,
        `/Clients/${caseId}/${category}/${personId}`
      ];

      const foundFiles = [];

      for (const searchPath of searchPaths) {
        try {
          const response = await this.dbx.filesListFolder({ path: searchPath });
          
          if (response.result.entries) {
            // Filter files that might match the document type
            const matchingFiles = response.result.entries
              .filter(entry => entry['.tag'] === 'file')
              .filter(file => this.isFileForDocType(file.name, docType))
              .map(file => ({
                name: file.name,
                path: file.path_display,
                size: file.size,
                modified: file.client_modified || file.server_modified,
                id: file.id
              }));

            foundFiles.push(...matchingFiles);
          }
        } catch (pathError) {
          // Ignore path not found errors - continue checking other paths
          if (!pathError.message?.includes('not_found')) {
            console.warn(`Error checking Dropbox path ${searchPath}:`, pathError.message);
          }
        }
      }

      return foundFiles;

    } catch (error) {
      console.warn('Dropbox file check failed:', error.message);
      return [];
    }
  }

  /**
   * Check for progress indicators in case notes, events, translations
   * @param {string} caseId - The case ID
   * @param {string} personId - Person ID
   * @param {string} docType - Document type
   * @returns {Promise<Object>} Progress information
   */
  async checkProgressIndicators(caseId, personId, docType) {
    try {
      // Check case.json for notes mentioning ordered/requested documents
      const caseDir = path.join(process.cwd(), 'data', 'cases', caseId);
      const casePath = path.join(caseDir, 'case.json');

      let hasProgress = false;
      let notes = '';
      let source = 'case notes';
      let lastUpdated = null;

      try {
        const caseContent = await fs.readFile(casePath, 'utf8');
        const caseData = JSON.parse(caseContent);

        // Check for progress keywords in notes
        const progressKeywords = ['ordered', 'requested', 'pending', 'in progress', 'waiting', 'applied'];
        const docKeywords = [docType.toLowerCase(), DOCUMENT_TYPES[docType].label.toLowerCase()];

        const textToCheck = [
          caseData.notes || '',
          caseData.lineage || '',
          JSON.stringify(caseData.events || [])
        ].join(' ').toLowerCase();

        const hasDocKeyword = docKeywords.some(keyword => textToCheck.includes(keyword));
        const hasProgressKeyword = progressKeywords.some(keyword => textToCheck.includes(keyword));

        if (hasDocKeyword && hasProgressKeyword) {
          hasProgress = true;
          notes = `Document ${docType} appears to be in progress`;
          lastUpdated = caseData.lastUpdated || caseData.updatedAt;
        }

      } catch (caseError) {
        // Ignore if case.json doesn't exist or can't be read
      }

      return {
        hasProgress,
        notes,
        source,
        lastUpdated
      };

    } catch (error) {
      console.warn('Progress check failed:', error.message);
      return {
        hasProgress: false,
        notes: '',
        source: '',
        lastUpdated: null
      };
    }
  }

  /**
   * Determine if a file matches a document type based on filename
   * @param {string} filename - The filename to check
   * @param {string} docType - Document type to match
   * @returns {boolean} True if file matches document type
   */
  isFileForDocType(filename, docType) {
    const lowerFilename = filename.toLowerCase();
    
    const typeMatchers = {
      'PL_BIRTH': ['birth', 'urodzenie', 'akt_urodzenia'],
      'PL_MARRIAGE': ['marriage', 'malzenstwo', 'slub', 'akt_malzenstwa'],
      'FOREIGN_BIRTH': ['birth', 'certificate', 'foreign'],
      'FOREIGN_MARRIAGE': ['marriage', 'certificate', 'foreign'],
      'NATURALIZATION_CERT': ['naturalization', 'naturalizacja', 'citizenship'],
      'NO_NATURALIZATION_PROOF': ['no_naturalization', 'brak_naturalizacji', 'nie_naturalizowany'],
      'NAME_CHANGE_DECREE': ['name_change', 'zmiana_nazwiska', 'dekret'],
      'MILITARY_SERVICE': ['military', 'wojsko', 'sluzba', 'service']
    };

    const matchers = typeMatchers[docType] || [];
    return matchers.some(matcher => lowerFilename.includes(matcher));
  }

  /**
   * Generate summary statistics for document matrix
   * @param {Array} personMatrices - Array of person document matrices
   * @returns {Object} Summary statistics
   */
  generateSummary(personMatrices) {
    const summary = {
      totalPersons: personMatrices.length,
      totalDocuments: 0,
      have: 0,
      inProgress: 0,
      needed: 0,
      completionPercentage: 0,
      byGeneration: {
        0: { have: 0, inProgress: 0, needed: 0, total: 0 }, // Applicant
        1: { have: 0, inProgress: 0, needed: 0, total: 0 }, // Parents
        2: { have: 0, inProgress: 0, needed: 0, total: 0 }  // Grandparents
      },
      requiredDocuments: {
        have: 0,
        inProgress: 0,
        needed: 0,
        total: 0
      }
    };

    for (const personMatrix of personMatrices) {
      const gen = personMatrix.generation;
      const stats = personMatrix.completionStats;

      summary.totalDocuments += stats.total;
      summary.have += stats.have;
      summary.inProgress += stats.inProgress;
      summary.needed += stats.needed;

      // Update by generation
      if (summary.byGeneration[gen]) {
        summary.byGeneration[gen].have += stats.have;
        summary.byGeneration[gen].inProgress += stats.inProgress;
        summary.byGeneration[gen].needed += stats.needed;
        summary.byGeneration[gen].total += stats.total;
      }

      // Count required documents only
      for (const [docType, docData] of Object.entries(personMatrix.documents)) {
        if (docData.required) {
          summary.requiredDocuments.total++;
          switch (docData.status) {
            case DOCUMENT_STATUS.HAVE:
              summary.requiredDocuments.have++;
              break;
            case DOCUMENT_STATUS.IN_PROGRESS:
              summary.requiredDocuments.inProgress++;
              break;
            case DOCUMENT_STATUS.NEEDED:
              summary.requiredDocuments.needed++;
              break;
          }
        }
      }
    }

    // Calculate completion percentage
    if (summary.totalDocuments > 0) {
      summary.completionPercentage = Math.round((summary.have / summary.totalDocuments) * 100);
    }

    return summary;
  }

  /**
   * Get relation name from generation number
   * @param {number} generation - Generation number
   * @returns {string} Relation name
   */
  getRelationFromGeneration(generation) {
    const relations = {
      0: 'Applicant',
      1: 'Parent', 
      2: 'Grandparent',
      3: 'Great-grandparent'
    };
    return relations[generation] || 'Relative';
  }

  /**
   * Validate case ID format
   * @param {string} caseId - Case ID to validate
   * @returns {boolean} True if valid
   */
  validateCaseId(caseId) {
    const caseIdRegex = /^[A-Za-z0-9_-]+$/;
    return caseId && caseIdRegex.test(caseId) && !caseId.includes('..');
  }
}

/**
 * Main export function - builds document matrix for a case
 * @param {string} caseId - The case ID
 * @returns {Promise<Object>} Document matrix result
 */
export async function buildDocMatrix(caseId) {
  const builder = new DocumentMatrixBuilder();
  return await builder.buildDocMatrix(caseId);
}

// Export document types and status constants for use by other modules
export { DOCUMENT_TYPES, DOCUMENT_STATUS };