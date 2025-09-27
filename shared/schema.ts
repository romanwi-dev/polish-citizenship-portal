import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Stage Action Link Types
export const StageActionLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  targetType: z.enum([
    'familyTree',
    'poa',
    'tasks', 
    'payments',
    'document',
    'email',
    'letter',
    'application',
    'archives',
    'translation'
  ]),
  route: z.string().optional(), // Navigation route
  payload: z.record(z.any()).optional(), // Additional data like documentId, templateId etc
  status: z.enum(['available', 'pending', 'completed', 'blocked']).optional(),
  count: z.number().optional(), // Number of items (e.g., documents, tasks)
  description: z.string().optional()
});

export type StageActionLink = z.infer<typeof StageActionLinkSchema>;

// Session storage table (required for auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Leads table (for Typeform webhook integration)
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  name: varchar("name"),
  score: integer("score"),
  tier: varchar("tier", { enum: ['A', 'B', 'C'] }).notNull(),
  token: varchar("token").notNull().unique(),
  typeformData: jsonb("typeform_data"), // Store raw Typeform response
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  accessedAt: timestamp("accessed_at"), // When they clicked the link
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Users table (required for auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  emailVerifiedAt: timestamp("email_verified_at"),
  passwordHash: varchar("password_hash"),
  role: varchar("role", { enum: ['user', 'admin', 'staff'] }).notNull().default('user'),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  country: varchar("country"),
  city: varchar("city"),
  timezone: varchar("timezone"),
  hasPolishAncestry: boolean("has_polish_ancestry").default(false),
  ancestorGeneration: varchar("ancestor_generation"),
  ancestorName: varchar("ancestor_name"),
  serviceType: varchar("service_type", { enum: ['standard', 'premium', 'express'] }),
  subscribeToNewsletter: boolean("subscribe_to_newsletter").default(false),
  caseStatus: varchar("case_status", { enum: ['pending_verification', 'email_verified', 'approved', 'rejected', 'active'] }).default('pending_verification'),
  caseApprovedAt: timestamp("case_approved_at"),
  caseApprovedBy: varchar("case_approved_by"),
  caseNotes: text("case_notes"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document categories
export const documentCategories = pgTable("document_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  color: varchar("color").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  categoryId: varchar("category_id").references(() => documentCategories.id),
  userId: varchar("user_id").references(() => users.id),
  status: varchar("status", { enum: ['required', 'uploaded', 'verified', 'missing', 'in-review'] }).notNull().default('required'),
  priority: varchar("priority", { enum: ['high', 'medium', 'low'] }).notNull().default('medium'),
  description: text("description"),
  fileName: varchar("file_name"),
  fileSize: varchar("file_size"),
  filePath: varchar("file_path"),
  mimeType: varchar("mime_type"),
  uploadDate: timestamp("upload_date"),
  verificationDate: timestamp("verification_date"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Family tree data
export const familyTreeData = pgTable("family_tree_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  treeData: jsonb("tree_data").notNull(), // Store the entire family tree structure
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OCR processed documents
export const processedDocuments = pgTable("processed_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  fileName: varchar("file_name").notNull(),
  filePath: varchar("file_path").notNull(),
  documentType: varchar("document_type", { 
    enum: ['passport', 'birth_certificate', 'marriage_certificate', 'other'] 
  }).notNull().default('other'),
  extractedText: text("extracted_text"),
  structuredData: jsonb("structured_data"),
  polishTranslation: text("polish_translation"),
  confidence: integer("confidence").default(0), // 0-100
  status: varchar("status", { 
    enum: ['processing', 'completed', 'error'] 
  }).notNull().default('processing'),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Document automation jobs
export const documentJobs = pgTable("document_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  jobType: varchar("job_type", { 
    enum: ['ocr_processing', 'form_autofill', 'pdf_generation', 'translation'] 
  }).notNull(),
  status: varchar("status", { 
    enum: ['pending', 'processing', 'completed', 'failed'] 
  }).notNull().default('pending'),
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  errorMessage: text("error_message"),
  progress: integer("progress").default(0), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Security audit logs for Bank-Level Security tracking
export const securityLogs = pgTable("security_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  eventType: varchar("event_type", { 
    enum: ['login', 'logout', 'document_access', 'document_upload', 'data_export', 'settings_change'] 
  }).notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  isSuccess: boolean("is_success").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Case progress tracking
export const caseProgress = pgTable("case_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  caseId: varchar("case_id").unique().notNull(),
  currentPhase: varchar("current_phase", {
    enum: ['initial_assessment', 'document_collection', 'archive_search', 'translation', 'submission', 'review', 'decision', 'completed']
  }).notNull().default('initial_assessment'),
  overallProgress: integer("overall_progress").default(0), // 0-100
  documentsCollected: integer("documents_collected").default(0),
  documentsRequired: integer("documents_required").default(12),
  documentsVerified: integer("documents_verified").default(0),
  translationsCompleted: integer("translations_completed").default(0),
  translationsRequired: integer("translations_required").default(6),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  serviceLevel: varchar("service_level", {
    enum: ['standard', 'expedited', 'premium']
  }).notNull().default('standard'),
  successProbability: integer("success_probability").default(85), // 0-100
  caseManager: varchar("case_manager"),
  lastActivityDate: timestamp("last_activity_date").defaultNow(),
  // Family Tree data - store as JSONB with exact field names from PDF template
  familyTree: jsonb("family_tree"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document progress details
export const documentProgress = pgTable("document_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseProgressId: varchar("case_progress_id").references(() => caseProgress.id),
  documentType: varchar("document_type").notNull(),
  status: varchar("status", {
    enum: ['not_started', 'requested', 'received', 'under_review', 'verified', 'rejected', 'resubmission_required']
  }).notNull().default('not_started'),
  receivedDate: timestamp("received_date"),
  verifiedDate: timestamp("verified_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Client details/applicant information
export const clientDetails = pgTable("client_details", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  // Personal Information
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  maidenName: varchar("maiden_name"),
  birthDate: varchar("birth_date"),
  birthPlace: varchar("birth_place"),
  nationality: varchar("nationality"),
  // Contact Information
  email: varchar("email"),
  phone: varchar("phone"),
  address: text("address"),
  city: varchar("city"),
  postalCode: varchar("postal_code"),
  country: varchar("country"),
  // Additional Data
  passportNumber: varchar("passport_number"),
  maritalStatus: varchar("marital_status"),
  occupation: varchar("occupation"),
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Polish citizenship application data
export const polishCitizenshipApplications = pgTable("polish_citizenship_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  applicationData: jsonb("application_data").notNull(), // Store the entire application form
  status: varchar("status").default('draft'),
  submissionDate: timestamp("submission_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dashboard notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { enum: ['success', 'info', 'warning', 'error'] }).default('info'),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages for Secure Messaging Center
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  senderId: varchar("sender_id").notNull(),
  senderName: varchar("sender_name").notNull(),
  senderRole: varchar("sender_role").notNull(), // client, case_manager, admin
  content: text("content").notNull(),
  attachmentUrl: varchar("attachment_url"),
  attachmentName: varchar("attachment_name"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Smart Alerts System
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // document_expiry, payment_due, missing_document, translation_complete, archive_update
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  priority: varchar("priority").notNull().default("medium"), // low, medium, high, urgent
  isRead: boolean("is_read").default(false),
  actionUrl: varchar("action_url"),
  createdAt: timestamp("created_at").defaultNow()
});

// Milestone Achievements
export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // documents_uploaded, verification_complete, translation_done, submission_ready
  title: varchar("title").notNull(),
  description: text("description"),
  badgeIcon: varchar("badge_icon"),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  points: integer("points").default(0)
});

// Prospect Cases - Auto-created from Typeform leads  
export const prospectCases = pgTable("leads", {
  id: varchar("id").primaryKey(),
  clientName: varchar("client_name").notNull(),
  clientEmail: varchar("client_email").notNull(),
  eligibilityLevel: varchar("eligibility_level", { 
    enum: ['HIGH', 'MEDIUM', 'LOW', 'VERY_LOW'] 
  }).notNull(),
  eligibilityScore: integer("eligibility_score").notNull(),
  estimatedTimeframe: varchar("estimated_timeframe"),
  status: varchar("status", { 
    enum: ['prospect', 'contacted', 'qualified', 'converted', 'rejected'] 
  }).notNull().default('prospect'),
  source: varchar("source").notNull(), // 'typeform', 'typeform_auto', 'manual'
  typeformResponseId: varchar("typeform_response_id").unique(),
  leadId: varchar("lead_id"),
  recommendations: jsonb("recommendations"),
  documentRequirements: jsonb("document_requirements"),
  typeformData: jsonb("typeform_data"),
  notes: text("notes"),
  assignedTo: varchar("assigned_to"),
  contactedAt: timestamp("contacted_at"),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Family Portal
export const familyMembers = pgTable("family_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  primaryUserId: varchar("primary_user_id").references(() => users.id),
  memberName: varchar("member_name").notNull(),
  relationship: varchar("relationship").notNull(), // spouse, child, parent, sibling
  email: varchar("email"),
  caseId: varchar("case_id"),
  applicationStatus: varchar("application_status"),
  documentsProgress: integer("documents_progress").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

// Financial Records
export const financialRecords = pgTable("financial_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // payment, invoice, refund
  description: varchar("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("EUR"),
  status: varchar("status").notNull(), // paid, pending, overdue
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  invoiceUrl: varchar("invoice_url"),
  createdAt: timestamp("created_at").defaultNow()
});

// Personal Notes
export const personalNotes = pgTable("personal_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  documentId: varchar("document_id"),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category"), // document_note, reminder, question, todo
  isPinned: boolean("is_pinned").default(false),
  dueDate: timestamp("due_date"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Timeline Events
export const timelineEvents = pgTable("timeline_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  phase: varchar("phase").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").notNull(), // completed, in_progress, upcoming
  completedDate: timestamp("completed_date"),
  estimatedDate: timestamp("estimated_date"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Video testimonials with AI verification
export const videoTestimonials = pgTable("video_testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  clientName: varchar("client_name").notNull(),
  clientEmail: varchar("client_email").notNull(),
  clientPhone: varchar("client_phone"),
  location: varchar("location").notNull(),
  videoUrl: varchar("video_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  duration: varchar("duration"),
  title: varchar("title").notNull(),
  description: text("description"),
  caseDetails: text("case_details"),
  
  // Verification fields
  verificationStatus: varchar("verification_status", { 
    enum: ['pending', 'ai_verified', 'manual_review', 'approved', 'rejected'] 
  }).notNull().default('pending'),
  aiVerificationScore: decimal("ai_verification_score", { precision: 5, scale: 2 }), // 0-100
  aiVerificationDetails: jsonb("ai_verification_details"),
  
  // Identity verification
  identityVerified: boolean("identity_verified").default(false),
  identityVerificationMethod: varchar("identity_verification_method"),
  identityVerificationDate: timestamp("identity_verification_date"),
  
  // Contact availability
  contactAvailable: boolean("contact_available").default(false),
  contactAvailableAfterConsultation: boolean("contact_available_after_consultation").default(true),
  
  // Admin review
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Public display
  isPublic: boolean("is_public").default(false),
  displayOrder: integer("display_order").default(0),
  featuredTestimonial: boolean("featured_testimonial").default(false),
  
  // Metadata
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI verification logs for testimonials
export const testimonialVerificationLogs = pgTable("testimonial_verification_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testimonialId: varchar("testimonial_id").references(() => videoTestimonials.id),
  verificationType: varchar("verification_type", {
    enum: ['authenticity', 'identity', 'content', 'quality', 'compliance']
  }).notNull(),
  score: decimal("score", { precision: 5, scale: 2 }),
  result: varchar("result", {
    enum: ['pass', 'fail', 'needs_review']
  }).notNull(),
  details: jsonb("details"),
  aiModel: varchar("ai_model"),
  processingTime: integer("processing_time"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Citizenship application progress tracking
export const citizenshipProgress = pgTable("citizenship_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stageId: varchar("stage_id").notNull(), // e.g., 'initial-consultation', 'document-collection'
  stageName: varchar("stage_name").notNull(),
  status: varchar("status", { enum: ['completed', 'in-progress', 'pending', 'delayed'] }).notNull().default('pending'),
  startDate: timestamp("start_date"),
  completedDate: timestamp("completed_date"),
  estimatedDuration: varchar("estimated_duration"), // e.g., "2-4 weeks"
  actualDuration: varchar("actual_duration"),
  requirements: jsonb("requirements"), // Array of required items
  notes: text("notes"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Citizenship progress milestones
export const citizenshipMilestones = pgTable("citizenship_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  progressId: varchar("progress_id").references(() => citizenshipProgress.id),
  title: varchar("title").notNull(),
  description: text("description"),
  completedDate: timestamp("completed_date"),
  isMajor: boolean("is_major").default(false),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Client documents table for saved PDFs
export const clientDocuments = pgTable("client_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().unique(),
  fileName: varchar("file_name").notNull(),
  documentType: varchar("document_type").notNull(),
  status: varchar("status", { enum: ['draft', 'completed', 'printed', 'signed', 'sent'] }).notNull().default('draft'),
  filePath: varchar("file_path").notNull(),
  fileSize: integer("file_size"),
  userId: varchar("user_id").references(() => users.id),
  printedAt: timestamp("printed_at"),
  signedAt: timestamp("signed_at"),
  sentAt: timestamp("sent_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for new tables
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = typeof familyMembers.$inferInsert;
export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertFinancialRecord = typeof financialRecords.$inferInsert;
export type PersonalNote = typeof personalNotes.$inferSelect;
export type InsertPersonalNote = typeof personalNotes.$inferInsert;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = typeof timelineEvents.$inferInsert;
export type VideoTestimonial = typeof videoTestimonials.$inferSelect;
export type InsertVideoTestimonial = typeof videoTestimonials.$inferInsert;
export type TestimonialVerificationLog = typeof testimonialVerificationLogs.$inferSelect;
export type InsertTestimonialVerificationLog = typeof testimonialVerificationLogs.$inferInsert;
export type CitizenshipProgress = typeof citizenshipProgress.$inferSelect;
export type InsertCitizenshipProgress = typeof citizenshipProgress.$inferInsert;
export type CitizenshipMilestone = typeof citizenshipMilestones.$inferSelect;
export type InsertCitizenshipMilestone = typeof citizenshipMilestones.$inferInsert;
export type ClientDocument = typeof clientDocuments.$inferSelect;
export type InsertClientDocument = typeof clientDocuments.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// Create Zod schemas for validation
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, updatedAt: true });
export const selectLeadSchema = createSelectSchema(leads);

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const selectUserSchema = createSelectSchema(users);

export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, updatedAt: true });
export const selectDocumentSchema = createSelectSchema(documents);

export const insertDocumentCategorySchema = createInsertSchema(documentCategories).omit({ id: true, createdAt: true });
export const selectDocumentCategorySchema = createSelectSchema(documentCategories);

export const insertFamilyTreeDataSchema = createInsertSchema(familyTreeData).omit({ id: true, createdAt: true, updatedAt: true });
export const selectFamilyTreeDataSchema = createSelectSchema(familyTreeData);

export const insertClientDetailsSchema = createInsertSchema(clientDetails).omit({ id: true, createdAt: true, updatedAt: true });
export const selectClientDetailsSchema = createSelectSchema(clientDetails);

export const insertPolishCitizenshipApplicationSchema = createInsertSchema(polishCitizenshipApplications).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPolishCitizenshipApplicationSchema = createSelectSchema(polishCitizenshipApplications);

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const selectNotificationSchema = createSelectSchema(notifications);

// Content management table for editable website content
export const websiteContent = pgTable("website_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  section: varchar("section").notNull(), // 'homepage', 'navigation', 'footer', 'forms', 'other'
  key: varchar("key").notNull().unique(), // unique identifier for the content piece
  type: varchar("type", { enum: ['text', 'textarea', 'url', 'icon'] }).notNull().default('text'),
  value: text("value").notNull(),
  label: varchar("label").notNull(), // human-readable label for admin interface
  description: text("description"), // optional description for admin interface
  isActive: boolean("is_active").default(true),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WebsiteContent = typeof websiteContent.$inferSelect;
export type InsertWebsiteContent = typeof websiteContent.$inferInsert;

export const insertWebsiteContentSchema = createInsertSchema(websiteContent).omit({ id: true, createdAt: true, updatedAt: true });
export const selectWebsiteContentSchema = createSelectSchema(websiteContent);

// Content editing system types
export type ContentType = 'text' | 'button' | 'label' | 'rich';

export interface ContentEntry {
  key: string; // unique identifier like "home.hero.title"
  value: string; // the content text
  type: ContentType;
  path: string; // route like "/" or "/dashboard"
  locale?: string; // default 'en'
  updatedAt?: string;
  updatedBy?: string;
}

export type InsertContentEntry = Omit<ContentEntry, 'updatedAt' | 'updatedBy'>;

// Zod schemas for content editing
export const contentEntrySchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  type: z.enum(['text', 'button', 'label', 'rich']),
  path: z.string().min(1),
  locale: z.string().optional().default('en'),
  updatedAt: z.string().optional(),
  updatedBy: z.string().optional(),
});

export const insertContentEntrySchema = contentEntrySchema.omit({ 
  updatedAt: true, 
  updatedBy: true 
});

// Legacy schema exports for existing components
export const consultationRequests = pgTable("consultation_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name"),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  message: text("message"),
  privacyConsent: boolean("privacy_consent").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eligibilityAssessments = pgTable("eligibility_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  country: varchar("country"),
  birthYear: varchar("birth_year"),
  polishAncestor: varchar("polish_ancestor"),
  ancestorBirthYear: varchar("ancestor_birth_year"),
  ancestorBirthPlace: varchar("ancestor_birth_place"),
  hasPolishDocuments: varchar("has_polish_documents"),
  emigrationYear: varchar("emigration_year"),
  currentCitizenship: varchar("current_citizenship"),
  familyMembers: varchar("family_members"),
  urgency: varchar("urgency"),
  caseComplexity: varchar("case_complexity"),
  budgetRange: varchar("budget_range"),
  timelineExpectation: varchar("timeline_expectation"),
  additionalInfo: text("additional_info"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConsultationRequestSchema = createInsertSchema(consultationRequests).omit({ id: true, createdAt: true });
export const selectConsultationRequestSchema = createSelectSchema(consultationRequests);

export const insertEligibilityAssessmentSchema = createInsertSchema(eligibilityAssessments).omit({ id: true, createdAt: true });
export const selectEligibilityAssessmentSchema = createSelectSchema(eligibilityAssessments);

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// OCR and document processing types
export type ProcessedDocument = typeof processedDocuments.$inferSelect;
export type InsertProcessedDocument = typeof processedDocuments.$inferInsert;
export type DocumentJob = typeof documentJobs.$inferSelect;
export type InsertDocumentJob = typeof documentJobs.$inferInsert;

export const insertProcessedDocumentSchema = createInsertSchema(processedDocuments);
export const selectProcessedDocumentSchema = createSelectSchema(processedDocuments);
export const insertDocumentJobSchema = createInsertSchema(documentJobs);
export const selectDocumentJobSchema = createSelectSchema(documentJobs);

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertDocumentCategory = z.infer<typeof insertDocumentCategorySchema>;
export type DocumentCategory = typeof documentCategories.$inferSelect;

export type InsertFamilyTreeData = z.infer<typeof insertFamilyTreeDataSchema>;
export type FamilyTreeData = typeof familyTreeData.$inferSelect;

export type InsertClientDetails = z.infer<typeof insertClientDetailsSchema>;
export type ClientDetails = typeof clientDetails.$inferSelect;

// Zod schemas for client details validation
export const ClientDetailsSchema = z.object({
  applicantName: z.string().min(1, "Name is required"),
  applicantFirstNames: z.string().min(1, "First name is required"),
  applicantLastName: z.string().min(1, "Last name is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  birthPlace: z.string().min(1, "Birth place is required"),
  gender: z.enum(["mężczyzna", "kobieta"]),
  married: z.enum(["YES", "NO"]).default("NO"),
  fatherFullName: z.string().min(1, "Father's name is required"),
  motherFullName: z.string().min(1, "Mother's name is required"),
  motherMaidenName: z.string().min(1, "Mother's maiden name is required"),
  marriageDate: z.string().optional(),
  marriagePlace: z.string().optional(),
  spouseName: z.string().optional(),
  spouseFirstNames: z.string().optional(),
  spouseLastName: z.string().optional(),
  spouseMaidenName: z.string().optional(),
  spouseGender: z.enum(["mężczyzna", "kobieta"]).optional(),
  childrenNames: z.string().optional(),
  currentAddress: z.string().min(1, "Address is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  passportNumber: z.string().min(1, "Passport number is required"),
});

export type ClientDetailsData = z.infer<typeof ClientDetailsSchema>;

export type InsertPolishCitizenshipApplication = z.infer<typeof insertPolishCitizenshipApplicationSchema>;
export type PolishCitizenshipApplication = typeof polishCitizenshipApplications.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertConsultationRequest = z.infer<typeof insertConsultationRequestSchema>;
export type ConsultationRequest = typeof consultationRequests.$inferSelect;

export type InsertEligibilityAssessment = z.infer<typeof insertEligibilityAssessmentSchema>;
export type EligibilityAssessment = typeof eligibilityAssessments.$inferSelect;

// Security and progress tracking types
export const insertSecurityLogSchema = createInsertSchema(securityLogs).omit({ id: true, createdAt: true });
export const selectSecurityLogSchema = createSelectSchema(securityLogs);
export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSecurityLog = z.infer<typeof insertSecurityLogSchema>;

export const insertCaseProgressSchema = createInsertSchema(caseProgress).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCaseProgressSchema = createSelectSchema(caseProgress);
export type CaseProgress = typeof caseProgress.$inferSelect;

// Family Tree data structure with exact field names from PDF template
export interface FamilyTreeData {
  // Applicant & Spouse
  applicant_full_name?: string;
  applicant_date_of_birth?: string;
  applicant_place_of_birth?: string;
  applicant_date_of_marriage?: string;
  applicant_place_of_marriage?: string;
  applicant_spouse_full_name_and_maiden_name?: string;
  
  // Polish Parent & Spouse
  polish_parent_full_name?: string;
  polish_parent_date_of_birth?: string;
  polish_parent_place_of_birth?: string;
  polish_parent_date_of_marriage?: string;
  polish_parent_place_of_marriage?: string;
  polish_parent_date_of_emigration?: string;
  polish_parent_date_of_naturalization?: string;
  polish_parent_spouse_full_name?: string;
  
  // Polish Grandparent & Spouse
  polish_grandparent_full_name?: string;
  polish_grandparent_date_of_birth?: string;
  polish_grandparent_place_of_birth?: string;
  polish_grandparent_date_of_mariage?: string; // Note: keeping original typo as specified
  polish_grandparent_place_of_mariage?: string; // Note: keeping original typo as specified
  polish_grandparent_date_of_emigration?: string;
  polish_grandparent_date_of_naturalization?: string;
  polish_grandparent_spouse_full_name?: string;
  
  // Great-Grandparents
  great_grandfather_full_name?: string;
  great_grandfather_date_of_birth?: string;
  great_grandfather_place_of_birth?: string;
  great_grandfather_date_of_marriage?: string;
  great_grandfather_place_of_marriage?: string;
  great_grandfather_date_of_emigartion?: string; // Note: keeping original typo as specified
  great_grandfather_date_of_naturalization?: string;
  great_grandmother_full_name?: string;
  
  // Minor Children (1-3)
  minor_1_full_name?: string;
  minor_1_date_of_birth?: string;
  minor_1_place_of_birth?: string;
  minor_2_full_name?: string;
  minor_2_date_of_birth?: string;
  minor_2_place_of_birth?: string;
  minor_3_full_name?: string;
  minor_3_date_of_birth?: string;
}

export const familyTreeDataSchema = z.object({
  // Applicant & Spouse
  applicant_full_name: z.string().max(120).optional(),
  applicant_date_of_birth: z.string().optional(),
  applicant_place_of_birth: z.string().max(120).optional(),
  applicant_date_of_marriage: z.string().optional(),
  applicant_place_of_marriage: z.string().max(120).optional(),
  applicant_spouse_full_name_and_maiden_name: z.string().max(120).optional(),
  
  // Polish Parent & Spouse
  polish_parent_full_name: z.string().max(120).optional(),
  polish_parent_date_of_birth: z.string().optional(),
  polish_parent_place_of_birth: z.string().max(120).optional(),
  polish_parent_date_of_marriage: z.string().optional(),
  polish_parent_place_of_marriage: z.string().max(120).optional(),
  polish_parent_date_of_emigration: z.string().optional(),
  polish_parent_date_of_naturalization: z.string().optional(),
  polish_parent_spouse_full_name: z.string().max(120).optional(),
  
  // Polish Grandparent & Spouse
  polish_grandparent_full_name: z.string().max(120).optional(),
  polish_grandparent_date_of_birth: z.string().optional(),
  polish_grandparent_place_of_birth: z.string().max(120).optional(),
  polish_grandparent_date_of_mariage: z.string().optional(),
  polish_grandparent_place_of_mariage: z.string().max(120).optional(),
  polish_grandparent_date_of_emigration: z.string().optional(),
  polish_grandparent_date_of_naturalization: z.string().optional(),
  polish_grandparent_spouse_full_name: z.string().max(120).optional(),
  
  // Great-Grandparents
  great_grandfather_full_name: z.string().max(120).optional(),
  great_grandfather_date_of_birth: z.string().optional(),
  great_grandfather_place_of_birth: z.string().max(120).optional(),
  great_grandfather_date_of_marriage: z.string().optional(),
  great_grandfather_place_of_marriage: z.string().max(120).optional(),
  great_grandfather_date_of_emigartion: z.string().optional(),
  great_grandfather_date_of_naturalization: z.string().optional(),
  great_grandmother_full_name: z.string().max(120).optional(),
  
  // Minor Children (1-3)
  minor_1_full_name: z.string().max(120).optional(),
  minor_1_date_of_birth: z.string().optional(),
  minor_1_place_of_birth: z.string().max(120).optional(),
  minor_2_full_name: z.string().max(120).optional(),
  minor_2_date_of_birth: z.string().optional(),
  minor_2_place_of_birth: z.string().max(120).optional(),
  minor_3_full_name: z.string().max(120).optional(),
  minor_3_date_of_birth: z.string().optional(),
});
export type InsertCaseProgress = z.infer<typeof insertCaseProgressSchema>;

export const insertDocumentProgressSchema = createInsertSchema(documentProgress).omit({ id: true, createdAt: true, updatedAt: true });
export const selectDocumentProgressSchema = createSelectSchema(documentProgress);
export type DocumentProgress = typeof documentProgress.$inferSelect;
export type InsertDocumentProgress = z.infer<typeof insertDocumentProgressSchema>;

// Data Population System Schema for Polish Document Generation
export const documentTemplates = pgTable("document_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // POA_ADULT, POA_MINOR, POA_SPOUSES, CITIZENSHIP, CIVIL_REGISTRY, etc.
  language: varchar("language", { length: 10 }).default("pl"),
  templatePath: varchar("template_path", { length: 500 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dataEntries = pgTable("data_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }),
  
  // Applicant Personal Data
  applicantFirstName: varchar("applicant_first_name", { length: 255 }),
  applicantLastName: varchar("applicant_last_name", { length: 255 }),
  applicantBirthName: varchar("applicant_birth_name", { length: 255 }),
  applicantDateOfBirth: varchar("applicant_date_of_birth", { length: 50 }),
  applicantPlaceOfBirth: varchar("applicant_place_of_birth", { length: 255 }),
  applicantGender: varchar("applicant_gender", { length: 20 }),
  applicantDocumentType: varchar("applicant_document_type", { length: 100 }),
  applicantDocumentNumber: varchar("applicant_document_number", { length: 100 }),
  applicantNationality: varchar("applicant_nationality", { length: 100 }),
  applicantPesel: varchar("applicant_pesel", { length: 20 }),
  applicantMaritalStatus: varchar("applicant_marital_status", { length: 50 }),
  
  // Applicant Address
  applicantCountry: varchar("applicant_country", { length: 100 }),
  applicantStreet: varchar("applicant_street", { length: 255 }),
  applicantHouseNumber: varchar("applicant_house_number", { length: 50 }),
  applicantApartmentNumber: varchar("applicant_apartment_number", { length: 50 }),
  applicantPostalCode: varchar("applicant_postal_code", { length: 20 }),
  applicantCity: varchar("applicant_city", { length: 100 }),
  applicantPhone: varchar("applicant_phone", { length: 50 }),
  applicantEmail: varchar("applicant_email", { length: 255 }),
  
  // Minor Child Data (for POA_MINOR)
  childFirstName: varchar("child_first_name", { length: 255 }),
  childLastName: varchar("child_last_name", { length: 255 }),
  childDateOfBirth: varchar("child_date_of_birth", { length: 50 }),
  childPlaceOfBirth: varchar("child_place_of_birth", { length: 255 }),
  
  // Polish Parent Data (for minor POA - usually same as main applicant)
  polishParentFirstName: varchar("polish_parent_first_name", { length: 255 }),
  polishParentLastName: varchar("polish_parent_last_name", { length: 255 }),
  
  // Spouse Data (for POA_SPOUSES)
  spouseFirstName: varchar("spouse_first_name", { length: 255 }),
  spouseLastName: varchar("spouse_last_name", { length: 255 }),
  spouseDocumentNumber: varchar("spouse_document_number", { length: 100 }),
  marriageDate: varchar("marriage_date", { length: 50 }),
  marriagePlace: varchar("marriage_place", { length: 255 }),
  husbandSurname: varchar("husband_surname", { length: 255 }),
  wifeSurname: varchar("wife_surname", { length: 255 }),
  childrenSurnames: text("children_surnames"),
  
  // Parent Data
  fatherFirstName: varchar("father_first_name", { length: 255 }),
  fatherLastName: varchar("father_last_name", { length: 255 }),
  fatherBirthName: varchar("father_birth_name", { length: 255 }),
  fatherDateOfBirth: varchar("father_date_of_birth", { length: 50 }),
  fatherPlaceOfBirth: varchar("father_place_of_birth", { length: 255 }),
  fatherNationality: varchar("father_nationality", { length: 100 }),
  fatherPesel: varchar("father_pesel", { length: 20 }),
  fatherEmigrationDate: varchar("father_emigration_date", { length: 50 }),
  fatherNaturalizationDate: varchar("father_naturalization_date", { length: 50 }),
  fatherGrandpaFirstName: varchar("father_grandpa_first_name", { length: 255 }),
  fatherGrandpaLastName: varchar("father_grandpa_last_name", { length: 255 }),
  fatherGrandmaFirstName: varchar("father_grandma_first_name", { length: 255 }),
  fatherGrandmaLastName: varchar("father_grandma_last_name", { length: 255 }),
  fatherGrandmaBirthName: varchar("father_grandma_birth_name", { length: 255 }),
  
  motherFirstName: varchar("mother_first_name", { length: 255 }),
  motherLastName: varchar("mother_last_name", { length: 255 }),
  motherBirthName: varchar("mother_birth_name", { length: 255 }),
  motherDateOfBirth: varchar("mother_date_of_birth", { length: 50 }),
  motherPlaceOfBirth: varchar("mother_place_of_birth", { length: 255 }),
  motherNationality: varchar("mother_nationality", { length: 100 }),
  motherPesel: varchar("mother_pesel", { length: 20 }),
  motherEmigrationDate: varchar("mother_emigration_date", { length: 50 }),
  motherNaturalizationDate: varchar("mother_naturalization_date", { length: 50 }),
  motherGrandpaFirstName: varchar("mother_grandpa_first_name", { length: 255 }),
  motherGrandpaLastName: varchar("mother_grandpa_last_name", { length: 255 }),
  motherGrandmaFirstName: varchar("mother_grandma_first_name", { length: 255 }),
  motherGrandmaLastName: varchar("mother_grandma_last_name", { length: 255 }),
  motherGrandmaBirthName: varchar("mother_grandma_birth_name", { length: 255 }),
  
  // Grandparent dates of birth
  fatherGrandpaDateOfBirth: varchar("father_grandpa_date_of_birth", { length: 50 }),
  fatherGrandmaDateOfBirth: varchar("father_grandma_date_of_birth", { length: 50 }),
  motherGrandpaDateOfBirth: varchar("mother_grandpa_date_of_birth", { length: 50 }),
  motherGrandmaDateOfBirth: varchar("mother_grandma_date_of_birth", { length: 50 }),
  
  // Grandparent places of birth
  fatherGrandpaPlaceOfBirth: varchar("father_grandpa_place_of_birth", { length: 255 }),
  fatherGrandmaPlaceOfBirth: varchar("father_grandma_place_of_birth", { length: 255 }),
  motherGrandpaPlaceOfBirth: varchar("mother_grandpa_place_of_birth", { length: 255 }),
  motherGrandmaPlaceOfBirth: varchar("mother_grandma_place_of_birth", { length: 255 }),
  
  // Grandparent emigration and naturalization dates
  fatherGrandpaEmigrationDate: varchar("father_grandpa_emigration_date", { length: 50 }),
  fatherGrandpaNaturalizationDate: varchar("father_grandpa_naturalization_date", { length: 50 }),
  fatherGrandmaEmigrationDate: varchar("father_grandma_emigration_date", { length: 50 }),
  fatherGrandmaNaturalizationDate: varchar("father_grandma_naturalization_date", { length: 50 }),
  motherGrandpaEmigrationDate: varchar("mother_grandpa_emigration_date", { length: 50 }),
  motherGrandpaNaturalizationDate: varchar("mother_grandpa_naturalization_date", { length: 50 }),
  motherGrandmaEmigrationDate: varchar("mother_grandma_emigration_date", { length: 50 }),
  motherGrandmaNaturalizationDate: varchar("mother_grandma_naturalization_date", { length: 50 }),
  
  // Great Grandparents - Father's side
  fatherGreatGrandpaFirstName: varchar("father_great_grandpa_first_name", { length: 255 }),
  fatherGreatGrandpaLastName: varchar("father_great_grandpa_last_name", { length: 255 }),
  fatherGreatGrandpaDateOfBirth: varchar("father_great_grandpa_date_of_birth", { length: 50 }),
  fatherGreatGrandpaPlaceOfBirth: varchar("father_great_grandpa_place_of_birth", { length: 255 }),
  fatherGreatGrandpaEmigrationDate: varchar("father_great_grandpa_emigration_date", { length: 50 }),
  fatherGreatGrandpaNaturalizationDate: varchar("father_great_grandpa_naturalization_date", { length: 50 }),
  
  fatherGreatGrandmaFirstName: varchar("father_great_grandma_first_name", { length: 255 }),
  fatherGreatGrandmaLastName: varchar("father_great_grandma_last_name", { length: 255 }),
  fatherGreatGrandmaBirthName: varchar("father_great_grandma_birth_name", { length: 255 }),
  fatherGreatGrandmaDateOfBirth: varchar("father_great_grandma_date_of_birth", { length: 50 }),
  fatherGreatGrandmaPlaceOfBirth: varchar("father_great_grandma_place_of_birth", { length: 255 }),
  fatherGreatGrandmaEmigrationDate: varchar("father_great_grandma_emigration_date", { length: 50 }),
  fatherGreatGrandmaNaturalizationDate: varchar("father_great_grandma_naturalization_date", { length: 50 }),
  
  // Great Grandparents - Mother's side
  motherGreatGrandpaFirstName: varchar("mother_great_grandpa_first_name", { length: 255 }),
  motherGreatGrandpaLastName: varchar("mother_great_grandpa_last_name", { length: 255 }),
  motherGreatGrandpaDateOfBirth: varchar("mother_great_grandpa_date_of_birth", { length: 50 }),
  motherGreatGrandpaPlaceOfBirth: varchar("mother_great_grandpa_place_of_birth", { length: 255 }),
  motherGreatGrandpaEmigrationDate: varchar("mother_great_grandpa_emigration_date", { length: 50 }),
  motherGreatGrandpaNaturalizationDate: varchar("mother_great_grandpa_naturalization_date", { length: 50 }),
  
  motherGreatGrandmaFirstName: varchar("mother_great_grandma_first_name", { length: 255 }),
  motherGreatGrandmaLastName: varchar("mother_great_grandma_last_name", { length: 255 }),
  motherGreatGrandmaBirthName: varchar("mother_great_grandma_birth_name", { length: 255 }),
  motherGreatGrandmaDateOfBirth: varchar("mother_great_grandma_date_of_birth", { length: 50 }),
  motherGreatGrandmaPlaceOfBirth: varchar("mother_great_grandma_place_of_birth", { length: 255 }),
  motherGreatGrandmaEmigrationDate: varchar("mother_great_grandma_emigration_date", { length: 50 }),
  motherGreatGrandmaNaturalizationDate: varchar("mother_great_grandma_naturalization_date", { length: 50 }),
  
  // Document specific fields
  eventType: varchar("event_type", { length: 100 }), // birth, marriage, death
  eventDate: varchar("event_date", { length: 50 }),
  eventPlace: varchar("event_place", { length: 255 }),
  eventCountry: varchar("event_country", { length: 100 }),
  registryOffice: varchar("registry_office", { length: 255 }),
  actNumber: varchar("act_number", { length: 100 }),
  actYear: varchar("act_year", { length: 10 }),
  
  // Correction/Amendment fields
  incorrectData: text("incorrect_data"),
  correctData: text("correct_data"),
  
  // Name change fields
  oldName: varchar("old_name", { length: 255 }),
  newName: varchar("new_name", { length: 255 }),
  
  // Processing metadata
  ocrProcessed: boolean("ocr_processed").default(false),
  aiProvider: varchar("ai_provider", { length: 50 }), // openai, claude, grok
  extractedData: text("extracted_data"), // JSON of OCR results
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const generatedDocuments = pgTable("generated_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dataEntryId: varchar("data_entry_id").references(() => dataEntries.id),
  templateType: varchar("template_type", { length: 100 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }),
  status: varchar("status", { length: 50 }).default("generated"), // generated, downloaded, printed
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for data population
export const insertDataEntrySchema = createInsertSchema(dataEntries);
export type InsertDataEntry = z.infer<typeof insertDataEntrySchema>;
export type DataEntry = typeof dataEntries.$inferSelect;

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates);
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;

export const insertGeneratedDocumentSchema = createInsertSchema(generatedDocuments);
export type InsertGeneratedDocument = z.infer<typeof insertGeneratedDocumentSchema>;
export type GeneratedDocument = typeof generatedDocuments.$inferSelect;

// PDF Workbench - Template definitions
export const pdfTemplates = pgTable("pdf_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  sourcePath: varchar("source_path").notNull(), // Dropbox path to original PDF
  acroFieldNames: jsonb("acro_field_names"), // Array of field names from AcroForm
  category: varchar("category", { enum: ['poa', 'citizenship', 'registry', 'other'] }).notNull().default('other'),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PDF Workbench - Field mappings for autofill
export const pdfMappings = pgTable("pdf_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").references(() => pdfTemplates.id),
  fields: jsonb("fields").notNull(), // Record<string, string> mapping field names to data keys
  mappingType: varchar("mapping_type", { enum: ['case', 'client', 'form', 'custom'] }).notNull().default('case'),
  description: text("description"),
  createdBy: varchar("created_by"), // admin user id
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PDF Workbench - Draft versions and saves
export const pdfDrafts = pgTable("pdf_drafts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").notNull(),
  templateId: varchar("template_id").references(() => pdfTemplates.id),
  filename: varchar("filename").notNull(),
  version: integer("version").notNull().default(1),
  storageUri: varchar("storage_uri").notNull(), // Dropbox path to saved file
  localPath: varchar("local_path"), // Local temp path if applicable
  status: varchar("status", { enum: ['draft', 'saved', 'flattened', 'printed'] }).notNull().default('draft'),
  fieldData: jsonb("field_data"), // Current field values
  notes: text("notes"),
  isSensitiveMasked: boolean("is_sensitive_masked").default(true),
  createdBy: varchar("created_by"), // user id
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Case versions for audit trail and undo/redo functionality
export const caseVersions = pgTable("case_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caseId: varchar("case_id").notNull(),
  entity: varchar("entity").notNull(), // Which part of the case was changed (e.g., 'case_progress', 'client_details')
  fieldName: varchar("field_name"), // Specific field that changed
  dataBefore: jsonb("data_before"), // Original data
  dataAfter: jsonb("data_after"), // New data
  actor: varchar("actor").notNull(), // Who made the change
  reason: text("reason"), // Optional reason for the change
  changeType: varchar("change_type", { 
    enum: ['create', 'update', 'delete', 'restore'] 
  }).notNull().default('update'),
  isUndone: boolean("is_undone").default(false), // Track if this version was undone
  undoneBy: varchar("undone_by"), // Who undid this change
  undoneAt: timestamp("undone_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cases ingest queue for Dropbox auto-import
export const casesIngestQueue = pgTable("cases_ingest_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  folderPath: varchar("folder_path").notNull(), // Full Dropbox path like "/CASES/ABC123_John_Doe"
  folderName: varchar("folder_name").notNull(), // Just the folder name for display
  caseId: varchar("case_id"), // Extracted from HYBRID naming (ABC123)
  clientName: varchar("client_name"), // Extracted from HYBRID naming (John_Doe)
  clientEmail: varchar("client_email"), // Extracted if present in naming
  contentHash: varchar("content_hash").notNull(), // To prevent duplicate imports
  fileCount: integer("file_count").default(0), // Number of files in folder
  fileList: jsonb("file_list"), // Array of file paths/metadata
  status: varchar("status", { 
    enum: ['pending', 'linked', 'created', 'ignored'] 
  }).notNull().default('pending'),
  linkedToCaseId: varchar("linked_to_case_id"), // If linked to existing case
  processedBy: varchar("processed_by"), // Admin who processed it
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PdfTemplate = typeof pdfTemplates.$inferSelect;
export type InsertPdfTemplate = typeof pdfTemplates.$inferInsert;
export type PdfMapping = typeof pdfMappings.$inferSelect;
export type InsertPdfMapping = typeof pdfMappings.$inferInsert;
export type PdfDraft = typeof pdfDrafts.$inferSelect;
export type InsertPdfDraft = typeof pdfDrafts.$inferInsert;

export const insertPdfTemplateSchema = createInsertSchema(pdfTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPdfTemplateSchema = createSelectSchema(pdfTemplates);

export const insertPdfMappingSchema = createInsertSchema(pdfMappings).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPdfMappingSchema = createSelectSchema(pdfMappings);

export const insertPdfDraftSchema = createInsertSchema(pdfDrafts).omit({ id: true, createdAt: true, updatedAt: true });
export const selectPdfDraftSchema = createSelectSchema(pdfDrafts);

// Prospect Cases schema exports
export type ProspectCase = typeof prospectCases.$inferSelect;
export type InsertProspectCase = typeof prospectCases.$inferInsert;

export const insertProspectCaseSchema = createInsertSchema(prospectCases).omit({ createdAt: true, updatedAt: true });
export const selectProspectCaseSchema = createSelectSchema(prospectCases);

// Case Versions schema exports
export type CaseVersion = typeof caseVersions.$inferSelect;
export type InsertCaseVersion = typeof caseVersions.$inferInsert;

export const insertCaseVersionSchema = createInsertSchema(caseVersions).omit({ id: true, createdAt: true });
export const selectCaseVersionSchema = createSelectSchema(caseVersions);

// Cases Ingest Queue schema exports
export type CasesIngestQueue = typeof casesIngestQueue.$inferSelect;
export type InsertCasesIngestQueue = typeof casesIngestQueue.$inferInsert;

export const insertCasesIngestQueueSchema = createInsertSchema(casesIngestQueue).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCasesIngestQueueSchema = createSelectSchema(casesIngestQueue);