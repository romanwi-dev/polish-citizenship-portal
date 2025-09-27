#!/usr/bin/env node

/**
 * AUTO-FIX AND RE-TEST AGENT
 * 
 * This agent automatically:
 * 1. Detects errors using independent AI verification
 * 2. Automatically fixes the detected issues
 * 3. Re-tests to verify fixes worked
 * 4. Continues this cycle until all tests pass
 * 
 * Purpose: Complete autonomous error detection and correction
 */

import { IndependentAITestingAgent } from './independent-ai-testing-agent.mjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import fetch from 'node-fetch';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

class AutoFixAndRetestAgent {
  constructor() {
    this.maxIterations = 5; // Prevent infinite loops
    this.fixes = [];
    this.testResults = [];
    
    console.log('🤖 AUTO-FIX AND RE-TEST AGENT STARTED');
    console.log('🔧 PURPOSE: Automatically detect errors, fix them, and re-test');
    console.log('🔄 PROCESS: Fix → Test → Fix → Test until all pass');
    console.log('⚡ MAX ITERATIONS: 5 to prevent infinite loops');
    console.log('=' .repeat(70));
  }

  async generateAutoFix(errorDescription, fileName, fileContent) {
    try {
      console.log(`🛠️  Generating automatic fix for: ${errorDescription}`);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `You are an AUTO-FIX AI agent. Your job is to automatically fix code errors.

ERROR TO FIX:
${errorDescription}

FILE: ${fileName}
CURRENT CODE:
${fileContent.substring(0, 3000)}

Generate the EXACT fixed code. Focus on:
1. Fix CSS syntax errors (malformed rules, missing brackets)
2. Remove problematic comments that break CSS
3. Ensure valid CSS structure
4. Keep existing functionality intact

Return ONLY the corrected code section that needs to be replaced.

If it's a CSS syntax error like "/* No animations */;" breaking rules, fix by:
- Removing malformed comment-semicolon combinations
- Ensuring proper bracket structure
- Maintaining valid CSS syntax

Respond with JSON format:
{
  "fixDescription": "Brief description of what was fixed",
  "oldCode": "exact code to replace",
  "newCode": "corrected code",
  "confidence": 0-100
}`
          }]
        })
      });

      const result = await response.json();
      
      if (result.content && result.content[0] && result.content[0].text) {
        try {
          const fix = JSON.parse(result.content[0].text.replace(/```json\n?|\n?```/g, ''));
          return fix;
        } catch (parseError) {
          console.error('Failed to parse AI fix response');
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Auto-fix generation failed:', error);
      return null;
    }
  }

  async applyFix(fix, fileName) {
    try {
      if (!fix || !fix.oldCode || !fix.newCode) {
        throw new Error('Invalid fix format');
      }

      const currentContent = readFileSync(fileName, 'utf8');
      
      if (!currentContent.includes(fix.oldCode)) {
        console.log('⚠️  Fix not applicable - code may have changed');
        return false;
      }

      const fixedContent = currentContent.replace(fix.oldCode, fix.newCode);
      writeFileSync(fileName, fixedContent);
      
      console.log(`✅ Applied fix: ${fix.fixDescription}`);
      
      this.fixes.push({
        file: fileName,
        description: fix.fixDescription,
        timestamp: new Date().toISOString()
      });
      
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to apply fix:`, error);
      return false;
    }
  }

  async runAutoFixCycle(taskDescription, verificationPlan) {
    console.log(`\n🔄 Starting auto-fix cycle for: ${taskDescription}`);
    
    for (let iteration = 1; iteration <= this.maxIterations; iteration++) {
      console.log(`\n📊 === ITERATION ${iteration}/${this.maxIterations} ===`);
      
      // Step 1: Run independent verification
      console.log('1️⃣  Running independent AI verification...');
      const testingAgent = new IndependentAITestingAgent();
      const testResult = await testingAgent.run10xIterations(taskDescription, verificationPlan);
      
      this.testResults.push({
        iteration,
        successRate: testResult.successRate,
        issues: testResult.issues,
        verdict: testResult.finalVerdict
      });
      
      // Step 2: Check if we're done
      if (testResult.finalVerdict === 'VERIFIED') {
        console.log(`🎉 SUCCESS! All tests passing after ${iteration} iterations`);
        console.log(`✅ ${testResult.successRate}% success rate achieved`);
        
        return {
          success: true,
          iterations: iteration,
          finalSuccessRate: testResult.successRate,
          totalFixes: this.fixes.length,
          fixes: this.fixes
        };
      }
      
      // Step 3: Generate and apply fixes for each issue
      console.log(`2️⃣  Found ${testResult.issues.length} issues to fix automatically...`);
      
      let fixesApplied = 0;
      
      for (const issue of testResult.issues.slice(0, 3)) { // Limit to 3 fixes per iteration
        console.log(`🛠️  Auto-fixing: ${issue.substring(0, 100)}...`);
        
        // Determine which file to fix based on the issue
        let targetFile = verificationPlan.codeToAnalyze;
        if (issue.toLowerCase().includes('css')) {
          targetFile = 'frontend/ai-citizenship-intake/style-redesigned.css';
        }
        
        if (!existsSync(targetFile)) {
          console.log(`⚠️  Target file not found: ${targetFile}`);
          continue;
        }
        
        const fileContent = readFileSync(targetFile, 'utf8');
        const fix = await this.generateAutoFix(issue, targetFile, fileContent);
        
        if (fix && fix.confidence > 70) {
          const applied = await this.applyFix(fix, targetFile);
          if (applied) {
            fixesApplied++;
            
            // Small delay between fixes
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      console.log(`3️⃣  Applied ${fixesApplied} automatic fixes`);
      
      if (fixesApplied === 0) {
        console.log('⚠️  No fixes could be applied automatically');
        break;
      }
      
      // Small delay before next iteration
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Return final results
    const lastResult = this.testResults[this.testResults.length - 1];
    
    return {
      success: false,
      iterations: this.maxIterations,
      finalSuccessRate: lastResult.successRate,
      totalFixes: this.fixes.length,
      fixes: this.fixes,
      remainingIssues: lastResult.issues
    };
  }

  generateReport() {
    console.log(`\n📋 AUTO-FIX AND RE-TEST REPORT`);
    console.log('=' .repeat(50));
    console.log(`🔧 Total Fixes Applied: ${this.fixes.length}`);
    console.log(`🧪 Test Iterations: ${this.testResults.length}`);
    
    if (this.testResults.length > 0) {
      const firstResult = this.testResults[0];
      const lastResult = this.testResults[this.testResults.length - 1];
      
      console.log(`📈 Success Rate Improvement:`);
      console.log(`   Initial: ${firstResult.successRate}%`);
      console.log(`   Final: ${lastResult.successRate}%`);
      console.log(`   Improvement: +${lastResult.successRate - firstResult.successRate}%`);
    }
    
    if (this.fixes.length > 0) {
      console.log(`\n🛠️  Fixes Applied:`);
      this.fixes.forEach((fix, i) => {
        console.log(`   ${i+1}. ${fix.description} (${fix.file})`);
      });
    }
  }
}

// Export for use as module or run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Running directly - fix CSS syntax errors
  const agent = new AutoFixAndRetestAgent();
  
  const taskDescription = "Fix CSS syntax errors and remove all animations";
  const verificationPlan = {
    codeToAnalyze: 'frontend/ai-citizenship-intake/style-redesigned.css',
    expectedBehavior: "Valid CSS with no syntax errors and no transform animations",
    testingCommands: [
      {
        command: 'npx stylelint frontend/ai-citizenship-intake/style-redesigned.css --config-basedir .',
        description: 'Check CSS syntax validity',
        successIndicators: ['no errors found', 'stylelint found 0 problems']
      }
    ]
  };
  
  agent.runAutoFixCycle(taskDescription, verificationPlan)
    .then(result => {
      agent.generateReport();
      console.log('\n🤖 AUTO-FIX AND RE-TEST AGENT COMPLETED');
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Auto-fix cycle failed:', error);
      process.exit(1);
    });
}

export { AutoFixAndRetestAgent };