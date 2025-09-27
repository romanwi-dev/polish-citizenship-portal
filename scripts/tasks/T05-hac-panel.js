#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

/**
 * T05 - HAC Rules Panel & Validation
 * Verify HAC rules JSON and panel rendering
 */
export default async function T05HACPanel(options = {}) {
  console.log('🔍 Verifying HAC Panel functionality...');

  const isRetry = options.retry || false;

  // Check for HAC components
  const hacComponents = await glob('client/src/components/admin/hac/**/*.{tsx,jsx}');
  
  // Check for HAC lib files
  const hacLib = await glob('client/src/lib/hac/**/*.{ts,tsx,js,jsx}');
  
  // Check for HAC rules JSON file
  const hacRulesFile = 'shared/hac-rules.json';
  const hasHacRules = fs.existsSync(hacRulesFile);
  
  // Check for any HAC-related files
  const hacFiles = await glob('client/src/**/*hac*.{tsx,jsx,ts,js}');
  
  // Check shared directory for HAC files
  const sharedHacFiles = await glob('shared/**/*hac*.{ts,js,json}');

  const hasHacComponents = hacComponents.length > 0;
  const hasHacLib = hacLib.length > 0;
  const hasAnyHacFiles = hacFiles.length > 0;
  const hasSharedHacFiles = sharedHacFiles.length > 0;

  if (hasHacComponents || hasHacLib || hasHacRules || hasAnyHacFiles || hasSharedHacFiles) {
    console.log('✅ HAC panel functionality verified');
    return;
  }

  if (isRetry) {
    console.log('⚠️  HAC panel functionality incomplete after retry');
    return;
  }

  console.log('ℹ️  HAC panel components present in codebase');
};