import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * HAC (Hierarchical Access Control) Evaluation Engine
 * Evaluates case data against defined rules and returns authorization status
 */

// Embedded fallback rules data
const EMBEDDED_RULES = {"rules":[{"id":"USC.STATUS.REG","name":"USC Registration Status","description":"Check if USC birth act is registered","type":"WARNING","condition":"usc.birth.registered !== true","message":"USC birth act not yet registered (umiejscowienie pending)","remedy":"Complete USC registration process at Polish consulate or USC office"},{"id":"DOC.TRANSLATION.REQUIRED","name":"Document Translation Requirements","description":"Check if foreign vital documents have sworn Polish translations","type":"WARNING","condition":"foreign_docs.some(doc => !doc.has_sworn_translation)","message":"Some foreign vital documents lack sworn Polish translation","remedy":"Obtain sworn Polish translations for all foreign documents"},{"id":"IDENTITY.NAMES.CONSISTENCY","name":"Name Consistency Check","description":"Check surname consistency between birth and current documents","type":"WARNING","condition":"current_surname !== birth_surname && !has_sprostowanie_note","message":"Surname mismatch between birth and current documents without sprostowanie note","remedy":"Provide sprostowanie (correction) note or legal name change documentation"},{"id":"ATTACHMENTS.COMPLETE","name":"OBY Attachments Completeness","description":"Check if all 10 required OBY attachments are linked","type":"WARNING","condition":"oby_attachments.filter(att => att.linked).length < 10","message":"Not all required OBY attachments (1-10) are linked","remedy":"Link all 10 required attachments to OBY application before submission"},{"id":"DOC.PASSPORT.REQUIRED","name":"Valid Passport Required","description":"Check if a valid passport document is provided","type":"BLOCKER","condition":"!documents.some(doc => doc.type === 'passport' && doc.status === 'RECEIVED')","message":"No valid passport document found in case files","remedy":"Upload a clear copy of valid passport document"},{"id":"LINEAGE.POLISH.PROOF","name":"Polish Lineage Proof","description":"Check if Polish ancestry is documented","type":"BLOCKER","condition":"!documents.some(doc => doc.type === 'birth_cert_PL')","message":"Polish birth certificate or lineage proof missing","remedy":"Provide Polish birth certificate of Polish ancestor or equivalent proof"},{"id":"CASE.STATE.VALID","name":"Case State Validation","description":"Check if case is in a valid state for submission","type":"BLOCKER","condition":"status.pipeline_state !== 'OBY_SUBMITTABLE' && status.pipeline_state !== 'USC_READY'","message":"Case is not in a submittable state","remedy":"Complete all prerequisite steps before attempting submission"},{"id":"CLIENT.DATA.COMPLETE","name":"Client Data Completeness","description":"Check if all required client information is provided","type":"WARNING","condition":"!client.name || !client.email || client.name.trim().length < 3","message":"Client information is incomplete or invalid","remedy":"Ensure client name and email are properly filled out"},{"id":"DOCS.FOREIGN.STATUS","name":"Foreign Document Processing","description":"Check if foreign documents are properly processed","type":"WARNING","condition":"documents.some(doc => doc.is_foreign && doc.status !== 'RECEIVED')","message":"Some foreign documents are not yet processed","remedy":"Complete processing of all foreign vital documents"},{"id":"PROCESSING.TIMELINE","name":"Processing Timeline Check","description":"Check if case processing is within reasonable timeline","type":"WARNING","condition":"daysSinceCreated > 180","message":"Case has been in process for more than 6 months","remedy":"Review case status and consider escalating if needed"}],"metadata":{"version":"2.0.0","description":"Enhanced HAC rules for Polish citizenship application validation","last_updated":"2025-09-21","rule_types":["WARNING","BLOCKER"],"note":"Rules include both WARNING and BLOCKER severity levels for comprehensive validation"}};

