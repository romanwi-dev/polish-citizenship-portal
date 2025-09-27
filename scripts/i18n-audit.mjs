#!/usr/bin/env node
// i18n Audit Script
// Validates that all required keys exist in both en.json and pl.json

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALE_PATH = path.join(__dirname, '../client/src/i18n/locales');
const SUPPORTED_LANGUAGES = ['en', 'pl'];
const EXIT_ON_ERROR = process.env.CI === 'true' || process.argv.includes('--strict');

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function loadLocaleFile(language) {
  try {
    const filePath = path.join(LOCALE_PATH, `${language}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load ${language}.json: ${error.message}`);
  }
}

function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
}

function findMissingKeys(source, target, sourceLang, targetLang) {
  const missing = [];
  
  for (const key in source) {
    if (!target.hasOwnProperty(key)) {
      missing.push({
        key,
        sourceValue: source[key],
        sourceLang,
        targetLang
      });
    }
  }
  
  return missing;
}

function findEmptyValues(localeData, language) {
  const empty = [];
  
  for (const key in localeData) {
    const value = localeData[key];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      empty.push({ key, language });
    }
  }
  
  return empty;
}

function findInterpolationMismatches(enData, plData) {
  const mismatches = [];
  
  for (const key in enData) {
    if (plData.hasOwnProperty(key)) {
      const enValue = enData[key];
      const plValue = plData[key];
      
      if (typeof enValue === 'string' && typeof plValue === 'string') {
        // Find interpolation patterns like {{variable}} or {variable}
        const enInterpolations = (enValue.match(/\{\{?\w+\}?\}/g) || []);
        const plInterpolations = (plValue.match(/\{\{?\w+\}?\}/g) || []);
        
        // Check if interpolation patterns match
        const enSet = new Set(enInterpolations);
        const plSet = new Set(plInterpolations);
        
        const missingInPl = [...enSet].filter(x => !plSet.has(x));
        const extraInPl = [...plSet].filter(x => !enSet.has(x));
        
        if (missingInPl.length > 0 || extraInPl.length > 0) {
          mismatches.push({
            key,
            enValue,
            plValue,
            missingInPl,
            extraInPl
          });
        }
      }
    }
  }
  
  return mismatches;
}

function validateRequiredKeys(localeData, language) {
  const required = [
    'header.title',
    'nav.dashboard',
    'nav.cases',
    'caseBoard.title',
    'caseDetail.title',
    'tree.title',
    'docTools.title',
    'common.success',
    'common.error',
    'common.loading',
    'common.save',
    'common.cancel'
  ];
  
  const missing = required.filter(key => !localeData.hasOwnProperty(key));
  return missing;
}

