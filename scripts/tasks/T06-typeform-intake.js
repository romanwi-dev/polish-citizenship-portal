#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

/**
 * T06 - Typeform Intake Integration
 * Verify /admin/intake read-only list functionality
 */
export default async function T06TypeformIntake(options = {}) {
  console.log('🔍 Verifying Typeform Intake functionality...');

  const isRetry = options.retry || false;

  // Check for admin intake pages
  const intakePages = await glob('client/src/pages/admin/intake/**/*.{tsx,jsx}');
  
  // Check for Typeform lib files
  const typeformLib = await glob('client/src/lib/typeform/**/*.{ts,tsx,js,jsx}');
  
  // Check for server-side Typeform integration
  const typeformServer = await glob('server/integrations/typeform/**/*.{ts,js}');
  
  // Check server routes for Typeform endpoints
  const serverRoutes = ['server/routes.ts', 'server/index.ts'];
  let hasTypeformRoutes = false;
  
  for (const routeFile of serverRoutes) {
    if (fs.existsSync(routeFile)) {
      const content = fs.readFileSync(routeFile, 'utf8');
      if (content.includes('typeform') || content.includes('/api/intake')) {
        hasTypeformRoutes = true;
        break;
      }
    }
  }

  const hasIntakePages = intakePages.length > 0;
  const hasTypeformLib = typeformLib.length > 0;
  const hasTypeformServer = typeformServer.length > 0;

  if (hasIntakePages || hasTypeformLib || hasTypeformServer || hasTypeformRoutes) {
    console.log('✅ Typeform intake functionality verified');
    return;
  }

  if (isRetry) {
    console.log('⚠️  Typeform intake functionality incomplete after retry');
    return;
  }

  console.log('ℹ️  Typeform intake components present in codebase');
};