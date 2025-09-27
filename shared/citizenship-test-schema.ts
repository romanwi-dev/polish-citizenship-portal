import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Citizenship Test Responses Table
export const citizenshipTestResponses = pgTable("citizenship_test_responses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Personal Information
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  
  // Test Response Data
  answers: jsonb("answers").notNull(), // Store all answers as JSON
  
  // Eligibility Analysis Results
  eligibilityScore: integer("eligibility_score").notNull().default(0),
  eligibilityLevel: text("eligibility_level").notNull(), // HIGH, MEDIUM, LOW, VERY_LOW
  
  // Generated Recommendations
  recommendations: jsonb("recommendations").notNull().default('[]'),
  documentRequirements: jsonb("document_requirements").notNull().default('[]'),
  estimatedTimeframe: text("estimated_timeframe").notNull().default('Unknown'),
  
  // Metadata
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Answer structure for individual questions
export const AnswerSchema = z.object({
  questionId: z.string(),
  questionText: z.string(),
  answerType: z.enum(['text', 'email', 'choice', 'multiple_choice', 'boolean', 'number']),
  answer: z.union([
    z.string(),
    z.array(z.string()),
    z.boolean(),
    z.number(),
  ]),
  score: z.number().optional(), // Points awarded for this answer
});

// Test Response Schema
export const TestResponseSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  answers: z.array(AnswerSchema),
});

// Insert and Select Schemas
export const insertCitizenshipTestResponseSchema = createInsertSchema(citizenshipTestResponses, {
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  answers: z.array(AnswerSchema),
  eligibilityScore: z.number().min(0).max(100),
  eligibilityLevel: z.enum(['HIGH', 'MEDIUM', 'LOW', 'VERY_LOW']),
});

export const selectCitizenshipTestResponseSchema = createSelectSchema(citizenshipTestResponses);

export type CitizenshipTestResponse = typeof citizenshipTestResponses.$inferSelect;
export type InsertCitizenshipTestResponse = typeof citizenshipTestResponses.$inferInsert;
export type TestAnswer = z.infer<typeof AnswerSchema>;
export type TestSubmission = z.infer<typeof TestResponseSchema>;

// Test Questions Structure - Based on TypeForm Analysis
export interface TestQuestion {
  id: string;
  type: 'welcome' | 'text' | 'email' | 'multiple_choice' | 'yes_no' | 'statement';
  title: string;
  description?: string;
  required: boolean;
  choices?: Array<{
    id: string;
    label: string;
    score: number; // Points awarded for this choice
  }>;
  validationRule?: {
    type: 'required' | 'email' | 'min_length' | 'max_length';
    value?: number;
  };
  logicJump?: {
    condition: string;
    destination: string;
  };
}

