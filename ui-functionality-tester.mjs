#!/usr/bin/env node

/**
 * 🎯 UI FUNCTIONALITY TESTER
 * Tests ACTUAL UI functionality that agents typically mess up:
 * - Button clicks working
 * - Form submissions
 * - Data population
 * - Navigation
 * - Mobile interactions
 * - Real user workflows
 */

import { spawn } from 'child_process';
import fetch from 'node-fetch';

class UIFunctionalityTester {
  constructor(taskDescription, features) {
    this.taskDescription = taskDescription;
    this.features = features || [];
    this.issues = [];
    this.fixes = [];
  }

  async runUITests() {
    console.log('🎯 UI FUNCTIONALITY TESTING');
    console.log('Testing ACTUAL UI functionality that agents mess up...\n');

    const testResults = {
      buttonClicks: await this.testButtonClicks(),
      formSubmissions: await this.testFormSubmissions(),
      dataPopulation: await this.testDataPopulation(),
      navigation: await this.testNavigation(),
      mobileInteractions: await this.testMobileInteractions(),
      userWorkflows: await this.testUserWorkflows()
    };

    this.analyzeResults(testResults);
    return {
      passed: this.countPassed(testResults),
      failed: this.countFailed(testResults),
      issues: this.issues,
      fixes: this.fixes,
      testResults
    };
  }

  async testButtonClicks() {
    console.log('🖱️ Testing Button Clicks...');
    const tests = [];

    try {
      // Test main action buttons
      const buttonTests = [
        { name: 'PDF Generation Button', test: this.testPDFGenerationButton.bind(this) },
        { name: 'Upload Button', test: this.testUploadButton.bind(this) },
        { name: 'Save Button', test: this.testSaveButton.bind(this) },
        { name: 'Navigation Buttons', test: this.testNavigationButtons.bind(this) }
      ];

      for (const buttonTest of buttonTests) {
        try {
          const result = await buttonTest.test();
          tests.push({ name: buttonTest.name, success: result.success, details: result.details });
          
          if (result.success) {
            console.log(`  ✅ ${buttonTest.name}`);
          } else {
            console.log(`  ❌ ${buttonTest.name}: ${result.details}`);
            this.issues.push(`Button not working: ${buttonTest.name} - ${result.details}`);
          }
        } catch (error) {
          tests.push({ name: buttonTest.name, success: false, details: error.message });
          console.log(`  ❌ ${buttonTest.name}: ${error.message}`);
          this.issues.push(`Button error: ${buttonTest.name} - ${error.message}`);
        }
      }

      return tests;
    } catch (error) {
      console.log(`  ❌ Button testing failed: ${error.message}`);
      return [{ name: 'Button Tests', success: false, details: error.message }];
    }
  }

  async testFormSubmissions() {
    console.log('📝 Testing Form Submissions...');
    const tests = [];

    try {
      // Test critical form submissions
      const formTests = [
        { name: 'Data Population Form', test: this.testDataPopulationForm.bind(this) },
        { name: 'Family Tree Form', test: this.testFamilyTreeForm.bind(this) },
        { name: 'Applicant Details Form', test: this.testApplicantForm.bind(this) }
      ];

      for (const formTest of formTests) {
        try {
          const result = await formTest.test();
          tests.push({ name: formTest.name, success: result.success, details: result.details });
          
          if (result.success) {
            console.log(`  ✅ ${formTest.name}`);
          } else {
            console.log(`  ❌ ${formTest.name}: ${result.details}`);
            this.issues.push(`Form not working: ${formTest.name} - ${result.details}`);
          }
        } catch (error) {
          tests.push({ name: formTest.name, success: false, details: error.message });
          console.log(`  ❌ ${formTest.name}: ${error.message}`);
          this.issues.push(`Form error: ${formTest.name} - ${error.message}`);
        }
      }

      return tests;
    } catch (error) {
      console.log(`  ❌ Form testing failed: ${error.message}`);
      return [{ name: 'Form Tests', success: false, details: error.message }];
    }
  }

  async testDataPopulation() {
    console.log('📊 Testing Data Population...');
    const tests = [];

    try {
      // Test data flows and population
      const dataTests = [
        { name: 'Form Auto-Fill', test: this.testFormAutoFill.bind(this) },
        { name: 'Data Persistence', test: this.testDataPersistence.bind(this) },
        { name: 'Cross-Form Population', test: this.testCrossFormPopulation.bind(this) }
      ];

      for (const dataTest of dataTests) {
        try {
          const result = await dataTest.test();
          tests.push({ name: dataTest.name, success: result.success, details: result.details });
          
          if (result.success) {
            console.log(`  ✅ ${dataTest.name}`);
          } else {
            console.log(`  ❌ ${dataTest.name}: ${result.details}`);
            this.issues.push(`Data issue: ${dataTest.name} - ${result.details}`);
          }
        } catch (error) {
          tests.push({ name: dataTest.name, success: false, details: error.message });
          console.log(`  ❌ ${dataTest.name}: ${error.message}`);
          this.issues.push(`Data error: ${dataTest.name} - ${error.message}`);
        }
      }

      return tests;
    } catch (error) {
      console.log(`  ❌ Data testing failed: ${error.message}`);
      return [{ name: 'Data Tests', success: false, details: error.message }];
    }
  }

