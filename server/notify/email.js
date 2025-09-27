/**
 * Simple Email Notification Service
 * Separate from the existing complex notification system
 * Pluggable design for development/production environments
 */

import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';

// Environment detection
const isDevelopment = process.env.NODE_ENV !== 'production';

// Email notification settings file
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'email-notification-settings.json');

// Default email notification settings
const DEFAULT_SETTINGS = {
  globalEnabled: true,
  hacNotifications: {
    newRequestToRoman: true,
    approvalToOwner: true
  },
  caseNotifications: {
    stageChangesToClients: true
  },
  romanEmail: process.env.ROMAN_EMAIL || 'roman@polishcitizenship.pl'
};

/**
 * Load email notification settings
 */
async function loadSettings() {
  try {
    // Ensure data directory exists
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    const settings = JSON.parse(data);
    
    // Merge with defaults to ensure all keys exist
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (error) {
    // If file doesn't exist or error reading, return defaults
    console.log('📧 Using default email notification settings');
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save email notification settings
 */
async function saveSettings(settings) {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    console.log('📧 Email notification settings saved');
  } catch (error) {
    console.error('❌ Error saving email notification settings:', error);
  }
}

/**
 * Load and compile email template by language and template type
 * @param {string} language - Language code ('en' or 'pl')
 * @param {Object} data - Template data
 * @param {string} templateType - Template type ('hacApproved', 'caseStageChange', etc.)
 * @returns {string} - Compiled HTML
 */
async function loadEmailTemplate(language = 'en', data = {}, templateType = null) {
  // Security: Validate language parameter to prevent path traversal
  const allowedLanguages = ['en', 'pl'];
  const sanitizedLanguage = allowedLanguages.includes(language) ? language : 'en';
  
  // Security: Validate templateType parameter to prevent path traversal
  const allowedTemplateTypes = ['hacApproved', 'caseStageChange'];
  let sanitizedTemplateType = null;
  
  // If templateType is provided in data object, use it
  if (data.templateType && allowedTemplateTypes.includes(data.templateType)) {
    sanitizedTemplateType = data.templateType;
  } else if (templateType && allowedTemplateTypes.includes(templateType)) {
    sanitizedTemplateType = templateType;
  }
  
  try {
    let templatePath;
    
    if (sanitizedTemplateType) {
      // Try to load specific template by type and language
      templatePath = path.join(process.cwd(), 'client', 'src', 'i18n', 'mail', sanitizedLanguage, `${sanitizedTemplateType}.html`);
      
      try {
        const templateContent = await fs.readFile(templatePath, 'utf8');
        const template = Handlebars.compile(templateContent);
        return template(data);
      } catch (typeError) {
        console.warn(`Failed to load specific template ${sanitizedLanguage}/${sanitizedTemplateType}.html, falling back to generic template:`, typeError.message);
        // Fall through to generic template
      }
    }
    
    // Fallback to generic template
    templatePath = path.join(process.cwd(), 'client', 'src', 'i18n', 'mail', `${sanitizedLanguage}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf8');
    const template = Handlebars.compile(templateContent);
    return template(data);
  } catch (error) {
    console.warn(`Failed to load ${sanitizedLanguage} template, falling back to English:`, error.message);
    // Fallback to English if Polish template fails
    if (sanitizedLanguage !== 'en') {
      return loadEmailTemplate('en', data, templateType);
    }
    throw error;
  }
}

/**
 * Core email sending function - pluggable for different environments
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email content
 * @param {Object} options - Additional options including preferredLanguage
 */
async function sendEmail(to, subject, html, options = {}) {
  const settings = await loadSettings();
  
  // Check if global notifications are disabled
  if (!settings.globalEnabled) {
    console.log('📧 Email notifications globally disabled - skipping email');
    return { success: true, skipped: true, reason: 'Globally disabled' };
  }

  if (isDevelopment) {
    // Development mode: Console logging with clear formatting
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL NOTIFICATION (DEVELOPMENT MODE)');
    console.log('='.repeat(80));
    console.log(`📩 To: ${to}`);
    console.log(`📝 Subject: ${subject}`);
    console.log(`🎨 HTML Content:`);
    console.log('-'.repeat(40));
    console.log(html);
    console.log('-'.repeat(40));
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    
    if (options.templateType) {
      console.log(`📋 Template Type: ${options.templateType}`);
    }
    
    if (options.preferredLanguage) {
      console.log(`🌐 Language: ${options.preferredLanguage}`);
    }
    
    if (options.caseId) {
      console.log(`🔍 Case ID: ${options.caseId}`);
    }
    
    if (options.hacRequestId) {
      console.log(`🔍 HAC Request ID: ${options.hacRequestId}`);
    }
    
    console.log('='.repeat(80) + '\n');

    return {
      success: true,
      messageId: `dev-${Date.now()}`,
      mode: 'development',
      recipient: to,
      subject: subject
    };
  } else {
    // Production mode: Integrate with real email service
    // This is a placeholder for production email service integration
    try {
      // TODO: Integrate with SendGrid, NodeMailer, or other email service
      // Example with SendGrid:
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // const msg = { to, from: 'noreply@polishcitizenship.pl', subject, html };
      // const response = await sgMail.send(msg);
      
      console.log(`📧 Production email would be sent to: ${to}`);
      console.log(`📝 Subject: ${subject}`);
      
      return {
        success: true,
        messageId: `prod-placeholder-${Date.now()}`,
        mode: 'production',
        recipient: to,
        subject: subject,
        note: 'Production email service not yet configured'
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return {
        success: false,
        error: error.message,
        mode: 'production',
        recipient: to,
        subject: subject
      };
    }
  }
}

/**
 * Generate mock client email for development
 * @param {string} caseId - Case identifier
 */
function generateMockClientEmail(caseId) {
  return `client-${caseId}@example.com`;
}

/**
 * Email Templates
 */
const emailTemplates = {
  /**
   * New HAC Request Template (to Roman)
   */
  newHACRequest: (hacRequest) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New HAC Request</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">🔔 New HAC Request</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Human-Assisted Collaboration System</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
          <h2 style="color: #dc2626; margin-top: 0;">Request Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; font-weight: bold; width: 30%;">Request ID:</td>
              <td style="padding: 8px 0;">${hacRequest.id}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; font-weight: bold;">Case ID:</td>
              <td style="padding: 8px 0;">${hacRequest.caseId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; font-weight: bold;">Type:</td>
              <td style="padding: 8px 0;">${hacRequest.type}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; font-weight: bold;">Submitted By:</td>
              <td style="padding: 8px 0;">${hacRequest.submittedBy}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Submitted At:</td>
              <td style="padding: 8px 0;">${new Date(hacRequest.submittedAt).toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-top: 20px;">
          <h3 style="color: #374151; margin-top: 0;">Requested Changes:</h3>
          <pre style="background: #f3f4f6; padding: 15px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; font-size: 14px;">${JSON.stringify(hacRequest.payload, null, 2)}</pre>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #fef2f2; border-radius: 8px;">
          <p style="margin: 0; color: #7f1d1d; font-weight: bold;">⚠️ This request requires manual review and approval</p>
          <p style="margin: 10px 0 0 0; color: #991b1b;">Please review the request and approve/decline via the HAC admin interface</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 4px; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">This is an automated notification from the Polish Citizenship Portal HAC system.</p>
        </div>
      </body>
      </html>
    `;
  },

  /**
   * HAC Approved Template (to case owner/client)
   */
  hacApproved: (hacRequest, caseOwnerEmail) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HAC Request Approved</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">✅ Request Approved</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your case has been updated</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a;">
          <h2 style="color: #15803d; margin-top: 0;">Update Applied Successfully</h2>
          <p style="margin: 0; color: #166534;">The requested changes to your case have been reviewed and approved. Your case information has been updated accordingly.</p>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-top: 20px;">
          <h3 style="color: #374151; margin-top: 0;">Request Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; font-weight: bold; width: 30%;">Case ID:</td>
              <td style="padding: 8px 0;">${hacRequest.caseId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; font-weight: bold;">Update Type:</td>
              <td style="padding: 8px 0;">${hacRequest.type}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px 0; font-weight: bold;">Approved By:</td>
              <td style="padding: 8px 0;">${hacRequest.approvedBy}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Approved At:</td>
              <td style="padding: 8px 0;">${new Date(hacRequest.approvedAt).toLocaleString()}</td>
            </tr>
          </table>
          
          ${hacRequest.comments ? `
            <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold; color: #334155;">Comments:</p>
              <p style="margin: 5px 0 0 0; color: #475569;">${hacRequest.comments}</p>
            </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px;">
          <p style="margin: 0; color: #0c4a6e; font-weight: bold;">📋 Next Steps</p>
          <p style="margin: 10px 0 0 0; color: #0369a1;">You can view your updated case information in your client portal</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 4px; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">This is an automated notification from Polish Citizenship Portal.</p>
        </div>
      </body>
      </html>
    `;
  },

  /**
   * Case Stage Change Template (to client)
   */
  caseStageChange: (caseId, oldStage, newStage, clientEmail, notes = '') => {
    const stageDescriptions = {
      initial_assessment: '🔍 Initial Assessment - Reviewing your eligibility',
      document_collection: '📋 Document Collection - Gathering required documents',
      archive_search: '🔍 Archive Research - Searching Polish archives',
      translation: '🌐 Translation - Translating documents to Polish',
      submission: '🚀 Application Submitted - Filed with Polish authorities',
      review: '⏳ Under Review - Polish government reviewing application',
      decision: '📋 Decision Received - Official decision available',
      completed: '🎉 Completed - Congratulations! Process complete'
    };

    const currentStageDesc = stageDescriptions[newStage] || `📄 ${newStage}`;
    const previousStageDesc = stageDescriptions[oldStage] || `📄 ${oldStage}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Case Status Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">📈 Case Status Update</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Case ID: ${caseId}</p>
        </div>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <h2 style="color: #1e40af; margin-top: 0;">Status Change</h2>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">Previous Status:</p>
            <p style="margin: 5px 0; font-weight: bold; color: #475569;">${previousStageDesc}</p>
          </div>
          <div style="text-align: center; margin: 15px 0;">
            <span style="font-size: 24px;">⬇️</span>
          </div>
          <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0; border: 2px solid #3b82f6;">
            <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: bold;">New Status:</p>
            <p style="margin: 5px 0; font-weight: bold; color: #1e40af; font-size: 16px;">${currentStageDesc}</p>
          </div>
        </div>
        
        ${notes ? `
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Additional Information:</h3>
            <p style="margin: 0; color: #4b5563; background: #f9fafb; padding: 15px; border-radius: 4px;">${notes}</p>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;">
          <p style="margin: 0; color: #334155; font-weight: bold;">💼 Your Polish Citizenship Journey</p>
          <p style="margin: 10px 0 0 0; color: #475569;">We'll continue to keep you updated on your progress</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 4px; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">This is an automated notification from Polish Citizenship Portal. Case updated at ${new Date().toLocaleString()}.</p>
        </div>
      </body>
      </html>
    `;
  }
};

/**
 * Notification Functions
 */

/**
 * Send new HAC request notification to Roman
 */
async function sendNewHACNotification(hacRequest) {
  const settings = await loadSettings();
  
  if (!settings.hacNotifications.newRequestToRoman) {
    console.log('📧 HAC new request notifications are disabled');
    return { success: true, skipped: true, reason: 'HAC new request notifications disabled' };
  }

  const subject = `🔔 New HAC Request: ${hacRequest.type} for Case ${hacRequest.caseId}`;
  const html = emailTemplates.newHACRequest(hacRequest);
  
  return await sendEmail(
    settings.romanEmail,
    subject,
    html,
    {
      templateType: 'newHACRequest',
      caseId: hacRequest.caseId,
      hacRequestId: hacRequest.id
    }
  );
}

/**
 * Load case language preference from case file
 * @param {string} caseId - Case ID to load language for
 * @returns {string} Language code ('en' or 'pl')
 */
async function loadCaseLanguagePreference(caseId) {
  try {
    // Try to read case.json from data/cases directory first
    const caseJsonPath = path.join(process.cwd(), 'data', 'cases', caseId, 'case.json');
    try {
      const caseData = await fs.readFile(caseJsonPath, 'utf8');
      const parsedCase = JSON.parse(caseData);
      return parsedCase.preferredLanguage || 'en';
    } catch {
      // If not found, try portal/case.json location
      const portalCaseJsonPath = path.join(process.cwd(), 'data', 'cases', caseId, 'portal', 'case.json');
      const caseData = await fs.readFile(portalCaseJsonPath, 'utf8');
      const parsedCase = JSON.parse(caseData);
      return parsedCase.preferredLanguage || 'en';
    }
  } catch (error) {
    console.warn(`Could not load language preference for case ${caseId}:`, error.message);
    return 'en'; // Default fallback
  }
}

/**
 * Send HAC approval notification to case owner
 */
async function sendHACApprovalNotification(hacRequest) {
  const settings = await loadSettings();
  
  if (!settings.hacNotifications.approvalToOwner) {
    console.log('📧 HAC approval notifications are disabled');
    return { success: true, skipped: true, reason: 'HAC approval notifications disabled' };
  }

  // Load case language preference
  const preferredLanguage = await loadCaseLanguagePreference(hacRequest.caseId);
  
  const clientEmail = generateMockClientEmail(hacRequest.caseId);
  const subject = `✅ Your Case Update Has Been Approved - Case ${hacRequest.caseId}`;
  
  // Generate email using case-specific language
  const html = await loadEmailTemplate(preferredLanguage, {
    hacRequest,
    clientEmail,
    templateType: 'hacApproved'
  });
  
  return await sendEmail(
    clientEmail,
    subject,
    html,
    {
      templateType: 'hacApproved',
      caseId: hacRequest.caseId,
      hacRequestId: hacRequest.id,
      preferredLanguage: preferredLanguage
    }
  );
}

/**
 * Send case stage change notification to client
 */
async function sendCaseStageChangeNotification(caseId, oldStage, newStage, notes = '') {
  const settings = await loadSettings();
  
  if (!settings.caseNotifications.stageChangesToClients) {
    console.log('📧 Case stage change notifications are disabled');
    return { success: true, skipped: true, reason: 'Case stage change notifications disabled' };
  }

  // Load case language preference
  const preferredLanguage = await loadCaseLanguagePreference(caseId);
  
  const clientEmail = generateMockClientEmail(caseId);
  const subject = `📈 Case Status Update: ${newStage.replace('_', ' ').toUpperCase()} - Case ${caseId}`;
  
  // Generate email using case-specific language
  const html = await loadEmailTemplate(preferredLanguage, {
    caseId,
    oldStage,
    newStage,
    clientEmail,
    notes,
    templateType: 'caseStageChange'
  });
  
  return await sendEmail(
    clientEmail,
    subject,
    html,
    {
      templateType: 'caseStageChange',
      caseId: caseId,
      oldStage: oldStage,
      newStage: newStage,
      preferredLanguage: preferredLanguage
    }
  );
}

export {
  sendEmail,
  loadEmailTemplate,
  loadCaseLanguagePreference,
  loadSettings,
  saveSettings,
  generateMockClientEmail,
  sendNewHACNotification,
  sendHACApprovalNotification,
  sendCaseStageChangeNotification,
  emailTemplates,
  DEFAULT_SETTINGS
};