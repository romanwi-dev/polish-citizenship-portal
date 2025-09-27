#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

import log from './log.js';
import fsAtomic from './fs-atomic.js';
import guards from './guards.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main orchestrator state machine
 * Executes tasks sequentially with backup, QA, and retry logic
 */
class TaskOrchestrator {
  constructor() {
    this.config = this.loadConfig();
    this.retryBudget = this.config.retryBudget || 1;
    this.currentTask = null;
    this.currentBackup = null;
  }

  /**
   * Load orchestrator configuration
   * @returns {object} Configuration object
   */
  loadConfig() {
    const configPath = path.join(__dirname, 'config.json');
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration not found: ${configPath}`);
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      if (!config.tasks || !Array.isArray(config.tasks)) {
        throw new Error('Invalid configuration: tasks array required');
      }

      return config;
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
  }

  /**
   * Run QA system and return success/failure
   * @returns {boolean} True if QA passes, false otherwise
   */
  runQA() {
    log.info('Running QA validation...');
    
    const qaResult = spawnSync('node', ['scripts/qa-run.js'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    if (qaResult.error) {
      log.error('QA execution failed', { error: qaResult.error.message });
      return false;
    }

    const success = qaResult.status === 0;
    
    if (success) {
      log.info('✅ QA validation passed');
    } else {
      log.error('❌ QA validation failed', { exitCode: qaResult.status });
    }

    return success;
  }

  /**
   * Execute a task implementation script
   * @param {object} task - Task configuration
   * @param {object} options - Execution options (e.g., retry flag)
   */
  async executeTaskImpl(task, options = {}) {
    const implPath = path.resolve(task.implScript);
    
    if (!fs.existsSync(implPath)) {
      throw new Error(`Implementation script not found: ${implPath}`);
    }

    log.info(`Executing implementation: ${task.implScript}`, options);

    try {
      // Note: ES modules don't have a require cache like CommonJS
      
      const taskImpl = (await import(implPath)).default;
      
      if (typeof taskImpl !== 'function') {
        throw new Error(`Implementation script must export a function: ${task.implScript}`);
      }

      await taskImpl(options);
      log.info('Implementation completed successfully');
      
    } catch (error) {
      throw new Error(`Implementation failed: ${error.message}`);
    }
  }

  /**
   * Execute single task with full workflow
   * @param {object} task - Task configuration
   * @returns {boolean} True if task completed successfully
   */
  async executeTask(task) {
    this.currentTask = task;
    
    try {
      // Validate task configuration
      guards.validateTaskConfig(task);
      
      log.taskStart(task.id, task.desc);

      // Pre-flight checks
      await guards.preflight();

      // Create backup
      log.info('Creating backup...');
      this.currentBackup = await fsAtomic.backup(task.globs);

      // Execute implementation
      await this.executeTaskImpl(task);

      // Run QA
      const qaPass = this.runQA();
      
      if (qaPass) {
        // Success - clean backup and mark complete
        await fsAtomic.clean(this.currentBackup);
        this.currentBackup = null;
        log.taskComplete(task.id);
        return true;
      } else {
        // QA failed - attempt rollback and retry
        return await this.handleQAFailure(task);
      }

    } catch (error) {
      log.taskFail(task.id, error);
      
      // Restore from backup if available
      if (this.currentBackup) {
        try {
          await fsAtomic.restore(this.currentBackup);
          log.info('Restored from backup after error');
        } catch (restoreError) {
          log.error('Failed to restore backup', { error: restoreError.message });
        }
      }

      throw error;
    }
  }

  /**
   * Handle QA failure with rollback and retry logic
   * @param {object} task - Task configuration
   * @returns {boolean} True if retry succeeds, false otherwise
   */
  async handleQAFailure(task) {
    log.taskRollback(task.id, 'QA validation failed');

    try {
      // Restore from backup
      await fsAtomic.restore(this.currentBackup);
      
      // Retry implementation
      log.info(`Retrying task ${task.id} (1/${this.retryBudget})...`);
      await this.executeTaskImpl(task, { retry: true });

      // Run QA again
      const qaPassRetry = this.runQA();

      if (qaPassRetry) {
        // Success on retry
        await fsAtomic.clean(this.currentBackup);
        this.currentBackup = null;
        log.taskComplete(task.id);
        return true;
      } else {
        // Still failed after retry
        log.taskFail(task.id, 'QA failed after retry');
        
        // Restore backup one more time
        await fsAtomic.restore(this.currentBackup);
        
        throw new Error(`FAILED ${task.id} — QA did not pass after retry`);
      }

    } catch (error) {
      log.error('Retry failed', { taskId: task.id, error: error.message });
      throw error;
    }
  }

  /**
   * Execute all tasks in sequence
   */
  async run() {
    console.log('🚀 Task Orchestrator Starting...\n');
    
    log.info('Orchestrator started', { 
      totalTasks: this.config.tasks.length,
      retryBudget: this.retryBudget
    });

    let completedTasks = 0;

    try {
      for (const task of this.config.tasks) {
        console.log(`\n📋 Processing ${task.id}: ${task.desc}`);
        
        await this.executeTask(task);
        completedTasks++;
        
        console.log(`✅ ${task.id} completed (${completedTasks}/${this.config.tasks.length})\n`);
      }

      // All tasks completed successfully
      log.info('All tasks completed successfully', { 
        completedTasks,
        totalTasks: this.config.tasks.length
      });

      // Print the exact required success message
      console.log('DONE - CHECKED - CONFIRMED - WORKING');
      process.exit(0);

    } catch (error) {
      log.error('Orchestrator failed', { 
        completedTasks,
        totalTasks: this.config.tasks.length,
        error: error.message
      });

      console.error(`\n❌ Orchestrator failed at task ${completedTasks + 1}/${this.config.tasks.length}`);
      console.error(`Error: ${error.message}`);
      
      if (this.currentTask) {
        console.error(`Failed task: ${this.currentTask.id} - ${this.currentTask.desc}`);
      }

      process.exit(1);
    }
  }

  /**
   * Get orchestrator status
   * @returns {object} Status information
   */
  getStatus() {
    return {
      totalTasks: this.config.tasks.length,
      currentTask: this.currentTask?.id || null,
      retryBudget: this.retryBudget,
      backupAvailable: !!this.currentBackup,
      logFile: this.config.logFile || '.orchestrator/run.log'
    };
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\n❌ Orchestrator interrupted by user');
  
  if (orchestrator.currentBackup) {
    console.log('🔄 Restoring backup...');
    try {
      await fsAtomic.restore(orchestrator.currentBackup);
      console.log('✅ Backup restored');
    } catch (error) {
      console.error(`❌ Failed to restore backup: ${error.message}`);
    }
  }
  
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\n❌ Orchestrator terminated');
  process.exit(1);
});

// Run orchestrator if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new TaskOrchestrator();
  orchestrator.run().catch((error) => {
    console.error('❌ Orchestrator Error:', error.message);
    process.exit(1);
  });
}

export default TaskOrchestrator;