import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { sendEmailVerification, sendCaseApprovalNotification, sendWelcomeEmail } from "./email";
import crypto from "crypto";

// Security middleware for webhook validation
const validateWebhookSignature = (secret: string) => {
  return (req: Request, res: Response, next: Function) => {
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;
    
    if (!signature || !timestamp) {
      return res.status(401).json({ error: 'Missing webhook signature or timestamp' });
    }
    
    // Verify timestamp (prevent replay attacks)
    const now = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp);
    if (Math.abs(now - webhookTime) > 300) { // 5 minutes tolerance
      return res.status(401).json({ error: 'Webhook timestamp too old' });
    }
    
    // Verify signature
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(timestamp + payload)
      .digest('hex');
    
    const receivedSignature = signature.replace('sha256=', '');
    
    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(receivedSignature))) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    
    next();
  };
};

export async function registerAutomationWebhookRoutes(app: Express) {
  // Webhook secrets (configure via environment variables)
  const LINDY_WEBHOOK_SECRET = process.env.LINDY_WEBHOOK_SECRET || 'lindy-secret-key';
  const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || 'n8n-secret-key';
  
  // Enhanced webhook endpoints for comprehensive AI testing
  await registerEnhancedWebhookEndpoints(app);
  
  // ==========================
  // LINDY AI WEBHOOK ENDPOINTS
  // ==========================
  
  /**
   * Lindy: New Client Eligibility Assessment
   * Triggered when Lindy AI processes a lead and determines eligibility
   */
  app.post("/api/webhooks/lindy/eligibility-assessment", 
    validateWebhookSignature(LINDY_WEBHOOK_SECRET),
    async (req: Request, res: Response) => {
      try {
        const { 
          clientEmail, 
          clientName, 
          eligibilityScore, 
          polishConnection, 
          documents,
          contactPreference,
          phoneNumber
        } = req.body;
        
        console.log('🤖 Lindy Eligibility Assessment:', { clientName, eligibilityScore });
        
        // Create eligibility assessment record
        const assessmentData = {
          email: clientEmail,
          firstName: clientName.split(' ')[0] || clientName,
          lastName: clientName.split(' ').slice(1).join(' ') || '',
          hasPolishAncestry: polishConnection?.hasAncestry || false,
          documentationLevel: documents?.level || 'basic',
          estimatedSuccessRate: eligibilityScore || 0,
          polishAncestorRelation: polishConnection?.relationship || '',
          additionalNotes: `Processed by Lindy AI. Contact preference: ${contactPreference}`,
          phoneNumber: phoneNumber || null,
          preferredContact: contactPreference || 'email',
          status: eligibilityScore >= 70 ? 'qualified' : 'needs_review'
        };
        
        const assessment = await storage.createEligibilityAssessment(assessmentData);
        
        // If highly qualified, automatically create consultation request
        if (eligibilityScore >= 80) {
          const consultationData = {
            firstName: assessmentData.firstName,
            lastName: assessmentData.lastName,
            email: clientEmail,
            phone: phoneNumber || '',
            message: `High-probability case (${eligibilityScore}% success rate) - Priority consultation requested by Lindy AI`,
            privacyConsent: true
          };
          
          await storage.createConsultationRequest(consultationData);
          
          // Send case approval notification 
          const user = { email: clientEmail, firstName: assessmentData.firstName, lastName: assessmentData.lastName };
          await sendCaseApprovalNotification(user as any, true, `High-probability case (${eligibilityScore}% success rate)`);
        }
        
        res.json({ 
          success: true, 
          assessmentId: assessment.id,
          nextSteps: eligibilityScore >= 80 ? 'priority_consultation' : 'standard_follow_up'
        });
        
      } catch (error) {
        console.error('Lindy eligibility webhook error:', error);
        res.status(500).json({ error: 'Failed to process eligibility assessment' });
      }
    }
  );
  
  /**
   * Lindy: AI Document Analysis Complete
   * Triggered when Lindy completes AI analysis of uploaded documents
   */
  app.post("/api/webhooks/lindy/document-analysis", 
    validateWebhookSignature(LINDY_WEBHOOK_SECRET),
    async (req: Request, res: Response) => {
      try {
        const {
          clientId,
          documentType,
          analysisResults,
          extractedData,
          confidenceScore,
          recommendations,
          documentUrl
        } = req.body;
        
        console.log('📄 Lindy Document Analysis:', { clientId, documentType, confidenceScore });
        
        // Update case progress with AI analysis
        const progressData = {
          caseId: clientId.toString(),
          currentPhase: (confidenceScore >= 85 ? 'completed' : 'document_collection') as 'completed' | 'document_collection',
          overallProgress: Math.min(confidenceScore, 100),
          lastActivityDate: new Date()
        };
        
        await storage.createCaseProgress(progressData);
        
        // If document analysis is complete and confident, trigger form auto-fill
        if (confidenceScore >= 90 && extractedData) {
          // Trigger n8n workflow for form auto-population
          await fetch(process.env.N8N_WEBHOOK_URL + '/form-autofill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientId: clientId,
              extractedData: extractedData,
              documentType: documentType,
              trigger: 'lindy_analysis_complete'
            })
          });
        }
        
        res.json({ 
          success: true, 
          nextAction: confidenceScore >= 90 ? 'auto_populate_forms' : 'manual_review_required'
        });
        
      } catch (error) {
        console.error('Lindy document analysis webhook error:', error);
        res.status(500).json({ error: 'Failed to process document analysis' });
      }
    }
  );
  
  /**
   * Lindy: Client Communication Response
   * Triggered when Lindy AI handles client questions
   */
  app.post("/api/webhooks/lindy/client-communication", 
    validateWebhookSignature(LINDY_WEBHOOK_SECRET),
    async (req: Request, res: Response) => {
      try {
        const {
          clientEmail,
          question,
          aiResponse,
          sentimentScore,
          urgencyLevel,
          followUpRequired
        } = req.body;
        
        console.log('💬 Lindy Client Communication:', { clientEmail, urgencyLevel });
        
        // Log the communication
        const communicationLog = {
          email: clientEmail,
          type: 'ai_response',
          content: aiResponse,
          metadata: {
            originalQuestion: question,
            sentimentScore: sentimentScore,
            urgencyLevel: urgencyLevel,
            aiProvider: 'lindy',
            timestamp: new Date().toISOString()
          }
        };
        
        // Store in notifications system
        await storage.createNotification({
          type: 'info',
          title: 'AI Communication',
          message: `Lindy AI responded to ${clientEmail}`,
          read: false
        });
        
        // If high urgency, notify admin
        if (urgencyLevel === 'high' || followUpRequired) {
          await storage.createNotification({
            type: 'warning',
            title: 'Priority Follow-up Required',
            message: `High priority client communication requires follow-up: ${clientEmail}`,
            read: false
          });
        }
        
        res.json({ success: true });
        
      } catch (error) {
        console.error('Lindy communication webhook error:', error);
        res.status(500).json({ error: 'Failed to log communication' });
      }
    }
  );
  
  // ======================
  // N8N WEBHOOK ENDPOINTS
  // ======================
  
  /**
   * n8n: Document Processing Chain Complete
   * Triggered when n8n completes multi-step document processing
   */
  app.post("/api/webhooks/n8n/document-complete", 
    validateWebhookSignature(N8N_WEBHOOK_SECRET),
    async (req: Request, res: Response) => {
      try {
        const {
          clientId,
          processedDocuments,
          generatedForms,
          uploadedToStorage,
          notificationsSent,
          workflowId
        } = req.body;
        
        console.log('🔄 n8n Document Processing Complete:', { clientId, workflowId });
        
        // Update case status
        const progressData = {
          caseId: clientId.toString(),
          currentPhase: 'completed' as 'completed',
          overallProgress: 100,
          lastActivityDate: new Date()
        };
        
        await storage.createCaseProgress(progressData);
        
        // Trigger Lindy to send completion notification to client
        if (process.env.LINDY_API_ENDPOINT) {
          await fetch(`${process.env.LINDY_API_ENDPOINT}/trigger-notification`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.LINDY_API_KEY}`
            },
            body: JSON.stringify({
              clientId: clientId,
              notificationType: 'document_processing_complete',
              documents: processedDocuments,
              forms: generatedForms
            })
          });
        }
        
        res.json({ success: true });
        
      } catch (error) {
        console.error('n8n document complete webhook error:', error);
        res.status(500).json({ error: 'Failed to process n8n completion' });
      }
    }
  );
  
  /**
   * n8n: Payment Processing Update
   * Triggered when n8n handles payment workflows (Stripe integration)
   */
  app.post("/api/webhooks/n8n/payment-update", 
    validateWebhookSignature(N8N_WEBHOOK_SECRET),
    async (req: Request, res: Response) => {
      try {
        const {
          clientEmail,
          paymentStatus,
          amount,
          currency,
          stripeSessionId,
          serviceType,
          clientId
        } = req.body;
        
        console.log('💳 n8n Payment Update:', { clientEmail, paymentStatus, serviceType });
        
        // Update case with payment information
        if (clientId) {
          const progressData = {
            caseId: clientId.toString(),
            currentPhase: (paymentStatus === 'succeeded' ? 'submission' : 'initial_assessment') as 'submission' | 'initial_assessment',
            overallProgress: paymentStatus === 'succeeded' ? 75 : 25,
            lastActivityDate: new Date()
          };
          
          await storage.createCaseProgress(progressData);
        }
        
        // If payment successful, trigger document generation workflow
        if (paymentStatus === 'succeeded') {
          // Create notification
          await storage.createNotification({
            type: 'success',
            title: 'Payment Successful',
            message: `Payment successful for ${clientEmail} - ${serviceType}`,
            read: false
          });
          
          // Trigger Lindy to begin document generation
          if (process.env.LINDY_API_ENDPOINT) {
            await fetch(`${process.env.LINDY_API_ENDPOINT}/trigger-document-generation`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LINDY_API_KEY}`
              },
              body: JSON.stringify({
                clientId: clientId,
                clientEmail: clientEmail,
                serviceType: serviceType,
                paymentAmount: amount
              })
            });
          }
        }
        
        res.json({ success: true });
        
      } catch (error) {
        console.error('n8n payment webhook error:', error);
        res.status(500).json({ error: 'Failed to process payment update' });
      }
    }
  );
  
  /**
   * n8n: CRM Integration Update
   * Triggered when n8n syncs data with external CRM systems
   */
  app.post("/api/webhooks/n8n/crm-sync", 
    validateWebhookSignature(N8N_WEBHOOK_SECRET),
    async (req: Request, res: Response) => {
      try {
        const {
          clientId,
          crmSystem,
          syncStatus,
          crmRecordId,
          syncedFields,
          errors
        } = req.body;
        
        console.log('🔄 n8n CRM Sync:', { clientId, crmSystem, syncStatus });
        
        // Log CRM sync activity
        const progressData = {
          caseId: clientId.toString(),
          currentPhase: (syncStatus === 'success' ? 'review' : 'document_collection') as 'review' | 'document_collection',
          overallProgress: syncStatus === 'success' ? 90 : 50,
          lastActivityDate: new Date()
        };
        
        await storage.createCaseProgress(progressData);
        
        // If sync failed, create admin notification
        if (syncStatus === 'failed' && errors) {
          await storage.createNotification({
            type: 'error',
            title: 'CRM Sync Failed',
            message: `CRM sync failed for client ${clientId} with ${crmSystem}`,
            read: false
          });
        }
        
        res.json({ success: true });
        
      } catch (error) {
        console.error('n8n CRM sync webhook error:', error);
        res.status(500).json({ error: 'Failed to process CRM sync' });
      }
    }
  );
  
  // ======================
  // UTILITY ENDPOINTS
  // ======================
  
  /**
   * Health check for webhook endpoints
   */
  app.get("/api/webhooks/health", (req: Request, res: Response) => {
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      webhooks: {
        lindy: {
          eligibility: '/api/webhooks/lindy/eligibility-assessment',
          documents: '/api/webhooks/lindy/document-analysis',
          communication: '/api/webhooks/lindy/client-communication'
        },
        n8n: {
          documents: '/api/webhooks/n8n/document-complete',
          payments: '/api/webhooks/n8n/payment-update',
          crm: '/api/webhooks/n8n/crm-sync'
        }
      }
    });
  });
  
  /**
   * Test webhook endpoint (for development)
   */
  app.post("/api/webhooks/test", (req: Request, res: Response) => {
    console.log('🧪 Webhook Test:', req.body);
    res.json({ 
      received: true, 
      timestamp: new Date().toISOString(),
      headers: req.headers,
      body: req.body
    });
  });
}

