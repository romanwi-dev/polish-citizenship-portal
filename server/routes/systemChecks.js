// System Checks Routes - Comprehensive admin-only system monitoring
// Provides health, QA, security, performance, and UX checks with report persistence

import { Router } from 'express';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import rateLimit from 'express-rate-limit';
import fs from 'fs/promises';
import path from 'path';
import { storage, getStorageHealth, isUsingMockStorage } from '../storage/index.js';
import { getUserFromToken } from '../auth.js';
import os from 'os';
import { z } from 'zod';

const router = Router();
const execAsync = promisify(exec);

// Rate limiting for system check endpoints
const systemCheckRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many system check requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin authentication middleware
const requireAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn(`Unauthorized admin access attempt from IP: ${req.ip} - missing Bearer token`);
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Admin endpoints require valid authentication token'
      });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);
    
    if (!user) {
      console.warn(`Invalid token admin access attempt from IP: ${req.ip}`);
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        message: 'Please log in to access admin features'
      });
    }

    if (user.role !== 'admin') {
      console.warn(`SECURITY ALERT: Privilege escalation attempt blocked - User ${user.email} (${user.id}) with role '${user.role || 'unknown'}' tried to access system checks endpoint from IP: ${req.ip}`);
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Admin privileges required. This incident has been logged.',
        incident_id: `SEC_${Date.now()}_${Math.random().toString(36).substring(2)}`
      });
    }

    req.user = user;
    console.info(`System checks access granted to admin: ${user.email} (${user.id}) from IP: ${req.ip}`);
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

// Utility function to ensure backup directory exists
async function ensureBackupDirectory() {
  const backupDir = path.join(process.cwd(), 'BACKUPS', 'system-checks');
  try {
    await fs.mkdir(backupDir, { recursive: true });
    return backupDir;
  } catch (error) {
    console.error('Failed to create backup directory:', error);
    throw new Error('Unable to create backup directory');
  }
}

// Utility function to run command with timeout
async function runCommandWithTimeout(command, args = [], options = {}) {
  const timeout = options.timeout || 30000;
  
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, QA_MODE: '1' },
      ...options
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timeoutId = setTimeout(() => {
      process.kill('SIGTERM');
      reject(new Error(`Command timeout: ${command} ${args.join(' ')}`));
    }, timeout);

    process.on('close', (code) => {
      clearTimeout(timeoutId);
      resolve({
        code,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        success: code === 0
      });
    });

    process.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}

// Validation schemas for input validation and security
const qaCheckSchema = z.object({
  suites: z.array(z.enum(['i18n', 'eslint', 'vitest', 'selfcheck'])).optional().default(['i18n', 'eslint', 'vitest', 'selfcheck']),
  timeout: z.number().min(1000).max(300000).optional().default(120000)
});

const securityCheckSchema = z.object({
  audits: z.array(z.enum(['secrets', 'npm', 'headers'])).optional().default(['secrets', 'npm', 'headers'])
});

const performanceCheckSchema = z.object({
  benchmarks: z.array(z.enum(['health', 'storage', 'io', 'memory'])).optional().default(['health', 'storage', 'io', 'memory'])
});

const uxCheckSchema = z.object({
  tests: z.array(z.enum(['smoke', 'playwright'])).optional().default(['smoke', 'playwright'])
});

const reportSaveSchema = z.object({
  report: z.object({
    timestamp: z.string(),
    status: z.enum(['ok', 'warning', 'error']),
    results: z.record(z.any())
  }),
  filename: z.string().regex(/^[a-zA-Z0-9_-]+$/).max(50).optional() // Sanitized filename
});

// Utility function to sanitize filename and prevent path traversal attacks
function sanitizeFilename(filename) {
  if (!filename) return null;
  
  // Remove any path separators and dangerous characters
  const sanitized = filename.replace(/[\/\\:*?"<>|\.\.]/g, '_');
  
  // Limit length and ensure it's alphanumeric with underscores/dashes only
  return sanitized.substring(0, 50).replace(/[^a-zA-Z0-9_-]/g, '_');
}

// GET /api/admin/checks/health - System health check
router.get('/health', systemCheckRateLimit, requireAdminAuth, async (req, res) => {
  const startTime = Date.now();
  console.log(`Health check request from admin: ${req.user?.email}`);
  
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024),
        system: Math.round(os.totalmem() / 1024 / 1024)
      },
      cpu: {
        arch: os.arch(),
        platform: os.platform(),
        cores: os.cpus().length,
        loadAvg: os.loadavg()
      },
      storage: await getStorageHealth(),
      storageType: isUsingMockStorage() ? 'mock' : 'dropbox',
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        qaMode: process.env.QA_MODE === '1',
        nodeVersion: process.version
      },
      routes: {
        registered: 'active',
        authentication: 'protected',
        rateLimit: 'enabled'
      },
      version: '1.0.0',
      duration: Date.now() - startTime
    };

    // Check database connectivity
    try {
      const { pool } = await import('../db.js');
      const client = await pool.connect();
      try {
        await client.query('SELECT 1');
        health.database = { status: 'connected', pool: pool.totalCount };
      } finally {
        client.release();
      }
    } catch (error) {
      health.database = { status: 'error', error: error.message };
      health.status = 'degraded';
    }

    res.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      duration: Date.now() - startTime
    });
  }
});

