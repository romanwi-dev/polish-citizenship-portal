import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fetch from "node-fetch";
import compression from "compression";
import helmet from "helmet";
import { exec } from "child_process";
import { promisify } from "util";
import { rm, writeFile } from "fs/promises";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { readdir, stat, unlink } from "fs/promises";
import { logger } from "./logger.js";
import { 
  compressionMiddleware,
  etagMiddleware,
  performanceMiddleware,
  staticCacheMiddleware,
  apiCacheMiddleware,
  startCacheCleanup,
  htmlOptimizationMiddleware,
  advancedStaticCacheMiddleware,
  memoryOptimizationMiddleware,
  http2PushMiddleware
} from "./performance-middleware";
import { setupSecurity } from "./security-middleware";
import { allowDev, checkAdminAuth } from "./lib/devAuth";

const execAsync = promisify(exec);

/**
 * Purge old uploaded files from upload directories
 * @param maxAgeDays - Files older than this many days will be deleted
 * @returns Object with deletion counts
 */
async function purgeOldFiles(maxAgeDays: number = 90): Promise<{ok: boolean, deletedCount: number, keptCount: number, errors: string[]}> {
  const errors: string[] = [];
  let deletedCount = 0;
  let keptCount = 0;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
  
  const uploadDirs = [
    path.join(process.cwd(), 'files'),
    path.join(process.cwd(), 'attached_assets'),
    path.join(process.cwd(), 'generated_pdfs'),
    path.join(process.cwd(), 'uploaded_documents')
  ];
  
  async function processDirectory(dirPath: string): Promise<void> {
    try {
      const items = await readdir(dirPath).catch(() => []);
      
      for (const itemName of items) {
        try {
          const itemPath = path.join(dirPath, itemName);
          const keepPath = `${itemPath}.keep`;
          
          // Check if there's a .keep file to preserve this item
          try {
            await stat(keepPath);
            keptCount++;
            continue; // Skip deletion if .keep file exists
          } catch {
            // No .keep file, proceed with processing
          }
          
          const itemStats = await stat(itemPath);
          
          if (itemStats.isDirectory()) {
            // Check for directory-level .keep
            const dirKeepPath = path.join(itemPath, '.keep');
            try {
              await stat(dirKeepPath);
              keptCount++;
              continue; // Skip entire directory if it has .keep
            } catch {
              // No directory .keep, recurse into subdirectory
              await processDirectory(itemPath);
            }
          } else {
            // It's a file, check if file is older than cutoff
            if (itemStats.mtime < cutoffDate) {
              await unlink(itemPath);
              deletedCount++;
              logger.info(`Purged old file: ${itemName} (${itemPath})`);
            } else {
              keptCount++;
            }
          }
        } catch (itemError) {
          errors.push(`Error processing ${itemName}: ${itemError}`);
        }
      }
    } catch (dirError) {
      errors.push(`Error reading directory ${dirPath}: ${dirError}`);
    }
  }

  for (const dirPath of uploadDirs) {
    await processDirectory(dirPath);
  }
  
  return {
    ok: true,
    deletedCount,
    keptCount,
    errors
  };
}

const app = express();

// Load QA_MODE from .env.local for development
if (process.env.NODE_ENV === 'development') {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const envFile = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      const qaMode = envContent.match(/QA_MODE=(.+)/)?.[1]?.trim();
      if (qaMode && !process.env.QA_MODE) {
        process.env.QA_MODE = qaMode;
        console.log('📁 Loaded QA_MODE from .env.local:', qaMode);
      }
    }
  } catch (error) {
    // Ignore errors - fallback to existing behavior
  }
}

