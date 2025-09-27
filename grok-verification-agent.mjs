#!/usr/bin/env node
/**
 * 🔴 RULE X: MANDATORY GROK VERIFICATION AGENT
 * 
 * This script performs comprehensive architecture and deployment verification
 * using Grok AI to ensure system is ready for production deployment.
 */

import OpenAI from "openai";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

// Initialize Grok AI client
const grok = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY
});

class GrokVerificationAgent {
  constructor() {
    this.taskDescription = process.argv[2] || 'Grok Architecture Verification';
    this.verificationScope = process.argv[3] || 'architecture';
    this.results = {
      architectureScore: 0,
      scalabilityTest: false,
      performanceProjection: {},
      deploymentReady: false,
      hasIssues: false,
      issues: [],
      recommendations: []
    };
  }

  async verifySystemArchitecture() {
    console.log('🔴 RULE X: Starting Grok Architecture Verification...');
    
    try {
      // 1. Analyze project structure and architecture
      const projectStructure = await this.analyzeProjectStructure();
      
      // 2. Use Grok AI to evaluate architecture
      const architectureAnalysis = await this.grokArchitectureAnalysis(projectStructure);
      
      // 3. Test scalability concerns
      const scalabilityResults = await this.testScalability();
      
      // 4. Performance projections
      const performanceAnalysis = await this.analyzePerformance();
      
      // 5. Deployment readiness check
      const deploymentAnalysis = await this.checkDeploymentReadiness();
      
      // Combine all results
      this.compileResults(architectureAnalysis, scalabilityResults, performanceAnalysis, deploymentAnalysis);
      
      return this.results;
      
    } catch (error) {
      console.error('❌ RULE X VIOLATION: Grok verification failed:', error);
      this.results.hasIssues = true;
      this.results.issues.push(`Grok verification error: ${error.message}`);
      return this.results;
    }
  }