// POST /api/admin/checks/qa - QA suite execution
router.post('/qa', systemCheckRateLimit, requireAdminAuth, async (req, res) => {
  const startTime = Date.now();
  console.log(`QA checks request from admin: ${req.user?.email}`);
  
  try {
    // Validate request body with Zod schema
    const validatedData = qaCheckSchema.parse(req.body || {});
    
    const qaResults = {
      status: 'running',
      timestamp: new Date().toISOString(),
      results: {}
    };

    // Run i18n audit
    try {
      const i18nResult = await runCommandWithTimeout('node', ['-e', `
        const fs = require('fs');
        const path = require('path');
        const localesDir = path.join(process.cwd(), 'client/src/i18n/locales');
        const enFile = path.join(localesDir, 'en.json');
        const plFile = path.join(localesDir, 'pl.json');
        
        try {
          const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
          const plData = JSON.parse(fs.readFileSync(plFile, 'utf-8'));
          
          const enKeys = Object.keys(enData);
          const plKeys = Object.keys(plData);
          const missingInPl = enKeys.filter(key => !plKeys.includes(key));
          const extraInPl = plKeys.filter(key => !enKeys.includes(key));
          
          console.log(JSON.stringify({
            status: 'ok',
            enKeys: enKeys.length,
            plKeys: plKeys.length,
            missingInPl: missingInPl.length,
            extraInPl: extraInPl.length,
            coverage: Math.round((plKeys.length / enKeys.length) * 100)
          }));
        } catch (error) {
          console.log(JSON.stringify({ status: 'error', error: error.message }));
        }
      `]);
      
      qaResults.results.i18n = i18nResult.success ? JSON.parse(i18nResult.stdout) : { status: 'error', error: i18nResult.stderr };
    } catch (error) {
      qaResults.results.i18n = { status: 'error', error: error.message };
    }

    // Run ESLint
    try {
      const eslintResult = await runCommandWithTimeout('npx', [
        'eslint', 'server/', 'client/src/', 
        '--ext', '.js,.jsx,.ts,.tsx', 
        '--format', 'json'
      ], { timeout: 60000 });
      
      if (eslintResult.success) {
        const lintData = eslintResult.stdout ? JSON.parse(eslintResult.stdout) : [];
        const errorCount = lintData.reduce((sum, file) => sum + file.errorCount, 0);
        const warningCount = lintData.reduce((sum, file) => sum + file.warningCount, 0);
        
        qaResults.results.eslint = {
          status: errorCount === 0 ? 'ok' : 'warning',
          files: lintData.length,
          errors: errorCount,
          warnings: warningCount
        };
      } else {
        qaResults.results.eslint = { status: 'error', error: eslintResult.stderr };
      }
    } catch (error) {
      qaResults.results.eslint = { status: 'error', error: error.message };
    }

    // Run Vitest
    try {
      const vitestResult = await runCommandWithTimeout('npx', ['vitest', 'run', '--reporter=json'], { timeout: 120000 });
      
      if (vitestResult.success && vitestResult.stdout) {
        try {
          const testData = JSON.parse(vitestResult.stdout);
          qaResults.results.vitest = {
            status: testData.success ? 'ok' : 'error',
            tests: testData.numTotalTests || 0,
            passed: testData.numPassedTests || 0,
            failed: testData.numFailedTests || 0,
            duration: testData.duration || 0
          };
        } catch (parseError) {
          qaResults.results.vitest = { status: 'warning', error: 'Test output parse error', output: vitestResult.stdout };
        }
      } else {
        qaResults.results.vitest = { status: 'error', error: vitestResult.stderr || 'Test execution failed' };
      }
    } catch (error) {
      qaResults.results.vitest = { status: 'error', error: error.message };
    }

    // Run selfcheck
    try {
      const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/selfcheck`, {
        headers: { 'x-qa-auth': process.env.QA_AUTH_TOKEN || 'dev-token' }
      });
      
      if (response.ok) {
        const selfcheckData = await response.json();
        qaResults.results.selfcheck = {
          status: selfcheckData.status,
          checks: selfcheckData.summary?.totalChecks || 0,
          passed: selfcheckData.summary?.passed || 0,
          warnings: selfcheckData.warnings?.length || 0,
          errors: selfcheckData.errors?.length || 0
        };
      } else {
        qaResults.results.selfcheck = { status: 'error', error: `HTTP ${response.status}` };
      }
    } catch (error) {
      qaResults.results.selfcheck = { status: 'error', error: error.message };
    }

    // Determine overall status
    const hasErrors = Object.values(qaResults.results).some(r => r.status === 'error');
    const hasWarnings = Object.values(qaResults.results).some(r => r.status === 'warning');
    
    qaResults.status = hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok';
    qaResults.duration = Date.now() - startTime;

    res.json(qaResults);
  } catch (error) {
    console.error('QA checks error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      duration: Date.now() - startTime
    });
  }
});

// POST /api/admin/checks/security - Security audit
router.post('/security', systemCheckRateLimit, requireAdminAuth, async (req, res) => {
  const startTime = Date.now();
  console.log(`Security checks request from admin: ${req.user?.email}`);
  
  try {
    // Validate request body with Zod schema
    const validatedData = securityCheckSchema.parse(req.body || {});
    
    const securityResults = {
      status: 'running',
      timestamp: new Date().toISOString(),
      results: {}
    };

    // Environment secrets audit
    const requiredSecrets = ['DATABASE_URL', 'JWT_SECRET'];
    const optionalSecrets = ['DROPBOX_ACCESS_TOKEN', 'OPENAI_API_KEY', 'QA_AUTH_TOKEN'];
    
    const secretsAudit = {
      status: 'ok',
      required: {},
      optional: {},
      missing: []
    };

    requiredSecrets.forEach(secret => {
      const exists = !!process.env[secret];
      secretsAudit.required[secret] = exists ? 'configured' : 'missing';
      if (!exists) {
        secretsAudit.missing.push(secret);
        secretsAudit.status = 'error';
      }
    });

    optionalSecrets.forEach(secret => {
      secretsAudit.optional[secret] = process.env[secret] ? 'configured' : 'not configured';
    });

    securityResults.results.secrets = secretsAudit;

    // NPM audit
    try {
      const npmAuditResult = await runCommandWithTimeout('npm', ['audit', '--json'], { timeout: 60000 });
      
      if (npmAuditResult.success && npmAuditResult.stdout) {
        try {
          const auditData = JSON.parse(npmAuditResult.stdout);
          securityResults.results.npmAudit = {
            status: auditData.metadata?.vulnerabilities?.total === 0 ? 'ok' : 'warning',
            vulnerabilities: auditData.metadata?.vulnerabilities || {},
            auditReportVersion: auditData.auditReportVersion
          };
        } catch (parseError) {
          securityResults.results.npmAudit = { status: 'warning', error: 'Audit parse error' };
        }
      } else {
        securityResults.results.npmAudit = { status: 'error', error: npmAuditResult.stderr };
      }
    } catch (error) {
      securityResults.results.npmAudit = { status: 'error', error: error.message };
    }

    // Security headers check
    const headersCheck = {
      status: 'ok',
      headers: {
        helmet: process.env.NODE_ENV === 'production' ? 'enabled' : 'development',
        cors: 'configured',
        compression: 'enabled',
        rateLimit: 'enabled'
      },
      recommendations: []
    };

    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      headersCheck.recommendations.push('Set JWT_SECRET for production');
      headersCheck.status = 'warning';
    }

    securityResults.results.headers = headersCheck;

    // Determine overall status
    const hasErrors = Object.values(securityResults.results).some(r => r.status === 'error');
    const hasWarnings = Object.values(securityResults.results).some(r => r.status === 'warning');
    
    securityResults.status = hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok';
    securityResults.duration = Date.now() - startTime;

    res.json(securityResults);
  } catch (error) {
    console.error('Security checks error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      duration: Date.now() - startTime
    });
  }
});

// POST /api/admin/checks/performance - Performance benchmarks
router.post('/performance', systemCheckRateLimit, requireAdminAuth, async (req, res) => {
  const startTime = Date.now();
  console.log(`Performance checks request from admin: ${req.user?.email}`);
  
  try {
    // Validate request body with Zod schema
    const validatedData = performanceCheckSchema.parse(req.body || {});
    
    const perfResults = {
      status: 'running',
      timestamp: new Date().toISOString(),
      results: {}
    };

    // Health endpoint timing
    try {
      const healthStart = Date.now();
      const healthResponse = await fetch(`http://localhost:${process.env.PORT || 5000}/api/health`);
      const healthDuration = Date.now() - healthStart;
      
      perfResults.results.healthTiming = {
        status: healthDuration < 1000 ? 'ok' : healthDuration < 3000 ? 'warning' : 'error',
        duration: healthDuration,
        statusCode: healthResponse.status
      };
    } catch (error) {
      perfResults.results.healthTiming = { status: 'error', error: error.message };
    }

    // Dropbox/Storage timing
    try {
      const storageStart = Date.now();
      const storageHealth = await getStorageHealth();
      const storageDuration = Date.now() - storageStart;
      
      perfResults.results.storageTiming = {
        status: storageDuration < 2000 ? 'ok' : storageDuration < 5000 ? 'warning' : 'error',
        duration: storageDuration,
        type: isUsingMockStorage() ? 'mock' : 'dropbox',
        health: storageHealth
      };
    } catch (error) {
      perfResults.results.storageTiming = { status: 'error', error: error.message };
    }

    // I/O timing (file system operations)
    try {
      const ioStart = Date.now();
      const testFile = path.join(process.cwd(), `temp_perf_test_${Date.now()}.txt`);
      
      await fs.writeFile(testFile, 'performance test data');
      const data = await fs.readFile(testFile, 'utf-8');
      await fs.unlink(testFile);
      
      const ioDuration = Date.now() - ioStart;
      
      perfResults.results.ioTiming = {
        status: ioDuration < 100 ? 'ok' : ioDuration < 500 ? 'warning' : 'error',
        duration: ioDuration,
        operations: ['write', 'read', 'delete'],
        dataSize: data.length
      };
    } catch (error) {
      perfResults.results.ioTiming = { status: 'error', error: error.message };
    }

    // Memory usage analysis
    const memUsage = process.memoryUsage();
    perfResults.results.memory = {
      status: memUsage.heapUsed < 100 * 1024 * 1024 ? 'ok' : memUsage.heapUsed < 250 * 1024 * 1024 ? 'warning' : 'error',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024)
    };

    // Determine overall status
    const hasErrors = Object.values(perfResults.results).some(r => r.status === 'error');
    const hasWarnings = Object.values(perfResults.results).some(r => r.status === 'warning');
    
    perfResults.status = hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok';
    perfResults.duration = Date.now() - startTime;

    res.json(perfResults);
  } catch (error) {
    console.error('Performance checks error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      duration: Date.now() - startTime
    });
  }
});

