#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * Structured logger for orchestrator
 * Logs to console and appends to .orchestrator/run.log
 */
class Logger {
  constructor() {
    this.logFile = '.orchestrator/run.log';
    this.ensureLogDir();
  }

  ensureLogDir() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Format log entry with timestamp and level
   * @param {string} level - Log level
   * @param {string} msg - Message
   * @param {object} meta - Additional metadata
   * @returns {string} Formatted log line
   */
  formatEntry(level, msg, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.padEnd(5)} ${msg}${metaStr}`;
  }

  /**
   * Write to both console and log file
   * @param {string} level - Log level
   * @param {string} msg - Message
   * @param {object} meta - Additional metadata
   * @param {function} consoleFn - Console function to use
   */
  write(level, msg, meta = {}, consoleFn = console.log) {
    const entry = this.formatEntry(level, msg, meta);
    
    // Console output with appropriate function
    consoleFn(entry);

    // Append to log file
    try {
      fs.appendFileSync(this.logFile, entry + '\n', 'utf8');
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  /**
   * Log info message
   * @param {string} msg - Message
   * @param {object} meta - Additional metadata
   */
  info(msg, meta = {}) {
    this.write('INFO', msg, meta, console.log);
  }

  /**
   * Log warning message
   * @param {string} msg - Message  
   * @param {object} meta - Additional metadata
   */
  warn(msg, meta = {}) {
    this.write('WARN', msg, meta, console.warn);
  }

  /**
   * Log error message
   * @param {string} msg - Message
   * @param {object} meta - Additional metadata
   */
  error(msg, meta = {}) {
    this.write('ERROR', msg, meta, console.error);
  }

  /**
   * Log task start
   * @param {string} taskId - Task identifier
   * @param {string} desc - Task description
   */
  taskStart(taskId, desc) {
    this.info(`START ${taskId}`, { description: desc, phase: 'start' });
  }

  /**
   * Log task completion
   * @param {string} taskId - Task identifier
   */
  taskComplete(taskId) {
    this.info(`COMPLETE ${taskId}`, { phase: 'complete' });
  }

  /**
   * Log task rollback
   * @param {string} taskId - Task identifier
   * @param {string} reason - Rollback reason
   */
  taskRollback(taskId, reason) {
    this.warn(`ROLLBACK ${taskId}`, { reason, phase: 'rollback' });
  }

  /**
   * Log task failure
   * @param {string} taskId - Task identifier
   * @param {string} error - Error message
   */
  taskFail(taskId, error) {
    this.error(`FAILED ${taskId}`, { error: error.toString(), phase: 'failed' });
  }

  /**
   * Clear log file (for testing)
   */
  clear() {
    try {
      fs.writeFileSync(this.logFile, '', 'utf8');
    } catch (error) {
      console.error(`Failed to clear log file: ${error.message}`);
    }
  }

  /**
   * Get recent log entries
   * @param {number} lines - Number of lines to retrieve
   * @returns {string[]} Array of log lines
   */
  getRecent(lines = 50) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return [];
      }

      const content = fs.readFileSync(this.logFile, 'utf8');
      const allLines = content.trim().split('\n').filter(line => line.trim());
      return allLines.slice(-lines);
    } catch (error) {
      console.error(`Failed to read log file: ${error.message}`);
      return [];
    }
  }
}

export default new Logger();