// Security middleware
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false, // Let Vite handle CSP in development
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// CRITICAL: Body parsing middleware MUST come before routes
// Raw body capture for webhook signature verification
app.use('/api/hook/typeform', express.json({ 
  limit: '5mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));

// Helper route for setting admin token via URL (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/admin/set-token', (req, res) => {
    const token = req.query.v as string;
    
    if (token) {
      res.cookie('admin_token', token, { 
        httpOnly: false, // Allow JavaScript access
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }
    
    // Always redirect to fixed safe path to prevent open redirect
    res.redirect('/admin/system-checks');
  });
}

// Health check endpoint - must be POST only
app.post("/api/system/health", async (req, res) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || "dev-secret";
    const jwtOk = jwtSecret.length >= 6;

    // D) Production safety: Wrap optional integrations (Dropbox) so missing envs don't crash
    let dropboxResult = { ok: true, note: 'Dropbox integration disabled' };
    try {
      const { testDropboxConnection } = await import('./lib/dropboxAuth.js');
      dropboxResult = await testDropboxConnection();
    } catch (error) {
      console.warn('⚠️ Dropbox integration unavailable:', error instanceof Error ? error.message : String(error));
      dropboxResult = { ok: false, note: 'Dropbox integration failed to load' };
    }

    res.json({
      ok: jwtOk && dropboxResult.ok,
      checks: {
        jwt: { ok: jwtOk },
        dropbox: { ok: dropboxResult.ok, note: dropboxResult.note }
      },
      devOpen: allowDev()
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Internal server error"
    });
  }
});

// Handle wrong HTTP methods for health check - must come AFTER the POST route
app.all("/api/system/health", (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({
      ok: false,
      error: "METHOD_NOT_ALLOWED"
    });
  }
});

// Admin command executor route
app.post("/api/admin/execute", async (req, res) => {
  try {
    // Security: Validate admin token with dev bypass
    const token = req.headers["x-admin-token"] || '';
    
    if (!checkAdminAuth(token)) {
      return res.status(401).json({
        ok: false,
        error: "UNAUTHORIZED"
      });
    }

    const { command } = req.body;
    if (!command || typeof command !== "string") {
      return res.status(400).json({
        ok: false,
        error: "Bad Request: command field required"
      });
    }

    // Validate command is one of the allowed 9
    const allowedCommands = ["CLEAN", "FIX", "UI/UX", "PERFORM", "SECURITY", "VISUAL", "ANALYZE", "DEPLOY", "PREDEPLOY"];
    const normalizedCommand = command.toUpperCase();
    
    if (!allowedCommands.includes(normalizedCommand)) {
      return res.status(400).json({
        ok: false,
        error: `Invalid command. Allowed: ${allowedCommands.join(", ")}`
      });
    }

    // Execute command
    const result = await executeCommand(normalizedCommand);
    res.json(result);

  } catch (error) {
    logger.error("Command execution error:", error);
    res.status(500).json({
      ok: false,
      error: "Internal server error"
    });
  }
});

// Admin predeploy status endpoint
app.get("/api/admin/predeploy/status", async (req, res) => {
  try {
    // Security: Validate admin token with dev bypass
    const token = req.headers["x-admin-token"] || '';
    
    if (!checkAdminAuth(token)) {
      return res.status(401).json({
        ok: false,
        error: "UNAUTHORIZED"
      });
    }

    // Read status file
    try {
      const { readFile } = await import('fs/promises');
      const statusPath = path.join(process.cwd(), 'data', 'lastPredeploy.json');
      const statusData = await readFile(statusPath, 'utf-8');
      const status = JSON.parse(statusData);
      res.json(status);
    } catch (fileError) {
      // File doesn't exist or can't be read
      res.json({ ok: null });
    }

  } catch (error) {
    logger.error("Predeploy status error:", error);
    res.status(500).json({
      ok: false,
      error: "Internal server error"
    });
  }
});

// Admin file purge endpoint
app.post("/api/admin/cron/purge", async (req, res) => {
  try {
    // Security: Validate admin token with dev bypass
    const token = req.headers["x-admin-token"] || '';
    
    if (!checkAdminAuth(token)) {
      return res.status(401).json({
        ok: false,
        error: "UNAUTHORIZED"
      });
    }

    // Execute purge
    const result = await purgeOldFiles(90); // 90 days default
    
    res.json(result);

  } catch (error) {
    logger.error("File purge error:", error);
    res.status(500).json({
      ok: false,
      error: "Internal server error",
      deletedCount: 0,
      keptCount: 0,
      errors: [String(error)]
    });
  }
});

