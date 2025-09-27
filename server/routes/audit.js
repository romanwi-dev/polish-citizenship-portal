import express from 'express';
import { db } from '../db.ts';
import { sql } from 'drizzle-orm';
import { checkAdminAuth } from '../lib/devAuth.js';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

// Admin authentication middleware
const requireAdminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'] || '';
  if (!checkAdminAuth(token)) {
    return res.status(401).json({
      ok: false,
      error: 'UNAUTHORIZED: Admin access required'
    });
  }
  next();
};

// POST /api/cases/:id/audit - Log an audit action
router.post('/cases/:caseId/audit', requireAdminAuth, async (req, res) => {
  try {
    const { caseId } = req.params;
    const { timestamp, actor, action, details } = req.body;

    if (!caseId || !action) {
      return res.status(400).json({
        error: 'Case ID and action are required'
      });
    }

    // Create audit log entry
    const auditEntry = {
      timestamp: timestamp || new Date().toISOString(),
      actor: actor || 'system',
      action,
      details: details || {}
    };

    // Store in database (if audit_logs table exists) or file system
    try {
      // Try to store in database first
      await db.execute(sql`
        INSERT INTO audit_logs (case_id, timestamp, actor, action, details)
        VALUES (${caseId}, ${auditEntry.timestamp}, ${auditEntry.actor}, ${auditEntry.action}, ${JSON.stringify(auditEntry.details)})
      `);
    } catch (dbError) {
      // Fallback to file system storage
      console.warn('[AUDIT] Database unavailable, using file storage:', dbError.message);
      
      const auditDir = path.join(process.cwd(), 'audit_logs');
      await fs.mkdir(auditDir, { recursive: true });
      
      const auditFile = path.join(auditDir, `${caseId}.log.json`);
      
      // Read existing logs or create new array
      let logs = [];
      try {
        const existingContent = await fs.readFile(auditFile, 'utf8');
        logs = JSON.parse(existingContent);
      } catch (error) {
        // File doesn't exist or invalid JSON, start with empty array
      }
      
      // Append new entry
      logs.push(auditEntry);
      
      // Keep only last 1000 entries per case
      if (logs.length > 1000) {
        logs = logs.slice(-1000);
      }
      
      await fs.writeFile(auditFile, JSON.stringify(logs, null, 2));
    }

    res.json({ 
      success: true, 
      message: 'Audit entry logged successfully',
      entry: auditEntry
    });

  } catch (error) {
    console.error('[AUDIT] Error logging audit entry:', error);
    res.status(500).json({
      error: 'Failed to log audit entry',
      details: error.message
    });
  }
});

// GET /api/cases/:id/audit - Get audit log for a case
router.get('/cases/:caseId/audit', requireAdminAuth, async (req, res) => {
  try {
    const { caseId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    let logs = [];

    // Try to get from database first
    try {
      const result = await db.execute(sql`
        SELECT timestamp, actor, action, details
        FROM audit_logs 
        WHERE case_id = ${caseId}
        ORDER BY timestamp DESC
        LIMIT ${limit} OFFSET ${offset}
      `);
      logs = result.rows.map(row => ({
        timestamp: row.timestamp,
        actor: row.actor,
        action: row.action,
        details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details
      }));
    } catch (dbError) {
      // Fallback to file system
      console.warn('[AUDIT] Database unavailable, using file storage:', dbError.message);
      
      const auditFile = path.join(process.cwd(), 'audit_logs', `${caseId}.log.json`);
      
      try {
        const content = await fs.readFile(auditFile, 'utf8');
        const allLogs = JSON.parse(content);
        logs = allLogs
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(offset, offset + limit);
      } catch (error) {
        // No audit log file exists
        logs = [];
      }
    }

    res.json(logs);

  } catch (error) {
    console.error('[AUDIT] Error retrieving audit log:', error);
    res.status(500).json({
      error: 'Failed to retrieve audit log',
      details: error.message
    });
  }
});

// GET /api/cases/:id/audit/export - Export audit log
router.get('/cases/:caseId/audit/export', requireAdminAuth, async (req, res) => {
  try {
    const { caseId } = req.params;
    const format = req.query.format || 'json';

    let logs = [];

    // Get all logs for export
    try {
      const result = await db.execute(sql`
        SELECT timestamp, actor, action, details
        FROM audit_logs 
        WHERE case_id = ${caseId}
        ORDER BY timestamp DESC
      `);
      logs = result.rows.map(row => ({
        timestamp: row.timestamp,
        actor: row.actor,
        action: row.action,
        details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details
      }));
    } catch (dbError) {
      // Fallback to file system
      const auditFile = path.join(process.cwd(), 'audit_logs', `${caseId}.log.json`);
      
      try {
        const content = await fs.readFile(auditFile, 'utf8');
        logs = JSON.parse(content);
      } catch (error) {
        logs = [];
      }
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = [
        'Timestamp,Actor,Action,Details',
        ...logs.map(log => 
          `"${log.timestamp}","${log.actor}","${log.action}","${JSON.stringify(log.details).replace(/"/g, '""')}"`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-log-${caseId}.csv"`);
      res.send(csv);
    } else {
      // JSON format (default)
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit-log-${caseId}.json"`);
      res.json({
        caseId,
        exportedAt: new Date().toISOString(),
        entries: logs
      });
    }

  } catch (error) {
    console.error('[AUDIT] Error exporting audit log:', error);
    res.status(500).json({
      error: 'Failed to export audit log',
      details: error.message
    });
  }
});

export default router;