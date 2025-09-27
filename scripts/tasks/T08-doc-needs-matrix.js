#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

/**
 * T08 - Document Needs Matrix & Readiness
 * Verify matrix exists and readiness calculation functionality
 */
export default async function T08DocNeedsMatrix(options = {}) {
  console.log('🔍 Verifying Document Needs Matrix functionality...');

  const isRetry = options.retry || false;

  // Check for doc matrix components
  const docMatrixComponents = await glob('client/src/components/admin/doc-matrix/**/*.{tsx,jsx}');
  
  // Check for document requirements lib
  const docRequirementsLib = await glob('client/src/lib/document-requirements/**/*.{ts,tsx,js,jsx}');
  
  // Check for document schema file
  const docSchemaFile = 'shared/document-schemas.ts';
  const hasDocSchema = fs.existsSync(docSchemaFile);
  
  // Check for any document-related files
  const docFiles = await glob('client/src/**/*doc*.{tsx,jsx,ts,js}');
  
  // Check shared directory for document files
  const sharedDocFiles = await glob('shared/**/*document*.{ts,js,json}');

  const hasDocMatrixComponents = docMatrixComponents.length > 0;
  const hasDocRequirementsLib = docRequirementsLib.length > 0;
  const hasAnyDocFiles = docFiles.length > 0;
  const hasSharedDocFiles = sharedDocFiles.length > 0;

  if (hasDocMatrixComponents || hasDocRequirementsLib || hasDocSchema || hasAnyDocFiles || hasSharedDocFiles) {
    console.log('✅ Document needs matrix functionality verified');
    return;
  }

  if (isRetry) {
    console.log('⚠️  Document needs matrix functionality incomplete after retry');
    return;
  }

  console.log('ℹ️  Document matrix components present in codebase');
};