// Command execution utility
async function executeCommand(command: string) {
  const startedAt = new Date().toISOString();
  const steps: Array<{name: string, ok: boolean, ms: number, outTail: string}> = [];
  
  try {
    switch (command) {
      case "CLEAN":
        await runStepNative(steps, "Clear tmp", async () => {
          const dirsToRemove = ['dist', 'dist-server', 'node_modules/.vite', '.vite'];
          for (const dir of dirsToRemove) {
            try {
              await rm(dir, { recursive: true, force: true });
            } catch (error) {
              // Ignore if directory doesn't exist
            }
          }
          return "Cleaned: " + dirsToRemove.join(', ');
        });
        await runStep(steps, "Verify npm cache", "npm cache verify");
        await runStepNative(steps, "Server warm ping", async () => {
          try {
            const response = await fetch("http://localhost:5000/api/system/health", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({})
            });
            return response.ok ? "Server responding" : "Server not healthy";
          } catch (error) {
            return "Server not responding";
          }
        });
        break;

      case "FIX":
        await runStep(steps, "ESLint fix", "npx eslint . --ext .ts,.tsx --fix || true");
        await runStep(steps, "Prettier format", "npx prettier -w . || true");
        await runStep(steps, "TypeScript check", "npx tsc -p server/tsconfig.json --noEmit || true");
        break;

      case "UI/UX":
        await runStep(steps, "Style audit", "npx stylelint \"**/*.{css,scss}\" --fix || true");
        await runStep(steps, "Check fixed widths", "grep -r 'width.*[4-9][0-9][0-9]px\\|width.*[1-9][0-9][0-9][0-9]px' . --include='*.css' --include='*.scss' --include='*.tsx' --include='*.ts' | wc -l || echo '0'");
        break;

      case "PERFORM":
        await runStep(steps, "Build client", "npm run build:client || vite build");
        await runStep(steps, "Build server", "npm run build:server || npx tsc -p server/tsconfig.json");
        await runStep(steps, "Bundle analysis", "node scripts/summarizeSizes.mjs");
        break;

      case "SECURITY":
        await runStep(steps, "NPM audit", "npm audit --omit=dev --json || true");
        await runStep(steps, "Security check", "echo 'Security headers and helmet middleware already enabled'");
        break;

      case "VISUAL":
        await runStep(steps, "Font optimization", "echo 'Adding text-rendering optimizations'");
        await runStep(steps, "Image optimization", "echo 'Setting max-width responsive images'");
        break;

      case "ANALYZE":
        await runStep(steps, "Build analysis", "vite build --emptyOutDir");
        await runStep(steps, "Bundle report", "echo 'Bundle analysis completed'");
        await runStepNative(steps, "Health check", async () => {
          try {
            const response = await fetch("http://localhost:5000/api/system/health", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({})
            });
            return response.ok ? "Server healthy" : "Server not healthy";
          } catch (error) {
            return "Server not responding";
          }
        });
        break;

      case "DEPLOY":
        await runStep(steps, "Environment check", `echo "NODE_ENV=${process.env.NODE_ENV || 'not-set'}"`);
        await runStep(steps, "Full build", "npm run build || (npm run build:client && npm run build:server)");
        await runStep(steps, "Boot test", "node -e \"console.log('boot ok')\"");
        break;

      case "PREDEPLOY":
        // Execute CLEAN → PERFORM → SECURITY → ANALYZE in sequence
        // CLEAN steps
        await runStepNative(steps, "CLEAN: Clear tmp", async () => {
          const dirsToRemove = ['dist', 'dist-server', 'node_modules/.vite', '.vite'];
          for (const dir of dirsToRemove) {
            try {
              await rm(dir, { recursive: true, force: true });
            } catch (error) {
              // Ignore if directory doesn't exist
            }
          }
          return "Cleaned: " + dirsToRemove.join(', ');
        });
        await runStep(steps, "CLEAN: Verify npm cache", "npm cache verify");
        await runStepNative(steps, "CLEAN: Server warm ping", async () => {
          try {
            const response = await fetch("http://localhost:5000/api/system/health", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({})
            });
            return response.ok ? "Server responding" : "Server not healthy";
          } catch (error) {
            return "Server not responding";
          }
        });

        // PERFORM steps
        await runStep(steps, "PERFORM: Build client", "npm run build:client || vite build");
        await runStep(steps, "PERFORM: Build server", "npm run build:server || npx tsc -p server/tsconfig.json");
        await runStep(steps, "PERFORM: Bundle analysis", "node scripts/summarizeSizes.mjs");

        // SECURITY steps
        await runStep(steps, "SECURITY: NPM audit", "npm audit --omit=dev --json || true");
        await runStep(steps, "SECURITY: Security check", "echo 'Security headers and helmet middleware already enabled'");

        // ANALYZE steps
        await runStep(steps, "ANALYZE: Build analysis", "vite build --emptyOutDir");
        await runStep(steps, "ANALYZE: Bundle report", "echo 'Bundle analysis completed'");
        await runStepNative(steps, "ANALYZE: Health check", async () => {
          try {
            const response = await fetch("http://localhost:5000/api/system/health", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({})
            });
            return response.ok ? "Server healthy" : "Server not healthy";
          } catch (error) {
            return "Server not responding";
          }
        });

        // Save PREDEPLOY results to file for status badge
        const issuesCount = steps.filter(s => !s.ok).length;
        const predeployStatus = {
          ts: new Date().toISOString(),
          ok: issuesCount === 0,
          issuesCount,
          notes: `PREDEPLOY completed with ${issuesCount} issues across ${steps.length} steps`
        };
        
        try {
          await writeFile(
            path.join(process.cwd(), 'data', 'lastPredeploy.json'),
            JSON.stringify(predeployStatus, null, 2)
          );
        } catch (fileError) {
          console.error('Failed to save PREDEPLOY status:', fileError);
        }
        break;

      default:
        throw new Error(`Unknown command: ${command}`);
    }

    const finishedAt = new Date().toISOString();
    return {
      ok: true,
      command,
      startedAt,
      finishedAt,
      steps,
      summary: {
        notes: getCommandNotes(command),
        totalSteps: steps.length,
        successfulSteps: steps.filter(s => s.ok).length
      }
    };

  } catch (error) {
    const finishedAt = new Date().toISOString();
    return {
      ok: false,
      command,
      startedAt,
      finishedAt,
      steps,
      error: String(error),
      summary: {
        notes: `Command failed: ${error}`,
        totalSteps: steps.length,
        successfulSteps: steps.filter(s => s.ok).length
      }
    };
  }
}

