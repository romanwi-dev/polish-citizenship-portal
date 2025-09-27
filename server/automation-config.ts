// Automation platform configuration and workflow templates
export interface AutomationConfig {
  lindy: {
    enabled: boolean;
    apiKey?: string;
    webhookSecret: string;
    endpoints: {
      triggerWorkflow: string;
      createAgent: string;
      updateAgent: string;
    };
  };
  n8n: {
    enabled: boolean;
    instanceUrl?: string;
    apiKey?: string;
    webhookSecret: string;
    workflows: {
      documentProcessing: string;
      clientOnboarding: string;
      paymentHandling: string;
      crmSync: string;
    };
  };
}

export const automationConfig: AutomationConfig = {
  lindy: {
    enabled: !!process.env.LINDY_API_KEY,
    apiKey: process.env.LINDY_API_KEY,
    webhookSecret: process.env.LINDY_WEBHOOK_SECRET || 'lindy-webhook-secret',
    endpoints: {
      triggerWorkflow: process.env.LINDY_API_ENDPOINT + '/workflows/trigger' || '',
      createAgent: process.env.LINDY_API_ENDPOINT + '/agents' || '',
      updateAgent: process.env.LINDY_API_ENDPOINT + '/agents/{id}' || ''
    }
  },
  n8n: {
    enabled: !!process.env.N8N_API_KEY,
    instanceUrl: process.env.N8N_INSTANCE_URL,
    apiKey: process.env.N8N_API_KEY,
    webhookSecret: process.env.N8N_WEBHOOK_SECRET || 'n8n-webhook-secret',
    workflows: {
      documentProcessing: process.env.N8N_WEBHOOK_URL + '/document-processing' || '',
      clientOnboarding: process.env.N8N_WEBHOOK_URL + '/client-onboarding' || '',
      paymentHandling: process.env.N8N_WEBHOOK_URL + '/payment-processing' || '',
      crmSync: process.env.N8N_WEBHOOK_URL + '/crm-sync' || ''
    }
  }
};

// Lindy AI Agent Templates
export const lindyAgentTemplates = {
  clientEligibilityAssessment: {
    name: "Polish Citizenship Eligibility Screener",
    description: "AI agent that qualifies potential clients for Polish citizenship by descent",
    instructions: `
You are an expert Polish citizenship consultant. Analyze client inquiries to determine eligibility for Polish citizenship by descent.

Key qualification criteria:
1. Has at least one Polish ancestor (parent, grandparent, great-grandparent)
2. Polish ancestor maintained Polish citizenship when child was born
3. No breaks in citizenship transmission line
4. Required documents are obtainable

Your tasks:
- Ask strategic questions to uncover ancestry details
- Calculate success probability (0-100%)
- Identify missing documentation
- Recommend next steps (consultation, document search, etc.)
- Hand off qualified leads to human consultants

When confidence is high (>80%), automatically create priority consultation request.
Always be encouraging while being realistic about challenges.
`,
    webhookUrl: process.env.REPLIT_DEV_DOMAIN + '/api/webhooks/lindy/eligibility-assessment',
    triggers: ['form_submission', 'chat_conversation', 'email_inquiry']
  },
  
  documentAnalyzer: {
    name: "Polish Document AI Analyzer",
    description: "Specialized AI for analyzing Polish genealogical documents",
    instructions: `
You are an expert in Polish genealogical documents and citizenship law.

Document types you analyze:
- Birth certificates (Akt Urodzenia)
- Marriage certificates (Akt Małżeństwa) 
- Death certificates (Akt Zgonu)
- Passports and ID cards
- Military records
- Immigration documents

For each document:
1. Extract all names, dates, places
2. Identify relationships (parent, child, spouse)
3. Check for citizenship indicators
4. Assess document authenticity
5. Flag missing information
6. Calculate confidence score

Output structured data for auto-filling citizenship application forms.
If confidence >90%, trigger automatic form population.
`,
    webhookUrl: process.env.REPLIT_DEV_DOMAIN + '/api/webhooks/lindy/document-analysis',
    triggers: ['document_upload', 'ocr_complete', 'manual_review']
  },

  clientCommunicationManager: {
    name: "Polish Citizenship Support Assistant",
    description: "AI assistant for handling client questions about Polish citizenship process",
    instructions: `
You are a knowledgeable Polish citizenship consultant assistant.

Your expertise covers:
- Polish citizenship by descent laws
- Required documents and sources
- Timeline expectations
- Cost estimates
- Common obstacles and solutions

Communication guidelines:
- Be professional yet warm
- Provide specific, actionable advice
- Reference our 97% success rate when appropriate
- Always offer to escalate complex questions
- Include relevant links to resources

Monitor sentiment and urgency:
- Happy clients: Provide helpful information
- Frustrated clients: Offer immediate assistance
- Confused clients: Break down complex topics
- Urgent requests: Flag for immediate human follow-up
`,
    webhookUrl: process.env.REPLIT_DEV_DOMAIN + '/api/webhooks/lindy/client-communication',
    triggers: ['chat_message', 'email_received', 'support_ticket']
  }
};