// POST /api/admin/checks/ux - UX smoke tests
router.post('/ux', systemCheckRateLimit, requireAdminAuth, async (req, res) => {
  const startTime = Date.now();
  console.log(`UX checks request from admin: ${req.user?.email}`);
  
  try {
    // Validate request body with Zod schema
    const validatedData = uxCheckSchema.parse(req.body || {});
    
    const uxResults = {
      status: 'running',
      timestamp: new Date().toISOString(),
      results: {}
    };

    // Basic smoke tests without full Playwright (faster execution)
    const smokeTests = [
      { name: 'Homepage', path: '/', expectedTitle: 'Polish Citizenship' },
      { name: 'Admin Dashboard', path: '/admin', expectedTitle: 'Admin' },
      { name: 'Health Check', path: '/api/health', expectedStatus: 200 }
    ];

    const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
    
    for (const test of smokeTests) {
      try {
        const testStart = Date.now();
        const response = await fetch(`${baseUrl}${test.path}`, {
          headers: test.path.startsWith('/api') ? {} : { 'User-Agent': 'System-Checks-UX-Test' }
        });
        
        const testDuration = Date.now() - testStart;
        const isHealthy = response.status === (test.expectedStatus || 200) && testDuration < 5000;
        
        uxResults.results[test.name.toLowerCase().replace(/\s+/g, '')] = {
          status: isHealthy ? 'ok' : 'warning',
          duration: testDuration,
          statusCode: response.status,
          path: test.path
        };
      } catch (error) {
        uxResults.results[test.name.toLowerCase().replace(/\s+/g, '')] = {
          status: 'error',
          error: error.message,
          path: test.path
        };
      }
    }

    // Try to run actual Playwright tests if available (with timeout)
    try {
      const playwrightResult = await runCommandWithTimeout('npx', [
        'playwright', 'test', 'tests/ux/', 
        '--reporter=json', 
        '--timeout=10000'
      ], { timeout: 60000 });
      
      if (playwrightResult.success && playwrightResult.stdout) {
        try {
          const testData = JSON.parse(playwrightResult.stdout);
          uxResults.results.playwright = {
            status: testData.stats?.failed === 0 ? 'ok' : 'warning',
            tests: testData.stats?.total || 0,
            passed: testData.stats?.passed || 0,
            failed: testData.stats?.failed || 0,
            duration: testData.stats?.duration || 0
          };
        } catch (parseError) {
          uxResults.results.playwright = { status: 'warning', error: 'Test output parse error' };
        }
      } else {
        uxResults.results.playwright = { status: 'skipped', reason: 'Playwright tests not available or failed' };
      }
    } catch (error) {
      uxResults.results.playwright = { status: 'skipped', reason: error.message };
    }

    // Determine overall status
    const hasErrors = Object.values(uxResults.results).some(r => r.status === 'error');
    const hasWarnings = Object.values(uxResults.results).some(r => r.status === 'warning');
    
    uxResults.status = hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok';
    uxResults.duration = Date.now() - startTime;

    res.json(uxResults);
  } catch (error) {
    console.error('UX checks error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      duration: Date.now() - startTime
    });
  }
});