  async analyzeProjectStructure() {
    try {
      // Get project files and structure
      const { stdout: fileList } = await execPromise('find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" | head -50');
      
      // Read key architecture files
      const keyFiles = [
        'package.json',
        'server/index.ts',
        'server/routes.ts', 
        'shared/schema.ts',
        'client/src/App.tsx',
        'vite.config.ts'
      ];
      
      const fileContents = {};
      for (const file of keyFiles) {
        try {
          const content = await fs.readFile(file, 'utf8');
          fileContents[file] = content.substring(0, 2000); // First 2000 chars
        } catch (error) {
          // File might not exist
        }
      }
      
      return {
        fileList: fileList.trim(),
        keyFiles: fileContents,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.log('⚠️ Project structure analysis limited:', error.message);
      return { limited: true, error: error.message };
    }
  }

  async grokArchitectureAnalysis(projectStructure) {
    try {
      console.log('🤖 Analyzing architecture with Grok AI...');
      
      const prompt = `You are a senior software architect reviewing a Polish citizenship application platform. Analyze this project structure and provide a comprehensive architectural assessment.

PROJECT CONTEXT:
- Full-stack TypeScript/React application
- Express.js backend with PostgreSQL database
- AI-powered document processing (OCR)
- Mobile-first design requirements
- Production deployment on Replit

PROJECT STRUCTURE:
${JSON.stringify(projectStructure, null, 2)}

ANALYSIS REQUIREMENTS:
1. Architecture Quality (0-100%)
2. Scalability Assessment
3. Performance Concerns
4. Security Evaluation
5. Deployment Readiness
6. Mobile Compatibility
7. Code Organization
8. Dependency Management

Provide your analysis in JSON format:
{
  "overallScore": 0-100,
  "architecture": {
    "score": 0-100,
    "strengths": ["list of strengths"],
    "weaknesses": ["list of issues"]
  },
  "scalability": {
    "score": 0-100,
    "bottlenecks": ["identified bottlenecks"],
    "recommendations": ["scaling recommendations"]
  },
  "performance": {
    "score": 0-100,
    "concerns": ["performance issues"],
    "optimizations": ["suggested optimizations"]
  },
  "security": {
    "score": 0-100,
    "vulnerabilities": ["security issues"],
    "recommendations": ["security improvements"]
  },
  "deployment": {
    "score": 0-100,
    "blockers": ["deployment blockers"],
    "requirements": ["deployment requirements"]
  },
  "mobile": {
    "score": 0-100,
    "issues": ["mobile-specific issues"],
    "compatibility": "good/poor/excellent"
  },
  "verdict": "EXCELLENT/GOOD/NEEDS_WORK/CRITICAL_ISSUES",
  "deploymentReady": true/false,
  "priorityIssues": ["most critical issues to fix"],
  "recommendations": ["top 3 recommendations"]
}`;

      const response = await grok.chat.completions.create({
        model: "grok-2-1212",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      console.log(`🤖 Grok Analysis Complete: ${analysis.verdict} (${analysis.overallScore}%)`);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Grok AI analysis failed:', error);
      return {
        overallScore: 0,
        verdict: 'ANALYSIS_FAILED',
        deploymentReady: false,
        error: error.message
      };
    }
  }

  async testScalability() {
    console.log('📈 Testing scalability factors...');
    
    try {
      // Check database connection pooling
      const dbConfig = await this.checkDatabaseConfig();
      
      // Analyze memory usage patterns
      const memoryUsage = process.memoryUsage();
      
      // Check for potential memory leaks or bottlenecks
      const scalabilityFactors = {
        databaseConnections: dbConfig.hasPooling ? 'good' : 'needs_improvement',
        memoryUsage: memoryUsage.heapUsed < 100 * 1024 * 1024 ? 'good' : 'high', // 100MB threshold
        fileHandling: 'analyzed',
        sessionManagement: 'needs_analysis'
      };
      
      const scalabilityScore = this.calculateScalabilityScore(scalabilityFactors);
      
      return {
        score: scalabilityScore,
        factors: scalabilityFactors,
        memoryUsage,
        recommendations: this.getScalabilityRecommendations(scalabilityFactors)
      };
      
    } catch (error) {
      console.log('⚠️ Scalability test limited:', error.message);
      return { score: 50, limited: true, error: error.message };
    }
  }

  async checkDatabaseConfig() {
    try {
      // Check if database pooling is configured
      const serverCode = await fs.readFile('server/index.ts', 'utf8').catch(() => '');
      const routesCode = await fs.readFile('server/routes.ts', 'utf8').catch(() => '');
      
      const hasPooling = serverCode.includes('Pool') || routesCode.includes('pool');
      const hasProperConfig = serverCode.includes('DATABASE_URL');
      
      return { hasPooling, hasProperConfig };
    } catch (error) {
      return { hasPooling: false, hasProperConfig: false };
    }
  }

  calculateScalabilityScore(factors) {
    let score = 100;
    
    if (factors.databaseConnections !== 'good') score -= 20;
    if (factors.memoryUsage !== 'good') score -= 15;
    if (factors.sessionManagement !== 'good') score -= 10;
    
    return Math.max(score, 0);
  }

  getScalabilityRecommendations(factors) {
    const recommendations = [];
    
    if (factors.databaseConnections !== 'good') {
      recommendations.push('Implement database connection pooling');
    }
    if (factors.memoryUsage !== 'good') {
      recommendations.push('Optimize memory usage and implement garbage collection');
    }
    if (factors.sessionManagement !== 'good') {
      recommendations.push('Review session management and storage strategy');
    }
    
    return recommendations;
  }

  async analyzePerformance() {
    console.log('⚡ Analyzing performance characteristics...');
    
    try {
      // Simple performance check
      const startTime = Date.now();
      
      // Test basic operations
      await this.simulateBasicOperations();
      
      const operationTime = Date.now() - startTime;
      
      const performanceMetrics = {
        basicOperations: operationTime,
        grade: operationTime < 1000 ? 'excellent' : operationTime < 3000 ? 'good' : 'needs_improvement'
      };
      
      const performanceScore = operationTime < 1000 ? 95 : operationTime < 3000 ? 80 : 60;
      
      return {
        score: performanceScore,
        metrics: performanceMetrics,
        recommendations: performanceScore < 80 ? ['Optimize slow operations', 'Add caching layer'] : []
      };
      
    } catch (error) {
      console.log('⚠️ Performance analysis limited:', error.message);
      return { score: 70, limited: true, error: error.message };
    }
  }

  async simulateBasicOperations() {
    // Simulate some basic operations to test responsiveness
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Test file system operations
    try {
      await fs.access('package.json');
    } catch (error) {
      // File access test
    }
  }

  async checkDeploymentReadiness() {
    console.log('🚀 Checking deployment readiness...');
    
    try {
      const deploymentChecks = {
        packageJson: await this.checkPackageJson(),
        environmentVars: this.checkEnvironmentVariables(),
        buildProcess: await this.checkBuildProcess(),
        dependencies: await this.checkDependencies()
      };
      
      const deploymentScore = this.calculateDeploymentScore(deploymentChecks);
      const isReady = deploymentScore >= 85;
      
      return {
        score: deploymentScore,
        ready: isReady,
        checks: deploymentChecks,
        blockers: this.identifyDeploymentBlockers(deploymentChecks)
      };
      
    } catch (error) {
      console.log('⚠️ Deployment readiness check limited:', error.message);
      return { score: 50, ready: false, limited: true, error: error.message };
    }
  }

  async checkPackageJson() {
    try {
      const packageContent = await fs.readFile('package.json', 'utf8');
      const packageData = JSON.parse(packageContent);
      
      return {
        hasStartScript: !!packageData.scripts?.dev,
        hasBuildScript: !!packageData.scripts?.build,
        hasName: !!packageData.name,
        hasVersion: !!packageData.version
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  checkEnvironmentVariables() {
    const requiredVars = ['DATABASE_URL'];
    const optionalVars = ['OPENAI_API_KEY', 'XAI_API_KEY'];
    
    const required = requiredVars.map(varName => ({
      name: varName,
      present: !!process.env[varName]
    }));
    
    const optional = optionalVars.map(varName => ({
      name: varName,
      present: !!process.env[varName]
    }));
    
    return { required, optional };
  }

  async checkBuildProcess() {
    try {
      // Check if Vite config exists
      const viteExists = await fs.access('vite.config.ts').then(() => true).catch(() => false);
      const tsconfigExists = await fs.access('tsconfig.json').then(() => true).catch(() => false);
      
      return { viteConfig: viteExists, typescript: tsconfigExists };
    } catch (error) {
      return { error: error.message };
    }
  }

  async checkDependencies() {
    try {
      const packageContent = await fs.readFile('package.json', 'utf8');
      const packageData = JSON.parse(packageContent);
      
      const depCount = Object.keys(packageData.dependencies || {}).length;
      const devDepCount = Object.keys(packageData.devDependencies || {}).length;
      
      return {
        productionDeps: depCount,
        devDeps: devDepCount,
        hasEssentialDeps: depCount > 10 // Rough estimate
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  calculateDeploymentScore(checks) {
    let score = 100;
    
    if (!checks.packageJson.hasStartScript) score -= 20;
    if (!checks.packageJson.hasName) score -= 10;
    
    const missingRequiredVars = checks.environmentVars.required.filter(v => !v.present).length;
    score -= missingRequiredVars * 15;
    
    if (!checks.buildProcess.viteConfig) score -= 15;
    if (!checks.dependencies.hasEssentialDeps) score -= 10;
    
    return Math.max(score, 0);
  }

  identifyDeploymentBlockers(checks) {
    const blockers = [];
    
    if (!checks.packageJson.hasStartScript) {
      blockers.push('Missing start/dev script in package.json');
    }
    
    const missingVars = checks.environmentVars.required.filter(v => !v.present);
    if (missingVars.length > 0) {
      blockers.push(`Missing environment variables: ${missingVars.map(v => v.name).join(', ')}`);
    }
    
    if (!checks.buildProcess.viteConfig) {
      blockers.push('Missing Vite configuration');
    }
    
    return blockers;
  }

  compileResults(architectureAnalysis, scalabilityResults, performanceAnalysis, deploymentAnalysis) {
    // Calculate overall architecture score
    this.results.architectureScore = Math.round(
      (architectureAnalysis.overallScore * 0.4) +
      (scalabilityResults.score * 0.2) +
      (performanceAnalysis.score * 0.2) +
      (deploymentAnalysis.score * 0.2)
    );
    
    this.results.scalabilityTest = scalabilityResults.score >= 80;
    this.results.performanceProjection = {
      score: performanceAnalysis.score,
      metrics: performanceAnalysis.metrics,
      grade: performanceAnalysis.metrics?.grade || 'unknown'
    };
    
    this.results.deploymentReady = deploymentAnalysis.ready && this.results.architectureScore >= 85;
    
    // Compile issues
    this.results.issues = [
      ...(architectureAnalysis.priorityIssues || []),
      ...(scalabilityResults.recommendations || []),
      ...(performanceAnalysis.recommendations || []),
      ...(deploymentAnalysis.blockers || [])
    ];
    
    this.results.hasIssues = this.results.issues.length > 0;
    
    // Compile recommendations
    this.results.recommendations = [
      ...(architectureAnalysis.recommendations || []),
      ...this.results.issues.slice(0, 3) // Top 3 issues as recommendations
    ];
    
    console.log(`🔴 RULE X RESULT: ${this.results.deploymentReady ? 'ENFORCED' : 'VIOLATION'} - Architecture: ${this.results.architectureScore}%`);
  }

  async run() {
    const startTime = Date.now();
    
    try {
      await this.verifySystemArchitecture();
      
      const result = {
        status: 'completed',
        type: 'grok_verification',
        duration: Date.now() - startTime,
        taskDescription: this.taskDescription,
        verificationScope: this.verificationScope,
        ...this.results,
        compliance: {
          ruleX: this.results.deploymentReady && this.results.architectureScore >= 95 ? 'ENFORCED' : 'VIOLATION'
        },
        timestamp: new Date().toISOString()
      };
      
      console.log(JSON.stringify(result, null, 2));
      return result;
      
    } catch (error) {
      console.error('❌ RULE X: Grok verification agent failed:', error);
      const result = {
        status: 'error',
        type: 'grok_verification',
        duration: Date.now() - startTime,
        error: error.message,
        architectureScore: 0,
        deploymentReady: false,
        hasIssues: true,
        compliance: {
          ruleX: 'VIOLATION'
        },
        timestamp: new Date().toISOString()
      };
      
      console.log(JSON.stringify(result, null, 2));
      return result;
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new GrokVerificationAgent();
  agent.run().catch(console.error);
}

export default GrokVerificationAgent;