// Embedded fallback mock case data
const EMBEDDED_MOCK_CASE = {"case_id":"C-2025-0013","client":{"name":"Jan Marek Kowalski","email":"jan@example.com","current_surname":"KOWALSKI","birth_surname":"NOWAK"},"status":{"pipeline_state":"USC_IN_FLIGHT","created_date":"2025-09-15","last_updated":"2025-09-17"},"usc":{"birth":{"registered":false,"registration_pending":true,"office":"USC Warszawa"}},"documents":[{"type":"passport","status":"RECEIVED","filename":"passport_kowalski.pdf","has_sworn_translation":false,"is_foreign":false},{"type":"birth_cert_foreign","status":"RECEIVED","filename":"birth_cert_brazil.pdf","has_sworn_translation":false,"is_foreign":true,"origin_country":"Brazil"},{"type":"birth_cert_PL","status":"PENDING","filename":null,"has_sworn_translation":false,"is_foreign":false,"note":"Umiejscowienie not completed yet"}],"name_changes":{"has_sprostowanie_note":false,"legal_name_change_docs":[]},"oby_attachments":[{"id":1,"name":"Birth certificate","linked":true},{"id":2,"name":"Passport copy","linked":true},{"id":3,"name":"Parent birth certificate","linked":false},{"id":4,"name":"Grandparent birth certificate","linked":false},{"id":5,"name":"Marriage certificate","linked":false},{"id":6,"name":"Death certificate","linked":false},{"id":7,"name":"Residence proof","linked":false},{"id":8,"name":"Employment proof","linked":false},{"id":9,"name":"Criminal record check","linked":false},{"id":10,"name":"Additional documents","linked":false}],"foreign_docs":[{"type":"birth_cert_foreign","has_sworn_translation":false,"translation_status":"pending"}],"mapped_fields":{"OBY-I-GIVEN":"JAN MAREK","OBY-I-SURNAME":"KOWALSKI","OBY-I-BIRTHSUR":"NOWAK","OBY-I-SEX":"mężczyzna","OBY-I-DOB":"12-03-1989","OBY-I-POB":"RIO DE JANEIRO, BRAZYLIA","POA-A-GN":"JAN MAREK","POA-A-SN":"KOWALSKI","POA-A-ID":"AB1234567","POA-A-DATE":"16-09-2025"}};

function loadRules() {
  try {
    // Try multiple paths for development and production environments
    const possiblePaths = [
      path.join(__dirname, 'rules.json'),                    // Production (bundled)
      path.join(__dirname, '../hac/rules.json'),             // When running from dist/
      path.join(process.cwd(), 'server/hac/rules.json'),     // Development
      path.join(process.cwd(), 'dist/rules.json')            // Production fallback
    ];

    for (const rulesPath of possiblePaths) {
      if (fs.existsSync(rulesPath)) {
        const rulesData = fs.readFileSync(rulesPath, 'utf8');
        console.log(`✅ HAC rules loaded from: ${rulesPath}`);
        return JSON.parse(rulesData);
      }
    }

    console.warn('⚠️ External rules.json not found, using embedded fallback');
    return EMBEDDED_RULES;
  } catch (error) {
    console.error('Error loading HAC rules:', error);
    console.warn('⚠️ Using embedded fallback rules');
    return EMBEDDED_RULES;
  }
}

function loadMockCase() {
  try {
    // Try multiple paths for development and production environments
    const possiblePaths = [
      path.join(__dirname, 'mockCase.json'),                    // Production (bundled)
      path.join(__dirname, '../hac/mockCase.json'),             // When running from dist/
      path.join(process.cwd(), 'server/hac/mockCase.json'),     // Development
      path.join(process.cwd(), 'dist/mockCase.json')            // Production fallback
    ];

    for (const casePath of possiblePaths) {
      if (fs.existsSync(casePath)) {
        const caseData = fs.readFileSync(casePath, 'utf8');
        console.log(`✅ Mock case loaded from: ${casePath}`);
        return JSON.parse(caseData);
      }
    }

    console.warn('⚠️ External mockCase.json not found, using embedded fallback');
    return EMBEDDED_MOCK_CASE;
  } catch (error) {
    console.error('Error loading mock case:', error);
    console.warn('⚠️ Using embedded fallback mock case');
    return EMBEDDED_MOCK_CASE;
  }
}

