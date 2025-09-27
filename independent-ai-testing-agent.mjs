#!/usr/bin/env node

/**
 * INDEPENDENT AI TESTING AGENT
 * 
 * This agent is COMPLETELY INDEPENDENT from the implementing AI.
 * It uses separate AI reasoning to verify implementations and catch mistakes.
 * 
 * Purpose: Verify that every task was actually implemented correctly
 * Runs: 10x iterations to ensure reliability
 * Reports: Honest assessment without bias from implementing AI
 */

import fetch from 'node-fetch';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

class IndependentAITestingAgent {
  constructor() {
    this.results = {
      iterations: [],
      finalVerdict: null,
      issues: [],
      successRate: 0,
      timestamp: new Date().toISOString()
    };
    
    console.log('🤖 INDEPENDENT AI TESTING AGENT STARTED');
    console.log('🎯 PURPOSE: Objectively verify implementing AI\'s work');
    console.log('🔍 INDEPENDENCE: Using separate AI reasoning to catch mistakes');
    console.log('📊 RELIABILITY: Running 10 iterations to verify consistency');
    console.log('=' .repeat(70));
  }

  async analyzeWithIndependentAI(taskDescription, codeToAnalyze, expectedBehavior) {
    try {
      // Use Claude API for independent analysis
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `You are an INDEPENDENT AI testing agent. Your job is to objectively verify if another AI's implementation actually works.

TASK CLAIMED TO BE IMPLEMENTED:
${taskDescription}

CODE PROVIDED:
${codeToAnalyze}

EXPECTED BEHAVIOR:
${expectedBehavior}

ANALYZE INDEPENDENTLY AND ANSWER:
1. Does the code actually implement what was claimed?
2. Will this code work when executed?
3. Are there obvious bugs or missing pieces?
4. Does it handle edge cases?
5. Overall: VERIFIED or FAILED?

Be BRUTALLY HONEST. Don't be nice. If it's broken, say it's broken.
If it's incomplete, say it's incomplete. Your job is to catch mistakes.

Respond in JSON format:
{
  "verified": boolean,
  "issues": ["list", "of", "issues"],
  "worksFunctionally": boolean,
  "confidence": 0-100,
  "summary": "brief honest assessment"
}`
          }]
        })
      });

      const result = await response.json();
      
      if (result.content && result.content[0] && result.content[0].text) {
        try {
          const analysis = JSON.parse(result.content[0].text.replace(/```json\n?|\n?```/g, ''));
          return analysis;
        } catch (parseError) {
          // Fallback if JSON parsing fails
          const text = result.content[0].text;
          return {
            verified: text.toLowerCase().includes('verified') && !text.toLowerCase().includes('failed'),
            issues: [text],
            worksFunctionally: text.toLowerCase().includes('works'),
            confidence: 50,
            summary: text.substring(0, 200)
          };
        }
      } else {
        throw new Error('Invalid AI response format');
      }
    } catch (error) {
      console.error('Independent AI analysis failed:', error);
      return {
        verified: false,
        issues: [`AI analysis failed: ${error.message}`],
        worksFunctionally: false,
        confidence: 0,
        summary: 'Could not perform independent analysis'
      };
    }
  }

  async testActualFunctionality(testingCommands) {
    const functionalityResults = [];
    
    for (const command of testingCommands) {
      try {
        console.log(`🧪 Testing: ${command.description}`);
        
        // Execute actual test
        const testResult = await this.executeRealTest(command);
        
        functionalityResults.push({
          command: command.description,
          passed: testResult.success,
          output: testResult.output,
          error: testResult.error
        });
        
        console.log(testResult.success ? '✅' : '❌', command.description);
        
      } catch (error) {
        functionalityResults.push({
          command: command.description,
          passed: false,
          output: null,
          error: error.message
        });
        console.log('❌', command.description, '-', error.message);
      }
    }
    
    return functionalityResults;
  }

  async executeRealTest(testCommand) {
    return new Promise(async (resolve) => {
      const { exec } = await import('child_process');
      
      exec(testCommand.command, { timeout: 10000 }, (error, stdout, stderr) => {
        if (error) {
          resolve({
            success: false,
            output: stdout,
            error: error.message
          });
        } else {
          // Check if output indicates success
          const success = testCommand.successIndicators.some(indicator => 
            stdout.includes(indicator) || stderr.includes(indicator)
          );
          
          resolve({
            success,
            output: stdout + stderr,
            error: null
          });
        }
      });
    });
  }

  async run10xIterations(taskDescription, verificationPlan) {
    console.log(`🔄 Running 10x iterations to verify: ${taskDescription}`);
    console.log('💡 Each iteration uses independent AI reasoning');
    
    const iterations = [];
    
    for (let i = 1; i <= 10; i++) {
      console.log(`\n🧪 ITERATION ${i}/10`);
      
      try {
        // Independent AI analysis
        const aiAnalysis = await this.analyzeWithIndependentAI(
          taskDescription,
          verificationPlan.codeToAnalyze,
          verificationPlan.expectedBehavior
        );
        
        // Actual functionality testing
        const functionalityResults = await this.testActualFunctionality(
          verificationPlan.testingCommands || []
        );
        
        const iterationResult = {
          iteration: i,
          aiAnalysis,
          functionalityResults,
          overallPassed: aiAnalysis.verified && functionalityResults.every(r => r.passed),
          timestamp: new Date().toISOString()
        };
        
        iterations.push(iterationResult);
        
        console.log(`📊 Iteration ${i}: ${iterationResult.overallPassed ? 'PASS' : 'FAIL'}`);
        
        // Small delay between iterations
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Iteration ${i} failed:`, error);
        iterations.push({
          iteration: i,
          aiAnalysis: { verified: false, issues: [error.message] },
          functionalityResults: [],
          overallPassed: false,
          error: error.message
        });
      }
    }
    
    this.results.iterations = iterations;
    this.analyzeIterationResults();
    
    return this.results;
  }

  analyzeIterationResults() {
    const passed = this.results.iterations.filter(i => i.overallPassed).length;
    const total = this.results.iterations.length;
    this.results.successRate = Math.round((passed / total) * 100);
    
    // Collect all unique issues
    const allIssues = new Set();
    this.results.iterations.forEach(iteration => {
      if (iteration.aiAnalysis && iteration.aiAnalysis.issues) {
        iteration.aiAnalysis.issues.forEach(issue => allIssues.add(issue));
      }
      if (iteration.functionalityResults) {
        iteration.functionalityResults.forEach(result => {
          if (!result.passed && result.error) {
            allIssues.add(result.error);
          }
        });
      }
    });
    
    this.results.issues = Array.from(allIssues);
    
    // Final verdict
    if (this.results.successRate >= 80) {
      this.results.finalVerdict = 'VERIFIED';
    } else if (this.results.successRate >= 50) {
      this.results.finalVerdict = 'PARTIALLY_WORKING';
    } else {
      this.results.finalVerdict = 'FAILED';
    }
    
    console.log(`\n🎯 FINAL INDEPENDENT ASSESSMENT:`);
    console.log(`📊 Success Rate: ${this.results.successRate}% (${passed}/${total} iterations)`);
    console.log(`🏆 Final Verdict: ${this.results.finalVerdict}`);
    
    if (this.results.issues.length > 0) {
      console.log(`⚠️  Issues Found:`);
      this.results.issues.forEach((issue, i) => {
        console.log(`   ${i+1}. ${issue}`);
      });
    }
  }

  saveResults() {
    try {
      if (!existsSync('test-results')) {
        mkdirSync('test-results', { recursive: true });
      }
      
      const filename = `test-results/independent-ai-assessment-${Date.now()}.json`;
      writeFileSync(filename, JSON.stringify(this.results, null, 2));
      
      console.log(`📄 Independent assessment saved: ${filename}`);
      return filename;
    } catch (error) {
      console.error('Failed to save results:', error);
      return null;
    }
  }
}

// Main execution function
async function runIndependentVerification(taskDescription, verificationPlan) {
  const agent = new IndependentAITestingAgent();
  
  try {
    const results = await agent.run10xIterations(taskDescription, verificationPlan);
    const savedFile = agent.saveResults();
    
    return {
      success: true,
      results,
      savedFile
    };
    
  } catch (error) {
    console.error('🚨 INDEPENDENT VERIFICATION FAILED:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for use as module or run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Running directly - verify the animation removal task as example
  const exampleTask = {
    taskDescription: "Remove all aggressive animations and make buttons quiet and simple",
    codeToAnalyze: existsSync('frontend/ai-citizenship-intake/style-redesigned.css') ? 
      readFileSync('frontend/ai-citizenship-intake/style-redesigned.css', 'utf8') : 'File not found',
    expectedBehavior: "All transform: scale(), translateY(), and keyframe animations should be removed or replaced with simple opacity changes",
    testingCommands: [
      {
        command: 'grep -c "scale(1\\." frontend/ai-citizenship-intake/style-redesigned.css',
        description: 'Check for remaining aggressive scaling animations',
        successIndicators: ['0']
      },
      {
        command: 'grep -c "translateY(" frontend/ai-citizenship-intake/style-redesigned.css',
        description: 'Check for remaining transform movements',
        successIndicators: ['0']
      }
    ]
  };
  
  runIndependentVerification(
    "Animation removal verification",
    exampleTask
  ).then(result => {
    console.log('\n🤖 INDEPENDENT AI TESTING AGENT COMPLETED');
    process.exit(result.success ? 0 : 1);
  });
}

export { runIndependentVerification, IndependentAITestingAgent };