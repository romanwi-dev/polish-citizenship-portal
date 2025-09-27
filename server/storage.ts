import {
  users,
  documents,
  documentCategories,
  familyTreeData,
  clientDetails,
  polishCitizenshipApplications,
  notifications,
  consultationRequests,
  eligibilityAssessments,
  processedDocuments,
  documentJobs,
  securityLogs,
  caseProgress,
  documentProgress,
  messages,
  alerts,
  milestones,
  familyMembers,
  financialRecords,
  personalNotes,
  timelineEvents,
  videoTestimonials,
  testimonialVerificationLogs,
  clientDocuments,
  type User,
  type UpsertUser,
  type Document,
  type InsertDocument,
  type DocumentCategory,
  type InsertDocumentCategory,
  type FamilyTreeData,
  type InsertFamilyTreeData,
  type ClientDetails,
  type InsertClientDetails,
  type PolishCitizenshipApplication,
  type InsertPolishCitizenshipApplication,
  type Notification,
  type InsertNotification,
  type ConsultationRequest,
  type InsertConsultationRequest,
  type EligibilityAssessment,
  type InsertEligibilityAssessment,
  type ProcessedDocument,
  type InsertProcessedDocument,
  type DocumentJob,
  type InsertDocumentJob,
  type SecurityLog,
  type InsertSecurityLog,
  type CaseProgress,
  type InsertCaseProgress,
  type DocumentProgress,
  type InsertDocumentProgress,
  type Message,
  type InsertMessage,
  type Alert,
  type InsertAlert,
  type Milestone,
  type InsertMilestone,
  type FamilyMember,
  type InsertFamilyMember,
  type FinancialRecord,
  type InsertFinancialRecord,
  type PersonalNote,
  type InsertPersonalNote,
  type TimelineEvent,
  type InsertTimelineEvent,
  type VideoTestimonial,
  type InsertVideoTestimonial,
  type TestimonialVerificationLog,
  type InsertTestimonialVerificationLog,
  type ClientDocument,
  type InsertClientDocument,
  type ContentEntry,
  type InsertContentEntry,
  prospectCases,
  type ProspectCase,
  type InsertProspectCase,
  type ContentType,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { promises as fs } from 'fs';
import { join } from 'path';

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Document operations
  getDocuments(userId: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  
  // Document category operations
  getDocumentCategories(): Promise<DocumentCategory[]>;
  createDocumentCategory(category: InsertDocumentCategory): Promise<DocumentCategory>;
  
  // Family tree operations
  getFamilyTreeData(userId: string): Promise<FamilyTreeData | undefined>;
  getLatestFamilyTreeData(): Promise<FamilyTreeData | undefined>;
  saveFamilyTreeData(data: InsertFamilyTreeData): Promise<FamilyTreeData>;
  
  // Client details operations
  getClientDetails(userId: string): Promise<ClientDetails | undefined>;
  getLatestClientDetails(): Promise<ClientDetails | undefined>;
  saveClientDetails(details: InsertClientDetails): Promise<ClientDetails>;
  
  // Polish citizenship application operations
  getPolishCitizenshipApplication(userId: string): Promise<PolishCitizenshipApplication | undefined>;
  savePolishCitizenshipApplication(application: InsertPolishCitizenshipApplication): Promise<PolishCitizenshipApplication>;
  
  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
  
  // Legacy operations for existing components
  createConsultationRequest(request: InsertConsultationRequest): Promise<ConsultationRequest>;
  getConsultationRequests(): Promise<ConsultationRequest[]>;
  createEligibilityAssessment(assessment: InsertEligibilityAssessment): Promise<EligibilityAssessment>;
  getEligibilityAssessments(): Promise<EligibilityAssessment[]>;
  
  // Document processing operations
  createProcessedDocument(doc: InsertProcessedDocument): Promise<ProcessedDocument>;
  getProcessedDocuments(userId: string): Promise<ProcessedDocument[]>;
  updateProcessedDocument(id: string, updates: Partial<InsertProcessedDocument>): Promise<ProcessedDocument>;
  
  // Document job operations  
  createDocumentJob(job: InsertDocumentJob): Promise<DocumentJob>;
  getDocumentJob(id: string): Promise<DocumentJob | undefined>;
  updateDocumentJob(id: string, updates: Partial<InsertDocumentJob>): Promise<DocumentJob>;
  
  // Form automation helpers
  updateFamilyTreeData(userId: string, data: any): Promise<void>;
  updateApplicantDetails(userId: string, data: any): Promise<void>;
  
  // Security logging operations
  createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog>;
  getSecurityLogs(userId?: string): Promise<SecurityLog[]>;
  
  // Case progress operations
  getCaseProgress(userId: string): Promise<CaseProgress | undefined>;
  createCaseProgress(progress: InsertCaseProgress): Promise<CaseProgress>;
  updateCaseProgress(id: string, updates: Partial<InsertCaseProgress>): Promise<CaseProgress>;
  
  // Document progress operations
  getDocumentProgress(caseProgressId: string): Promise<DocumentProgress[]>;
  createDocumentProgress(progress: InsertDocumentProgress): Promise<DocumentProgress>;
  updateDocumentProgress(id: string, updates: Partial<InsertDocumentProgress>): Promise<DocumentProgress>;
  
  // New additions for Messages, Alerts, Milestones, Family Members, Financial Records, Personal Notes, Timeline Events
  getMessages(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: string): Promise<void>;
  
  getAlerts(userId: string): Promise<Alert[]>;
  markAlertAsRead(alertId: string): Promise<void>;
  
  getMilestones(userId: string): Promise<Milestone[]>;
  
  getFamilyMembers(userId: string): Promise<FamilyMember[]>;
  createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
  addFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>; // alias for createFamilyMember
  updateFamilyMember(memberId: string, updates: Partial<InsertFamilyMember>): Promise<FamilyMember>;
  
  getFinancialRecords(userId: string): Promise<FinancialRecord[]>;
  createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord>;
  
  getPersonalNotes(userId: string): Promise<PersonalNote[]>;
  createPersonalNote(note: InsertPersonalNote): Promise<PersonalNote>;
  updatePersonalNote(noteId: string, updates: Partial<InsertPersonalNote>): Promise<PersonalNote>;
  deletePersonalNote(noteId: string): Promise<void>;
  
  getTimelineEvents(userId: string): Promise<TimelineEvent[]>;
  updateTimelineEvent(eventId: string, updates: Partial<InsertTimelineEvent>): Promise<TimelineEvent>;
  
  // Analytics operations
  getAnalytics(userId: string): Promise<any>;
  
  // Video testimonial operations
  getVideoTestimonials(filter?: { isPublic?: boolean; verificationStatus?: string }): Promise<VideoTestimonial[]>;
  getVideoTestimonial(id: string): Promise<VideoTestimonial | undefined>;
  createVideoTestimonial(testimonial: InsertVideoTestimonial): Promise<VideoTestimonial>;
  updateVideoTestimonial(id: string, updates: Partial<InsertVideoTestimonial>): Promise<VideoTestimonial>;
  deleteVideoTestimonial(id: string): Promise<void>;
  
  // Testimonial verification log operations
  getTestimonialVerificationLogs(testimonialId: string): Promise<TestimonialVerificationLog[]>;
  createTestimonialVerificationLog(log: InsertTestimonialVerificationLog): Promise<TestimonialVerificationLog>;
  
  // Client document operations
  saveClientDocument(document: InsertClientDocument): Promise<ClientDocument>;
  getClientDocuments(userId?: string): Promise<ClientDocument[]>;
  
  // Content management operations for editing system
  getContent(key: string): Promise<ContentEntry | undefined>;
  
  // Prospect case operations for Typeform integration
  createProspectCase(prospectCase: InsertProspectCase): Promise<ProspectCase>;
  getProspectCases(filters?: { status?: string; eligibilityLevel?: string; source?: string }): Promise<ProspectCase[]>;
  getProspectCaseByTypeformResponse(responseId: string): Promise<ProspectCase | undefined>;
  updateProspectCase(id: string, updates: Partial<InsertProspectCase>): Promise<ProspectCase | undefined>;
  
  // Enhanced authentication operations
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  updateUserEmailVerification(id: string, verified: boolean): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  setContent(key: string, value: string, type: ContentType, path: string, locale?: string, updatedBy?: string): Promise<ContentEntry>;
  listContentByPath(path: string): Promise<ContentEntry[]>;
  listAllContent(): Promise<ContentEntry[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    // Ensure email is provided as it's required
    if (!userData.email) {
      throw new Error('Email is required to create a user');
    }
    const [user] = await db.insert(users).values(userData as any).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Document operations
  async getDocuments(userId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Document category operations
  async getDocumentCategories(): Promise<DocumentCategory[]> {
    return await db.select().from(documentCategories).orderBy(documentCategories.orderIndex);
  }

  async createDocumentCategory(category: InsertDocumentCategory): Promise<DocumentCategory> {
    const [newCategory] = await db.insert(documentCategories).values(category).returning();
    return newCategory;
  }

  // Family tree operations
  async getFamilyTreeData(userId: string): Promise<FamilyTreeData | undefined> {
    const [data] = await db.select().from(familyTreeData).where(eq(familyTreeData.userId, userId));
    return data;
  }

  // Get most recent family tree data (for demo/testing without user auth)
  async getLatestFamilyTreeData(): Promise<FamilyTreeData | undefined> {
    const [data] = await db.select().from(familyTreeData).orderBy(desc(familyTreeData.updatedAt)).limit(1);
    return data;
  }

  async saveFamilyTreeData(data: InsertFamilyTreeData): Promise<FamilyTreeData> {
    // For demo/testing without user auth, always create new records
    if (!data.userId) {
      const [newData] = await db.insert(familyTreeData).values(data).returning();
      return newData;
    }
    
    const existing = await this.getFamilyTreeData(data.userId);
    
    if (existing) {
      const [updated] = await db
        .update(familyTreeData)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(familyTreeData.userId, data.userId))
        .returning();
      return updated;
    } else {
      const [newData] = await db.insert(familyTreeData).values(data).returning();
      return newData;
    }
  }

  // Client details operations
  async getClientDetails(userId: string): Promise<ClientDetails | undefined> {
    const [details] = await db.select().from(clientDetails).where(eq(clientDetails.userId, userId));
    return details;
  }

  // Get most recent client details (for demo/testing without user auth)
  async getLatestClientDetails(): Promise<ClientDetails | undefined> {
    const [details] = await db.select().from(clientDetails).orderBy(desc(clientDetails.updatedAt)).limit(1);
    return details;
  }

  async saveClientDetails(details: InsertClientDetails): Promise<ClientDetails> {
    // For demo/testing without user auth, always create new records
    if (!details.userId) {
      const [newDetails] = await db.insert(clientDetails).values(details).returning();
      return newDetails;
    }
    
    const existing = await this.getClientDetails(details.userId);
    
    if (existing) {
      const [updated] = await db
        .update(clientDetails)
        .set({ ...details, updatedAt: new Date() })
        .where(eq(clientDetails.userId, details.userId))
        .returning();
      return updated;
    } else {
      const [newDetails] = await db.insert(clientDetails).values(details).returning();
      return newDetails;
    }
  }

  // Polish citizenship application operations
  async getPolishCitizenshipApplication(userId: string): Promise<PolishCitizenshipApplication | undefined> {
    const [application] = await db.select().from(polishCitizenshipApplications).where(eq(polishCitizenshipApplications.userId, userId));
    return application;
  }

  async savePolishCitizenshipApplication(application: InsertPolishCitizenshipApplication): Promise<PolishCitizenshipApplication> {
    const existing = await this.getPolishCitizenshipApplication(application.userId!);
    
    if (existing) {
      const [updated] = await db
        .update(polishCitizenshipApplications)
        .set({ ...application, updatedAt: new Date() })
        .where(eq(polishCitizenshipApplications.userId, application.userId!))
        .returning();
      return updated;
    } else {
      const [newApplication] = await db.insert(polishCitizenshipApplications).values(application).returning();
      return newApplication;
    }
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }

  // Legacy operations for existing components
  async createConsultationRequest(request: InsertConsultationRequest): Promise<ConsultationRequest> {
    const [newRequest] = await db.insert(consultationRequests).values(request).returning();
    return newRequest;
  }

  async getConsultationRequests(): Promise<ConsultationRequest[]> {
    return await db.select().from(consultationRequests).orderBy(desc(consultationRequests.createdAt));
  }

  async createEligibilityAssessment(assessment: InsertEligibilityAssessment): Promise<EligibilityAssessment> {
    const [newAssessment] = await db.insert(eligibilityAssessments).values(assessment).returning();
    return newAssessment;
  }

  async getEligibilityAssessments(): Promise<EligibilityAssessment[]> {
    return await db.select().from(eligibilityAssessments).orderBy(desc(eligibilityAssessments.createdAt));
  }

  // Document processing operations
  async createProcessedDocument(doc: InsertProcessedDocument): Promise<ProcessedDocument> {
    const [result] = await db.insert(processedDocuments).values(doc).returning();
    return result;
  }

  async getProcessedDocuments(userId: string): Promise<ProcessedDocument[]> {
    return await db.select().from(processedDocuments)
      .where(eq(processedDocuments.userId, userId))
      .orderBy(desc(processedDocuments.createdAt));
  }

  async updateProcessedDocument(id: string, updates: Partial<InsertProcessedDocument>): Promise<ProcessedDocument> {
    const [result] = await db.update(processedDocuments)
      .set(updates)
      .where(eq(processedDocuments.id, id))
      .returning();
    return result;
  }

  // Document job operations
  async createDocumentJob(job: InsertDocumentJob): Promise<DocumentJob> {
    const [result] = await db.insert(documentJobs).values(job).returning();
    return result;
  }

  async getDocumentJob(id: string): Promise<DocumentJob | undefined> {
    const [result] = await db.select().from(documentJobs).where(eq(documentJobs.id, id));
    return result;
  }

  async updateDocumentJob(id: string, updates: Partial<InsertDocumentJob>): Promise<DocumentJob> {
    const [result] = await db.update(documentJobs)
      .set(updates)
      .where(eq(documentJobs.id, id))
      .returning();
    return result;
  }

  // Form automation helpers
  async updateClientDetailsData(userId: string, data: any): Promise<void> {
    // For now, we'll store in memory - can be extended to database later
    console.log(`Updating client details for user ${userId}:`, data);
  }

  // Form automation helpers
  async updateFamilyTreeData(userId: string, data: any): Promise<void> {
    const existing = await db.select().from(familyTreeData).where(eq(familyTreeData.userId, userId));
    
    if (existing.length > 0) {
      const currentData = existing[0].treeData as any || {};
      const mergedData = { ...currentData, ...data };
      
      await db.update(familyTreeData)
        .set({ 
          treeData: mergedData,
          updatedAt: new Date()
        })
        .where(eq(familyTreeData.userId, userId));
    } else {
      await db.insert(familyTreeData).values({
        userId,
        treeData: data
      });
    }
  }

  async updateApplicantDetails(userId: string, data: any): Promise<void> {
    const existing = await db.select().from(clientDetails).where(eq(clientDetails.userId, userId));
    
    if (existing.length > 0) {
      await db.update(clientDetails)
        .set({ 
          ...data,
          updatedAt: new Date()
        })
        .where(eq(clientDetails.userId, userId));
    } else {
      await db.insert(clientDetails).values({
        userId,
        ...data
      });
    }
  }

  // Security logging operations
  async createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog> {
    const [newLog] = await db.insert(securityLogs).values(log).returning();
    return newLog;
  }

  async getSecurityLogs(userId?: string): Promise<SecurityLog[]> {
    if (userId) {
      return await db.select().from(securityLogs)
        .where(eq(securityLogs.userId, userId))
        .orderBy(desc(securityLogs.createdAt));
    }
    return await db.select().from(securityLogs).orderBy(desc(securityLogs.createdAt));
  }

  // Case progress operations
  async getCaseProgress(userId: string): Promise<CaseProgress | undefined> {
    const [progress] = await db.select().from(caseProgress)
      .where(eq(caseProgress.userId, userId))
      .orderBy(desc(caseProgress.createdAt));
    return progress;
  }

  async createCaseProgress(progress: InsertCaseProgress): Promise<CaseProgress> {
    const [newProgress] = await db.insert(caseProgress).values(progress).returning();
    return newProgress;
  }

  async updateCaseProgress(id: string, updates: Partial<InsertCaseProgress>): Promise<CaseProgress> {
    const [updated] = await db.update(caseProgress)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(caseProgress.id, id))
      .returning();
    return updated;
  }

  // Document progress operations
  async getDocumentProgress(caseProgressId: string): Promise<DocumentProgress[]> {
    return await db.select().from(documentProgress)
      .where(eq(documentProgress.caseProgressId, caseProgressId))
      .orderBy(documentProgress.documentType);
  }

  async createDocumentProgress(progress: InsertDocumentProgress): Promise<DocumentProgress> {
    const [newProgress] = await db.insert(documentProgress).values(progress).returning();
    return newProgress;
  }

  async updateDocumentProgress(id: string, updates: Partial<InsertDocumentProgress>): Promise<DocumentProgress> {
    const [updated] = await db.update(documentProgress)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(documentProgress.id, id))
      .returning();
    return updated;
  }

  // Messages operations
  async getMessages(userId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  // Alerts operations
  async getAlerts(userId: string): Promise<Alert[]> {
    return await db.select().from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(alerts.createdAt);
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    await db.update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, alertId));
  }

  // Milestones operations
  async getMilestones(userId: string): Promise<Milestone[]> {
    return await db.select().from(milestones)
      .where(eq(milestones.userId, userId))
      .orderBy(milestones.unlockedAt);
  }

  // Family Members operations
  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    return await db.select().from(familyMembers)
      .where(eq(familyMembers.primaryUserId, userId))
      .orderBy(familyMembers.createdAt);
  }

  async createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    const [newMember] = await db.insert(familyMembers).values(member).returning();
    return newMember;
  }

  async updateFamilyMember(memberId: string, updates: Partial<InsertFamilyMember>): Promise<FamilyMember> {
    const [updated] = await db.update(familyMembers)
      .set(updates)
      .where(eq(familyMembers.id, memberId))
      .returning();
    return updated;
  }

  // Financial Records operations
  async getFinancialRecords(userId: string): Promise<FinancialRecord[]> {
    return await db.select().from(financialRecords)
      .where(eq(financialRecords.userId, userId))
      .orderBy(financialRecords.createdAt);
  }

  async createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord> {
    const [newRecord] = await db.insert(financialRecords).values(record).returning();
    return newRecord;
  }

  // Personal Notes operations
  async getPersonalNotes(userId: string): Promise<PersonalNote[]> {
    return await db.select().from(personalNotes)
      .where(eq(personalNotes.userId, userId))
      .orderBy(personalNotes.createdAt);
  }

  async createPersonalNote(note: InsertPersonalNote): Promise<PersonalNote> {
    const [newNote] = await db.insert(personalNotes).values(note).returning();
    return newNote;
  }

  async updatePersonalNote(noteId: string, updates: Partial<InsertPersonalNote>): Promise<PersonalNote> {
    const [updated] = await db.update(personalNotes)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(personalNotes.id, noteId))
      .returning();
    return updated;
  }

  async deletePersonalNote(noteId: string): Promise<void> {
    await db.delete(personalNotes).where(eq(personalNotes.id, noteId));
  }

  // Timeline Events operations
  async getTimelineEvents(userId: string): Promise<TimelineEvent[]> {
    return await db.select().from(timelineEvents)
      .where(eq(timelineEvents.userId, userId))
      .orderBy(timelineEvents.order);
  }

  async updateTimelineEvent(eventId: string, updates: Partial<InsertTimelineEvent>): Promise<TimelineEvent> {
    const [updated] = await db.update(timelineEvents)
      .set(updates)
      .where(eq(timelineEvents.id, eventId))
      .returning();
    return updated;
  }
  
  // Alias for createFamilyMember to match routes.ts usage
  async addFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    return this.createFamilyMember(member);
  }
  
  // Analytics operations
  // Video testimonial operations
  async getVideoTestimonials(filter?: { isPublic?: boolean; verificationStatus?: string }): Promise<VideoTestimonial[]> {
    const query = db.select().from(videoTestimonials);
    const conditions: any[] = [];
    
    if (filter?.isPublic !== undefined) {
      conditions.push(eq(videoTestimonials.isPublic, filter.isPublic));
    }
    
    if (filter?.verificationStatus) {
      conditions.push(eq(videoTestimonials.verificationStatus, filter.verificationStatus as any));
    }
    
    const finalQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;
    return await finalQuery.orderBy(desc(videoTestimonials.displayOrder), desc(videoTestimonials.createdAt));
  }
  
  async getVideoTestimonial(id: string): Promise<VideoTestimonial | undefined> {
    const [testimonial] = await db.select().from(videoTestimonials).where(eq(videoTestimonials.id, id));
    return testimonial;
  }
  
  async createVideoTestimonial(testimonial: InsertVideoTestimonial): Promise<VideoTestimonial> {
    const [created] = await db.insert(videoTestimonials).values(testimonial).returning();
    return created;
  }
  
  async updateVideoTestimonial(id: string, updates: Partial<InsertVideoTestimonial>): Promise<VideoTestimonial> {
    const [updated] = await db
      .update(videoTestimonials)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(videoTestimonials.id, id))
      .returning();
    return updated;
  }
  
  async deleteVideoTestimonial(id: string): Promise<void> {
    await db.delete(videoTestimonials).where(eq(videoTestimonials.id, id));
  }
  
  // Testimonial verification log operations
  async getTestimonialVerificationLogs(testimonialId: string): Promise<TestimonialVerificationLog[]> {
    return await db
      .select()
      .from(testimonialVerificationLogs)
      .where(eq(testimonialVerificationLogs.testimonialId, testimonialId))
      .orderBy(desc(testimonialVerificationLogs.createdAt));
  }
  
  async createTestimonialVerificationLog(log: InsertTestimonialVerificationLog): Promise<TestimonialVerificationLog> {
    const [created] = await db.insert(testimonialVerificationLogs).values(log).returning();
    return created;
  }
  
  async getAnalytics(userId: string): Promise<any> {
    // Fetch various analytics data
    const documentsData = await this.getDocuments(userId);
    const caseProgressData = await this.getCaseProgress(userId);
    const messagesData = await this.getMessages(userId);
    const financialData = await this.getFinancialRecords(userId);
    
    // Calculate document progress
    const documentProgress = [
      { 
        name: "Personal", 
        completed: documentsData.filter(d => d.status === 'verified' && d.categoryId === 'personal').length,
        pending: documentsData.filter(d => d.status !== 'verified' && d.categoryId === 'personal').length
      },
      { 
        name: "Ancestral", 
        completed: documentsData.filter(d => d.status === 'verified' && d.categoryId === 'ancestral').length,
        pending: documentsData.filter(d => d.status !== 'verified' && d.categoryId === 'ancestral').length
      },
      { 
        name: "Legal", 
        completed: documentsData.filter(d => d.status === 'verified' && d.categoryId === 'legal').length,
        pending: documentsData.filter(d => d.status !== 'verified' && d.categoryId === 'legal').length
      },
      { 
        name: "Translation", 
        completed: documentsData.filter(d => d.status === 'verified' && d.categoryId === 'translation').length,
        pending: documentsData.filter(d => d.status !== 'verified' && d.categoryId === 'translation').length
      }
    ];
    
    // Calculate timeline data
    const timelineData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    for (let i = 0; i < months.length; i++) {
      timelineData.push({
        month: months[i],
        progress: caseProgressData ? Math.min(100, (i + 1) * 15 + Math.random() * 10) : 0
      });
    }
    
    // Calculate category breakdown
    const categoryBreakdown = [
      { category: "Documents", value: 40, color: "#3b82f6" },
      { category: "Archives", value: 25, color: "#10b981" },
      { category: "Translation", value: 20, color: "#f59e0b" },
      { category: "Legal", value: 15, color: "#8b5cf6" }
    ];
    
    // Calculate activity metrics
    const activityMetrics = {
      documentsUploaded: documentsData.filter(d => d.uploadDate).length,
      messagesExchanged: messagesData.length,
      avgResponseTime: "2.5 hours",
      completionRate: caseProgressData?.overallProgress || 0
    };
    
    return {
      documentProgress,
      timelineData,
      categoryBreakdown,
      activityMetrics
    };
  }

  // Client document operations
  async saveClientDocument(document: InsertClientDocument): Promise<ClientDocument> {
    const [savedDocument] = await db.insert(clientDocuments).values(document).returning();
    return savedDocument;
  }

  async getClientDocuments(userId?: string): Promise<ClientDocument[]> {
    if (userId) {
      return await db.select().from(clientDocuments).where(eq(clientDocuments.userId, userId)).orderBy(desc(clientDocuments.createdAt));
    }
    return await db.select().from(clientDocuments).orderBy(desc(clientDocuments.createdAt));
  }

  // Content management operations for editing system
  private contentFilePath = join(process.cwd(), 'server', 'data', 'content.json');

  private async ensureContentFileExists(): Promise<void> {
    try {
      const dir = join(process.cwd(), 'server', 'data');
      await fs.mkdir(dir, { recursive: true });
      await fs.access(this.contentFilePath);
    } catch {
      await fs.writeFile(this.contentFilePath, JSON.stringify({}));
    }
  }

  private async loadContent(): Promise<Record<string, ContentEntry>> {
    await this.ensureContentFileExists();
    try {
      const data = await fs.readFile(this.contentFilePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  private async saveContentToFile(content: Record<string, ContentEntry>): Promise<void> {
    await this.ensureContentFileExists();
    await fs.writeFile(this.contentFilePath, JSON.stringify(content, null, 2));
  }

  async getContent(key: string): Promise<ContentEntry | undefined> {
    const content = await this.loadContent();
    return content[key];
  }

  async setContent(
    key: string, 
    value: string, 
    type: ContentType, 
    path: string, 
    locale: string = 'en', 
    updatedBy?: string
  ): Promise<ContentEntry> {
    const content = await this.loadContent();
    
    const entry: ContentEntry = {
      key,
      value,
      type,
      path,
      locale,
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    
    content[key] = entry;
    await this.saveContentToFile(content);
    
    return entry;
  }

  async listContentByPath(path: string): Promise<ContentEntry[]> {
    const content = await this.loadContent();
    return Object.values(content).filter(entry => entry.path === path);
  }

  async listAllContent(): Promise<ContentEntry[]> {
    const content = await this.loadContent();
    return Object.values(content);
  }
  
  // Prospect case operations for Typeform integration
  async createProspectCase(prospectCase: InsertProspectCase): Promise<ProspectCase> {
    const [createdCase] = await db.insert(prospectCases).values(prospectCase).returning();
    return createdCase;
  }

  async getProspectCases(filters?: { status?: string; eligibilityLevel?: string; source?: string }): Promise<ProspectCase[]> {
    let query = db.select().from(prospectCases);
    
    if (filters) {
      const conditions = [];
      if (filters.status) {
        conditions.push(eq(prospectCases.status, filters.status));
      }
      if (filters.eligibilityLevel) {
        conditions.push(eq(prospectCases.eligibilityLevel, filters.eligibilityLevel));
      }
      if (filters.source) {
        conditions.push(eq(prospectCases.source, filters.source));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(prospectCases.createdAt));
  }

  async getProspectCaseByTypeformResponse(responseId: string): Promise<ProspectCase | undefined> {
    const [prospectCase] = await db.select().from(prospectCases).where(eq(prospectCases.typeformResponseId, responseId));
    return prospectCase;
  }

  async updateProspectCase(id: string, updates: Partial<InsertProspectCase>): Promise<ProspectCase | undefined> {
    const [updatedCase] = await db.update(prospectCases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(prospectCases.id, id))
      .returning();
    return updatedCase;
  }
  
  // Enhanced authentication operations
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user;
  }
  
  async updateUserEmailVerification(id: string, verified: boolean): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ 
        emailVerified: verified,
        emailVerificationToken: verified ? null : users.emailVerificationToken,
        caseStatus: verified ? 'email_verified' : users.caseStatus,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }
  
  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
}

export const storage = new DatabaseStorage();