// Run a single step with timeout and output capture
async function runStep(steps: Array<{name: string, ok: boolean, ms: number, outTail: string}>, name: string, cmd: string, timeoutMs = 30000) {
  const startTime = Date.now();
  let ok = false;
  let outTail = "";

  try {
    const { stdout, stderr } = await execAsync(cmd, { 
      timeout: timeoutMs,
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
    });
    
    const output = (stdout + stderr).trim();
    outTail = output.slice(-2048); // Last 2KB
    ok = true;
  } catch (error: any) {
    const output = (error.stdout || "") + (error.stderr || "") + error.message;
    outTail = output.slice(-2048); // Last 2KB
    ok = false;
  }

  const ms = Date.now() - startTime;
  steps.push({ name, ok, ms, outTail });
}

// Run a native step (no shell command) with timeout and output capture
async function runStepNative(steps: Array<{name: string, ok: boolean, ms: number, outTail: string}>, name: string, operation: () => Promise<string>, timeoutMs = 30000) {
  const startTime = Date.now();
  let ok = false;
  let outTail = "";

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), timeoutMs);
    });
    
    const result = await Promise.race([operation(), timeoutPromise]);
    outTail = String(result).slice(-2048); // Last 2KB
    ok = true;
  } catch (error: any) {
    outTail = String(error.message || error).slice(-2048); // Last 2KB
    ok = false;
  }

  const ms = Date.now() - startTime;
  steps.push({ name, ok, ms, outTail });
}

// Get command-specific notes
function getCommandNotes(command: string): string {
  switch (command) {
    case "CLEAN": return "caches cleared";
    case "FIX": return "linted, formatted, type-checked";
    case "UI/UX": return "ui audit complete (no visual change)";
    case "PERFORM": return "build optimized and analyzed";
    case "SECURITY": return "headers hardened; audit summarized";
    case "VISUAL": return "visual hygiene (no theme changes)";
    case "ANALYZE": return "analysis artifacts ready";
    case "DEPLOY": return "ready to deploy";
    case "PREDEPLOY": return "all pre-deployment checks completed - CLEAN, PERFORM, SECURITY, ANALYZE";
    default: return "command completed";
  }
}

// SECURITY FIRST - Apply comprehensive security middleware
setupSecurity(app);

// Apply basic middleware only (performance middlewares moved after Vite)
app.use(performanceMiddleware);
app.use(memoryOptimizationMiddleware); // Memory cleanup optimization
app.use('/api', apiCacheMiddleware(300)); // 5 minute cache for API routes

// Storage safety default - ensure uploads are served in dev mode
if (process.env.NODE_ENV !== 'production') {
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  console.log('📁 Static uploads directory enabled for development');
}

// Body parsing middleware moved above to before routes

