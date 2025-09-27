import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { users, caseProgress, documents } from "@shared/schema";
import { sendCaseStatusUpdateNotification, sendDocumentStatusUpdateNotification } from "./email";

// Email notification preferences table
export const emailNotificationPreferences = `
CREATE TABLE IF NOT EXISTS email_notification_preferences (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_status_updates BOOLEAN DEFAULT true,
  document_status_updates BOOLEAN DEFAULT true,
  milestone_notifications BOOLEAN DEFAULT true,
  weekly_progress_reports BOOLEAN DEFAULT false,
  admin_announcements BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
`;

// Notification history table for tracking sent emails
export const notificationHistory = `
CREATE TABLE IF NOT EXISTS notification_history (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR NOT NULL, -- 'case_status', 'document_status', 'milestone', etc.
  reference_id VARCHAR, -- case_id, document_id, etc.
  old_value VARCHAR,
  new_value VARCHAR,
  email_subject VARCHAR,
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR DEFAULT 'sent' -- 'sent', 'failed', 'pending'
);
`;

// Initialize notification tables
export async function initializeNotificationTables() {
  try {
    // Skip database initialization in test environment
    if (process.env.NODE_ENV === 'test' || process.env.QA_MODE === '1') {
      console.log('🧪 Skipping notification table initialization in test mode');
      return;
    }
    
    // Check if db is available before executing
    if (!db) {
      console.warn('⚠️  Database not available, skipping notification table initialization');
      return;
    }
    
    await db.execute(emailNotificationPreferences as any);
    await db.execute(notificationHistory as any);
    console.log('✅ Email notification tables initialized');
  } catch (error) {
    console.error('Error initializing notification tables:', error);
    console.warn('⚠️  Continuing without notification tables - app will still function');
    // Don't crash the app due to database connection issues
    // Notification features will be disabled but core app functionality remains
  }
}

// Check if user has notifications enabled for a specific type
async function getUserNotificationPreference(userId: string, preferenceType: string): Promise<boolean> {
  try {
    const result = await db.execute(`
      SELECT ${preferenceType} 
      FROM email_notification_preferences 
      WHERE user_id = $1
    ` as any, [userId]);
    
    if (result.rows && result.rows.length > 0) {
      return result.rows[0][preferenceType] === true;
    }
    
    // Default to true if no preferences set
    return true;
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    return true; // Default to enabled
  }
}

// Log notification to history
async function logNotification(
  userId: string,
  notificationType: string,
  referenceId: string,
  oldValue: string,
  newValue: string,
  emailSubject: string,
  status: 'sent' | 'failed' | 'pending' = 'sent'
) {
  try {
    await db.execute(`
      INSERT INTO notification_history (user_id, notification_type, reference_id, old_value, new_value, email_subject, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    ` as any, [userId, notificationType, referenceId, oldValue, newValue, emailSubject, status]);
  } catch (error) {
    console.error('Error logging notification:', error);
  }
}

// Monitor case status changes and send notifications
export async function handleCaseStatusChange(
  userId: string,
  caseId: string,
  oldStatus: string,
  newStatus: string,
  notes?: string
) {
  try {
    // Check if user wants case status notifications
    const notificationsEnabled = await getUserNotificationPreference(userId, 'case_status_updates');
    if (!notificationsEnabled) {
      console.log(`📧 Case status notifications disabled for user: ${userId}`);
      return;
    }

    // Get user details
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      console.error(`User not found: ${userId}`);
      return;
    }

    const userData = user[0];
    
    // Send notification email
    await sendCaseStatusUpdateNotification(userData, oldStatus, newStatus, caseId, notes);
    
    // Log the notification
    await logNotification(
      userId,
      'case_status',
      caseId,
      oldStatus,
      newStatus,
      `Case Status Updated: ${newStatus.replace('_', ' ')}`,
      'sent'
    );
    
    console.log(`📧 Case status notification sent: ${userId} (${oldStatus} → ${newStatus})`);
  } catch (error) {
    console.error('Error handling case status change notification:', error);
    
    // Log failed notification
    try {
      await logNotification(
        userId,
        'case_status',
        caseId,
        oldStatus,
        newStatus,
        `Case Status Updated: ${newStatus.replace('_', ' ')}`,
        'failed'
      );
    } catch (logError) {
      console.error('Error logging failed notification:', logError);
    }
  }
}

