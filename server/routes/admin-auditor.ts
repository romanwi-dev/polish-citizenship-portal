// admin-auditor.ts - API routes for Full Project Auditor (MAX)
// Provides comprehensive end-to-end system auditing with report persistence

import { Router } from 'express';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import MaxAuditor from '../lib/audit/maxAudit.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve screenshot static files
router.use('/reports/screens', express.static(path.resolve('data', 'reports', 'screens')));

// Ensure reports directory exists
async function ensureReportsDirectory(): Promise<string> {
  const reportsDir = path.join(process.cwd(), 'data', 'reports');
  try {
    await fs.mkdir(reportsDir, { recursive: true });
    return reportsDir;
  } catch (error) {
    console.error('Failed to create reports directory:', error);
    throw new Error('Unable to create reports directory');
  }
}

// Generate HTML report from JSON data
function generateHtmlReport(report: any): string {
  const statusColor = report.passed ? '#10b981' : '#ef4444';
  const statusText = report.passed ? 'PASSED' : 'FAILED';
  
  const itemsHtml = report.items.map((item: any) => {
    const levelColors: Record<string, string> = {
      'OK': '#10b981',
      'WARN': '#f59e0b', 
      'INFO': '#3b82f6',
      'ERROR': '#ef4444'
    };
    
    const levelColor = levelColors[item.level] || '#6b7280';
    
    return `
      <div class="audit-item" style="margin-bottom: 16px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
          <span style="background: ${levelColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
            ${item.level}
          </span>
          <h4 style="margin: 0; font-size: 16px; font-weight: 600;">${item.name}</h4>
        </div>
        <pre style="background: #f3f4f6; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 14px; margin: 0;">${item.out}</pre>
      </div>
    `;
  }).join('');

  // Generate UX screenshots gallery if available
  let uxGalleryHtml = '';
  if (report.extras?.uiux) {
    const ux = report.extras.uiux;
    const screenshotsByRoute = ux.pages.reduce((acc: any, page: any) => {
      if (!acc[page.route]) acc[page.route] = [];
      acc[page.route].push(page);
      return acc;
    }, {});

    uxGalleryHtml = `
      <div class="ux-section" style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #1f2937;">🎨 UI/UX Analysis & Screenshots</h2>
        
        <div class="ux-summary" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px;">
          <div style="padding: 12px; background: #fef3c7; border-radius: 6px; text-align: center;">
            <div style="font-size: 18px; font-weight: bold; color: #92400e;">${ux.totals.a11yViolations}</div>
            <div style="font-size: 12px; color: #92400e;">A11y Violations</div>
          </div>
          <div style="padding: 12px; background: #fce7f3; border-radius: 6px; text-align: center;">
            <div style="font-size: 18px; font-weight: bold; color: #be185d;">${ux.totals.tapTargetIssues}</div>
            <div style="font-size: 12px; color: #be185d;">Small Tap Targets</div>
          </div>
          <div style="padding: 12px; background: #dbeafe; border-radius: 6px; text-align: center;">
            <div style="font-size: 18px; font-weight: bold; color: #1d4ed8;">${ux.totals.altMissing}</div>
            <div style="font-size: 12px; color: #1d4ed8;">Missing Alt Text</div>
          </div>
          <div style="padding: 12px; background: #d1fae5; border-radius: 6px; text-align: center;">
            <div style="font-size: 18px; font-weight: bold; color: #065f46;">${ux.totals.clsRiskRoutes}</div>
            <div style="font-size: 12px; color: #065f46;">CLS Risk Routes</div>
          </div>
        </div>

        ${Object.keys(screenshotsByRoute).map(route => `
          <div class="route-section" style="margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px;">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">Route: ${route}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
              ${screenshotsByRoute[route].map((page: any) => {
                const timestamp = path.basename(path.dirname(path.dirname(''))); // Extract timestamp from path
                return `
                  <div style="text-align: center;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px; text-transform: capitalize;">${page.viewport}</h4>
                    <img src="/admin/reports/screens/${timestamp}/${page.viewport}/${route.replace(/[^a-zA-Z0-9-]/g, '_').replace(/^_/, 'root')}.png" 
                         style="max-width: 100%; height: auto; border: 1px solid #d1d5db; border-radius: 4px;" 
                         alt="${route} - ${page.viewport}" />
                    <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">
                      A11y: ${page.axe.violations} | Tap Issues: ${page.heuristics.tapTargetsSmall} | CLS: ${page.heuristics.clsRiskPct}%
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Full Project Audit Report - ${new Date(report.finishedAt).toLocaleString()}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; padding: 20px; background: #ffffff; color: #111827; 
        }
        .header { 
            text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb; margin-bottom: 24px; 
        }
        .status { 
            font-size: 24px; font-weight: bold; color: ${statusColor}; 
        }
        .stats { 
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; 
        }
        .stat-card { 
            padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center; background: #f9fafb; 
        }
        .stat-value { 
            font-size: 32px; font-weight: bold; margin-bottom: 4px; 
        }
        .stat-label { 
            font-size: 14px; color: #6b7280; 
        }
        .meta { 
            background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px; 
        }
        .json-dump { 
            background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; 
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Full Project Audit Report (MAX)</h1>
        <div class="status">${statusText}</div>
        <p>Generated: ${new Date(report.finishedAt).toLocaleString()}</p>
        <p>Duration: ${report.ms}ms</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-value" style="color: #10b981;">${report.counts.ok}</div>
            <div class="stat-label">PASSED</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="color: #f59e0b;">${report.counts.warn}</div>
            <div class="stat-label">WARNINGS</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="color: #3b82f6;">${report.counts.info}</div>
            <div class="stat-label">INFO</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="color: #ef4444;">${report.counts.error}</div>
            <div class="stat-label">ERRORS</div>
        </div>
    </div>

    <div class="meta">
        <h3>📊 Audit Metadata</h3>
        <p><strong>Port:</strong> ${report.meta.port}</p>
        <p><strong>Storage Provider:</strong> ${report.meta.storageProvider}</p>
        <p><strong>App URL:</strong> ${report.meta.appUrl}</p>
        <p><strong>Routes Tested:</strong> ${report.meta.routesTested.join(', ')}</p>
    </div>

    <div>
        <h3>📋 Detailed Results</h3>
        ${itemsHtml}
    </div>

    ${uxGalleryHtml}

    <div>
        <h3>📄 Full JSON Report</h3>
        <pre class="json-dump">${JSON.stringify(report, null, 2)}</pre>
    </div>
</body>
</html>
  `;
}

// POST /api/admin/auditor/run - Run full project audit
router.post('/run', async (req, res) => {
  const startTime = Date.now();
  console.log(`🔍 Full Project Audit requested by admin: ${req.user?.email || 'unknown'}`);

  try {
    const auditor = new MaxAuditor();
    
    // Run the comprehensive audit
    const report = await auditor.runFullAudit();
    
    // Ensure reports directory exists
    const reportsDir = await ensureReportsDirectory();
    
    // Generate file names with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonPath = path.join(reportsDir, `audit-${timestamp}.json`);
    const htmlPath = path.join(reportsDir, `audit-${timestamp}.html`);
    
    // Generate HTML report
    const htmlContent = generateHtmlReport(report);
    
    // Save both JSON and HTML reports
    await Promise.all([
      fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf-8'),
      fs.writeFile(htmlPath, htmlContent, 'utf-8')
    ]);
    
    const relativePath = {
      json: path.relative(process.cwd(), jsonPath),
      html: path.relative(process.cwd(), htmlPath)
    };
    
    console.log(`✅ Full Project Audit completed in ${Date.now() - startTime}ms`);
    console.log(`📄 Reports saved: ${relativePath.json}, ${relativePath.html}`);
    
    res.json({
      ok: true,
      report,
      jsonPath: relativePath.json,
      htmlPath: relativePath.html,
      duration: Date.now() - startTime
    });
    
  } catch (error) {
    console.error('❌ Full Project Audit failed:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
      duration: Date.now() - startTime
    });
  }
});

// GET /api/admin/auditor/reports - List available audit reports
router.get('/reports', async (req, res) => {
  try {
    const reportsDir = path.join(process.cwd(), 'data', 'reports');
    
    try {
      const files = await fs.readdir(reportsDir);
      const auditFiles = files
        .filter(f => f.startsWith('audit-') && (f.endsWith('.json') || f.endsWith('.html')))
        .map(f => ({
          name: f,
          path: path.join('data', 'reports', f),
          type: f.endsWith('.json') ? 'json' : 'html',
          timestamp: f.match(/audit-(.+)\.(json|html)$/)?.[1]?.replace(/-/g, ':') || 'unknown'
        }))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      
      res.json({
        ok: true,
        reports: auditFiles,
        total: auditFiles.length
      });
    } catch (dirError) {
      res.json({
        ok: true,
        reports: [],
        total: 0,
        message: 'Reports directory not found'
      });
    }
  } catch (error) {
    console.error('Error listing audit reports:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// GET /api/admin/auditor/download/:filename - Download specific report
router.get('/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Security: Prevent path traversal
    if (filename.includes('..') || filename.includes('/') || !filename.startsWith('audit-')) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid filename'
      });
    }
    
    const filePath = path.join(process.cwd(), 'data', 'reports', filename);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const contentType = filename.endsWith('.json') ? 'application/json' : 'text/html';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
    } catch (fileError) {
      res.status(404).json({
        ok: false,
        error: 'Report not found'
      });
    }
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default function makeAuditorRoutes(adminGuard: any) {
  // Apply admin authentication to all routes
  router.use(adminGuard);
  return router;
}