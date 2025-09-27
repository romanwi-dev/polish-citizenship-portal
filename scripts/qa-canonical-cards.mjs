#!/usr/bin/env node

/**
 * QA Guardrails Script for Canonical Card System
 * 
 * This script runs comprehensive QA checks for the canonical card system including:
 * 1. Visual snapshot tests
 * 2. Route unit tests  
 * 3. Performance validation
 * 4. Zero-errors policy enforcement
 * 5. Integration with existing AI testing system
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

class CanonicalCardQASystem {
  constructor() {
    this.results = {
      visualTests: null,
      unitTests: null,
      performanceTests: null,
      integrationTests: null,
      errorCount: 0,
      overallStatus: 'PENDING'
    };
    
    this.testStartTime = Date.now();
  }

  async runQAGuardrails() {
    console.log('🛡️  CANONICAL CARD QA GUARDRAILS SYSTEM');
    console.log('=' .repeat(60));
    console.log('🎯 Ensuring visual consistency, navigation, and zero-errors');
    console.log('📱 Testing responsive design and edit panel functionality');
    console.log('⚡ Performance and accessibility validation');
    console.log('=' .repeat(60));

    try {
      // Phase 1: Run visual consistency tests
      await this.runVisualTests();
      
      // Phase 2: Run route unit tests
      await this.runUnitTests();
      
      // Phase 3: Run performance validation
      await this.runPerformanceTests();
      
      // Phase 4: Run integration tests
      await this.runIntegrationTests();
      
      // Phase 5: Generate comprehensive report
      await this.generateQAReport();
      
      // Phase 6: Determine overall status
      this.determineOverallStatus();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ QA Guardrails failed:', error.message);
      this.results.overallStatus = 'FAILED';
      this.results.errorCount++;
      return this.results;
    }
  }

  async runVisualTests() {
    console.log('\n🎨 PHASE 1: Visual Consistency Tests');
    console.log('-'.repeat(40));
    
    try {
      // Run Playwright UI tests for canonical cards
      const { stdout, stderr } = await execAsync(
        'npx playwright test tests/ui/canonical-card-qa.spec.ts --reporter=json',
        { timeout: 120000 }
      );
      
      const testResults = this.parsePlaywrightResults(stdout);
      this.results.visualTests = {
        status: testResults.passed ? 'PASSED' : 'FAILED',
        passed: testResults.passed,
        failed: testResults.failed,
        duration: testResults.duration,
        details: testResults.details
      };
      
      console.log(`✅ Visual tests: ${testResults.passed} passed, ${testResults.failed} failed`);
      
      if (testResults.failed > 0) {
        this.results.errorCount += testResults.failed;
        console.log('❌ Visual consistency issues detected');
      }
      
    } catch (error) {
      console.log('❌ Visual tests failed to run:', error.message);
      this.results.visualTests = {
        status: 'ERROR',
        error: error.message
      };
      this.results.errorCount++;
    }
  }

  async runUnitTests() {
    console.log('\n🔧 PHASE 2: Route Unit Tests');
    console.log('-'.repeat(40));
    
    try {
      // Run Vitest unit tests
      const { stdout, stderr } = await execAsync(
        'npx vitest run tests/unit/canonical-card-routes.test.js --reporter=json',
        { timeout: 60000 }
      );
      
      const testResults = this.parseVitestResults(stdout);
      this.results.unitTests = {
        status: testResults.passed ? 'PASSED' : 'FAILED',
        passed: testResults.passed,
        failed: testResults.failed,
        duration: testResults.duration
      };
      
      console.log(`✅ Unit tests: ${testResults.passed} passed, ${testResults.failed} failed`);
      
      if (testResults.failed > 0) {
        this.results.errorCount += testResults.failed;
        console.log('❌ Route logic issues detected');
      }
      
    } catch (error) {
      console.log('❌ Unit tests failed to run:', error.message);
      this.results.unitTests = {
        status: 'ERROR',
        error: error.message
      };
      this.results.errorCount++;
    }
  }

  async runPerformanceTests() {
    console.log('\n⚡ PHASE 3: Performance Validation');
    console.log('-'.repeat(40));
    
    try {
      // Check for performance anti-patterns in canonical card code
      const performanceIssues = await this.checkPerformanceAntiPatterns();
      
      this.results.performanceTests = {
        status: performanceIssues.length === 0 ? 'PASSED' : 'WARNING',
        issues: performanceIssues,
        recommendations: this.generatePerformanceRecommendations(performanceIssues)
      };
      
      if (performanceIssues.length === 0) {
        console.log('✅ No performance anti-patterns detected');
      } else {
        console.log(`⚠️  Found ${performanceIssues.length} performance concerns`);
        performanceIssues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
      
    } catch (error) {
      console.log('❌ Performance validation failed:', error.message);
      this.results.performanceTests = {
        status: 'ERROR',
        error: error.message
      };
    }
  }

  async runIntegrationTests() {
    console.log('\n🔗 PHASE 4: Integration Tests');
    console.log('-'.repeat(40));
    
    try {
      // Test integration with existing system
      const integrationStatus = await this.checkSystemIntegration();
      
      this.results.integrationTests = {
        status: integrationStatus.allPassing ? 'PASSED' : 'FAILED',
        cardsIntegration: integrationStatus.cardsIntegration,
        routingIntegration: integrationStatus.routingIntegration,
        stateManagement: integrationStatus.stateManagement
      };
      
      if (integrationStatus.allPassing) {
        console.log('✅ All integrations working correctly');
      } else {
        console.log('❌ Integration issues detected');
        this.results.errorCount++;
      }
      
    } catch (error) {
      console.log('❌ Integration tests failed:', error.message);
      this.results.integrationTests = {
        status: 'ERROR',
        error: error.message
      };
      this.results.errorCount++;
    }
  }

  async checkPerformanceAntiPatterns() {
    const issues = [];
    
    try {
      // Check canonical card file for performance issues
      const canonicalCardPath = 'client/src/components/cards/CaseCardCanonical.tsx';
      const content = await fs.readFile(canonicalCardPath, 'utf8');
      
      // Check for React.memo usage
      if (!content.includes('memo(')) {
        issues.push('CaseCardCanonical should use React.memo for optimization');
      }
      
      // Check for useCallback usage
      if (!content.includes('useCallback')) {
        issues.push('Navigation handlers should use useCallback optimization');
      }
      
      // Check for requestAnimationFrame usage
      if (!content.includes('requestAnimationFrame')) {
        issues.push('Navigation should use requestAnimationFrame for smooth transitions');
      }
      
      // Check for proper portal usage
      if (!content.includes('createPortal')) {
        issues.push('Dropdown should use createPortal for proper z-index management');
      }
      
    } catch (error) {
      issues.push(`Could not analyze canonical card file: ${error.message}`);
    }
    
    return issues;
  }

  generatePerformanceRecommendations(issues) {
    const recommendations = [];
    
    issues.forEach(issue => {
      if (issue.includes('React.memo')) {
        recommendations.push('Wrap component with React.memo to prevent unnecessary re-renders');
      }
      if (issue.includes('useCallback')) {
        recommendations.push('Use useCallback for navigation handlers to maintain referential equality');
      }
      if (issue.includes('requestAnimationFrame')) {
        recommendations.push('Use requestAnimationFrame for navigation to ensure smooth 60fps transitions');
      }
      if (issue.includes('createPortal')) {
        recommendations.push('Use createPortal for overlays to avoid z-index and stacking context issues');
      }
    });
    
    return recommendations;
  }

  async checkSystemIntegration() {
    const status = {
      allPassing: true,
      cardsIntegration: 'UNKNOWN',
      routingIntegration: 'UNKNOWN',
      stateManagement: 'UNKNOWN'
    };
    
    try {
      // Check if canonical card is properly integrated
      const casesGridPath = 'client/src/routes/admin/cases/CasesGrid.tsx';
      const casesGridContent = await fs.readFile(casesGridPath, 'utf8');
      
      if (casesGridContent.includes('CaseCardCanonical')) {
        status.cardsIntegration = 'PASSED';
      } else {
        status.cardsIntegration = 'FAILED';
        status.allPassing = false;
      }
      
      // Check routing integration
      const appPath = 'client/src/App.tsx';
      const appContent = await fs.readFile(appPath, 'utf8');
      
      if (appContent.includes('/agent/:caseId')) {
        status.routingIntegration = 'PASSED';
      } else {
        status.routingIntegration = 'FAILED';
        status.allPassing = false;
      }
      
      // Check state management
      const editPanelPath = 'client/src/components/cards/CaseEditPanel.tsx';
      const editPanelExists = await fs.access(editPanelPath).then(() => true).catch(() => false);
      
      if (editPanelExists) {
        status.stateManagement = 'PASSED';
      } else {
        status.stateManagement = 'FAILED';
        status.allPassing = false;
      }
      
    } catch (error) {
      status.allPassing = false;
      status.error = error.message;
    }
    
    return status;
  }

  parsePlaywrightResults(stdout) {
    const defaultResults = { passed: 0, failed: 0, duration: 0, details: [] };
    
    try {
      // Try to parse JSON output
      const lines = stdout.split('\n').filter(line => line.trim());
      const jsonLine = lines.find(line => line.startsWith('{'));
      
      if (jsonLine) {
        const results = JSON.parse(jsonLine);
        return {
          passed: results.stats?.expected || 0,
          failed: results.stats?.unexpected || 0,
          duration: results.stats?.duration || 0,
          details: results.suites || []
        };
      }
    } catch (error) {
      console.log('Could not parse Playwright results, using fallback');
    }
    
    // Fallback: parse from text output
    const passedMatch = stdout.match(/(\d+) passed/);
    const failedMatch = stdout.match(/(\d+) failed/);
    
    return {
      passed: passedMatch ? parseInt(passedMatch[1]) : defaultResults.passed,
      failed: failedMatch ? parseInt(failedMatch[1]) : defaultResults.failed,
      duration: defaultResults.duration,
      details: defaultResults.details
    };
  }

  parseVitestResults(stdout) {
    const defaultResults = { passed: 0, failed: 0, duration: 0 };
    
    try {
      // Try to parse JSON output
      const lines = stdout.split('\n').filter(line => line.trim());
      const jsonLine = lines.find(line => line.startsWith('{'));
      
      if (jsonLine) {
        const results = JSON.parse(jsonLine);
        return {
          passed: results.numPassedTests || 0,
          failed: results.numFailedTests || 0,
          duration: results.testResults?.[0]?.endTime - results.testResults?.[0]?.startTime || 0
        };
      }
    } catch (error) {
      console.log('Could not parse Vitest results, using fallback');
    }
    
    // Fallback: parse from text output  
    const passedMatch = stdout.match(/(\d+) passed/);
    const failedMatch = stdout.match(/(\d+) failed/);
    
    return {
      passed: passedMatch ? parseInt(passedMatch[1]) : defaultResults.passed,
      failed: failedMatch ? parseInt(failedMatch[1]) : defaultResults.failed,
      duration: defaultResults.duration
    };
  }

  async generateQAReport() {
    const duration = Date.now() - this.testStartTime;
    const reportPath = 'test-results/canonical-card-qa-report.json';
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      overallStatus: this.results.errorCount === 0 ? 'PASSED' : 'FAILED',
      errorCount: this.results.errorCount,
      results: this.results,
      summary: {
        visualTests: this.results.visualTests?.status || 'NOT_RUN',
        unitTests: this.results.unitTests?.status || 'NOT_RUN',
        performanceTests: this.results.performanceTests?.status || 'NOT_RUN',
        integrationTests: this.results.integrationTests?.status || 'NOT_RUN'
      },
      recommendations: this.generateOverallRecommendations()
    };
    
    try {
      await fs.mkdir('test-results', { recursive: true });
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📊 QA Report saved to: ${reportPath}`);
    } catch (error) {
      console.log('❌ Could not save QA report:', error.message);
    }
    
    return report;
  }

  generateOverallRecommendations() {
    const recommendations = [];
    
    if (this.results.errorCount === 0) {
      recommendations.push('✅ All QA guardrails passed! Canonical card system is ready for production.');
    } else {
      recommendations.push('⚠️  Issues detected that should be addressed:');
      
      if (this.results.visualTests?.failed > 0) {
        recommendations.push('- Fix visual consistency issues in card components');
      }
      
      if (this.results.unitTests?.failed > 0) {
        recommendations.push('- Resolve unit test failures in route navigation logic');
      }
      
      if (this.results.performanceTests?.issues?.length > 0) {
        recommendations.push('- Address performance optimization opportunities');
      }
      
      if (this.results.integrationTests?.status === 'FAILED') {
        recommendations.push('- Fix integration issues with existing system components');
      }
    }
    
    return recommendations;
  }

  determineOverallStatus() {
    if (this.results.errorCount === 0) {
      this.results.overallStatus = 'PASSED';
      console.log('\n🎉 CANONICAL CARD QA GUARDRAILS: PASSED');
      console.log('✅ All visual, route, performance, and integration tests successful');
    } else {
      this.results.overallStatus = 'FAILED';
      console.log('\n❌ CANONICAL CARD QA GUARDRAILS: FAILED');
      console.log(`🔍 Found ${this.results.errorCount} issues that need attention`);
    }
    
    console.log('=' .repeat(60));
  }
}

// Execute QA guardrails if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const qaSystem = new CanonicalCardQASystem();
  qaSystem.runQAGuardrails()
    .then(results => {
      process.exit(results.overallStatus === 'PASSED' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ QA system execution failed:', error);
      process.exit(1);
    });
}

export { CanonicalCardQASystem };