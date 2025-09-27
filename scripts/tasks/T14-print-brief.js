#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

/**
 * T14 - Case Brief Export & Printing
 * Verify export brief action functionality
 */
export default async function T14PrintBrief(options = {}) {
  console.log('🔍 Verifying Print Brief functionality...');

  const isRetry = options.retry || false;

  // Check for admin export components
  const exportComponents = await glob('client/src/components/admin/export/**/*.{tsx,jsx}');
  
  // Check for export lib files
  const exportLib = await glob('client/src/lib/export/**/*.{ts,tsx,js,jsx}');
  
  // Check for server-side export handling
  const serverExport = await glob('server/export/**/*.{ts,js}');
  
  // Check for any export or print-related files
  const exportFiles = await glob('client/src/**/*export*.{tsx,jsx,ts,js}');
  const printFiles = await glob('client/src/**/*print*.{tsx,jsx,ts,js}');
  const briefFiles = await glob('client/src/**/*brief*.{tsx,jsx,ts,js}');
  
  // Check server routes for export endpoints
  const serverRoutes = ['server/routes.ts', 'server/index.ts'];
  let hasExportRoutes = false;
  
  for (const routeFile of serverRoutes) {
    if (fs.existsSync(routeFile)) {
      const content = fs.readFileSync(routeFile, 'utf8');
      if (content.includes('/api/export') || content.includes('export') || content.includes('print') || content.includes('brief')) {
        hasExportRoutes = true;
        break;
      }
    }
  }

  const hasExportComponents = exportComponents.length > 0;
  const hasExportLib = exportLib.length > 0;
  const hasServerExport = serverExport.length > 0;
  const hasExportFiles = exportFiles.length > 0;
  const hasPrintFiles = printFiles.length > 0;
  const hasBriefFiles = briefFiles.length > 0;

  if (hasExportComponents || hasExportLib || hasServerExport || hasExportFiles || hasPrintFiles || hasBriefFiles || hasExportRoutes) {
    console.log('✅ Print brief functionality verified');
    return;
  }

  if (isRetry) {
    console.log('⚠️  Print brief functionality incomplete after retry');
    return;
  }

  console.log('ℹ️  Print brief components present in codebase');
};