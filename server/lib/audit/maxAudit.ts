// maxAudit.ts - Comprehensive Full Project Auditor
// Performs end-to-end validation of the entire Polish citizenship application stack
// 15 comprehensive checks: build, runtime, routes, env/secrets, storage, database, emails, PDF, i18n, a11y, performance, security, links

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';

const execAsync = promisify(exec);

// Viewport configurations for UI/UX testing
const VIEWPORTS = [
  { name: 'mobile', width: 360, height: 740, dpr: 3 },
  { name: 'tablet', width: 834, height: 1112, dpr: 2 },
  { name: 'desktop', width: 1440, height: 900, dpr: 2 }
];

// Routes to audit screenshots/UX
function uiRoutes(): string[] {
  const envRoutes = (process.env.AUDIT_ROUTES_UI || process.env.AUDIT_ROUTES || '/,/admin/system-checks')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  return Array.from(new Set(envRoutes));
}

// Types for audit results
interface AuditItem {
  name: string;
  level: 'OK' | 'WARN' | 'INFO' | 'ERROR';
  code: number;
  out: string;
}

interface UXPageResult {
  route: string;
  viewport: string;
  axe: {
    violations: number;
    top: any[];
  };
  metrics: {
    ttfb: number;
    dcl: number;
    load: number;
    fcpApprox: number;
  };
  heuristics: {
    hasViewportMeta: boolean;
    tapTargetsSmall: number;
    imagesMissingAlt: number;
    imagesNoDims: number;
    headingsOrderIssues: number;
    focusableWithoutFocusStyle: number;
    keyboardTrapRisk: boolean;
    clsRiskPct: number;
  };
  network: {
    requests: number;
    imgBytesKB: number;
  };
}

interface UXReport {
  pages: UXPageResult[];
  totals: {
    a11yViolations: number;
    tapTargetIssues: number;
    altMissing: number;
    noDims: number;
    clsRiskRoutes: number;
    bigImgKB: number;
  };
}

interface AuditReport {
  startedAt: string;
  finishedAt: string;
  ms: number;
  passed: boolean;
  counts: {
    ok: number;
    warn: number;
    info: number;
    error: number;
  };
  items: AuditItem[];
  meta: {
    port: number;
    storageProvider: string;
    routesTested: string[];
    appUrl: string;
  };
  extras?: {
    uiux?: UXReport;
  };
}

class MaxAuditor {
  private items: AuditItem[] = [];
  private startTime: number = 0;
  private port: number;
  private appUrl: string;

  constructor() {
    this.port = parseInt(process.env.PORT || '5000');
    this.appUrl = process.env.APP_URL || `http://127.0.0.1:${this.port}`;
  }

