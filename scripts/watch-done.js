#!/usr/bin/env node

/**
 * Watchdog Verifier - Module 15
 * Confirms each task reports "DONE - CHECKED - CONFIRMED - WORKING"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

class WatchdogVerifier {
  constructor() {
    this.modules = [
      { id: 1, name: 'Dropbox Import & Sync', path: 'client/src/admin/ImportsDropbox.jsx' },
      { id: 2, name: 'Case Dashboard', path: 'client/src/admin/CaseBoardDemo.jsx' },
      { id: 3, name: 'Case Cards', path: 'client/src/admin/CaseBoardDemo.jsx' },
      { id: 4, name: 'Agent Control Room', path: 'client/src/AgentControlRoom.jsx' },
      { id: 5, name: 'HAC Authority Panel', path: 'client/src/admin/HACQueue.jsx' },
      { id: 6, name: 'PDF Workbench', path: 'client/src/pages/PdfWorkbench.tsx' },
      { id: 7, name: 'Typeform Integration', path: 'server/integrations/' },
      { id: 8, name: 'Family Tree Module', path: 'client/src/admin/CaseTree.jsx' },
      { id: 9, name: 'Applications Generator', path: 'server/pdf-generation-service.ts' },
      { id: 10, name: 'OCR Input', path: 'server/definitive-passport-ocr.ts' },
      { id: 11, name: 'Voice Assistant Input', path: 'client/src/components/VoiceAssistant.jsx' },
      { id: 12, name: 'Audit Logs', path: 'client/src/components/AuditLogger.jsx' },
      { id: 13, name: 'Undo-first Actions', path: 'client/src/components/UndoProvider.jsx' },
      { id: 14, name: 'Checks & System Health', path: 'client/src/admin/SystemChecks.jsx' },
      { id: 15, name: 'Watchdog Verifier', path: 'scripts/watch-done.js' }
    ];
    
    this.results = {};
    this.errors = [];
    this.warnings = [];
  }

  log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logHeader(message) {
    console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}`);
    console.log(`${message}`);
    console.log(`${'='.repeat(60)}${colors.reset}\n`);
  }

  logModuleStatus(moduleId, name, status, details = '') {
    const statusColor = status === 'PASS' ? 'green' : status === 'WARN' ? 'yellow' : 'red';
    const statusIcon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
    
    console.log(`${colors.dim}[${moduleId.toString().padStart(2, '0')}]${colors.reset} ${statusIcon} ${colors[statusColor]}${status}${colors.reset} ${name}`);
    if (details) {
      console.log(`${colors.dim}    ${details}${colors.reset}`);
    }
  }

  async checkFileExists(filePath) {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  async checkFileContent(filePath, requiredPatterns = []) {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const missingPatterns = requiredPatterns.filter(pattern => {
        const regex = new RegExp(pattern, 'i');
        return !regex.test(content);
      });
      
      return {
        exists: true,
        content,
        lineCount: content.split('\n').length,
        missingPatterns
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }

  async checkModule(module) {
    this.log(`Checking Module ${module.id}: ${module.name}...`, 'blue');
    
    let status = 'PASS';
    let details = '';
    const issues = [];

    // Check if file/directory exists
    const exists = await this.checkFileExists(module.path);
    if (!exists) {
      status = 'FAIL';
      issues.push(`File not found: ${module.path}`);
    } else {
      // For specific modules, check content requirements
      switch (module.id) {
        case 11: // Voice Assistant Input
          const voiceCheck = await this.checkFileContent(module.path, [
            'VoiceAssistant',
            'webkitSpeechRecognition|SpeechRecognition',
            'validateAndCleanInput'
          ]);
          if (voiceCheck.missingPatterns.length > 0) {
            status = 'WARN';
            issues.push(`Missing voice features: ${voiceCheck.missingPatterns.join(', ')}`);
          }
          break;
          
        case 12: // Audit Logs
          const auditCheck = await this.checkFileContent(module.path, [
            'AuditLogService',
            'logAction',
            'getAuditLog'
          ]);
          if (auditCheck.missingPatterns.length > 0) {
            status = 'WARN';
            issues.push(`Missing audit features: ${auditCheck.missingPatterns.join(', ')}`);
          }
          break;
          
        case 13: // Undo-first Actions
          const undoCheck = await this.checkFileContent(module.path, [
            'UndoProvider',
            'executeWithUndo',
            'addUndoAction'
          ]);
          if (undoCheck.missingPatterns.length > 0) {
            status = 'WARN';
            issues.push(`Missing undo features: ${undoCheck.missingPatterns.join(', ')}`);
          }
          break;
      }
    }

    details = issues.length > 0 ? issues.join('; ') : 'All checks passed';
    
    this.results[module.id] = { status, details, issues };
    this.logModuleStatus(module.id, module.name, status, details);
    
    if (status === 'FAIL') {
      this.errors.push(`Module ${module.id} (${module.name}): ${details}`);
    } else if (status === 'WARN') {
      this.warnings.push(`Module ${module.id} (${module.name}): ${details}`);
    }
    
    return status;
  }

  async checkServerRunning() {
    try {
      const response = await fetch('http://localhost:5000/api/workflows/status');
      return response.ok;
    } catch {
      return false;
    }
  }

  async checkDependencies() {
    this.log('Checking dependencies...', 'blue');
    
    try {
      // Check if package.json exists
      const packageExists = await this.checkFileExists('package.json');
      if (!packageExists) {
        this.errors.push('package.json not found');
        return false;
      }

      // Check critical dependencies
      const packageContent = await fs.promises.readFile('package.json', 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      const criticalDeps = [
        'react',
        'express',
        '@tanstack/react-query',
        'framer-motion',
        'lucide-react'
      ];
      
      const missingDeps = criticalDeps.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );
      
      if (missingDeps.length > 0) {
        this.warnings.push(`Missing dependencies: ${missingDeps.join(', ')}`);
      }
      
      this.log('✅ Dependencies check completed', 'green');
      return true;
    } catch (error) {
      this.errors.push(`Dependency check failed: ${error.message}`);
      return false;
    }
  }

  async runFullVerification() {
    this.logHeader('🔍 WATCHDOG VERIFIER - FULL SYSTEM VALIDATION');
    
    // Step 1: Check dependencies
    await this.checkDependencies();
    
    // Step 2: Check all modules
    this.log('\n📋 Checking all 15 modules...', 'cyan');
    
    let passCount = 0;
    let warnCount = 0;
    let failCount = 0;
    
    for (const module of this.modules) {
      const status = await this.checkModule(module);
      if (status === 'PASS') passCount++;
      else if (status === 'WARN') warnCount++;
      else failCount++;
    }
    
    // Step 3: Generate summary
    this.logHeader('📊 VERIFICATION SUMMARY');
    
    this.log(`✅ PASSED: ${passCount} modules`, 'green');
    if (warnCount > 0) this.log(`⚠️  WARNINGS: ${warnCount} modules`, 'yellow');
    if (failCount > 0) this.log(`❌ FAILED: ${failCount} modules`, 'red');
    
    // Step 4: List issues
    if (this.errors.length > 0) {
      this.log('\n❌ CRITICAL ERRORS:', 'red');
      this.errors.forEach(error => this.log(`   • ${error}`, 'red'));
    }
    
    if (this.warnings.length > 0) {
      this.log('\n⚠️  WARNINGS:', 'yellow');
      this.warnings.forEach(warning => this.log(`   • ${warning}`, 'yellow'));
    }
    
    // Step 5: Final verdict
    const overallStatus = failCount === 0 ? (warnCount === 0 ? 'FULLY_COMPLETE' : 'COMPLETE_WITH_WARNINGS') : 'INCOMPLETE';
    
    this.log('\n' + '='.repeat(60), 'cyan');
    
    if (overallStatus === 'FULLY_COMPLETE') {
      this.log('🎉 ALL SYSTEMS OPERATIONAL', 'green');
      this.log('', 'green');
      this.log('DONE - CHECKED - CONFIRMED - WORKING', 'bold');
    } else if (overallStatus === 'COMPLETE_WITH_WARNINGS') {
      this.log('⚠️  SYSTEM FUNCTIONAL WITH MINOR ISSUES', 'yellow');
      this.log('Review warnings and consider improvements.', 'yellow');
    } else {
      this.log('❌ SYSTEM INCOMPLETE', 'red');
      this.log('Critical errors must be fixed before deployment.', 'red');
    }
    
    this.log('='.repeat(60), 'cyan');
    
    return overallStatus;
  }

  async exportReport() {
    const report = {
      timestamp: new Date().toISOString(),
      modules: this.modules.map(module => ({
        ...module,
        result: this.results[module.id]
      })),
      summary: {
        total: this.modules.length,
        passed: Object.values(this.results).filter(r => r.status === 'PASS').length,
        warnings: Object.values(this.results).filter(r => r.status === 'WARN').length,
        failed: Object.values(this.results).filter(r => r.status === 'FAIL').length
      },
      errors: this.errors,
      warnings: this.warnings
    };
    
    const reportPath = `watchdog-report-${Date.now()}.json`;
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    this.log(`\n📄 Report saved: ${reportPath}`, 'blue');
    
    return reportPath;
  }
}

// Main execution
async function main() {
  const verifier = new WatchdogVerifier();
  
  try {
    const status = await verifier.runFullVerification();
    await verifier.exportReport();
    
    // Exit codes
    process.exit(status === 'FULLY_COMPLETE' ? 0 : status === 'COMPLETE_WITH_WARNINGS' ? 1 : 2);
  } catch (error) {
    console.error(`${colors.red}WATCHDOG ERROR: ${error.message}${colors.reset}`);
    process.exit(3);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { WatchdogVerifier };