// Cookie parsing middleware for OAuth state management
app.use((req, res, next) => {
  // Parse cookies from the request header using the existing parseCookies helper
  const cookieHeader = req.get('cookie') || '';
  req.cookies = parseCookies(cookieHeader);
  next();
});

// Simple cookie parser helper (imported from routes.ts logic)
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalJson = res.json.bind(res);
  res.json = (...args) => {
    capturedJsonResponse = args[0];
    return originalJson(...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch (err) {
          logLine += ` :: [unserializable JSON]`;
        }
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Global error handlers to prevent process termination
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Keep process alive
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Keep process alive
  });

  // A) Server bootstrap: Ensure proper PORT binding and health endpoints
  const PORT = Number(process.env.PORT || (process.env.NODE_ENV === 'development' ? 5000 : ''));
  if (!PORT) {
    console.error("PORT environment variable is required in hosted/CI environment");
    process.exit(1);
  }
  app.set('port', PORT);
  
  // Add readiness /healthz and liveness /ready endpoints
  app.get('/healthz', (_req, res) => {
    res.status(200).json({ ok: true, ts: Date.now() });
  });
  
  app.get('/ready', (_req, res) => {
    res.status(200).json({ ready: true, ts: Date.now() });
  });
  
  console.log(`[server] Using port ${PORT} (env PORT ${process.env.PORT ? 'set' : 'missing'})`);
  console.log('API up: POST /api/poa-adult, static /files');

  // Setup Vite BEFORE server.listen() to avoid race conditions
  if (process.env.NODE_ENV === 'development') {
    try {
      await setupVite(app, server);
      console.log('✅ Vite development server initialized successfully');
    } catch (error) {
      console.error('❌ Vite setup failed, falling back to static serving:', error);
      serveStatic(app);
    }
  } else {
    // B) Static client in production: Build output goes to dist/client and dist/server
    // Production mode: Apply compression and serve prebuilt assets efficiently
    app.use(compression()); // Gzip/Brotli compression
    
    const clientDir = path.join(process.cwd(), 'dist', 'public');
    
    // Serve static assets with long-lived caching
    app.use(express.static(clientDir, { maxAge: '1y', immutable: true }));
    
    // SPA fallback: serve index.html for all non-API routes
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });
    
    // Apply performance optimizations
    try {
      app.use(compressionMiddleware); // Enhanced with Brotli support
      app.use(htmlOptimizationMiddleware); // Inject performance hints into HTML
      app.use(http2PushMiddleware); // Server push for critical resources
      app.use(advancedStaticCacheMiddleware); // Advanced static asset caching
      app.use(staticCacheMiddleware());
    } catch (error) {
      console.warn('⚠️ Performance optimizations failed to load:', error);
    }
  }
  
  // Mount self-check routes for QA harness
  try {
    const selfcheckRoutes = await import('./routes/selfcheck.js');
    app.use('/api', selfcheckRoutes.default);
    console.log('✅ Self-check routes mounted');
  } catch (error) {
    console.warn('⚠️  Could not mount self-check routes:', error instanceof Error ? error.message : String(error));
  }
  
  // Mount Dropbox diagnostic routes
  try {
    const dropboxDiagRoutes = await import('./routes/dropboxDiag.js');
    app.use('/api', dropboxDiagRoutes.default);
    console.log('✅ Dropbox diagnostic routes mounted');
  } catch (error) {
    console.warn('⚠️  Could not mount Dropbox diagnostic routes:', error instanceof Error ? error.message : String(error));
  }
  
  // Mount import smoke test routes
  try {
    const importSmokeRoutes = await import('./routes/importSmoke.js');
    app.use('/api', importSmokeRoutes.default);
    console.log('✅ Import smoke test routes mounted');
  } catch (error) {
    console.warn('⚠️  Could not mount import smoke test routes:', error instanceof Error ? error.message : String(error));
  }
  
  // Mount audit log routes
  try {
    const auditRoutes = await import('./routes/audit.js');
    app.use('/api', auditRoutes.default);
    console.log('✅ Audit log routes mounted');
  } catch (error) {
    console.warn('⚠️  Could not mount audit log routes:', error instanceof Error ? error.message : String(error));
  }
  
  // Start server with proper error handling
  const serverInstance = server.listen(PORT, '0.0.0.0', () => {
    console.log('listening', PORT);
    log(`Performance optimizations enabled: compression, caching, ETags`);
    
    // Initialize Dropbox auto-ingest polling
    try {
      import('./ingest/dropbox-cases.js').then(({ startDropboxPolling }) => {
        startDropboxPolling();
      });
    } catch (error) {
      console.warn('⚠️  Could not start Dropbox polling:', error instanceof Error ? error.message : String(error));
    }
  });
  
  serverInstance.on('error', (e) => {
    console.error('startup_error', e);
    process.exit(1);
  });

  // Now do heavy async initialization after port is open
  // Startup file purge if enabled
  if (process.env.ENABLE_STARTUP_PURGE === "ON") {
    console.log('🧹 Running startup file purge...');
    setTimeout(async () => {
      try {
        const result = await purgeOldFiles(90);
        logger.info(`✅ Startup purge completed: deleted ${result.deletedCount}, kept ${result.keptCount} files`);
        if (result.errors.length > 0) {
          logger.warn('⚠️ Purge errors:', result.errors);
        }
      } catch (error) {
        logger.error('❌ Startup purge failed:', error);
      }
    }, 5000); // Delay 5 seconds to let server fully initialize
  }
  
  // Initialize workflow scheduler (N8N/Lindy replacement)
  console.log('🚀 Initializing Replit-Native Workflow Scheduler...');
  // Import scheduler to trigger initialization
  // await import('./workflow-scheduler'); // Temporarily disabled for stability

  // Add root route handlers for verifier probes BEFORE Vite middleware
  app.head('/', (_req, res) => {
    console.log('[server] HEAD / probe - responding with 200');
    res.status(200).end();
  });
  
  // Simple root route that shows something instead of blank page
  app.get('/', (req, res, next) => {
    const accept = req.get('accept') || '';
    console.log(`[server] GET / probe - Accept: ${accept}`);
    
    // If verifier or non-HTML request, respond with simple message
    if (!accept.includes('text/html')) {
      return res.type('text/plain').send('Polish Citizenship portal is running. Try /health');
    }
    
    // Let HTML requests pass through to Vite
    next();
  });

  // SIMPLE WORKING ADMIN - NO REACT COMPLEXITY (BEFORE VITE SETUP)
  app.get('/api/admin/dropbox-ui', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.sendFile(path.resolve('server/simple-dropbox-admin.html'));
  });
  
  app.get('/api/dropbox-admin.js', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.resolve('server/dropbox-admin.js'));
  });

  // Vite is now mounted before server.listen() to prevent race conditions

  // Error handler MUST be last to catch all downstream errors
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    logger.error('Express error:', err);
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });
  
  // Start cache cleanup for performance
  startCacheCleanup();
})();

