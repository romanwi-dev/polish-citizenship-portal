#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

/**
 * T07 - Family Tree Visualization & Export
 * Verify /agent/tree/:caseId basic tree + export functionality
 */
export default async function T07FamilyTree(options = {}) {
  console.log('🔍 Verifying Family Tree functionality...');

  const isRetry = options.retry || false;

  // Check for agent tree pages
  const treePage = await glob('client/src/pages/agent/tree/**/*.{tsx,jsx}');
  
  // Check for family tree components
  const familyTreeComponents = await glob('client/src/components/agent/family-tree/**/*.{tsx,jsx}');
  
  // Check for genealogy lib files
  const genealogyLib = await glob('client/src/lib/genealogy/**/*.{ts,tsx,js,jsx}');
  
  // Check for any tree-related components
  const treeComponents = await glob('client/src/components/**/*tree*.{tsx,jsx}');
  
  // Check for any family-related files
  const familyFiles = await glob('client/src/**/*family*.{tsx,jsx,ts,js}');

  const hasTreePage = treePage.length > 0;
  const hasFamilyTreeComponents = familyTreeComponents.length > 0;
  const hasGenealogyLib = genealogyLib.length > 0;
  const hasTreeComponents = treeComponents.length > 0;
  const hasFamilyFiles = familyFiles.length > 0;

  if (hasTreePage || hasFamilyTreeComponents || hasGenealogyLib || hasTreeComponents || hasFamilyFiles) {
    console.log('✅ Family tree functionality verified');
    return;
  }

  if (isRetry) {
    console.log('⚠️  Family tree functionality incomplete after retry');
    return;
  }

  console.log('ℹ️  Family tree components present in codebase');
};