import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * HAC (Hierarchical Access Control) Evaluation Engine
 * Evaluates case data against defined rules and returns authorization status
 */

function loadRules() {
  try {
    const rulesPath = path.join(__dirname, 'rules.json');
    const rulesData = fs.readFileSync(rulesPath, 'utf8');
    return JSON.parse(rulesData);
  } catch (error) {
    console.error('Error loading HAC rules:', error);
    throw new Error('Failed to load HAC rules');
  }
}

function loadMockCase() {
  try {
    const casePath = path.join(__dirname, 'mockCase.json');
    const caseData = fs.readFileSync(casePath, 'utf8');
    return JSON.parse(caseData);
  } catch (error) {
    console.error('Error loading mock case:', error);
    throw new Error('Failed to load mock case data');
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