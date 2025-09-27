#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';

/**
 * Atomic filesystem operations for orchestrator
 * Provides backup, restore, and cleanup functionality
 */
class FsAtomic {
  constructor() {
    this.backupDir = '.orchestrator/backups';
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create atomic backup of files matching globs
   * @param {string[]} globs - File glob patterns to backup
   * @returns {string} Path to backup archive
   */
  async backup(globs) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}.tar.gz`;
    const backupPath = path.join(this.backupDir, backupName);

    // Collect all files matching globs
    const filesToBackup = new Set();
    
    for (const globPattern of globs) {
      try {
        const matches = await glob(globPattern, { 
          dot: true,
          ignore: ['node_modules/**', '.git/**', '.orchestrator/**']
        });
        matches.forEach(file => filesToBackup.add(file));
      } catch (error) {
        // If glob doesn't match anything, continue (some tasks may be pre-implemented)
        console.warn(`Warning: glob pattern "${globPattern}" matched no files`);
      }
    }

    if (filesToBackup.size === 0) {
      console.warn('No files to backup - creating empty backup marker');
      // Create empty backup marker
      fs.writeFileSync(backupPath + '.empty', 'No files matched globs');
      return backupPath + '.empty';
    }

    // Create file list for tar
    const fileList = Array.from(filesToBackup).join('\n');
    const fileListPath = path.join(this.backupDir, `files-${timestamp}.txt`);
    fs.writeFileSync(fileListPath, fileList);

    try {
      // Create tar archive with relative paths preserved
      execSync(`tar -czf "${backupPath}" -T "${fileListPath}"`, {
        stdio: ['inherit', 'inherit', 'inherit']
      });

      // Clean up file list
      fs.unlinkSync(fileListPath);

      console.log(`✅ Backup created: ${backupPath} (${filesToBackup.size} files)`);
      return backupPath;
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(fileListPath)) {
        fs.unlinkSync(fileListPath);
      }
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  /**
   * Restore files from backup archive
   * @param {string} backupPath - Path to backup archive
   */
  async restore(backupPath) {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupPath}`);
    }

    // Handle empty backup marker
    if (backupPath.endsWith('.empty')) {
      console.log('📂 Empty backup - nothing to restore');
      return;
    }

    try {
      // Extract tar archive, overwriting existing files
      execSync(`tar -xzf "${backupPath}"`, {
        stdio: ['inherit', 'inherit', 'inherit']
      });

      console.log(`🔄 Restored from: ${backupPath}`);
    } catch (error) {
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  /**
   * Clean up backup after successful completion
   * @param {string} backupPath - Path to backup archive to delete
   */
  async clean(backupPath) {
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
      console.log(`🗑️  Cleaned backup: ${backupPath}`);
    }
  }

  /**
   * List all available backups
   * @returns {string[]} Array of backup file paths
   */
  listBackups() {
    if (!fs.existsSync(this.backupDir)) {
      return [];
    }

    return fs.readdirSync(this.backupDir)
      .filter(file => file.startsWith('backup-') && (file.endsWith('.tar.gz') || file.endsWith('.empty')))
      .map(file => path.join(this.backupDir, file))
      .sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime); // Most recent first
  }
}

export default new FsAtomic();