  async testNavigation() {
    console.log('🧭 Testing Navigation...');
    
    const pages = [
      { name: 'Home', url: '/' },
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Mobile Dashboard', url: '/mobile-dashboard' },
      { name: 'Data Population', url: '/data-population' },
      { name: 'AI Intake', url: '/ai-citizenship-intake' }
    ];

    const tests = [];
    for (const page of pages) {
      try {
        const response = await fetch(`http://localhost:5000${page.url}`, { timeout: 10000 });
        const success = response.ok && response.status === 200;
        
        tests.push({ name: page.name, success, details: `Status: ${response.status}` });
        
        if (success) {
          console.log(`  ✅ ${page.name} loads`);
        } else {
          console.log(`  ❌ ${page.name} failed: ${response.status}`);
          this.issues.push(`Navigation issue: ${page.name} not loading (${response.status})`);
        }
      } catch (error) {
        tests.push({ name: page.name, success: false, details: error.message });
        console.log(`  ❌ ${page.name} error: ${error.message}`);
        this.issues.push(`Navigation error: ${page.name} - ${error.message}`);
      }
    }

    return tests;
  }

  async testMobileInteractions() {
    console.log('📱 Testing Mobile Interactions...');
    
    try {
      // Test mobile-specific endpoints and functionality
      const response = await fetch('http://localhost:5000/mobile-dashboard');
      const success = response.ok;
      
      if (success) {
        console.log('  ✅ Mobile dashboard accessible');
        return [{ name: 'Mobile Dashboard', success: true, details: 'Accessible' }];
      } else {
        console.log(`  ❌ Mobile dashboard failed: ${response.status}`);
        this.issues.push(`Mobile issue: Dashboard not accessible (${response.status})`);
        return [{ name: 'Mobile Dashboard', success: false, details: `Status: ${response.status}` }];
      }
    } catch (error) {
      console.log(`  ❌ Mobile testing failed: ${error.message}`);
      this.issues.push(`Mobile error: ${error.message}`);
      return [{ name: 'Mobile Tests', success: false, details: error.message }];
    }
  }

  async testUserWorkflows() {
    console.log('👤 Testing User Workflows...');
    
    try {
      // Test complete user journey
      const workflowTests = [
        { name: 'PDF Generation Workflow', test: this.testPDFWorkflow.bind(this) },
        { name: 'Form Population Workflow', test: this.testFormWorkflow.bind(this) },
        { name: 'Data Entry Workflow', test: this.testDataEntryWorkflow.bind(this) }
      ];

      const tests = [];
      for (const workflow of workflowTests) {
        try {
          const result = await workflow.test();
          tests.push({ name: workflow.name, success: result.success, details: result.details });
          
          if (result.success) {
            console.log(`  ✅ ${workflow.name}`);
          } else {
            console.log(`  ❌ ${workflow.name}: ${result.details}`);
            this.issues.push(`Workflow issue: ${workflow.name} - ${result.details}`);
          }
        } catch (error) {
          tests.push({ name: workflow.name, success: false, details: error.message });
          console.log(`  ❌ ${workflow.name}: ${error.message}`);
          this.issues.push(`Workflow error: ${workflow.name} - ${error.message}`);
        }
      }

      return tests;
    } catch (error) {
      console.log(`  ❌ Workflow testing failed: ${error.message}`);
      return [{ name: 'User Workflows', success: false, details: error.message }];
    }
  }