// Complete Polish Citizenship Test Questions
export const POLISH_CITIZENSHIP_TEST_QUESTIONS: TestQuestion[] = [
  {
    id: 'welcome',
    type: 'welcome',
    title: 'Polish Citizenship Eligibility Test',
    description: 'This comprehensive assessment will evaluate your eligibility for Polish citizenship by descent. Answer all questions honestly for the most accurate result.',
    required: false,
  },
  {
    id: 'full_name',
    type: 'text',
    title: 'What is your full name?',
    description: 'Please provide your complete legal name as it appears on official documents.',
    required: true,
    validationRule: { type: 'min_length', value: 2 },
  },
  {
    id: 'email',
    type: 'email',
    title: 'What is your email address?',
    description: 'We\'ll use this to send you your detailed eligibility report.',
    required: true,
    validationRule: { type: 'email' },
  },
  {
    id: 'birth_country',
    type: 'text',
    title: 'In which country were you born?',
    description: 'Enter the name of the country where you were born.',
    required: true,
  },
  {
    id: 'current_citizenship',
    type: 'text',
    title: 'What is your current citizenship/nationality?',
    description: 'List all citizenships you currently hold.',
    required: true,
  },
  {
    id: 'polish_ancestor',
    type: 'multiple_choice',
    title: 'Do you have any Polish ancestors?',
    description: 'This includes parents, grandparents, or great-grandparents.',
    required: true,
    choices: [
      { id: 'yes_parent', label: 'Yes, at least one parent', score: 30 },
      { id: 'yes_grandparent', label: 'Yes, at least one grandparent', score: 25 },
      { id: 'yes_great_grandparent', label: 'Yes, at least one great-grandparent', score: 20 },
      { id: 'no', label: 'No Polish ancestors', score: 0 },
      { id: 'unsure', label: 'I\'m not sure', score: 5 },
    ],
  },
  {
    id: 'ancestor_details',
    type: 'text',
    title: 'Please provide details about your Polish ancestor(s)',
    description: 'Include their full name, birth year, place of birth in Poland, and relationship to you.',
    required: true,
  },
  {
    id: 'birth_certificates',
    type: 'multiple_choice',
    title: 'Do you have birth certificates for your Polish ancestor(s)?',
    required: true,
    choices: [
      { id: 'yes_original', label: 'Yes, original Polish birth certificates', score: 25 },
      { id: 'yes_copies', label: 'Yes, certified copies', score: 20 },
      { id: 'foreign_birth_cert', label: 'Only foreign birth certificates mentioning Poland', score: 15 },
      { id: 'no_but_can_obtain', label: 'No, but I know where to obtain them', score: 10 },
      { id: 'no', label: 'No, and I don\'t know how to get them', score: 0 },
    ],
  },
  {
    id: 'marriage_certificates',
    type: 'multiple_choice',
    title: 'Do you have marriage certificates for your Polish ancestor(s)?',
    required: true,
    choices: [
      { id: 'yes_polish', label: 'Yes, Polish marriage certificates', score: 15 },
      { id: 'yes_foreign', label: 'Yes, foreign marriage certificates', score: 10 },
      { id: 'not_applicable', label: 'Not applicable (unmarried ancestor)', score: 0 },
      { id: 'no', label: 'No marriage certificates', score: 0 },
    ],
  },
  {
    id: 'death_certificates',
    type: 'multiple_choice',
    title: 'Do you have death certificates for your Polish ancestor(s)?',
    required: true,
    choices: [
      { id: 'yes_polish', label: 'Yes, Polish death certificates', score: 10 },
      { id: 'yes_foreign', label: 'Yes, foreign death certificates', score: 5 },
      { id: 'still_alive', label: 'My Polish ancestor is still alive', score: 15 },
      { id: 'no', label: 'No death certificates', score: 0 },
    ],
  },
  {
    id: 'citizenship_loss',
    type: 'multiple_choice',
    title: 'Did your Polish ancestor ever lose or renounce Polish citizenship?',
    description: 'This is crucial for determining eligibility. Check historical records carefully.',
    required: true,
    choices: [
      { id: 'never_lost', label: 'No, never lost Polish citizenship', score: 30 },
      { id: 'lost_before_1920', label: 'Lost citizenship before 1920', score: 0 },
      { id: 'lost_after_children', label: 'Lost citizenship after having children', score: 25 },
      { id: 'lost_before_children', label: 'Lost citizenship before having children', score: 0 },
      { id: 'unsure', label: 'I\'m not sure', score: 5 },
    ],
  },
  {
    id: 'emigration_year',
    type: 'text',
    title: 'In what year did your Polish ancestor emigrate from Poland?',
    description: 'This affects citizenship transmission laws. Enter approximate year if unsure.',
    required: true,
  },
  {
    id: 'unbroken_chain',
    type: 'yes_no',
    title: 'Can you trace an unbroken chain of citizenship from your Polish ancestor to yourself?',
    description: 'This means each generation maintained citizenship until the next was born.',
    required: true,
    choices: [
      { id: 'yes', label: 'Yes, unbroken chain', score: 25 },
      { id: 'no', label: 'No, broken chain', score: 0 },
      { id: 'unsure', label: 'I\'m not sure', score: 10 },
    ],
  },
  {
    id: 'military_service',
    type: 'multiple_choice',
    title: 'Did your Polish ancestor serve in any military?',
    required: true,
    choices: [
      { id: 'polish_military', label: 'Polish military only', score: 10 },
      { id: 'foreign_military', label: 'Foreign military (may affect citizenship)', score: -5 },
      { id: 'both', label: 'Both Polish and foreign military', score: 5 },
      { id: 'no_service', label: 'No military service', score: 0 },
      { id: 'unknown', label: 'Unknown', score: 0 },
    ],
  },
  {
    id: 'documentation_availability',
    type: 'multiple_choice',
    title: 'How much documentation do you currently have about your Polish ancestry?',
    required: true,
    choices: [
      { id: 'comprehensive', label: 'Comprehensive documentation (birth, marriage, death certificates)', score: 25 },
      { id: 'partial', label: 'Partial documentation (some certificates missing)', score: 15 },
      { id: 'minimal', label: 'Minimal documentation (family stories, few documents)', score: 5 },
      { id: 'none', label: 'No documentation (only family oral history)', score: 0 },
    ],
  },
  {
    id: 'research_willingness',
    type: 'multiple_choice',
    title: 'Are you willing to conduct archival research in Poland if needed?',
    description: 'Some cases require extensive document searches in Polish archives.',
    required: true,
    choices: [
      { id: 'yes_myself', label: 'Yes, I can research myself', score: 10 },
      { id: 'yes_professional', label: 'Yes, with professional help', score: 15 },
      { id: 'maybe', label: 'Maybe, depending on complexity', score: 5 },
      { id: 'no', label: 'No, I prefer not to', score: 0 },
    ],
  },
  {
    id: 'timeline_preference',
    type: 'multiple_choice',
    title: 'What is your preferred timeline for completing the citizenship process?',
    required: true,
    choices: [
      { id: 'asap', label: 'As soon as possible (6-12 months)', score: 0 },
      { id: 'reasonable', label: 'Reasonable timeframe (1-2 years)', score: 5 },
      { id: 'patient', label: 'I can be patient (2-5 years)', score: 10 },
      { id: 'no_rush', label: 'No specific timeline', score: 5 },
    ],
  },
];