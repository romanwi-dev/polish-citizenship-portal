import nodemailer from 'nodemailer';
import { Lead } from '@shared/schema';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

interface LeadEmailData {
  lead: Lead;
  inviteLink: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
      console.warn('SMTP configuration incomplete. Email service disabled.');
      return;
    }

    this.config = {
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      user: SMTP_USER,
      pass: SMTP_PASS,
      from: FROM_EMAIL
    };

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.port === 465, // true for 465, false for other ports
      auth: {
        user: this.config.user,
        pass: this.config.pass
      }
    });

    console.log('✅ Email service initialized with SMTP configuration');
  }

  async sendLeadInvitation(data: LeadEmailData): Promise<boolean> {
    if (!this.transporter || !this.config) {
      console.error('Email service not configured');
      return false;
    }

    const { lead, inviteLink } = data;
    const subject = 'Your Polish citizenship pre-check';
    
    const htmlBody = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #1a365d;">Welcome ${lead.name || 'there'}!</h2>
        
        <p>Thank you for completing our Polish citizenship eligibility assessment.</p>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">Your Assessment Results</h3>
          <p><strong>Eligibility Tier:</strong> ${lead.tier}</p>
          ${lead.score ? `<p><strong>Score:</strong> ${lead.score}/100</p>` : ''}
        </div>

        <p>Based on your responses, we've prepared a personalized Family Tree workspace to help you organize your documentation and next steps.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" 
             style="background: #4299e1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Open your Family Tree
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This link is secure and personalized for you. Please keep it private and bookmark it for future access.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    const textBody = `
Welcome ${lead.name || 'there'}!

Thank you for completing our Polish citizenship eligibility assessment.

Your Assessment Results:
- Eligibility Tier: ${lead.tier}
${lead.score ? `- Score: ${lead.score}/100` : ''}

Based on your responses, we've prepared a personalized Family Tree workspace to help you organize your documentation and next steps.

Open your Family Tree: ${inviteLink}

This link is secure and personalized for you. Please keep it private and bookmark it for future access.

This is an automated message. Please do not reply to this email.
    `;

    try {
      const result = await this.transporter.sendMail({
        from: `"Polish Citizenship Services" <${this.config.from}>`,
        to: lead.email,
        subject,
        text: textBody,
        html: htmlBody
      });

      console.log(`✅ Lead invitation sent to ${lead.email} (Message ID: ${result.messageId})`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send lead invitation to ${lead.email}:`, error);
      return false;
    }
  }

  async sendStaffAlert(lead: Lead): Promise<boolean> {
    if (!this.transporter || !this.config) {
      console.error('Email service not configured');
      return false;
    }

    const staffEmail = process.env.STAFF_ALERT_EMAIL;
    if (!staffEmail) {
      console.warn('STAFF_ALERT_EMAIL not configured, skipping staff alert');
      return false;
    }

    const subject = `New ${lead.tier}-tier lead: ${lead.email}`;
    
    const htmlBody = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #1a365d;">New Lead Alert</h2>
        
        <div style="background: ${lead.tier === 'A' ? '#d4edda' : '#fff3cd'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Tier ${lead.tier} Lead</h3>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Name:</strong> ${lead.name || 'Not provided'}</p>
          <p><strong>Score:</strong> ${lead.score || 'N/A'}</p>
          <p><strong>Submitted:</strong> ${lead.createdAt}</p>
        </div>
        
        <p>This lead has been automatically processed and invited to their personalized workspace.</p>
        
        <p style="color: #666; font-size: 14px;">
          ${lead.tier === 'A' ? 'High-priority lead - consider immediate follow-up.' : 'Medium-priority lead - add to follow-up queue.'}
        </p>
      </div>
    `;

    try {
      const result = await this.transporter.sendMail({
        from: `"Polish Citizenship System" <${this.config.from}>`,
        to: staffEmail,
        subject,
        html: htmlBody
      });

      console.log(`✅ Staff alert sent for lead ${lead.email} (Message ID: ${result.messageId})`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send staff alert for lead ${lead.email}:`, error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();