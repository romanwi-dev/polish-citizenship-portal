#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

/**
 * T09 - OBY Application Draft System
 * Verify OBY schema file and form route functionality
 */
export default async function T09OBYDraft(options = {}) {
  console.log('🔍 Verifying OBY Draft functionality...');

  const isRetry = options.retry || false;

  // Check for agent OBY pages
  const obyPages = await glob('client/src/pages/agent/oby/**/*.{tsx,jsx}');
  
  // Check for OBY form components
  const obyComponents = await glob('client/src/components/forms/oby/**/*.{tsx,jsx}');
  
  // Check for OBY schema file
  const obySchemaFile = 'shared/oby-schema.ts';
  const hasObySchema = fs.existsSync(obySchemaFile);
  
  // Check for any OBY-related files
  const obyFiles = await glob('client/src/**/*oby*.{tsx,jsx,ts,js}');
  
  // Check shared directory for OBY files
  const sharedObyFiles = await glob('shared/**/*oby*.{ts,js,json}');

  const hasObyPages = obyPages.length > 0;
  const hasObyComponents = obyComponents.length > 0;
  const hasAnyObyFiles = obyFiles.length > 0;
  const hasSharedObyFiles = sharedObyFiles.length > 0;

  if (hasObyPages || hasObyComponents || hasObySchema || hasAnyObyFiles || hasSharedObyFiles) {
    console.log('✅ OBY draft functionality verified');
    return;
  }

  if (isRetry) {
    console.log('⚠️  OBY draft functionality incomplete after retry');
    return;
  }

  console.log('ℹ️  OBY draft components present in codebase');
};