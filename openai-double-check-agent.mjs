#!/usr/bin/env node

/**
 * OpenAI Double-Check Agent
 * Double-checks Claude's independent verification results using OpenAI API
 * Provides cross-AI validation for maximum reliability
 */

import OpenAI from 'openai';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

console.log('🔄 OPENAI DOUBLE-CHECK AGENT STARTED');
console.log('🎯 PURPOSE: Double-check Claude\'s verification using OpenAI for cross-AI validation');
console.log('🤖 PROVIDER: OpenAI GPT-5 (separate from Claude)');
console.log('✨ BENEFIT: Two different AI providers = Higher reliability');
console.log('=' .repeat(70));

async function runClaudeAgent() {
  console.log('1️⃣  Running Claude Independent Agent first...');
  
  try {
    const { stdout } = await execPromise('node independent-ai-testing-agent.mjs');
    console.log('✅ Claude agent completed successfully');
    return stdout;
  } catch (error) {
    console.log('⚠️  Claude agent had issues, continuing with OpenAI double-check...');
    return `Claude analysis had errors: ${error.message}`;
  }
}

async function analyzeWithOpenAI(claudeResults, codebase) {
  console.log('2️⃣  Analyzing codebase with OpenAI GPT-5...');
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system", 
          content: `You are an expert software testing analyst. Your job is to double-check another AI's (Claude's) verification results using your own independent analysis.

TASK: Review the codebase and Claude's findings, then provide your own independent assessment.

FOCUS AREAS:
1. Verify Claude's findings are accurate
2. Find any issues Claude might have missed  
3. Check for false positives in Claude's analysis
4. Provide your own success rate assessment
5. Give objective feedback on code quality

RESPOND with JSON in this format:
{
  "agrees_with_claude": boolean,
  "openai_success_rate": number (0-100),
  "issues_found": ["issue1", "issue2"],
  "issues_missed_by_claude": ["missed1", "missed2"], 
  "false_positives_in_claude": ["false1", "false2"],
  "overall_verdict": "PASSED|PARTIALLY_WORKING|FAILED",
  "confidence": number (0-100),
  "reasoning": "detailed explanation"
}`
        },
        {
          role: "user",
          content: `Please double-check this Claude verification analysis:

CLAUDE'S RESULTS:
${claudeResults}

CODEBASE TO VERIFY:
${codebase}

Provide your independent OpenAI analysis in JSON format.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('❌ OpenAI analysis failed:', error);
    return {
      agrees_with_claude: false,
      openai_success_rate: 0,
      issues_found: [`OpenAI analysis error: ${error.message}`],
      issues_missed_by_claude: [],
      false_positives_in_claude: [],
      overall_verdict: "FAILED",
      confidence: 0,
      reasoning: `OpenAI analysis failed due to: ${error.message}`
    };
  }
}

async function getCodebaseSnapshot() {
  console.log('📂 Getting codebase snapshot for analysis...');
  
  try {
    // Get key files for analysis
    const files = [
      'frontend/ai-citizenship-intake/style-redesigned.css',
      'frontend/ai-citizenship-intake/script-enhanced.js', 
      'server/routes.ts',
      'client/src/App.tsx'
    ];
    
    let codebase = '';
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        codebase += `\n=== ${file} ===\n${content}\n`;
      } catch (error) {
        codebase += `\n=== ${file} ===\nFile not found or error reading: ${error.message}\n`;
      }
    }
    
    return codebase;
  } catch (error) {
    return `Error getting codebase: ${error.message}`;
  }
}

async function runDoubleCheckAnalysis() {
  console.log('🔄 Starting OpenAI double-check analysis...');
  
  // Step 1: Run Claude agent
  const claudeResults = await runClaudeAgent();
  
  // Step 2: Get codebase for OpenAI
  const codebase = await getCodebaseSnapshot();
  
  // Step 3: Run OpenAI analysis
  const openaiAnalysis = await analyzeWithOpenAI(claudeResults, codebase);
  
  // Step 4: Compare results
  console.log('3️⃣  Comparing Claude vs OpenAI results...');
  
  const comparison = {
    claude_vs_openai: {
      agreement: openaiAnalysis.agrees_with_claude,
      claude_found_issues: claudeResults.includes('❌') ? 'YES' : 'NO',
      openai_success_rate: openaiAnalysis.openai_success_rate,
      consensus_verdict: openaiAnalysis.overall_verdict,
      confidence: openaiAnalysis.confidence
    },
    cross_validation: {
      both_agree: openaiAnalysis.agrees_with_claude,
      additional_issues: openaiAnalysis.issues_missed_by_claude,
      false_positives: openaiAnalysis.false_positives_in_claude,
      reliability_score: Math.min(95, (openaiAnalysis.confidence + 85) / 2) // Conservative scoring
    },
    final_assessment: {
      verified_by_both_ai: openaiAnalysis.agrees_with_claude && openaiAnalysis.confidence > 80,
      recommended_action: openaiAnalysis.overall_verdict === 'PASSED' ? 'DEPLOY' : 'FIX_ISSUES',
      trust_score: openaiAnalysis.agrees_with_claude ? 'HIGH' : 'REVIEW_NEEDED'
    }
  };
  
  return { claudeResults, openaiAnalysis, comparison };
}

// Main execution
async function main() {
  try {
    const results = await runDoubleCheckAnalysis();
    
    console.log('4️⃣  Cross-AI validation completed!');
    console.log('');
    console.log('🎯 CLAUDE vs OPENAI COMPARISON:');
    console.log(`📊 Agreement: ${results.comparison.claude_vs_openai.agreement ? '✅ AGREE' : '❌ DISAGREE'}`);
    console.log(`📈 OpenAI Success Rate: ${results.openaiAnalysis.openai_success_rate}%`);
    console.log(`🏆 Consensus Verdict: ${results.comparison.claude_vs_openai.consensus_verdict}`);
    console.log(`🎯 Confidence: ${results.comparison.claude_vs_openai.confidence}%`);
    console.log('');
    
    if (results.openaiAnalysis.issues_missed_by_claude.length > 0) {
      console.log('⚠️  ISSUES CLAUDE MISSED:');
      results.openaiAnalysis.issues_missed_by_claude.forEach(issue => {
        console.log(`   • ${issue}`);
      });
      console.log('');
    }
    
    if (results.openaiAnalysis.false_positives_in_claude.length > 0) {
      console.log('🔍 CLAUDE FALSE POSITIVES:');
      results.openaiAnalysis.false_positives_in_claude.forEach(issue => {
        console.log(`   • ${issue}`);
      });
      console.log('');
    }
    
    console.log('✨ CROSS-AI VALIDATION BENEFITS:');
    console.log('   • Two different AI models verify the same code');
    console.log('   • Catches issues one AI might miss');
    console.log('   • Eliminates single-AI bias');
    console.log('   • Provides confidence scoring');
    console.log('');
    
    const finalScore = results.comparison.cross_validation.reliability_score;
    console.log(`🎯 FINAL DOUBLE-CHECK RESULTS:`);
    console.log(`📊 Cross-AI Reliability Score: ${finalScore}%`);
    console.log(`🏆 Verified by Both AI: ${results.comparison.final_assessment.verified_by_both_ai ? '✅ YES' : '❌ NO'}`);
    console.log(`🚀 Recommended Action: ${results.comparison.final_assessment.recommended_action}`);
    console.log(`🛡️ Trust Score: ${results.comparison.final_assessment.trust_score}`);
    
    // Save detailed results
    fs.writeFileSync('test-results/openai-double-check-report.json', JSON.stringify(results, null, 2));
    console.log('💾 Detailed report saved: test-results/openai-double-check-report.json');
    
    console.log('');
    console.log('🤖 OPENAI DOUBLE-CHECK AGENT COMPLETED');
    console.log('✨ Now you have Claude AND OpenAI both verifying your work!');
    
  } catch (error) {
    console.error('❌ Double-check analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default { runDoubleCheckAnalysis };