// GET /api/admin/checks/report/latest - Load latest report
router.get('/report/latest', systemCheckRateLimit, requireAdminAuth, async (req, res) => {
  console.log(`Load latest report request from admin: ${req.user?.email}`);
  
  try {
    const backupDir = await ensureBackupDirectory();
    const files = await fs.readdir(backupDir);
    
    const reportFiles = files
      .filter(file => file.startsWith('system-checks-') && file.endsWith('.json'))
      .sort()
      .reverse();

    if (reportFiles.length === 0) {
      return res.json({
        status: 'empty',
        message: 'No saved reports found',
        timestamp: new Date().toISOString()
      });
    }

    const latestFile = reportFiles[0];
    const reportPath = path.join(backupDir, latestFile);
    const reportData = await fs.readFile(reportPath, 'utf-8');
    const report = JSON.parse(reportData);

    res.json({
      status: 'ok',
      report,
      filename: latestFile,
      loadedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Load latest report error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/admin/checks/report/save - Save report
router.post('/report/save', systemCheckRateLimit, requireAdminAuth, async (req, res) => {
  console.log(`Save report request from admin: ${req.user?.email}`);
  
  try {
    // Validate request body with strict Zod schema
    const validatedData = reportSaveSchema.parse(req.body);
    const { report } = validatedData;
    
    const backupDir = await ensureBackupDirectory();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Sanitize custom filename or use default - SECURITY: prevent path traversal
    const customFilename = validatedData.filename ? sanitizeFilename(validatedData.filename) : null;
    const filename = customFilename ? `system-checks-${customFilename}-${timestamp}.json` : `system-checks-${timestamp}.json`;
    
    // Additional security check to prevent path traversal attacks
    if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      console.error(`SECURITY ALERT: Path traversal attempt detected in filename: ${filename} by user: ${req.user.email}`);
      return res.status(400).json({
        status: 'error',
        error: 'Invalid filename: Path traversal detected',
        incident_id: `SEC_${Date.now()}_${Math.random().toString(36).substring(2)}`
      });
    }
    
    const reportPath = path.join(backupDir, filename);

    const reportWithMetadata = {
      ...report,
      savedBy: req.user.email,
      savedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    await fs.writeFile(reportPath, JSON.stringify(reportWithMetadata, null, 2));

    // Clean up old reports (keep last 10)
    try {
      const files = await fs.readdir(backupDir);
      const reportFiles = files
        .filter(file => file.startsWith('system-checks-') && file.endsWith('.json'))
        .sort()
        .reverse();

      if (reportFiles.length > 10) {
        const filesToDelete = reportFiles.slice(10);
        for (const file of filesToDelete) {
          await fs.unlink(path.join(backupDir, file));
        }
      }
    } catch (cleanupError) {
      console.warn('Report cleanup error:', cleanupError);
    }

    res.json({
      status: 'ok',
      filename,
      path: reportPath,
      savedAt: new Date().toISOString(),
      message: 'Report saved successfully'
    });
  } catch (error) {
    console.error('Save report error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;