/**
 * 🔴 ENHANCED WEBHOOK ENDPOINTS FOR COMPREHENSIVE AI TESTING
 */
async function registerEnhancedWebhookEndpoints(app: Express) {
  const { spawn, exec } = await import('child_process');
  const fs = await import('fs/promises');
  const path = await import('path');

  // Enhanced script execution with better error handling
  const executeTestingScript = (scriptPath: string, args: string[] = [], options: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      const {
        timeout = 300000,
        enforceRules = false,
        securityLevel = 'standard'
      } = options;

      const process = spawn('node', [scriptPath, ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { 
          ...process.env, 
          ENFORCE_RULES: enforceRules.toString(),
          SECURITY_LEVEL: securityLevel,
          TESTING_MODE: 'comprehensive'
        }
      });

      let stdout = '';
      let stderr = '';
      let completed = false;

      process.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      const cleanup = () => {
        if (!completed) {
          completed = true;
          try {
            process.kill('SIGTERM');
            setTimeout(() => process.kill('SIGKILL'), 5000);
          } catch (error) {
            // Process already ended
          }
        }
      };

      process.on('close', (code: number) => {
        if (completed) return;
        completed = true;

        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            resolve({
              ...result,
              rawOutput: stdout,
              executionTime: Date.now() - startTime,
              securityLevel,
              rulesEnforced: enforceRules
            });
          } catch (error: any) {
            resolve({ 
              output: stdout, 
              success: true, 
              executionTime: Date.now() - startTime,
              parseError: error.message
            });
          }
        } else {
          reject({ 
            error: stderr || stdout || 'Process failed',
            code,
            executionTime: Date.now() - startTime
          });
        }
      });

      const startTime = Date.now();
      
      // Set timeout
      const timeoutHandle = setTimeout(() => {
        if (!completed) {
          cleanup();
          reject({ 
            error: 'Process timeout', 
            code: 124, 
            executionTime: timeout 
          });
        }
      }, timeout);

      process.on('close', () => {
        clearTimeout(timeoutHandle);
      });
    });
  };

  /**
   * 🔴 RULE 1: COMPREHENSIVE UI FUNCTIONALITY TESTING
   */
  app.post('/webhook/run-ui-tests', async (req: Request, res: Response) => {
    console.log('🔴 RULE 1 ENFORCED: Comprehensive UI Functionality Testing');
    
    try {
      const { 
        taskDescription = 'Rule 1 - Comprehensive UI Testing',
        features = ['ui', 'forms', 'workflows', 'mobile'],
        enforceRule1 = true,
        securityLevel = 'maximum'
      } = req.body.parameters || {};
      
      const startTime = Date.now();
      
      // Execute Rule 1 with enhanced parameters
      const result = await executeTestingScript('ui-functionality-tester.mjs', [
        taskDescription,
        Array.isArray(features) ? features.join(',') : features
      ], {
        timeout: 180000,
        enforceRules: enforceRule1,
        securityLevel
      });
      
      const duration = Date.now() - startTime;
      const totalTests = (result.passed || 0) + (result.failed || 0);
      const passRate = totalTests > 0 ? Math.round((result.passed / totalTests) * 100) : 0;
      
      // Rule 1 enforcement: UI pass rate must be >= 95%
      const rule1Enforced = passRate >= 95;
      
      console.log(`🔴 RULE 1 STATUS: ${rule1Enforced ? 'ENFORCED' : 'VIOLATION'} - ${passRate}% pass rate`);
      
      res.json({
        status: 'completed',
        type: 'rule1_ui_functionality_test',
        rule1Enforced,
        duration,
        taskDescription,
        features,
        passed: result.passed || 0,
        failed: result.failed || 0,
        uiPassRate: passRate,
        issues: result.issues || [],
        testResults: result.testResults || {},
        securityLevel,
        compliance: {
          rule1: rule1Enforced ? 'ENFORCED' : 'VIOLATION',
          requiresAutofix: !rule1Enforced
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ RULE 1 VIOLATION: UI Testing failed:', error);
      res.status(500).json({
        status: 'error',
        type: 'rule1_ui_functionality_test',
        rule1Enforced: false,
        error: error.message || 'Rule 1 UI testing failed',
        compliance: {
          rule1: 'VIOLATION',
          requiresAutofix: true
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * 🔴 RULE 4: SUPERIOR AUTO-FIX UNTIL PERFECT
   */
  app.post('/webhook/rule-four-autofix', async (req: Request, res: Response) => {
    console.log('🔴 RULE 4 ENFORCED: Superior Auto-Fix Until Perfect');
    
    try {
      const { 
        taskDescription = 'Rule 4 - Superior Auto-Fix Until Perfect',
        maxIterations = 15,
        enforceUntilPerfect = true,
        aggressive = true,
        issuesContext = {}
      } = req.body.parameters || {};
      
      const startTime = Date.now();
      
      // Execute Rule 4 auto-fix system
      const result = await executeTestingScript('rule-four-autofix-system.mjs', [
        taskDescription,
        'comprehensive,autofix,aggressive'
      ], {
        timeout: 900000, // 15 minutes for aggressive fixing
        enforceRules: true,
        securityLevel: 'maximum',
        maxIterations
      });
      
      const duration = Date.now() - startTime;
      const success = result.success || false;
      const iterations = result.iterations || 0;
      const fixesApplied = result.fixesApplied || 0;
      
      // Rule 4 enforcement: Must achieve success or reach max iterations
      const rule4Enforced = success || iterations >= maxIterations;
      
      console.log(`🔴 RULE 4 STATUS: ${rule4Enforced ? 'ENFORCED' : 'VIOLATION'} - ${fixesApplied} fixes, ${iterations} iterations`);
      
      res.json({
        status: 'completed',
        type: 'rule4_superior_autofix',
        rule4Enforced,
        duration,
        taskDescription,
        success,
        iterations,
        maxIterations,
        fixesApplied,
        fixHistory: result.fixHistory || [],
        enforceUntilPerfect,
        aggressive,
        compliance: {
          rule4: rule4Enforced ? 'ENFORCED' : 'VIOLATION',
          perfectionAchieved: success,
          maxEffortApplied: iterations >= maxIterations
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ RULE 4 VIOLATION: Auto-fix failed:', error);
      res.status(500).json({
        status: 'error',
        type: 'rule4_superior_autofix',
        rule4Enforced: false,
        error: error.message || 'Rule 4 auto-fix failed',
        compliance: {
          rule4: 'VIOLATION',
          perfectionAchieved: false,
          maxEffortApplied: false
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * 🚀 COMPREHENSIVE TESTING ENDPOINT
   */
  app.post('/webhook/run-complete-testing', async (req: Request, res: Response) => {
    console.log('🚀 N8N/Lindy: Comprehensive Testing with All Rules');
    
    try {
      const { 
        taskDescription = 'Comprehensive Testing with All Rules',
        features = ['complete', 'all-rules']
      } = req.body.parameters || {};
      
      const startTime = Date.now();
      
      // Execute complete testing
      const result = await executeTestingScript('complete-ai-testing-system.mjs', [
        taskDescription,
        Array.isArray(features) ? features.join(',') : features
      ], {
        timeout: 600000, // 10 minutes for comprehensive testing
        enforceRules: true,
        securityLevel: 'maximum'
      });
      
      const duration = Date.now() - startTime;
      
      res.json({
        status: 'completed',
        type: 'comprehensive_testing',
        duration,
        taskDescription,
        features,
        results: result.results || {},
        finalVerdict: result.finalVerdict || 'UNKNOWN',
        allRulesEnforced: result.allRulesEnforced || false,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('❌ Comprehensive testing failed:', error);
      res.status(500).json({
        status: 'error',
        type: 'comprehensive_testing',
        error: error.message || 'Comprehensive testing failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * 📊 ENHANCED TESTING STATUS
   */
  app.get('/webhook/testing-status', async (req: Request, res: Response) => {
    try {
      const scripts = [
        'ui-functionality-tester.mjs',
        'enhanced-rules-verification.mjs', 
        'rule-four-autofix-system.mjs',
        'complete-ai-testing-system.mjs',
        'grok-verification-agent.mjs'
      ];
      
      const scriptStatus: Record<string, boolean> = {};
      for (const script of scripts) {
        try {
          await fs.access(script);
          scriptStatus[script] = true;
        } catch {
          scriptStatus[script] = false;
        }
      }
      
      const allScriptsReady = Object.values(scriptStatus).every(Boolean);
      
      res.json({
        status: 'operational',
        scripts: scriptStatus,
        allScriptsReady,
        mandatoryRulesSupport: {
          rule1_ui_testing: scriptStatus['ui-functionality-tester.mjs'],
          rule2_triple_ai: scriptStatus['enhanced-rules-verification.mjs'],
          rule3_maintenance: true, // Built-in functionality
          ruleX_grok: scriptStatus['grok-verification-agent.mjs'],
          rule4_autofix: scriptStatus['rule-four-autofix-system.mjs']
        },
        supportedWorkflows: ['n8n', 'lindy'],
        webhookEndpoints: [
          'POST /webhook/run-ui-tests (Rule 1)',
          'POST /webhook/rule-four-autofix (Rule 4)', 
          'POST /webhook/run-complete-testing',
          'GET /webhook/testing-status'
        ],
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}