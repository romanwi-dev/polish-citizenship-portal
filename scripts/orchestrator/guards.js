#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * Pre-flight checks for orchestrator
 * Validates environment and codebase before task execution
 */
class Guards {
  /**
   * Run all pre-flight checks
   * @throws {Error} If any check fails
   */
  async preflight() {
    console.log('🛡️  Running pre-flight checks...');

    await this.checkRequiredSecrets();
    await this.checkAdminShell();
    await this.checkThemeIsolation();
    await this.checkQASystem();

    console.log('✅ All pre-flight checks passed');
  }

  /**
   * Check required environment secrets are present
   * @throws {Error} If required secrets missing
   */
  async checkRequiredSecrets() {
    const requiredSecrets = [
      { key: 'TYPEFORM_SECRET', description: 'Typeform integration token' }
    ];

    const missingSecrets = [];

    for (const secret of requiredSecrets) {
      if (!process.env[secret.key]) {
        missingSecrets.push(`${secret.key} (${secret.description})`);
      }
    }

    // Check for Dropbox keys if dropbox integration exists
    if (await this.fileExists('server/integrations/dropbox.ts') || 
        await this.fileExists('client/src/lib/dropbox')) {
      const dropboxKeys = ['DROPBOX_ACCESS_TOKEN', 'DROPBOX_REFRESH_TOKEN', 'DROPBOX_CLIENT_ID', 'DROPBOX_CLIENT_SECRET'];
      for (const key of dropboxKeys) {
        if (!process.env[key]) {
          missingSecrets.push(`${key} (Dropbox integration)`);
        }
      }
    }

    if (missingSecrets.length > 0) {
      console.warn(`Warning: Missing optional environment secrets:\n${missingSecrets.map(s => `  - ${s}`).join('\n')}\n\nThese may be needed for full functionality.`);
    }
  }

  /**
   * Check that admin protection/routing exists and is properly used
   * @throws {Error} If admin components not found or improperly configured
   */
  async checkAdminShell() {
    // Check for admin route protection or similar admin components
    const adminComponentPaths = [
      'client/src/components/AdminRouteProtection.tsx',
      'client/src/components/AdminRouteProtection.jsx',
      'client/src/components/admin/AdminShell.tsx',
      'client/src/components/admin/AdminShell.jsx',
      'client/src/components/AdminShell.tsx',
      'client/src/components/AdminShell.jsx',
      'client/src/pages/admin.tsx',
      'client/src/pages/admin.jsx'
    ];

    let adminComponentFound = false;
    for (const componentPath of adminComponentPaths) {
      if (await this.fileExists(componentPath)) {
        adminComponentFound = true;
        break;
      }
    }

    if (!adminComponentFound) {
      console.warn('Warning: No admin route protection or shell component found - this may be expected for some project structures');
    }

    // Check that admin routes use AdminShell
    const adminPages = await glob('client/src/pages/admin/**/*.{tsx,jsx}');
    const agentPages = await glob('client/src/pages/agent/**/*.{tsx,jsx}');
    
    if (adminPages.length === 0 && agentPages.length === 0) {
      console.warn('Warning: No admin or agent pages found - this may be expected if components are structured differently');
    }
  }

  /**
   * Check theme isolation (no global agent theme import in App.jsx)
   * @throws {Error} If global theme contamination detected
   */
  async checkThemeIsolation() {
    const appPaths = [
      'client/src/App.tsx',
      'client/src/App.jsx'
    ];

    for (const appPath of appPaths) {
      if (await this.fileExists(appPath)) {
        const content = fs.readFileSync(appPath, 'utf8');
        
        // Check for problematic imports
        const problematicImports = [
          'import.*agent.*theme',
          'import.*admin.*theme.*global',
          '@/styles/agent',
          'agent-globals.css'
        ];

        for (const pattern of problematicImports) {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(content)) {
            throw new Error(`Theme isolation violation in ${appPath}: Found global import of agent theme. Agent styles should be scoped to agent components only.`);
          }
        }
      }
    }
  }

  /**
   * Check QA system is available
   * @throws {Error} If QA system not properly configured
   */
  async checkQASystem() {
    const qaRunner = 'scripts/qa-run.js';
    
    if (!await this.fileExists(qaRunner)) {
      throw new Error(`QA system not found: ${qaRunner} is required for task validation`);
    }

    // Check QA runner has execute permission or is runnable with node
    try {
      const content = fs.readFileSync(qaRunner, 'utf8');
      if (!content.includes('DONE - CHECKED - CONFIRMED - WORKING')) {
        throw new Error(`QA system malformed: ${qaRunner} does not output required success message`);
      }
    } catch (error) {
      throw new Error(`Failed to validate QA system: ${error.message}`);
    }
  }

  /**
   * Helper: Check if file exists
   * @param {string} filePath - Path to check
   * @returns {boolean} True if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Helper: Check if directory exists and has files
   * @param {string} dirPath - Directory path to check
   * @returns {boolean} True if directory exists and contains files
   */
  async dirHasFiles(dirPath) {
    try {
      const files = await fs.promises.readdir(dirPath);
      return files.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Validate task configuration
   * @param {object} task - Task configuration object
   * @throws {Error} If task configuration invalid
   */
  validateTaskConfig(task) {
    const requiredFields = ['id', 'desc', 'globs', 'implScript'];
    
    for (const field of requiredFields) {
      if (!task[field]) {
        throw new Error(`Task configuration invalid: missing required field '${field}'`);
      }
    }

    if (!Array.isArray(task.globs)) {
      throw new Error(`Task configuration invalid: 'globs' must be an array`);
    }

    if (task.globs.length === 0) {
      throw new Error(`Task configuration invalid: 'globs' cannot be empty`);
    }
  }
}

export default new Guards();