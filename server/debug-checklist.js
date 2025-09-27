#!/usr/bin/env node
/**
 * ONE-PROMPT TROUBLESHOOTING CHECKLIST
 * Run this first for any "data not showing in UI" issues
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function debugDataFlow(issueType = 'cases-not-showing') {
  console.log('🔍 DEBUGGING DATA FLOW - Starting from READ MODEL...\n');
  
  if (issueType === 'cases-not-showing') {
    // Step 1: Check what UI expects
    console.log('1️⃣ Checking Cases Management UI data source...');
    try {
      const response = await fetch(`${BASE_URL}/api/admin/cases`);
      const data = await response.json();
      console.log(`   ✅ UI reads from /api/admin/cases`);
      console.log(`   📊 Found ${data.total} cases in management interface`);
      console.log(`   🔗 Latest case: ${data.cases[0]?.caseId || 'NONE'}`);
    } catch (error) {
      console.log(`   ❌ UI read FAILED: ${error.message}`);
      return;
    }
    
    // Step 2: Check what import creates
    console.log('\n2️⃣ Testing import process...');
    const testPayload = {
      items: [{
        path: "/CASES/DEBUG_TEST",
        clientName: "Debug Test",
        email: "debug@test.com",
        processing: "standard",
        clientScore: 85
      }]
    };
    
    try {
      const importResponse = await fetch(`${BASE_URL}/import/dropbox/create-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      const importResult = await importResponse.json();
      console.log(`   ✅ Import status: ${importResult.ok ? 'SUCCESS' : 'FAILED'}`);
      
      if (importResult.ok) {
        const caseId = importResult.created[0]?.caseId;
        console.log(`   📝 Created case: ${caseId}`);
        console.log(`   💾 Database ID: ${importResult.created[0]?.databaseId || 'MISSING!'}`);
        
        // Step 3: Immediate verification
        console.log('\n3️⃣ Verifying case appears in UI...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
        
        const verifyResponse = await fetch(`${BASE_URL}/api/admin/cases`);
        const verifyData = await verifyResponse.json();
        const foundCase = verifyData.cases.find(c => c.caseId === caseId);
        
        if (foundCase) {
          console.log(`   ✅ SUCCESS: Case ${caseId} appears in management interface!`);
        } else {
          console.log(`   ❌ PROBLEM: Case ${caseId} missing from management interface`);
          console.log(`   🔧 ROOT CAUSE: Import creates files but not database records`);
          console.log(`   🛠️  FIX NEEDED: Add database record creation to import process`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Import FAILED: ${error.message}`);
    }
  }
  
  console.log('\n✅ Debug complete! Use findings to fix in 1 prompt.');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  debugDataFlow().catch(console.error);
}

export { debugDataFlow };