// Monitor document status changes and send notifications
export async function handleDocumentStatusChange(
  userId: string,
  documentName: string,
  caseId: string,
  oldStatus: string,
  newStatus: string,
  notes?: string
) {
  try {
    // Check if user wants document status notifications
    const notificationsEnabled = await getUserNotificationPreference(userId, 'document_status_updates');
    if (!notificationsEnabled) {
      console.log(`📧 Document status notifications disabled for user: ${userId}`);
      return;
    }

    // Get user details
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      console.error(`User not found: ${userId}`);
      return;
    }

    const userData = user[0];
    
    // Send notification email
    await sendDocumentStatusUpdateNotification(userData, documentName, oldStatus, newStatus, caseId, notes);
    
    // Log the notification
    await logNotification(
      userId,
      'document_status',
      documentName,
      oldStatus,
      newStatus,
      `Document ${newStatus}: ${documentName}`,
      'sent'
    );
    
    console.log(`📧 Document status notification sent: ${userId} (${documentName}: ${oldStatus} → ${newStatus})`);
  } catch (error) {
    console.error('Error handling document status change notification:', error);
    
    // Log failed notification
    try {
      await logNotification(
        userId,
        'document_status',
        documentName,
        oldStatus,
        newStatus,
        `Document ${newStatus}: ${documentName}`,
        'failed'
      );
    } catch (logError) {
      console.error('Error logging failed notification:', logError);
    }
  }
}

// Send milestone notifications (special achievements)
export async function sendMilestoneNotification(
  userId: string,
  milestone: string,
  caseId: string,
  customMessage?: string
) {
  try {
    // Check if user wants milestone notifications
    const notificationsEnabled = await getUserNotificationPreference(userId, 'milestone_notifications');
    if (!notificationsEnabled) {
      console.log(`📧 Milestone notifications disabled for user: ${userId}`);
      return;
    }

    // Get user details
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      console.error(`User not found: ${userId}`);
      return;
    }

    const userData = user[0];
    
    const milestoneMessages = {
      '50_percent_complete': {
        subject: '🎉 Halfway There! 50% Complete',
        title: 'You\'re Halfway to Polish Citizenship!',
        message: customMessage || 'Congratulations! You\'ve completed 50% of your Polish citizenship journey. Keep up the great work!'
      },
      'documents_complete': {
        subject: '📄 All Documents Collected!',
        title: 'Document Collection Complete',
        message: customMessage || 'Excellent news! You\'ve successfully uploaded all required documents. We\'re now processing your application.'
      },
      'eligibility_confirmed': {
        subject: '✅ Eligibility Confirmed',
        title: 'Your Polish Citizenship Eligibility Confirmed',
        message: customMessage || 'Great news! We\'ve confirmed your eligibility for Polish citizenship. Your case is moving forward.'
      }
    };

    const milestoneInfo = milestoneMessages[milestone as keyof typeof milestoneMessages];
    if (!milestoneInfo) {
      console.log(`📧 No template for milestone: ${milestone}`);
      return;
    }

    // Use case status template but with milestone info
    await sendCaseStatusUpdateNotification(
      userData, 
      'milestone', 
      milestone, 
      caseId, 
      milestoneInfo.message
    );
    
    // Log the milestone notification
    await logNotification(
      userId,
      'milestone',
      caseId,
      '',
      milestone,
      milestoneInfo.subject,
      'sent'
    );
    
    console.log(`📧 Milestone notification sent: ${userId} (${milestone})`);
  } catch (error) {
    console.error('Error sending milestone notification:', error);
  }
}

// Get user's notification preferences
export async function getUserNotificationPreferences(userId: string) {
  try {
    const result = await db.execute(`
      SELECT * FROM email_notification_preferences WHERE user_id = $1
    ` as any, [userId]);
    
    if (result.rows && result.rows.length > 0) {
      return result.rows[0];
    }
    
    // Create default preferences if none exist
    await db.execute(`
      INSERT INTO email_notification_preferences (user_id) VALUES ($1)
    ` as any, [userId]);
    
    return {
      user_id: userId,
      case_status_updates: true,
      document_status_updates: true,
      milestone_notifications: true,
      weekly_progress_reports: false,
      admin_announcements: true
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
}

// Update user's notification preferences
export async function updateUserNotificationPreferences(userId: string, preferences: any) {
  try {
    const setClause = Object.keys(preferences)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [userId, ...Object.values(preferences)];
    
    await db.execute(`
      UPDATE email_notification_preferences 
      SET ${setClause}, updated_at = NOW()
      WHERE user_id = $1
    ` as any, values);
    
    console.log(`📧 Updated notification preferences for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
}

// Get notification history for a user
export async function getNotificationHistory(userId: string, limit: number = 50) {
  try {
    const result = await db.execute(`
      SELECT * FROM notification_history 
      WHERE user_id = $1 
      ORDER BY sent_at DESC 
      LIMIT $2
    ` as any, [userId, limit]);
    
    return result.rows || [];
  } catch (error) {
    console.error('Error getting notification history:', error);
    return [];
  }
}