import * as nodemailer from 'nodemailer';
import type { User } from '@shared/schema';

// For development, we'll use console logging
// In production, you would configure a real email service
const isDevelopment = true; // Always use development mode for now

// Create a console logger for development
const transporter = isDevelopment
  ? {
      sendMail: async (options: any) => {
        console.log('📧 Email would be sent:');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('HTML:', options.html?.substring(0, 200) + '...');
        return Promise.resolve({ messageId: 'dev-message-id' });
      }
    }
  : nodemailer.createTransport({
      // Configure your production email service here
      // Example for SendGrid:
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY || '',
      },
    });

export async function sendEmailVerification(user: User, verificationUrl: string): Promise<void> {
  const emailContent = `
    <h2>Welcome to Polish Citizenship Services!</h2>
    <p>Hello ${user.firstName || 'there'},</p>
    <p>Thank you for registering with us. Please verify your email address by clicking the link below:</p>
    <p><a href="${verificationUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a></p>
    <p>Or copy and paste this link into your browser:</p>
    <p>${verificationUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <p>Best regards,<br>Polish Citizenship Services Team</p>
  `;

  if (isDevelopment) {
    console.log('📧 Email Verification Link:', verificationUrl);
    console.log('Email would be sent to:', user.email);
    return;
  }

  try {
    await transporter.sendMail({
      from: '"Polish Citizenship Services" <noreply@polishcitizenship.com>',
      to: user.email,
      subject: 'Verify Your Email - Polish Citizenship Services',
      html: emailContent,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    // In production, you might want to retry or use a queue
  }
}

export async function sendCaseApprovalNotification(user: User, approved: boolean, notes?: string): Promise<void> {
  const subject = approved ? 'Your Case Has Been Approved!' : 'Case Review Update';
  const emailContent = approved
    ? `
      <h2>Congratulations! Your Case Has Been Approved</h2>
      <p>Dear ${user.firstName || 'Client'},</p>
      <p>We're excited to inform you that your Polish citizenship case has been approved!</p>
      <p>Our team has reviewed your information and we're ready to proceed with your application.</p>
      ${notes ? `<p><strong>Notes from our team:</strong> ${notes}</p>` : ''}
      <p>Your next steps:</p>
      <ul>
        <li>Complete your dashboard profile</li>
        <li>Upload required documents</li>
        <li>Schedule a consultation with our experts</li>
      </ul>
      <p><a href="${process.env.BASE_URL || 'http://localhost:5000'}/dashboard" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Dashboard</a></p>
      <p>Best regards,<br>Polish Citizenship Services Team</p>
    `
    : `
      <h2>Case Review Update</h2>
      <p>Dear ${user.firstName || 'Client'},</p>
      <p>Thank you for your application. After reviewing your case, we need some additional information.</p>
      ${notes ? `<p><strong>Notes from our team:</strong> ${notes}</p>` : ''}
      <p>Please contact us to discuss your case further.</p>
      <p>Best regards,<br>Polish Citizenship Services Team</p>
    `;

  if (isDevelopment) {
    console.log('📧 Case Approval Notification:');
    console.log('Approved:', approved);
    console.log('Email would be sent to:', user.email);
    console.log('Notes:', notes);
    return;
  }

  try {
    await transporter.sendMail({
      from: '"Polish Citizenship Services" <noreply@polishcitizenship.com>',
      to: user.email,
      subject,
      html: emailContent,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendWelcomeEmail(user: User): Promise<void> {
  const emailContent = `
    <h2>Welcome to Polish Citizenship Services!</h2>
    <p>Dear ${user.firstName || 'Client'},</p>
    <p>Thank you for choosing us for your Polish citizenship journey.</p>
    <p>Your account has been successfully created with the ${user.serviceType || 'standard'} package.</p>
    <p>You can now access your personalized dashboard where you can:</p>
    <ul>
      <li>Track your application progress</li>
      <li>Upload and manage documents</li>
      <li>Build your family tree</li>
      <li>Schedule consultations</li>
      <li>Receive real-time updates</li>
    </ul>
    <p><a href="${process.env.BASE_URL || 'http://localhost:5000'}/dashboard" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Access Your Dashboard</a></p>
    <p>If you have any questions, our team is here to help!</p>
    <p>Best regards,<br>Polish Citizenship Services Team</p>
  `;

  if (isDevelopment) {
    console.log('📧 Welcome Email:');
    console.log('Email would be sent to:', user.email);
    return;
  }

  try {
    await transporter.sendMail({
      from: '"Polish Citizenship Services" <noreply@polishcitizenship.com>',
      to: user.email,
      subject: 'Welcome to Polish Citizenship Services',
      html: emailContent,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Case status change notification templates
export async function sendCaseStatusUpdateNotification(
  user: User, 
  oldStatus: string, 
  newStatus: string, 
  caseId: string,
  notes?: string
): Promise<void> {
  const statusMessages = {
    initial_assessment: {
      subject: '🔍 Case Assessment Started',
      title: 'Your Case Assessment Has Begun',
      message: 'Our experts have started reviewing your Polish citizenship eligibility. We\'ll analyze your family history and documentation requirements.',
      nextSteps: ['Gather family documents', 'Complete eligibility questionnaire', 'Wait for initial assessment results']
    },
    document_collection: {
      subject: '📋 Document Collection Phase',
      title: 'Time to Gather Your Documents',
      message: 'Your case has progressed to the document collection phase. Please prepare and upload the required documents listed in your dashboard.',
      nextSteps: ['Review document checklist', 'Upload required documents', 'Schedule consultation if needed']
    },
    archive_search: {
      subject: '🔍 Archive Research Initiated',
      title: 'Searching Polish Archives',
      message: 'We\'ve initiated a search of Polish archives for your ancestor\'s records. This process typically takes 2-4 weeks.',
      nextSteps: ['Monitor dashboard for updates', 'Prepare remaining documents', 'No action required from you at this time']
    },
    translation: {
      subject: '🌐 Document Translation Phase',
      title: 'Translating Your Documents',
      message: 'Your documents are being professionally translated into Polish by certified translators.',
      nextSteps: ['Review translated documents', 'Approve translations', 'Prepare for submission']
    },
    submission: {
      subject: '🚀 Application Submitted!',
      title: 'Your Application Has Been Submitted',
      message: 'Great news! Your Polish citizenship application has been officially submitted to the Polish authorities.',
      nextSteps: ['Monitor application status', 'Respond to any government requests', 'Estimated processing time: 6-12 months']
    },
    review: {
      subject: '⏳ Under Government Review',
      title: 'Application Under Review',
      message: 'Your application is currently being reviewed by Polish government officials. This is the final stage before a decision.',
      nextSteps: ['Wait for official decision', 'Be ready to provide additional info if requested', 'Estimated completion: 2-8 weeks']
    },
    decision: {
      subject: '📋 Decision Received',
      title: 'Official Decision Received',
      message: 'We\'ve received the official decision on your Polish citizenship application. Please check your dashboard for details.',
      nextSteps: ['Review decision details', 'Follow next steps based on decision', 'Contact us for any questions']
    },
    completed: {
      subject: '🎉 Congratulations! Application Complete',
      title: 'Your Polish Citizenship Journey is Complete',
      message: 'Congratulations! Your Polish citizenship application has been successfully completed. Welcome to the European Union!',
      nextSteps: ['Download your certificates', 'Apply for Polish passport if desired', 'Enjoy your EU citizenship benefits']
    }
  };

  const statusInfo = statusMessages[newStatus as keyof typeof statusMessages];
  if (!statusInfo) {
    console.log(`📧 No email template for status: ${newStatus}`);
    return;
  }

  const progressPercentage = {
    initial_assessment: 10,
    document_collection: 25,
    archive_search: 40,
    translation: 60,
    submission: 75,
    review: 85,
    decision: 95,
    completed: 100
  };

  const currentProgress = progressPercentage[newStatus as keyof typeof progressPercentage] || 0;

  const emailContent = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">${statusInfo.title}</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Case ID: ${caseId}</p>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; margin-bottom: 20px;">Dear ${user.firstName || 'Client'},</p>
          
          <p style="font-size: 16px; margin-bottom: 25px;">${statusInfo.message}</p>
          
          ${notes ? `
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold; color: #1976d2;">Additional Notes:</p>
              <p style="margin: 8px 0 0 0; color: #1565c0;">${notes}</p>
            </div>
          ` : ''}
          
          <!-- Progress Bar -->
          <div style="margin: 25px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: bold; color: #dc2626;">Progress: ${currentProgress}%</span>
              <span style="font-size: 14px; color: #666;">Status: ${newStatus.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div style="width: 100%; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
              <div style="width: ${currentProgress}%; height: 100%; background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%); transition: width 0.5s ease;"></div>
            </div>
          </div>
          
          <div style="margin: 25px 0;">
            <h3 style="color: #dc2626; margin-bottom: 15px;">📋 Your Next Steps:</h3>
            <ul style="padding-left: 20px; margin: 0;">
              ${statusInfo.nextSteps.map(step => `<li style="margin: 8px 0; font-size: 15px;">${step}</li>`).join('')}
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.BASE_URL || 'http://localhost:5000'}/dashboard" 
               style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      display: inline-block; 
                      font-weight: bold;
                      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);">
              View Dashboard →
            </a>
          </div>
          
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; text-align: center; color: #666;">
            <p style="margin: 0; font-size: 14px;">Questions? Reply to this email or contact our support team.</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Best regards,<br><strong>Polish Citizenship Services Team</strong></p>
          </div>
        </div>
      </div>
    </div>
  `;

  if (isDevelopment) {
    console.log('📧 Case Status Update Notification:');
    console.log(`Old Status: ${oldStatus} → New Status: ${newStatus}`);
    console.log('Email would be sent to:', user.email);
    console.log('Subject:', statusInfo.subject);
    console.log('Notes:', notes);
    return;
  }

  try {
    await transporter.sendMail({
      from: '"Polish Citizenship Services" <noreply@polishcitizenship.com>',
      to: user.email,
      subject: statusInfo.subject,
      html: emailContent,
    });
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
}

// Document status change notifications
export async function sendDocumentStatusUpdateNotification(
  user: User,
  documentName: string,
  oldStatus: string,
  newStatus: string,
  caseId: string,
  notes?: string
): Promise<void> {
  const statusMessages = {
    uploaded: {
      subject: '📄 Document Received',
      title: 'Document Successfully Uploaded',
      icon: '✅',
      color: '#2e7d32'
    },
    verified: {
      subject: '✅ Document Verified',
      title: 'Document Approved',
      icon: '🎉',
      color: '#2e7d32'
    },
    'in-review': {
      subject: '🔍 Document Under Review',
      title: 'Document Being Reviewed',
      icon: '⏳',
      color: '#f57c00'
    },
    missing: {
      subject: '⚠️ Document Required',
      title: 'Additional Document Needed',
      icon: '📋',
      color: '#d32f2f'
    }
  };

  const statusInfo = statusMessages[newStatus as keyof typeof statusMessages];
  if (!statusInfo) return;

  const emailContent = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="background: ${statusInfo.color}; color: white; padding: 25px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">${statusInfo.icon} ${statusInfo.title}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Case ID: ${caseId}</p>
      </div>
      
      <div style="padding: 30px; background: white; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Dear ${user.firstName || 'Client'},</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #333;">Document: ${documentName}</p>
          <p style="margin: 8px 0 0 0; color: #666;">Status: ${oldStatus} → <strong style="color: ${statusInfo.color};">${newStatus.toUpperCase()}</strong></p>
        </div>
        
        ${notes ? `
          <div style="background: #e8f5e8; border-left: 4px solid #2e7d32; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold;">Notes:</p>
            <p style="margin: 8px 0 0 0;">${notes}</p>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.BASE_URL || 'http://localhost:5000'}/dashboard" 
             style="background: ${statusInfo.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Dashboard
          </a>
        </div>
        
        <p style="margin: 20px 0 0 0; text-align: center; color: #666; font-size: 14px;">
          Best regards,<br>Polish Citizenship Services Team
        </p>
      </div>
    </div>
  `;

  if (isDevelopment) {
    console.log('📧 Document Status Update:');
    console.log(`Document: ${documentName}`);
    console.log(`Status: ${oldStatus} → ${newStatus}`);
    console.log('Email would be sent to:', user.email);
    return;
  }

  try {
    await transporter.sendMail({
      from: '"Polish Citizenship Services" <noreply@polishcitizenship.com>',
      to: user.email,
      subject: statusInfo.subject,
      html: emailContent,
    });
  } catch (error) {
    console.error('Error sending document status email:', error);
  }
}