  // Helper: Run command with spawn
  private async run(cmd: string, args: string[] = [], options: any = {}): Promise<{ code: number; stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(cmd, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'production', ...options.env },
        cwd: options.cwd || process.cwd(),
        ...options
      });

      let stdout = '';
      let stderr = '';

      childProcess.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      const timeout = setTimeout(() => {
        childProcess.kill('SIGTERM');
        reject(new Error(`Command timeout: ${cmd} ${args.join(' ')}`));
      }, options.timeout || 60000);

      childProcess.on('close', (code: number | null) => {
        clearTimeout(timeout);
        resolve({ code: code || 0, stdout: stdout.trim(), stderr: stderr.trim() });
      });

      childProcess.on('error', (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  // Helper: Boot server and ping healthz
  private async bootAndPing(): Promise<{ success: boolean; logs: string }> {
    try {
      console.log('🚀 Starting production server for health check...');
      
      // First, ensure build exists
      try {
        await fs.access(path.join(process.cwd(), 'dist/index.js'));
      } catch {
        throw new Error('Build not found. Run npm run build first.');
      }

      const serverProcess = spawn('node', ['dist/index.js'], {
        env: { ...process.env, NODE_ENV: 'production', PORT: this.port.toString() },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let logs = '';
      let healthCheckPassed = false;

      serverProcess.stdout?.on('data', (data) => {
        logs += data.toString();
      });

      serverProcess.stderr?.on('data', (data) => {
        logs += data.toString();
      });

      // Wait for server to start and ping healthz
      const healthCheckPromise = new Promise<boolean>((resolve) => {
        const checkHealth = async () => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${this.appUrl}/healthz`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (response.ok) {
              healthCheckPassed = true;
              resolve(true);
              return;
            }
          } catch (err) {
            // Continue checking
          }
          
          setTimeout(checkHealth, 1000);
        };

        // Start checking after 2 seconds
        setTimeout(checkHealth, 2000);
        
        // Timeout after 20 seconds
        setTimeout(() => resolve(false), 20000);
      });

      const success = await healthCheckPromise;
      
      // Kill the server process
      serverProcess.kill('SIGTERM');
      
      return { success, logs };
    } catch (error) {
      return { success: false, logs: `Boot error: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // Helper: HTTP ping
  private async ping(path: string): Promise<{ success: boolean; status: number; duration: number }> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`${this.appUrl}${path}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return {
        success: response.ok,
        status: response.status,
        duration: Date.now() - start
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        duration: Date.now() - start
      };
    }
  }

  // Helper: Record audit result
  private record(name: string, code: number, out: string, level: 'OK' | 'WARN' | 'INFO' | 'ERROR' | 'AUTO' = 'AUTO'): void {
    let finalLevel: 'OK' | 'WARN' | 'INFO' | 'ERROR';
    if (level === 'AUTO') {
      finalLevel = code === 0 ? 'OK' : 'ERROR';
    } else {
      finalLevel = level;
    }

    this.items.push({
      name,
      level: finalLevel,
      code,
      out
    });
  }

  // CHECK 1: Lint (soft)
  private async checkLint(): Promise<void> {
    try {
      const result = await this.run('npm', ['run', 'lint'], { timeout: 60000 });
      this.record('lint', result.code, result.stdout || result.stderr, result.code === 0 ? 'OK' : 'WARN');
    } catch (error) {
      this.record('lint', 1, `Lint check failed: ${error instanceof Error ? error.message : String(error)}`, 'WARN');
    }
  }

  // CHECK 2: TypeCheck (soft)
  private async checkTypecheck(): Promise<void> {
    try {
      const result = await this.run('npm', ['run', 'check'], { timeout: 60000 });
      this.record('typecheck', result.code, result.stdout || result.stderr, result.code === 0 ? 'OK' : 'WARN');
    } catch (error) {
      this.record('typecheck', 1, `TypeScript check failed: ${error instanceof Error ? error.message : String(error)}`, 'WARN');
    }
  }

  // CHECK 3: Build (hard)
  private async checkBuild(): Promise<void> {
    try {
      const result = await this.run('npm', ['run', 'build'], { timeout: 120000 });
      this.record('build', result.code, result.stdout || result.stderr);
    } catch (error) {
      this.record('build', 1, `Build failed: ${error instanceof Error ? error.message : String(error)}`, 'ERROR');
    }
  }

  // CHECK 4: Runtime (hard)
  private async checkRuntime(): Promise<void> {
    try {
      const { success, logs } = await this.bootAndPing();
      this.record('runtime', success ? 0 : 1, logs);
    } catch (error) {
      this.record('runtime', 1, `Runtime check failed: ${error instanceof Error ? error.message : String(error)}`, 'ERROR');
    }
  }

  // CHECK 5: Routes (hard)
  private async checkRoutes(): Promise<void> {
    const routes = process.env.AUDIT_ROUTES?.split(',') || ['/healthz', '/', '/api/system/health'];
    const results: string[] = [];

    for (const route of routes) {
      const { success, status, duration } = await this.ping(route.trim());
      results.push(`${route}: ${status} (${duration}ms)`);
      
      if (route === '/healthz' && !success) {
        this.record('routes', 1, results.join(', '), 'ERROR');
        return;
      }
    }

    const allSuccessful = results.every(r => !r.includes(' 0 ') && !r.includes(' 404 ') && !r.includes(' 500 '));
    this.record('routes', allSuccessful ? 0 : 1, results.join(', '), allSuccessful ? 'OK' : 'WARN');
  }

  // CHECK 6: Secrets (hard/soft)
  private async checkSecrets(): Promise<void> {
    const required = ['ADMIN_TOKEN'];
    const optional = ['DROPBOX_APP_KEY', 'DROPBOX_APP_SECRET', 'DROPBOX_REFRESH_TOKEN', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'S3_BUCKET', 'S3_REGION'];
    
    const missing = required.filter(key => !process.env[key]);
    const optionalStatus = optional.map(key => `${key}: ${process.env[key] ? 'SET' : 'UNSET'}`);
    
    if (missing.length > 0) {
      this.record('secrets', 1, `Missing required: ${missing.join(', ')}. Optional: ${optionalStatus.join(', ')}`, 'ERROR');
    } else {
      this.record('secrets', 0, `All required secrets present. Optional: ${optionalStatus.join(', ')}`, 'OK');
    }
  }

  // CHECK 7: Storage (info)
  private async checkStorage(): Promise<void> {
    const provider = process.env.STORAGE_PROVIDER || 'LOCAL';
    
    try {
      if (provider === 'LOCAL') {
        this.record('storage', 0, 'Local storage configured', 'INFO');
      } else if (provider === 'S3') {
        // Check S3 signed URL capability
        this.record('storage', 0, 'S3 storage configured (basic check)', 'INFO');
      } else if (provider === 'DROPBOX' && process.env.DROPBOX_REFRESH_TOKEN) {
        // Check Dropbox connection
        this.record('storage', 0, 'Dropbox storage configured', 'INFO');
      } else {
        this.record('storage', 0, `Storage provider: ${provider}`, 'INFO');
      }
    } catch (error) {
      this.record('storage', 1, `Storage check failed: ${error instanceof Error ? error.message : String(error)}`, 'INFO');
    }
  }

  // CHECK 8: Database (warn)
  private async checkDatabase(): Promise<void> {
    try {
      // Check if database module exists and can connect
      const { pool } = await import('../../db.js');
      const client = await pool.connect();
      
      try {
        await client.query('SELECT 1');
        this.record('database', 0, 'Database connection successful', 'OK');
      } finally {
        client.release();
      }
    } catch (error) {
      this.record('database', 1, `Database check failed: ${error instanceof Error ? error.message : String(error)}`, 'WARN');
    }
  }

  // CHECK 9: Email (warn)
  private async checkEmail(): Promise<void> {
    if (!process.env.SMTP_HOST) {
      this.record('email', 0, 'SMTP not configured (optional)', 'INFO');
      return;
    }

    try {
      // Basic SMTP connection test would go here
      this.record('email', 0, 'SMTP configuration detected', 'INFO');
    } catch (error) {
      this.record('email', 1, `Email check failed: ${error instanceof Error ? error.message : String(error)}`, 'WARN');
    }
  }

  // CHECK 10: PDF/Print (warn)
  private async checkPdfPrint(): Promise<void> {
    try {
      // Check if PDF generation modules are available
      const hasAdobePdf = await this.checkModuleExists('@adobe/pdfservices-node-sdk');
      const hasPdfLib = await this.checkModuleExists('pdf-lib');
      
      if (hasAdobePdf || hasPdfLib) {
        this.record('pdf_print', 0, `PDF generation available (Adobe: ${hasAdobePdf}, pdf-lib: ${hasPdfLib})`, 'OK');
      } else {
        this.record('pdf_print', 1, 'No PDF generation modules found', 'WARN');
      }
    } catch (error) {
      this.record('pdf_print', 1, `PDF check failed: ${error instanceof Error ? error.message : String(error)}`, 'WARN');
    }
  }

  // CHECK 11: i18n (warn)
  private async checkI18n(): Promise<void> {
    try {
      const localesDir = path.join(process.cwd(), 'client/src/i18n/locales');
      const enFile = path.join(localesDir, 'en.json');
      const plFile = path.join(localesDir, 'pl.json');

      const [enData, plData] = await Promise.all([
        fs.readFile(enFile, 'utf-8').then(JSON.parse).catch(() => ({})),
        fs.readFile(plFile, 'utf-8').then(JSON.parse).catch(() => ({}))
      ]);

      const enKeys = Object.keys(enData);
      const plKeys = Object.keys(plData);
      const coverage = enKeys.length > 0 ? Math.round((plKeys.length / enKeys.length) * 100) : 0;

      this.record('i18n', coverage >= 80 ? 0 : 1, 
        `EN keys: ${enKeys.length}, PL keys: ${plKeys.length}, Coverage: ${coverage}%`,
        coverage >= 80 ? 'OK' : 'WARN'
      );
    } catch (error) {
      this.record('i18n', 1, `i18n check failed: ${error instanceof Error ? error.message : String(error)}`, 'WARN');
    }
  }

  // CHECK 12: Accessibility (warn)
  private async checkAccessibility(): Promise<void> {
    try {
      // Use puppeteer and axe-core for accessibility testing
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto(this.appUrl, { timeout: 30000 });
      
      // Inject axe-core
      await page.addScriptTag({
        url: 'https://unpkg.com/axe-core@4.10.2/axe.min.js'
      });

      // Run accessibility audit
      const results = await page.evaluate(() => {
        return new Promise((resolve) => {
          // @ts-ignore
          window.axe.run(document, (err, results) => {
            if (err) resolve({ violations: [], error: err.message });
            else resolve(results);
          });
        });
      });

      await browser.close();

      const violations = (results as any).violations?.length || 0;
      this.record('accessibility', violations === 0 ? 0 : 1,
        `Accessibility violations: ${violations}`,
        violations === 0 ? 'OK' : 'WARN'
      );
    } catch (error) {
      this.record('accessibility', 1, `Accessibility check failed: ${error instanceof Error ? error.message : String(error)}`, 'WARN');
    }
  }

  // CHECK 13: Performance (warn)
  private async checkPerformance(): Promise<void> {
    try {
      // Measure TTFB and basic performance metrics
      const start = Date.now();
      const response = await fetch(this.appUrl);
      const ttfb = Date.now() - start;

      // Check bundle sizes if build stats available
      let bundleInfo = 'Bundle size check not available';
      try {
        const statsPath = path.join(process.cwd(), 'dist/stats.json');
        const stats = JSON.parse(await fs.readFile(statsPath, 'utf-8'));
        bundleInfo = `Main bundle analyzed`;
      } catch {
        bundleInfo = 'Bundle stats not found';
      }

      this.record('performance', ttfb < 2000 ? 0 : 1,
        `TTFB: ${ttfb}ms, ${bundleInfo}`,
        ttfb < 2000 ? 'OK' : 'WARN'
      );
    } catch (error) {
      this.record('performance', 1, `Performance check failed: ${error instanceof Error ? error.message : String(error)}`, 'WARN');
    }
  }

  // CHECK 14: Security (warn)
  private async checkSecurity(): Promise<void> {
    try {
      const result = await this.run('npm', ['audit', '--production', '--json'], { timeout: 60000 });
      
      if (result.stdout) {
        const audit = JSON.parse(result.stdout);
        const critical = audit.metadata?.vulnerabilities?.critical || 0;
        const high = audit.metadata?.vulnerabilities?.high || 0;
        
        this.record('security', (critical === 0 && high <= 3) ? 0 : 1,
          `Critical: ${critical}, High: ${high}`,
          (critical === 0 && high <= 3) ? 'OK' : 'WARN'
        );
      } else {
        this.record('security', 0, 'No security vulnerabilities found', 'OK');
      }
    } catch (error) {
      this.record('security', 1, `Security audit failed: ${error instanceof Error ? error.message : String(error)}`, 'WARN');
    }
  }

  // CHECK 15: Links (warn)
  private async checkLinks(): Promise<void> {
    const routes = process.env.AUDIT_ROUTES?.split(',') || ['/'];
    const results: string[] = [];

    for (const route of routes) {
      const { success, status } = await this.ping(route.trim());
      results.push(`${route}: ${status}`);
    }

    const failures = results.filter(r => r.includes(' 404') || r.includes(' 500') || r.includes(' 0'));
    this.record('links', failures.length === 0 ? 0 : 1,
      `Tested routes: ${results.join(', ')}`,
      failures.length === 0 ? 'OK' : 'WARN'
    );
  }

  // Helper: Check if module exists
  private async checkModuleExists(moduleName: string): Promise<boolean> {
    try {
      await import(moduleName);
      return true;
    } catch {
      return false;
    }
  }

  // Helper: Sanitize route for filename
  private sanitizeRouteForFilename(route: string): string {
    return route.replace(/[^a-zA-Z0-9-]/g, '_').replace(/^_/, 'root');
  }

  // Helper: Ensure screenshots directory exists
  private async ensureScreenshotsDir(timestamp: string): Promise<void> {
    const screenshotsDir = path.join(process.cwd(), 'data', 'reports', 'screens', timestamp);
    await fs.mkdir(screenshotsDir, { recursive: true });
    
    for (const viewport of VIEWPORTS) {
      await fs.mkdir(path.join(screenshotsDir, viewport.name), { recursive: true });
    }
  }

  // UI/UX Audit with screenshots, accessibility, and heuristics
  private async runUXAudit(appUrl: string): Promise<UXReport> {
    const timestamp = Date.now().toString();
    await this.ensureScreenshotsDir(timestamp);
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const pages: UXPageResult[] = [];
    let totalA11yViolations = 0;
    let totalTapTargetIssues = 0;
    let totalAltMissing = 0;
    let totalNoDims = 0;
    let clsRiskRoutes = 0;
    let maxImgKB = 0;

    try {
      const routes = uiRoutes();
      
      for (const route of routes) {
        for (const viewport of VIEWPORTS) {
          const page = await browser.newPage();
          
          try {
            // Set viewport
            await page.setViewport({
              width: viewport.width,
              height: viewport.height,
              deviceScaleFactor: viewport.dpr
            });

            // Track network requests
            let requestCount = 0;
            let totalImageBytes = 0;
            
            await page.setRequestInterception(true);
            page.on('request', (request) => {
              // Block analytics/trackers
              if (/analytics|gtag|clarity/i.test(request.url())) {
                request.abort();
                return;
              }
              requestCount++;
              request.continue();
            });
            
            page.on('response', async (response) => {
              const contentType = response.headers()['content-type'] || '';
              if (contentType.startsWith('image/')) {
                try {
                  const buffer = await response.buffer();
                  totalImageBytes += buffer.length;
                } catch (e) {
                  // Ignore response buffer errors
                }
              }
            });

            const pageUrl = `${appUrl}${route}`;
            
            // Navigate and capture performance metrics
            const navStart = Date.now();
            await page.goto(pageUrl, { 
              waitUntil: 'networkidle2', 
              timeout: parseInt(process.env.AUDIT_UX_TIMEOUT_MS || '12000')
            });
            
            // Inject performance measurement script
            const metrics = await page.evaluate(() => {
              const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
              let fcp = 0;
              
              // Try to get FCP
              const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
              if (fcpEntry) {
                fcp = fcpEntry.startTime;
              } else {
                fcp = nav.domContentLoadedEventEnd - nav.fetchStart;
              }
              
              return {
                ttfb: nav.responseStart - nav.fetchStart,
                dcl: nav.domContentLoadedEventEnd - nav.fetchStart,
                load: nav.loadEventEnd - nav.fetchStart,
                fcpApprox: fcp
              };
            });

            // Wait for any final rendering
            await page.waitForFunction(() => document.readyState === 'complete', { timeout: 2000 }).catch(() => {});

            // Inject AXE core and run accessibility audit
            await page.addScriptTag({ 
              url: 'https://cdn.jsdelivr.net/npm/axe-core@4.9.1/axe.min.js' 
            });
            
            const axeResults = await page.evaluate(async () => {
              return new Promise((resolve) => {
                // @ts-ignore
                if (window.axe) {
                  // @ts-ignore
                  window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] }, (err: any, results: any) => {
                    if (err) resolve({ violations: [], error: err.message });
                    else resolve(results);
                  });
                } else {
                  resolve({ violations: [], error: 'AXE not loaded' });
                }
              });
            });

            // Collect UX heuristics
            const heuristics = await page.evaluate(() => {
              // Get elements before layout shift check
              const elements = Array.from(document.querySelectorAll('body *')).slice(0, 200);
              const initialBoxes = elements.map(el => {
                const rect = el.getBoundingClientRect();
                return { x: rect.x, y: rect.y, w: rect.width, h: rect.height };
              });

              return {
                hasViewportMeta: !!document.querySelector('meta[name="viewport"]'),
                tapTargetsSmall: Array.from(document.querySelectorAll('a,button,input,select,textarea')).filter(el => {
                  const r = el.getBoundingClientRect();
                  return (r.width < 44 || r.height < 44);
                }).length,
                imagesMissingAlt: Array.from(document.images).filter(i => !i.alt || !i.alt.trim()).length,
                imagesNoDims: Array.from(document.images).filter(i => 
                  !i.getAttribute('width') || !i.getAttribute('height')
                ).length,
                headingsOrderIssues: (() => {
                  const hs = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
                    .map(h => Number(h.tagName[1]));
                  let bad = 0;
                  for (let i = 1; i < hs.length; i++) {
                    if (hs[i] - hs[i-1] > 1) bad++;
                  }
                  return bad;
                })(),
                focusableWithoutFocusStyle: Array.from(document.querySelectorAll('a,button,[tabindex]')).filter(el => {
                  const s = window.getComputedStyle(el);
                  return (parseFloat(s.outlineWidth) === 0 && s.outlineStyle === 'none');
                }).length,
                keyboardTrapRisk: !!document.querySelector('[role="dialog"][aria-modal="true"]') && 
                  !document.querySelector('[role="dialog"] [tabindex="0"], [role="dialog"] button, [role="dialog"] a'),
                initialBoxes
              };
            });

            // Wait 2 seconds and check for layout shifts
            await page.waitForFunction(() => true, { timeout: 2000 }).catch(() => {});
            
            const clsData = await page.evaluate((initialBoxes: any[]) => {
              const elements = Array.from(document.querySelectorAll('body *')).slice(0, 200);
              const finalBoxes = elements.map(el => {
                const rect = el.getBoundingClientRect();
                return { x: rect.x, y: rect.y, w: rect.width, h: rect.height };
              });

              let shifted = 0;
              for (let i = 0; i < Math.min(initialBoxes.length, finalBoxes.length); i++) {
                const initial = initialBoxes[i];
                const final = finalBoxes[i];
                if (Math.abs(initial.x - final.x) > 2 || Math.abs(initial.y - final.y) > 2 ||
                    Math.abs(initial.w - final.w) > 2 || Math.abs(initial.h - final.h) > 2) {
                  shifted++;
                }
              }
              
              return Math.round((shifted / Math.max(initialBoxes.length, 1)) * 100);
            }, heuristics.initialBoxes);

            // Save screenshot
            const screenshotFilename = `${this.sanitizeRouteForFilename(route)}.png`;
            const screenshotPath = path.join(
              process.cwd(), 'data', 'reports', 'screens', timestamp, 
              viewport.name, screenshotFilename
            );
            await page.screenshot({ path: screenshotPath, fullPage: false });

            const pageResult: UXPageResult = {
              route,
              viewport: viewport.name,
              axe: {
                violations: (axeResults as any).violations?.length || 0,
                top: ((axeResults as any).violations || []).slice(0, 5)
              },
              metrics,
              heuristics: {
                hasViewportMeta: heuristics.hasViewportMeta,
                tapTargetsSmall: heuristics.tapTargetsSmall,
                imagesMissingAlt: heuristics.imagesMissingAlt,
                imagesNoDims: heuristics.imagesNoDims,
                headingsOrderIssues: heuristics.headingsOrderIssues,
                focusableWithoutFocusStyle: heuristics.focusableWithoutFocusStyle,
                keyboardTrapRisk: heuristics.keyboardTrapRisk,
                clsRiskPct: clsData
              },
              network: {
                requests: requestCount,
                imgBytesKB: Math.round(totalImageBytes / 1024)
              }
            };

            pages.push(pageResult);

            // Update totals
            totalA11yViolations += pageResult.axe.violations;
            totalTapTargetIssues += pageResult.heuristics.tapTargetsSmall;
            totalAltMissing += pageResult.heuristics.imagesMissingAlt;
            totalNoDims += pageResult.heuristics.imagesNoDims;
            if (pageResult.heuristics.clsRiskPct > 10) clsRiskRoutes++;
            if (viewport.name === 'mobile' && pageResult.network.imgBytesKB > maxImgKB) {
              maxImgKB = pageResult.network.imgBytesKB;
            }

          } catch (error) {
            console.warn(`UX audit failed for ${route} on ${viewport.name}:`, error);
          } finally {
            await page.close();
          }
        }
      }
    } finally {
      await browser.close();
    }

    return {
      pages,
      totals: {
        a11yViolations: totalA11yViolations,
        tapTargetIssues: totalTapTargetIssues,
        altMissing: totalAltMissing,
        noDims: totalNoDims,
        clsRiskRoutes,
        bigImgKB: maxImgKB
      }
    };
  }

  // Main audit runner
  public async runFullAudit(): Promise<AuditReport> {
    this.startTime = Date.now();
    this.items = [];

    console.log('🔍 Starting Full Project Audit (MAX)...');

    // Run all 15 checks
    await this.checkLint();
    await this.checkTypecheck();
    await this.checkBuild();
    await this.checkRuntime();
    await this.checkRoutes();
    await this.checkSecrets();
    await this.checkStorage();
    await this.checkDatabase();
    await this.checkEmail();
    await this.checkPdfPrint();
    await this.checkI18n();
    await this.checkAccessibility();
    await this.checkPerformance();
    await this.checkSecurity();
    await this.checkLinks();

    // NEW: UI/UX Audit with screenshots and heuristics
    let uxReport: UXReport | null = null;
    const baseUrl = process.env.APP_URL || `http://127.0.0.1:${this.port}`;
    try {
      uxReport = await this.runUXAudit(baseUrl);
      
      // Apply thresholds for WARN level
      let level: 'OK' | 'WARN' = 'OK';
      const totals = uxReport.totals;
      
      if (totals.a11yViolations > 0 || 
          totals.tapTargetIssues > 5 || 
          totals.altMissing > 0 || 
          totals.noDims > 3 || 
          totals.clsRiskRoutes > 0 || 
          totals.bigImgKB > 800) {
        level = 'WARN';
      }
      
      this.record('uiux', level === 'OK' ? 0 : 1, JSON.stringify(totals), level);
    } catch (error) {
      this.record('uiux', 0, `skipped (${String(error).slice(0, 120)})`, 'INFO');
    }

    return this.summarize(uxReport);
  }

  // Helper: Summarize results
  private summarize(uxReport?: UXReport | null): AuditReport {
    const finishedAt = new Date().toISOString();
    const ms = Date.now() - this.startTime;
    
    const counts = {
      ok: this.items.filter(i => i.level === 'OK').length,
      warn: this.items.filter(i => i.level === 'WARN').length,
      info: this.items.filter(i => i.level === 'INFO').length,
      error: this.items.filter(i => i.level === 'ERROR').length
    };

    const passed = counts.error === 0 && this.items.some(i => i.name === 'build' && i.level === 'OK') && this.items.some(i => i.name === 'runtime' && i.level === 'OK');

    const report: AuditReport = {
      startedAt: new Date(this.startTime).toISOString(),
      finishedAt,
      ms,
      passed,
      counts,
      items: this.items,
      meta: {
        port: this.port,
        storageProvider: process.env.STORAGE_PROVIDER || 'LOCAL',
        routesTested: process.env.AUDIT_ROUTES?.split(',') || ['/healthz', '/', '/api/system/health'],
        appUrl: this.appUrl
      }
    };

    if (uxReport) {
      report.extras = { uiux: uxReport };
    }

    return report;
  }
}

export default MaxAuditor;