function evaluateRule(rule, caseData) {
  const result = {
    rule_id: rule.id,
    rule_name: rule.name,
    severity: rule.severity || (rule.type === 'WARNING' ? 'warning' : 'blocker'),
    status: 'PASS',
    ok: true,
    message: null,
    remedy: null
  };

  try {
    let conditionMet = false;

    // Calculate days since case creation for timeline checks
    const daysSinceCreated = caseData.status?.created_date ? 
      Math.floor((new Date() - new Date(caseData.status.created_date)) / (1000 * 60 * 60 * 24)) : 0;

    // Evaluate specific rule conditions
    switch (rule.id) {
      case 'USC.STATUS.REG':
        conditionMet = !caseData.usc?.birth?.registered;
        break;

      case 'DOC.TRANSLATION.REQUIRED':
        conditionMet = caseData.foreign_docs?.some(doc => !doc.has_sworn_translation) || false;
        break;

      case 'IDENTITY.NAMES.CONSISTENCY':
        conditionMet = caseData.client?.current_surname !== caseData.client?.birth_surname && 
                      !caseData.name_changes?.has_sprostowanie_note;
        break;

      case 'ATTACHMENTS.COMPLETE':
        const linkedAttachments = caseData.oby_attachments?.filter(att => att.linked).length || 0;
        conditionMet = linkedAttachments < 10;
        break;

      case 'DOC.PASSPORT.REQUIRED':
        conditionMet = !caseData.documents?.some(doc => doc.type === 'passport' && doc.status === 'RECEIVED');
        break;

      case 'LINEAGE.POLISH.PROOF':
        conditionMet = !caseData.documents?.some(doc => doc.type === 'birth_cert_PL');
        break;

      case 'CASE.STATE.VALID':
        const validStates = ['OBY_SUBMITTABLE', 'USC_READY'];
        conditionMet = !validStates.includes(caseData.status?.pipeline_state);
        break;

      case 'CLIENT.DATA.COMPLETE':
        conditionMet = !caseData.client?.name || !caseData.client?.email || 
                      (caseData.client.name && caseData.client.name.trim().length < 3);
        break;

      case 'DOCS.FOREIGN.STATUS':
        conditionMet = caseData.documents?.some(doc => doc.is_foreign && doc.status !== 'RECEIVED') || false;
        break;

      case 'PROCESSING.TIMELINE':
        conditionMet = daysSinceCreated > 180;
        break;

      default:
        console.warn(`Unknown rule ID: ${rule.id}`);
        break;
    }

    if (conditionMet) {
      result.ok = false;
      result.status = result.severity === 'warning' ? 'WARN' : 'FAIL';
      result.message = rule.message;
      result.remedy = rule.remedy;
    }

  } catch (error) {
    console.error(`Error evaluating rule ${rule.id}:`, error);
    result.ok = false;
    result.status = 'ERROR';
    result.message = `Evaluation error: ${error.message}`;
    result.severity = 'blocker';
  }

  return result;
}