// n8n Workflow Templates
export const n8nWorkflowTemplates = {
  documentProcessingPipeline: {
    name: "Document Processing Automation",
    description: "Complete document processing from upload to client delivery",
    workflow: {
      trigger: "webhook",
      nodes: [
        {
          type: "Webhook",
          name: "Document Upload Trigger",
          settings: {
            path: "document-processing",
            httpMethod: "POST"
          }
        },
        {
          type: "If",
          name: "Check Document Type",
          conditions: [
            { field: "documentType", operation: "equals", value: "passport" },
            { field: "documentType", operation: "equals", value: "birth_certificate" },
            { field: "documentType", operation: "equals", value: "marriage_certificate" }
          ]
        },
        {
          type: "HTTP Request",
          name: "Trigger OCR Processing",
          settings: {
            method: "POST",
            url: process.env.REPLIT_DEV_DOMAIN + "/api/documents/ocr",
            headers: { "Content-Type": "application/json" }
          }
        },
        {
          type: "HTTP Request",
          name: "Translate Document",
          settings: {
            method: "POST",
            url: process.env.REPLIT_DEV_DOMAIN + "/api/translation/translate"
          }
        },
        {
          type: "Dropbox",
          name: "Store in Client Folder",
          settings: {
            operation: "upload",
            path: "/clients/{{clientId}}/{{documentType}}"
          }
        },
        {
          type: "HTTP Request",
          name: "Update Case Progress",
          settings: {
            method: "POST",
            url: process.env.REPLIT_DEV_DOMAIN + "/api/case/progress"
          }
        },
        {
          type: "Lindy",
          name: "Notify Client of Completion",
          settings: {
            agent: "clientCommunicationManager",
            message: "Document processing complete"
          }
        }
      ]
    }
  },

  clientOnboardingFlow: {
    name: "Automated Client Onboarding",
    description: "End-to-end client onboarding from registration to case setup",
    workflow: {
      trigger: "webhook",
      nodes: [
        {
          type: "Webhook",
          name: "New Registration Trigger"
        },
        {
          type: "Lindy",
          name: "Eligibility Assessment",
          settings: {
            agent: "clientEligibilityAssessment",
            action: "analyze_client_info"
          }
        },
        {
          type: "If",
          name: "High Probability Case?",
          conditions: [{ field: "successProbability", operation: ">=", value: 80 }]
        },
        {
          type: "HubSpot",
          name: "Create CRM Contact",
          settings: {
            operation: "create",
            object: "contact"
          }
        },
        {
          type: "Stripe",
          name: "Create Customer Profile",
          settings: {
            operation: "createCustomer"
          }
        },
        {
          type: "HTTP Request",
          name: "Setup Case Dashboard",
          settings: {
            method: "POST",
            url: process.env.REPLIT_DEV_DOMAIN + "/api/case/create"
          }
        },
        {
          type: "SendGrid",
          name: "Send Welcome Email",
          settings: {
            template: "client_onboarding_welcome"
          }
        }
      ]
    }
  },

  paymentProcessingWorkflow: {
    name: "Payment Processing and Service Activation",
    description: "Handle payments and automatically activate services",
    workflow: {
      trigger: "stripe_webhook",
      nodes: [
        {
          type: "Stripe Trigger",
          name: "Payment Success Webhook"
        },
        {
          type: "Switch",
          name: "Service Type Router",
          routes: [
            { value: "consultation", output: 0 },
            { value: "document_search", output: 1 },
            { value: "full_service", output: 2 }
          ]
        },
        {
          type: "HTTP Request",
          name: "Activate Service Level",
          settings: {
            method: "POST",
            url: process.env.REPLIT_DEV_DOMAIN + "/api/case/activate-service"
          }
        },
        {
          type: "Calendly",
          name: "Schedule Consultation",
          settings: {
            operation: "create_booking",
            eventType: "initial_consultation"
          }
        },
        {
          type: "Lindy",
          name: "Begin Document Generation",
          settings: {
            agent: "documentAnalyzer",
            action: "prepare_citizenship_forms"
          }
        },
        {
          type: "HTTP Request",
          name: "Update Webhook Endpoint",
          settings: {
            method: "POST",
            url: process.env.REPLIT_DEV_DOMAIN + "/api/webhooks/n8n/payment-update"
          }
        }
      ]
    }
  }
};

// Helper functions for workflow management
export class AutomationWorkflowManager {
  
  static async triggerLindyWorkflow(workflowType: string, data: any) {
    if (!automationConfig.lindy.enabled) {
      console.log('Lindy integration disabled');
      return;
    }

    try {
      const response = await fetch(automationConfig.lindy.endpoints.triggerWorkflow, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${automationConfig.lindy.apiKey}`
        },
        body: JSON.stringify({
          workflowType,
          data,
          timestamp: new Date().toISOString()
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to trigger Lindy workflow:', error);
      throw error;
    }
  }

  static async triggerN8nWorkflow(workflowUrl: string, data: any) {
    if (!automationConfig.n8n.enabled) {
      console.log('n8n integration disabled');
      return;
    }

    try {
      const response = await fetch(workflowUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${automationConfig.n8n.apiKey}`
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: 'polish_citizenship_portal'
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to trigger n8n workflow:', error);
      throw error;
    }
  }

  static getWorkflowStatus() {
    return {
      lindy: {
        enabled: automationConfig.lindy.enabled,
        configured: !!automationConfig.lindy.apiKey,
        agentTemplates: Object.keys(lindyAgentTemplates).length
      },
      n8n: {
        enabled: automationConfig.n8n.enabled,
        configured: !!automationConfig.n8n.apiKey,
        workflowTemplates: Object.keys(n8nWorkflowTemplates).length
      }
    };
  }
}