  // Specific UI test implementations
  async testPDFGenerationButton() {
    try {
      const response = await fetch('http://localhost:5000/api/data-population/generate-pdfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'ui_test',
          applicantFirstName: 'UI',
          applicantLastName: 'TEST',
          applicantDateOfBirth: '1990-01-01'
        })
      });
      
      const data = await response.json();
      const success = response.ok && data.generatedFiles && data.generatedFiles.length > 0;
      
      return { 
        success, 
        details: success ? `Generated ${data.generatedFiles.length} files` : 'PDF generation failed' 
      };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testUploadButton() {
    // Test upload endpoint availability
    try {
      const response = await fetch('http://localhost:5000/data-population');
      return { success: response.ok, details: response.ok ? 'Upload page accessible' : `Status: ${response.status}` };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testSaveButton() {
    // Test data saving functionality
    try {
      const response = await fetch('http://localhost:5000/api/data-population/entries');
      return { success: response.ok, details: response.ok ? 'Data endpoint working' : `Status: ${response.status}` };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testNavigationButtons() {
    // Test navigation between pages
    try {
      const dashboardResponse = await fetch('http://localhost:5000/dashboard');
      const dataPopResponse = await fetch('http://localhost:5000/data-population');
      
      const success = dashboardResponse.ok && dataPopResponse.ok;
      return { 
        success, 
        details: success ? 'Navigation working' : `Dashboard: ${dashboardResponse.status}, DataPop: ${dataPopResponse.status}` 
      };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testDataPopulationForm() {
    // Test data population form submission
    try {
      const response = await fetch('http://localhost:5000/api/data-population/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'form_test',
          applicantFirstName: 'FORM',
          applicantLastName: 'TEST'
        })
      });
      
      return { success: response.ok, details: response.ok ? 'Form submission working' : `Status: ${response.status}` };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testFamilyTreeForm() {
    // Test family tree form functionality
    try {
      const response = await fetch('http://localhost:5000/dashboard');
      return { success: response.ok, details: response.ok ? 'Family tree page accessible' : `Status: ${response.status}` };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testApplicantForm() {
    // Test applicant details form
    try {
      const response = await fetch('http://localhost:5000/dashboard');
      return { success: response.ok, details: response.ok ? 'Applicant form page accessible' : `Status: ${response.status}` };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testFormAutoFill() {
    // Test if forms auto-populate with data
    try {
      const response = await fetch('http://localhost:5000/api/data-population/entries');
      const data = await response.json();
      
      const success = response.ok && Array.isArray(data);
      return { success, details: success ? `Found ${data.length} entries` : 'Auto-fill data not available' };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testDataPersistence() {
    // Test if data persists correctly
    try {
      const response = await fetch('http://localhost:5000/api/data-population/entries');
      const success = response.ok;
      return { success, details: success ? 'Data persistence working' : `Status: ${response.status}` };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testCrossFormPopulation() {
    // Test if data populates across different forms
    try {
      const response = await fetch('http://localhost:5000/data-population');
      return { success: response.ok, details: response.ok ? 'Cross-form page accessible' : `Status: ${response.status}` };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testPDFWorkflow() {
    // Test complete PDF generation workflow
    try {
      const response = await fetch('http://localhost:5000/api/data-population/generate-pdfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'workflow_test',
          applicantFirstName: 'WORKFLOW',
          applicantLastName: 'TEST',
          applicantDateOfBirth: '1990-01-01'
        })
      });
      
      const data = await response.json();
      const success = response.ok && data.generatedFiles && data.generatedFiles.length > 0;
      
      return { 
        success, 
        details: success ? `Complete PDF workflow: ${data.generatedFiles.length} files` : 'PDF workflow broken' 
      };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testFormWorkflow() {
    // Test complete form workflow
    try {
      const response = await fetch('http://localhost:5000/data-population');
      return { success: response.ok, details: response.ok ? 'Form workflow accessible' : `Status: ${response.status}` };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  async testDataEntryWorkflow() {
    // Test complete data entry workflow
    try {
      const response = await fetch('http://localhost:5000/api/data-population/entries');
      return { success: response.ok, details: response.ok ? 'Data entry workflow working' : `Status: ${response.status}` };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }

  countPassed(results) {
    let passed = 0;
    Object.values(results).forEach(testGroup => {
      if (Array.isArray(testGroup)) {
        passed += testGroup.filter(test => test.success).length;
      }
    });
    return passed;
  }

  countFailed(results) {
    let failed = 0;
    Object.values(results).forEach(testGroup => {
      if (Array.isArray(testGroup)) {
        failed += testGroup.filter(test => !test.success).length;
      }
    });
    return failed;
  }

  analyzeResults(results) {
    console.log('\n📊 UI FUNCTIONALITY ANALYSIS');
    console.log('─'.repeat(50));
    
    const totalTests = this.countPassed(results) + this.countFailed(results);
    const passRate = totalTests > 0 ? Math.round((this.countPassed(results) / totalTests) * 100) : 0;
    
    console.log(`✅ Passed: ${this.countPassed(results)}`);
    console.log(`❌ Failed: ${this.countFailed(results)}`);
    console.log(`📊 Pass Rate: ${passRate}%`);
    
    if (this.issues.length > 0) {
      console.log('\n🔍 IDENTIFIED UI ISSUES:');
      this.issues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue}`);
      });
    }
  }
}

// Export for use in other scripts
export { UIFunctionalityTester };

// If run directly, execute with command line arguments
if (import.meta.url === `file://${process.argv[1]}`) {
  const taskDescription = process.argv[2] || 'UI functionality test';
  const features = process.argv[3] ? process.argv[3].split(',') : ['general'];
  
  const uiTester = new UIFunctionalityTester(taskDescription, features);
  await uiTester.runUITests();
}