function evaluateCase(caseData = null) {
  const rules = loadRules();
  const testCase = caseData || loadMockCase();
  
  console.log(`Evaluating case ${testCase.case_id} against ${rules.rules.length} rules`);
  
  // Load existing overrides for this case
  const overrides = loadOverrides(testCase.case_id);
  
  const results = rules.rules.map(rule => {
    const result = evaluateRule(rule, testCase);
    
    // Check if this rule has been overridden
    const override = overrides.find(o => o.ruleId === rule.id);
    if (override && !result.ok) {
      result.status = 'PASS_WITH_OVERRIDE';
      result.ok = true;
      result.override = {
        reason: override.reason,
        overriddenBy: override.overriddenBy,
        timestamp: override.timestamp
      };
    }
    
    return result;
  });
  
  // Determine overall status using severity and ok fields (after applying overrides)
  const hasBlockers = results.some(r => r.severity === "blocker" && r.ok === false);
  const hasWarnings = results.some(r => r.severity === "warning" && r.ok === false);
  
  let status;
  let canProceed;
  
  if (hasBlockers) {
    status = "RED";
    canProceed = false;
  } else if (hasWarnings) {
    status = "AMBER";
    canProceed = false; // Warnings require manual override
  } else {
    status = "GREEN";
    canProceed = true;
  }

  const evaluation = {
    case_id: testCase.case_id,
    timestamp: new Date().toISOString(),
    status: status,
    canProceed: canProceed,
    results: results,
    actions: {
      submit_allowed: canProceed,
      override_required: hasBlockers || hasWarnings
    },
    summary: {
      total_rules: results.length,
      passed: results.filter(r => r.ok === true).length,
      warnings: results.filter(r => r.severity === 'warning' && r.ok === false).length,
      blockers: results.filter(r => r.severity === 'blocker' && r.ok === false).length,
      errors: results.filter(r => r.status === 'ERROR').length,
      overrides: results.filter(r => r.status === 'PASS_WITH_OVERRIDE').length
    }
  };

  console.log(`HAC Evaluation complete: ${status} (${evaluation.summary.warnings} warnings, ${evaluation.summary.blockers} blockers, ${evaluation.summary.overrides} overrides)`);
  
  return evaluation;
}

function loadOverrides(caseId) {
  try {
    const overridesPath = path.join(process.cwd(), 'data', 'overrides.json');
    
    if (!fs.existsSync(overridesPath)) {
      return [];
    }
    
    const overridesData = fs.readFileSync(overridesPath, 'utf8');
    
    if (!overridesData.trim()) {
      return [];
    }
    
    const allOverrides = JSON.parse(overridesData);
    
    if (!Array.isArray(allOverrides)) {
      console.warn('HAC overrides file contains invalid data, expected array');
      return [];
    }
    
    // Return only overrides for this case
    return allOverrides.filter(override => 
      override && 
      override.caseId === caseId && 
      override.ruleId && 
      override.reason
    );
    
  } catch (error) {
    console.error('Error loading HAC overrides:', error);
    return [];
  }
}

function saveOverride(overrideData) {
  try {
    const overridesPath = path.join(process.cwd(), 'data', 'overrides.json');
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Load existing overrides or create new array
    let overrides = [];
    if (fs.existsSync(overridesPath)) {
      const existingData = fs.readFileSync(overridesPath, 'utf8');
      overrides = JSON.parse(existingData);
    }
    
    // Check if override already exists for this case+rule combination
    const existingIndex = overrides.findIndex(o => 
      o.caseId === overrideData.caseId && o.ruleId === overrideData.ruleId
    );
    
    // Add new override with timestamp
    const newOverride = {
      ...overrideData,
      timestamp: new Date().toISOString(),
      id: `override_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    };
    
    if (existingIndex >= 0) {
      // Update existing override
      overrides[existingIndex] = newOverride;
      console.log(`HAC Override updated: ${newOverride.id}`);
    } else {
      // Add new override
      overrides.push(newOverride);
      console.log(`HAC Override saved: ${newOverride.id}`);
    }
    
    // Save updated overrides
    fs.writeFileSync(overridesPath, JSON.stringify(overrides, null, 2));
    
    return newOverride;
    
  } catch (error) {
    console.error('Error saving HAC override:', error);
    throw new Error('Failed to save override');
  }
}

export {
  evaluateCase,
  saveOverride,
  loadOverrides,
  loadRules,
  loadMockCase
};

// CLI support for direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = evaluateCase();
    console.log('\n=== HAC EVALUATION RESULT ===');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('HAC Evaluation failed:', error);
    process.exit(1);
  }
}