import { db } from "./db";
import { users, eligibilityAssessments, consultationRequests } from "@shared/schema";
import type { 
  User, 
  UpsertUser, 
  EligibilityAssessment, 
  InsertEligibilityAssessment, 
  ConsultationRequest, 
  InsertConsultationRequest 
} from "@shared/schema";
import type { IStorage } from "./storage";
import { eq } from "drizzle-orm";

export class DatabaseStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: UpsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async createEligibilityAssessment(assessment: InsertEligibilityAssessment): Promise<EligibilityAssessment> {
    const result = await db.insert(eligibilityAssessments).values(assessment).returning();
    return result[0];
  }

  async createConsultationRequest(request: InsertConsultationRequest): Promise<ConsultationRequest> {
    const result = await db.insert(consultationRequests).values(request).returning();
    return result[0];
  }

  async getEligibilityAssessments(): Promise<EligibilityAssessment[]> {
    return await db.select().from(eligibilityAssessments).orderBy(eligibilityAssessments.createdAt);
  }

  async getConsultationRequests(): Promise<ConsultationRequest[]> {
    return await db.select().from(consultationRequests).orderBy(consultationRequests.createdAt);
  }
}

export const dbStorage = new DatabaseStorage();