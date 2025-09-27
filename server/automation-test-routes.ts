import type { Express, Request, Response } from "express";
import { AutomationWorkflowManager, automationConfig } from "./automation-config";

export function registerAutomationTestRoutes(app: Express) {
  
  /**
   * Test Lindy AI Integration
   */
  app.post("/api/automation/test-lindy", async (req: Request, res: Response) => {
    try {
      const { workflowType = 'eligibility-assessment', testData } = req.body;
      
      const sampleData = testData || {
        clientEmail: 'test@example.com',
        clientName: 'Jan Kowalski',
        eligibilityScore: 85,
        polishConnection: {
          hasAncestry: true,
          relationship: 'grandfather',
          documents: 'birth_certificate'
        },
        contactPreference: 'email'
      };
      
      console.log('🧪 Testing Lindy integration:', { workflowType, sampleData });
      
      // Simulate webhook call to our own endpoint
      const webhookUrl = `${req.protocol}://${req.get('host')}/api/webhooks/lindy/eligibility-assessment`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': 'sha256=test-signature',
          'x-webhook-timestamp': Math.floor(Date.now() / 1000).toString()
        },
        body: JSON.stringify(sampleData)
      });
      
      const result = await response.json();
      
      res.json({
        success: true,
        test: 'lindy-integration',
        config: {
          enabled: automationConfig.lindy.enabled,
          configured: !!automationConfig.lindy.apiKey
        },
        webhookResponse: result,
        message: 'Lindy integration test completed'
      });
      
    } catch (error) {
      console.error('Lindy test error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      });
    }
  });
  
  /**
   * Test n8n Integration
   */
  app.post("/api/automation/test-n8n", async (req: Request, res: Response) => {
    try {
      const { workflowType = 'document-complete', testData } = req.body;
      
      const sampleData = testData || {
        clientId: '123',
        processedDocuments: ['passport', 'birth_certificate'],
        generatedForms: ['citizenship_application', 'power_of_attorney'],
        uploadedToStorage: ['https://dropbox.com/client123/passport.pdf'],
        notificationsSent: true,
        workflowId: 'test-workflow-001'
      };
      
      console.log('🧪 Testing n8n integration:', { workflowType, sampleData });
      
      // Simulate webhook call to our own endpoint
      const webhookUrl = `${req.protocol}://${req.get('host')}/api/webhooks/n8n/document-complete`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': 'sha256=test-signature',
          'x-webhook-timestamp': Math.floor(Date.now() / 1000).toString()
        },
        body: JSON.stringify(sampleData)
      });
      
      const result = await response.json();
      
      res.json({
        success: true,
        test: 'n8n-integration',
        config: {
          enabled: automationConfig.n8n.enabled,
          configured: !!automationConfig.n8n.apiKey
        },
        webhookResponse: result,
        message: 'n8n integration test completed'
      });
      
    } catch (error) {
      console.error('n8n test error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      });
    }
  });
  
  /**
   * Integration Status Dashboard
   */
  app.get("/api/automation/status", (req: Request, res: Response) => {
    const status = AutomationWorkflowManager.getWorkflowStatus();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      integrations: status,
      endpoints: {
        webhooks: {
          health: '/api/webhooks/health',
          test: '/api/webhooks/test',
          lindy: [
            '/api/webhooks/lindy/eligibility-assessment',
            '/api/webhooks/lindy/document-analysis', 
            '/api/webhooks/lindy/client-communication'
          ],
          n8n: [
            '/api/webhooks/n8n/document-complete',
            '/api/webhooks/n8n/payment-update',
            '/api/webhooks/n8n/crm-sync'
          ]
        },
        testing: {
          lindyTest: '/api/automation/test-lindy',
          n8nTest: '/api/automation/test-n8n',
          status: '/api/automation/status'
        }
      },
      environment: {
        isDevelopment: process.env.NODE_ENV === 'development',
        domain: process.env.REPLIT_DEV_DOMAIN,
        webhookSecretsConfigured: {
          lindy: !!process.env.LINDY_WEBHOOK_SECRET,
          n8n: !!process.env.N8N_WEBHOOK_SECRET
        }
      }
    });
  });
  
  /**
   * Trigger Sample Automation Workflow
   */
  app.post("/api/automation/trigger-sample", async (req: Request, res: Response) => {
    try {
      const { platform, workflow, clientData } = req.body;
      
      if (platform === 'lindy' && automationConfig.lindy.enabled) {
        const result = await AutomationWorkflowManager.triggerLindyWorkflow(
          workflow || 'eligibility-assessment',
          clientData || { test: true }
        );
        
        res.json({
          success: true,
          platform: 'lindy',
          workflow: workflow,
          result: result
        });
        
      } else if (platform === 'n8n' && automationConfig.n8n.enabled) {
        const workflowUrl = automationConfig.n8n.workflows.documentProcessing;
        const result = await AutomationWorkflowManager.triggerN8nWorkflow(
          workflowUrl,
          clientData || { test: true }
        );
        
        res.json({
          success: true,
          platform: 'n8n', 
          workflowUrl: workflowUrl,
          result: result
        });
        
      } else {
        res.status(400).json({
          success: false,
          error: `Platform ${platform} is not enabled or configured`
        });
      }
      
    } catch (error) {
      console.error('Sample workflow trigger error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Workflow trigger failed'
      });
    }
  });
}