import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Continuous AI Testing Agent
 * Runs comprehensive tests every 30 minutes and generates reports
 */
class ContinuousTestingAgent {
  private testInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  constructor(private intervalMinutes = 30) {}
  
  start() {
    console.log('🤖 Starting Continuous AI Testing Agent');
    console.log(`📊 Tests will run every ${this.intervalMinutes} minutes`);
    
    // Run tests immediately
    this.runTests();
    
    // Schedule recurring tests
    this.testInterval = setInterval(() => {
      this.runTests();
    }, this.intervalMinutes * 60 * 1000);
  }
  
  stop() {
    if (this.testInterval) {
      clearInterval(this.testInterval);
      this.testInterval = null;
    }
    console.log('🛑 Continuous testing stopped');
  }
  
  private async runTests() {
    if (this.isRunning) {
      console.log('⏳ Tests already running, skipping this cycle');
      return;
    }
    
    this.isRunning = true;
    const startTime = new Date();
    
    try {
      console.log(`🚀 Starting AI test cycle at ${startTime.toLocaleTimeString()}`);
      
      // Clear caches before testing
      await this.clearCaches();
      
      // Run the test suite
      const result = await this.executeTests();
      
      // Generate report
      await this.generateReport(result, startTime);
      
    } catch (error) {
      console.error('❌ Test cycle failed:', error);
      await this.generateErrorReport(error, startTime);
    } finally {
      this.isRunning = false;
      console.log('✅ Test cycle completed');
    }
  }
  
  private async clearCaches(): Promise<void> {
    return new Promise((resolve) => {
      console.log('🧹 Clearing caches...');
      // Simulate cache clearing - in real implementation, this would clear browser caches
      setTimeout(() => {
        console.log('✅ Caches cleared');
        resolve();
      }, 1000);
    });
  }
  
  private executeTests(): Promise<TestResult> {
    return new Promise((resolve, reject) => {
      const testProcess = spawn('npx', ['playwright', 'test', '--reporter=json'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      testProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      testProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      testProcess.on('close', (code) => {
        try {
          const result = JSON.parse(stdout);
          resolve({
            success: code === 0,
            exitCode: code,
            results: result,
            stdout,
            stderr
          });
        } catch (error) {
          reject(new Error(`Failed to parse test results: ${error}`));
        }
      });
      
      testProcess.on('error', (error) => {
        reject(error);
      });
    });
  }
  
  private async generateReport(result: TestResult, startTime: Date) {
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    const report = {
      timestamp: startTime.toISOString(),
      duration: `${Math.round(duration / 1000)}s`,
      status: result.success ? 'PASSED' : 'FAILED',
      summary: this.generateSummary(result.results),
      details: result.results,
      recommendations: this.generateRecommendations(result.results)
    };
    
    // Save report
    const reportPath = path.join('test-results', `report-${Date.now()}.json`);
    await fs.promises.mkdir('test-results', { recursive: true });
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Console output
    console.log('📈 Test Report Generated:');
    console.log(`   Status: ${report.status}`);
    console.log(`   Duration: ${report.duration}`);
    console.log(`   Summary: ${report.summary}`);
    
    if (report.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      report.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }
  }
  
  private async generateErrorReport(error: any, startTime: Date) {
    const report = {
      timestamp: startTime.toISOString(),
      status: 'ERROR',
      error: error.message,
      stack: error.stack
    };
    
    const reportPath = path.join('test-results', `error-${Date.now()}.json`);
    await fs.promises.mkdir('test-results', { recursive: true });
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.error('💥 Error Report Generated');
  }
  
  private generateSummary(results: any): string {
    if (!results.suites) return 'No test data available';
    
    let passed = 0;
    let failed = 0;
    let total = 0;
    
    const countTests = (suite: any) => {
      if (suite.tests) {
        suite.tests.forEach((test: any) => {
          total++;
          if (test.outcome === 'expected') passed++;
          else failed++;
        });
      }
      if (suite.suites) {
        suite.suites.forEach(countTests);
      }
    };
    
    results.suites.forEach(countTests);
    
    return `${passed}/${total} tests passed, ${failed} failed`;
  }
  
  private generateRecommendations(results: any): string[] {
    const recommendations: string[] = [];
    
    // This would analyze test results and generate intelligent recommendations
    if (results.stats?.failed > 0) {
      recommendations.push('Some tests are failing - check recent code changes');
    }
    
    if (results.stats?.duration > 300000) { // 5 minutes
      recommendations.push('Tests are running slowly - consider optimizing');
    }
    
    return recommendations;
  }
}

interface TestResult {
  success: boolean;
  exitCode: number;
  results: any;
  stdout: string;
  stderr: string;
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new ContinuousTestingAgent();
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down testing agent...');
    agent.stop();
    process.exit(0);
  });
  
  agent.start();
}

export { ContinuousTestingAgent };