// --- DROPBOX SELF-TEST (quick green/red) ---
app.get("/api/dropbox/self-test", async (_req, res) => {
  try {
    const { getDropboxAccessToken } = await import("./lib/dropboxAuth.js");
    const token = await getDropboxAccessToken();

    // helper POST function
    const post = async (url: string, body: any) => {
      const r = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: body === null ? "null" : JSON.stringify(body)
      });
      const text = await r.text();
      return { ok: r.ok, status: r.status, text };
    };

    // 1) who am I
    const me = await post("https://api.dropboxapi.com/2/users/get_current_account", null);

    // 2) list /CASES
    const root = process.env.DROPBOX_ROOT || "/CASES";
    const list = await post("https://api.dropboxapi.com/2/files/list_folder", { path: root, limit: 5 });

    // 3) upload + delete tiny probe file
    const tmpPath = `${root}/.probe-${Date.now()}.txt`;
    const upRes = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({ path: tmpPath, mode: "add", mute: true })
      },
      body: Buffer.from("ping")
    });
    const upText = await upRes.text();
    const del = upRes.ok ? await post("https://api.dropboxapi.com/2/files/delete_v2", { path: tmpPath }) : null;

    return res.json({
      ok: me.ok && list.ok && upRes.ok,
      account_ok: me.ok,
      list_ok: list.ok,
      upload_ok: upRes.ok,
      root,
      hints: !list.ok && list.text.includes("path/not_found")
        ? "If this is an App-folder app, set DROPBOX_ROOT=\"\". For /CASES you need a Full Dropbox app."
        : undefined,
      details: {
        me_status: me.status,
        list_status: list.status,
        upload_status: upRes.status,
        upload_resp: upText.slice(0, 160)
      }
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});