function generateReport(auditResults) {
  const { enData, plData, missingInPl, missingInEn, emptyInEn, emptyInPl, interpolationMismatches, missingRequiredEn, missingRequiredPl } = auditResults;
  
  log('\n🔍 i18n Audit Report', 'bold');
  log('=====================================', 'blue');
  
  // Summary
  const enKeys = Object.keys(enData).length;
  const plKeys = Object.keys(plData).length;
  
  log(`\n📊 Summary:`, 'bold');
  log(`   English keys: ${enKeys}`);
  log(`   Polish keys: ${plKeys}`);
  log(`   Key difference: ${Math.abs(enKeys - plKeys)}`);
  
  // Missing keys
  if (missingInPl.length > 0) {
    log(`\n❌ Missing in Polish (${missingInPl.length}):`, 'red');
    missingInPl.forEach(item => {
      log(`   • ${item.key}: "${item.sourceValue}"`, 'yellow');
    });
  }
  
  if (missingInEn.length > 0) {
    log(`\n❌ Missing in English (${missingInEn.length}):`, 'red');
    missingInEn.forEach(item => {
      log(`   • ${item.key}: "${item.sourceValue}"`, 'yellow');
    });
  }
  
  // Empty values
  if (emptyInEn.length > 0) {
    log(`\n⚠️  Empty values in English (${emptyInEn.length}):`, 'yellow');
    emptyInEn.forEach(item => {
      log(`   • ${item.key}`);
    });
  }
  
  if (emptyInPl.length > 0) {
    log(`\n⚠️  Empty values in Polish (${emptyInPl.length}):`, 'yellow');
    emptyInPl.forEach(item => {
      log(`   • ${item.key}`);
    });
  }
  
  // Interpolation mismatches
  if (interpolationMismatches.length > 0) {
    log(`\n🔄 Interpolation mismatches (${interpolationMismatches.length}):`, 'yellow');
    interpolationMismatches.forEach(item => {
      log(`   • ${item.key}:`);
      log(`     EN: "${item.enValue}"`);
      log(`     PL: "${item.plValue}"`);
      if (item.missingInPl.length > 0) {
        log(`     Missing in PL: ${item.missingInPl.join(', ')}`, 'red');
      }
      if (item.extraInPl.length > 0) {
        log(`     Extra in PL: ${item.extraInPl.join(', ')}`, 'red');
      }
    });
  }
  
  // Required keys
  if (missingRequiredEn.length > 0) {
    log(`\n🔴 Missing required keys in English (${missingRequiredEn.length}):`, 'red');
    missingRequiredEn.forEach(key => log(`   • ${key}`));
  }
  
  if (missingRequiredPl.length > 0) {
    log(`\n🔴 Missing required keys in Polish (${missingRequiredPl.length}):`, 'red');
    missingRequiredPl.forEach(key => log(`   • ${key}`));
  }
  
  // Final status
  const totalIssues = missingInPl.length + missingInEn.length + emptyInEn.length + 
                     emptyInPl.length + interpolationMismatches.length + 
                     missingRequiredEn.length + missingRequiredPl.length;
  
  log('\n=====================================', 'blue');
  if (totalIssues === 0) {
    log('✅ i18n audit passed! No issues found.', 'green');
  } else {
    log(`❌ i18n audit found ${totalIssues} issues.`, 'red');
    
    if (EXIT_ON_ERROR) {
      log('\n💡 Tips for fixing:', 'blue');
      log('   1. Add missing translations to the appropriate locale files');
      log('   2. Fill in empty translation values');
      log('   3. Fix interpolation pattern mismatches');
      log('   4. Ensure all required keys are present');
    }
  }
  
  return totalIssues === 0;
}

async function auditI18n() {
  try {
    log('🔍 Starting i18n audit...', 'blue');
    
    // Load locale files
    log('📂 Loading locale files...', 'blue');
    const enData = await loadLocaleFile('en');
    const plData = await loadLocaleFile('pl');
    
    // Flatten nested objects
    const flatEnData = flattenObject(enData);
    const flatPlData = flattenObject(plData);
    
    log(`✅ Loaded ${Object.keys(flatEnData).length} English keys`);
    log(`✅ Loaded ${Object.keys(flatPlData).length} Polish keys`);
    
    // Find missing keys
    const missingInPl = findMissingKeys(flatEnData, flatPlData, 'en', 'pl');
    const missingInEn = findMissingKeys(flatPlData, flatEnData, 'pl', 'en');
    
    // Find empty values
    const emptyInEn = findEmptyValues(flatEnData, 'en');
    const emptyInPl = findEmptyValues(flatPlData, 'pl');
    
    // Find interpolation mismatches
    const interpolationMismatches = findInterpolationMismatches(flatEnData, flatPlData);
    
    // Validate required keys
    const missingRequiredEn = validateRequiredKeys(flatEnData, 'en');
    const missingRequiredPl = validateRequiredKeys(flatPlData, 'pl');
    
    // Generate report
    const auditResults = {
      enData: flatEnData,
      plData: flatPlData,
      missingInPl,
      missingInEn,
      emptyInEn,
      emptyInPl,
      interpolationMismatches,
      missingRequiredEn,
      missingRequiredPl
    };
    
    const success = generateReport(auditResults);
    
    // Generate JSON report for automation
    if (process.env.OUTPUT_JSON) {
      const jsonReport = {
        summary: {
          enKeyCount: Object.keys(flatEnData).length,
          plKeyCount: Object.keys(flatPlData).length,
          totalIssues: missingInPl.length + missingInEn.length + emptyInEn.length + 
                      emptyInPl.length + interpolationMismatches.length + 
                      missingRequiredEn.length + missingRequiredPl.length
        },
        issues: {
          missingInPl,
          missingInEn,
          emptyInEn,
          emptyInPl,
          interpolationMismatches,
          missingRequiredEn,
          missingRequiredPl
        },
        timestamp: new Date().toISOString()
      };
      
      await fs.writeFile('i18n-audit-report.json', JSON.stringify(jsonReport, null, 2));
      log('\n📄 JSON report saved to i18n-audit-report.json', 'blue');
    }
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    log(`❌ i18n audit failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the audit
if (import.meta.url === `file://${process.argv[1]}`) {
  auditI18n();
}

export { auditI18n };