import type { Express, Request, Response } from "express";
import { workflowScheduler } from "./workflow-scheduler";

/**
 * 🚀 REPLIT-NATIVE WORKFLOW DASHBOARD ROUTES
 * Direct replacement for N8N and Lindy - everything in Replit!
 */

export function registerReplitWorkflowRoutes(app: Express) {
  
  /**
   * 📊 WORKFLOW DASHBOARD STATUS
   */
  app.get('/api/workflows/status', async (req: Request, res: Response) => {
    try {
      const status = workflowScheduler.getStatus();
      const lastResults = workflowScheduler.getLastResults();
      
      res.json({
        status: 'operational',
        scheduler: status,
        workflows: {
          technical: {
            name: 'Technical Workflow (N8N Replacement)',
            schedule: 'Every 2 hours',
            description: 'Rule 1 UI Testing + Rule 4 Auto-Fix',
            lastRun: lastResults.rule1?.timestamp || 'Never'
          },
          aiDriven: {
            name: 'AI-Driven Workflow (Lindy Replacement)',
            schedule: 'Every 3 hours', 
            description: 'Comprehensive Testing + Rule X Grok',
            lastRun: lastResults.comprehensive?.timestamp || 'Never'
          },
          daily: {
            name: 'Daily Comprehensive Check',
            schedule: '6 AM daily',
            description: 'Full system verification',
            lastRun: lastResults.comprehensive?.timestamp || 'Never'
          }
        },
        lastResults,
        isRunning: status.isRunning,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to get workflow status',
        details: error.message
      });
    }
  });

  /**
   * 🔴 RULE 1: MANUAL UI TESTING TRIGGER
   */
  app.post('/api/workflows/trigger/rule1', async (req: Request, res: Response) => {
    try {
      console.log('🎯 Manual trigger: Rule 1 UI Testing');
      const result = await workflowScheduler.triggerRule1();
      
      res.json({
        success: true,
        type: 'rule1_manual_trigger',
        result,
        alertCode: result.success ? 'T001' : 'T004',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Rule 1 manual trigger failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        type: 'rule1_manual_trigger',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * 🔴 RULE 2: MANUAL TRIPLE-AI VERIFICATION
   */
  app.post('/api/workflows/trigger/rule2', async (req: Request, res: Response) => {
    try {
      console.log('🎯 Manual trigger: Rule 2 Triple-AI Verification');
      const result = await workflowScheduler.triggerRule2();
      
      res.json({
        success: true,
        type: 'rule2_manual_trigger',
        result,
        alertCode: result.success ? 'T002' : 'T004',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Rule 2 manual trigger failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        type: 'rule2_manual_trigger',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * 🔴 RULE 3: MANUAL CACHE CLEANUP AND SERVER HEALTH CHECK
   */
  app.post('/api/workflows/trigger/rule3', async (req: Request, res: Response) => {
    try {
      console.log('🎯 Manual trigger: Rule 3 Cache Cleanup and Server Health Check');
      const result = await workflowScheduler.triggerRule3();
      
      res.json({
        success: true,
        type: 'rule3_manual_trigger',
        result,
        alertCode: result.success ? 'S001' : 'S003',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Rule 3 manual trigger failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        type: 'rule3_manual_trigger',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * 🔴 RULE 4: MANUAL AUTO-FIX TRIGGER
   */
  app.post('/api/workflows/trigger/rule4', async (req: Request, res: Response) => {
    try {
      console.log('🎯 Manual trigger: Rule 4 Auto-Fix');
      const result = await workflowScheduler.triggerRule4();
      
      res.json({
        success: true,
        type: 'rule4_manual_trigger',
        result,
        alertCode: result.success ? 'T002' : 'T004',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Rule 4 manual trigger failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        type: 'rule4_manual_trigger',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * 🎯 AUTO "NEW TASK" DETECTION - Called by AI when user starts with "new task"
   */
  app.post('/api/workflows/trigger/auto-new-task', async (req: Request, res: Response) => {
    try {
      const { taskType = 'general', taskDescription = '' } = req.body;
      
      console.log(`🎯 AUTO-DETECTED: "new task" - ${taskDescription}`);
      console.log(`📋 Task type: ${taskType}`);
      
      // Trigger appropriate rules based on task type
      await workflowScheduler.runRulesAfterTaskCompletion(taskType);
      
      res.json({
        success: true,
        type: 'auto_new_task_trigger',
        taskType,
        taskDescription,
        alertCode: 'T001',
        message: `Auto-triggered rules for "${taskType}" task`,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Auto new task trigger failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        type: 'auto_new_task_trigger',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * 🔴 RULE X: MANUAL GROK VERIFICATION TRIGGER
   */
  app.post('/api/workflows/trigger/ruleX', async (req: Request, res: Response) => {
    try {
      console.log('🎯 Manual trigger: Rule X Grok Verification');
      const result = await workflowScheduler.triggerRuleX();
      
      res.json({
        success: true,
        type: 'ruleX_manual_trigger',
        result,
        alertCode: result.success ? 'T003' : 'T004',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Rule X manual trigger failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        type: 'ruleX_manual_trigger',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * 🚀 COMPREHENSIVE TESTING MANUAL TRIGGER
   */
  app.post('/api/workflows/trigger/comprehensive', async (req: Request, res: Response) => {
    try {
      console.log('🎯 Manual trigger: Comprehensive Testing');
      const result = await workflowScheduler.triggerComprehensive();
      
      res.json({
        success: true,
        type: 'comprehensive_manual_trigger',
        result,
        alertCode: result.allRulesEnforced ? 'WF001' : (result.verdict === 'ISSUES_FIXED' ? 'WF002' : 'WF003'),
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Comprehensive manual trigger failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        type: 'comprehensive_manual_trigger',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * 🚨 EMERGENCY CHECK (ALL WORKFLOWS)
   */
  app.post('/api/workflows/trigger/emergency', async (req: Request, res: Response) => {
    try {
      console.log('🚨 Emergency check: Running all workflows');
      const results = await workflowScheduler.triggerEmergencyCheck();
      
      res.json({
        success: true,
        type: 'emergency_check',
        results,
        summary: {
          totalRun: Object.keys(results).length,
          allPassed: Object.values(results).every(r => r.success),
          criticalIssues: Object.values(results).filter(r => r.verdict === 'CRITICAL').length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Emergency check failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        type: 'emergency_check',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * 📧 NOTIFICATION SETTINGS
   */
  app.post('/api/workflows/notifications', async (req: Request, res: Response) => {
    try {
      const { email, webhookUrl, slackWebhook } = req.body;
      
      workflowScheduler.setNotifications({
        email,
        webhookUrl,
        slackWebhook
      });
      
      res.json({
        success: true,
        message: 'Notification settings updated',
        settings: {
          email: email ? '✅ Configured' : '❌ Not set',
          webhookUrl: webhookUrl ? '✅ Configured' : '❌ Not set',
          slackWebhook: slackWebhook ? '✅ Configured' : '❌ Not set'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * 📈 WORKFLOW RESULTS HISTORY
   */
  app.get('/api/workflows/results', async (req: Request, res: Response) => {
    try {
      const results = workflowScheduler.getLastResults();
      
      res.json({
        results,
        summary: {
          totalWorkflows: Object.keys(results).length,
          successfulWorkflows: Object.values(results).filter(r => r.success).length,
          criticalWorkflows: Object.values(results).filter(r => r.verdict === 'CRITICAL').length,
          lastActivity: Object.values(results).reduce((latest, result) => {
            const resultTime = new Date(result.timestamp).getTime();
            return resultTime > latest ? resultTime : latest;
          }, 0)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to get workflow results',
        details: error.message
      });
    }
  });

  /**
   * 🛑 STOP RUNNING WORKFLOW (Emergency)
   */
  app.post('/api/workflows/stop', async (req: Request, res: Response) => {
    try {
      // Note: The actual stopping would require more complex process management
      // For now, we just return the current status
      const status = workflowScheduler.getStatus();
      
      res.json({
        message: 'Stop request received',
        currentStatus: status.isRunning ? 'RUNNING' : 'IDLE',
        note: 'Workflows will complete their current cycle naturally',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to process stop request',
        details: error.message
      });
    }
  });

  console.log('✅ Replit Workflow Routes registered:');
  console.log('   📊 GET /api/workflows/status');
  console.log('   🔴 POST /api/workflows/trigger/rule1');
  console.log('   🔴 POST /api/workflows/trigger/rule4');
  console.log('   🔴 POST /api/workflows/trigger/ruleX');
  console.log('   🚀 POST /api/workflows/trigger/comprehensive');
  console.log('   🚨 POST /api/workflows/trigger/emergency');
  console.log('   📧 POST /api/workflows/notifications');
  console.log('   📈 GET /api/workflows/results');
}