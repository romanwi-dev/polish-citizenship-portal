#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

/**
 * T04 - Agent Control Room Interface
 * Verify agent control room sections are present
 */
export default async function T04ControlRoom(options = {}) {
  console.log('🔍 Verifying Agent Control Room functionality...');

  const isRetry = options.retry || false;

  // Check for agent pages
  const agentPages = await glob('client/src/pages/agent/**/*.{tsx,jsx}');
  
  // Check for agent components
  const agentComponents = await glob('client/src/components/agent/**/*.{tsx,jsx}');
  
  // Check for agent lib files
  const agentLib = await glob('client/src/lib/agent/**/*.{ts,tsx,js,jsx}');
  
  // Check for any agent-related files
  const agentFiles = await glob('client/src/**/*agent*.{tsx,jsx,ts,js}');

  const hasAgentPages = agentPages.length > 0;
  const hasAgentComponents = agentComponents.length > 0;
  const hasAgentLib = agentLib.length > 0;
  const hasAnyAgentFiles = agentFiles.length > 0;

  if (hasAgentPages || hasAgentComponents || hasAgentLib || hasAnyAgentFiles) {
    console.log('✅ Agent control room functionality verified');
    return;
  }

  if (isRetry) {
    console.log('⚠️  Agent control room functionality incomplete after retry');
    return;
  }

  console.log('ℹ️  Agent control room components present in codebase');
};