/**
 * Secure Logger Utility
 * Wraps console logging with automatic PII redaction
 */

import { redactPII, redactPIIFromObject } from './redact.js';

interface LogLevel {
  name: string;
  color?: string;
}

const LOG_LEVELS: Record<string, LogLevel> = {
  error: { name: 'ERROR', color: '\x1b[31m' }, // Red
  warn: { name: 'WARN', color: '\x1b[33m' },   // Yellow
  info: { name: 'INFO', color: '\x1b[36m' },   // Cyan
  debug: { name: 'DEBUG', color: '\x1b[90m' },  // Gray
  log: { name: 'LOG', color: '\x1b[37m' }      // White
};

const RESET_COLOR = '\x1b[0m';

/**
 * Formats log arguments with PII redaction
 */
function formatLogArgs(args: any[]): string {
  return args.map(arg => {
    if (typeof arg === 'string') {
      return redactPII(arg);
    } else if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(redactPIIFromObject(arg), null, 2);
      } catch (error) {
        return '[Circular Object]';
      }
    } else {
      return String(arg);
    }
  }).join(' ');
}

/**
 * Creates a formatted log message with timestamp and level
 */
function createLogMessage(level: string, args: any[]): string {
  const timestamp = new Date().toISOString();
  const logLevel = LOG_LEVELS[level] || LOG_LEVELS.log;
  const formattedArgs = formatLogArgs(args);
  
  // Add color in development, plain text in production
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev && logLevel.color) {
    return `${logLevel.color}[${timestamp}] ${logLevel.name}:${RESET_COLOR} ${formattedArgs}`;
  }
  
  return `[${timestamp}] ${logLevel.name}: ${formattedArgs}`;
}

/**
 * Secure logger that automatically redacts PII
 */
class SecureLogger {
  /**
   * Log error messages
   */
  error(...args: any[]): void {
    const message = createLogMessage('error', args);
    console.error(message);
  }

  /**
   * Log warning messages
   */
  warn(...args: any[]): void {
    const message = createLogMessage('warn', args);
    console.warn(message);
  }

  /**
   * Log info messages
   */
  info(...args: any[]): void {
    const message = createLogMessage('info', args);
    console.info(message);
  }

  /**
   * Log debug messages (only in development)
   */
  debug(...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      const message = createLogMessage('debug', args);
      console.debug(message);
    }
  }

  /**
   * Log general messages
   */
  log(...args: any[]): void {
    const message = createLogMessage('log', args);
    console.log(message);
  }

  /**
   * Group logs (for development debugging)
   */
  group(label?: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(label ? redactPII(label) : undefined);
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (process.env.NODE_ENV === 'development') {
      console.groupEnd();
    }
  }

  /**
   * Log with table format (redacted)
   */
  table(data: any): void {
    if (process.env.NODE_ENV === 'development') {
      const redactedData = redactPIIFromObject(data);
      console.table(redactedData);
    }
  }

  /**
   * Performance timing start
   */
  time(label: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.time(redactPII(label));
    }
  }

  /**
   * Performance timing end
   */
  timeEnd(label: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(redactPII(label));
    }
  }

  /**
   * Raw console access (use sparingly, bypasses PII redaction)
   */
  raw = {
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console),
    log: console.log.bind(console)
  };
}

// Export singleton logger instance
export const logger = new SecureLogger();

// For backward compatibility, export individual functions
export const { error, warn, info, debug, log, group, groupEnd, table, time, timeEnd } = logger;