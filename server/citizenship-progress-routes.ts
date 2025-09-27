import type { Express } from "express";
import { z } from "zod";
import { db } from "./db";
import { citizenshipProgress, citizenshipMilestones, users, type CitizenshipProgress, type InsertCitizenshipProgress } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

// Default citizenship stages with proper order
const DEFAULT_CITIZENSHIP_STAGES = [
  {
    stageId: "initial-consultation",
    stageName: "Initial Consultation",
    estimatedDuration: "1-2 weeks",
    requirements: ["Completed eligibility test", "Initial documentation review", "Service agreement signed"],
    orderIndex: 1
  },
  {
    stageId: "document-collection",
    stageName: "Document Collection",
    estimatedDuration: "2-4 months",
    requirements: ["Birth certificates", "Marriage certificates", "Immigration records", "Polish civil acts"],
    orderIndex: 2
  },
  {
    stageId: "document-verification",
    stageName: "Document Verification",
    estimatedDuration: "3-6 weeks",
    requirements: ["Apostille certification", "Sworn translations", "Document authentication"],
    orderIndex: 3
  },
  {
    stageId: "application-preparation",
    stageName: "Application Preparation",
    estimatedDuration: "2-3 weeks",
    requirements: ["Complete application forms", "Prepare supporting documentation", "Legal review"],
    orderIndex: 4
  },
  {
    stageId: "government-submission",
    stageName: "Government Submission",
    estimatedDuration: "1-2 weeks",
    requirements: ["Submit to Provincial Office", "Pay government fees", "Receive confirmation"],
    orderIndex: 5
  },
  {
    stageId: "government-review",
    stageName: "Government Review",
    estimatedDuration: "12-36 months",
    requirements: ["Government case review", "Possible additional requests", "Final decision"],
    orderIndex: 6
  },
  {
    stageId: "decision-notification",
    stageName: "Decision & Documentation",
    estimatedDuration: "2-4 weeks",
    requirements: ["Citizenship confirmation", "Polish passport application", "ID card processing"],
    orderIndex: 7
  }
];

// Initialize default progress stages for a user
async function initializeUserProgress(userId: string): Promise<CitizenshipProgress[]> {
  const existingProgress = await db
    .select()
    .from(citizenshipProgress)
    .where(eq(citizenshipProgress.userId, userId));

  if (existingProgress.length > 0) {
    return existingProgress;
  }

  // Create default stages for new user
  const progressData: InsertCitizenshipProgress[] = DEFAULT_CITIZENSHIP_STAGES.map((stage, index) => ({
    userId,
    stageId: stage.stageId,
    stageName: stage.stageName,
    status: index === 0 ? 'in-progress' : 'pending', // First stage starts as in-progress
    estimatedDuration: stage.estimatedDuration,
    requirements: stage.requirements,
    orderIndex: stage.orderIndex,
    startDate: index === 0 ? new Date() : undefined,
    notes: index === 0 ? "Initial consultation stage started" : undefined
  }));

  const newProgress = await db
    .insert(citizenshipProgress)
    .values(progressData)
    .returning();

  return newProgress;
}

// Update stage status
const updateStageStatusSchema = z.object({
  stageId: z.string(),
  status: z.enum(['completed', 'in-progress', 'pending', 'delayed']),
  notes: z.string().optional(),
  actualDuration: z.string().optional()
});

export function registerCitizenshipProgressRoutes(app: Express) {
  // Get user's citizenship progress
  app.get('/api/citizenship-progress/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      // Verify user exists
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get or initialize progress
      let progress = await db
        .select()
        .from(citizenshipProgress)
        .where(eq(citizenshipProgress.userId, userId))
        .orderBy(citizenshipProgress.orderIndex);

      if (progress.length === 0) {
        progress = await initializeUserProgress(userId);
      }

      // Get associated milestones
      const milestones = await db
        .select()
        .from(citizenshipMilestones)
        .where(eq(citizenshipMilestones.userId, userId))
        .orderBy(citizenshipMilestones.orderIndex);

      // Calculate overall progress
      const completedStages = progress.filter(stage => stage.status === 'completed').length;
      const totalStages = progress.length;
      const progressPercentage = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

      // Find current stage
      const currentStage = progress.find(stage => stage.status === 'in-progress') || 
                          progress.find(stage => stage.status === 'pending');

      res.json({
        success: true,
        data: {
          userId,
          stages: progress,
          milestones,
          summary: {
            totalStages,
            completedStages,
            progressPercentage: Math.round(progressPercentage),
            currentStage: currentStage ? {
              id: currentStage.stageId,
              name: currentStage.stageName,
              status: currentStage.status
            } : null
          }
        }
      });
    } catch (error) {
      console.error('Error fetching citizenship progress:', error);
      res.status(500).json({ error: 'Failed to fetch citizenship progress' });
    }
  });

  // Update stage status
  app.patch('/api/citizenship-progress/:userId/:stageId', async (req, res) => {
    try {
      const { userId, stageId } = req.params;
      const validatedData = updateStageStatusSchema.parse(req.body);

      // Update the stage
      const updateData: Partial<CitizenshipProgress> = {
        status: validatedData.status,
        notes: validatedData.notes,
        actualDuration: validatedData.actualDuration,
        updatedAt: new Date()
      };

      // Set completion date if completing
      if (validatedData.status === 'completed') {
        updateData.completedDate = new Date();
      }

      // Set start date if starting
      if (validatedData.status === 'in-progress') {
        const existingStage = await db
          .select()
          .from(citizenshipProgress)
          .where(and(
            eq(citizenshipProgress.userId, userId),
            eq(citizenshipProgress.stageId, stageId)
          ))
          .limit(1);

        if (existingStage.length > 0 && !existingStage[0].startDate) {
          updateData.startDate = new Date();
        }
      }

      const updatedStage = await db
        .update(citizenshipProgress)
        .set(updateData)
        .where(and(
          eq(citizenshipProgress.userId, userId),
          eq(citizenshipProgress.stageId, stageId)
        ))
        .returning();

      if (!updatedStage.length) {
        return res.status(404).json({ error: 'Stage not found' });
      }

      res.json({
        success: true,
        data: updatedStage[0]
      });
    } catch (error) {
      console.error('Error updating stage status:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to update stage status' });
      }
    }
  });

  // Add milestone to a stage
  app.post('/api/citizenship-progress/:userId/milestones', async (req, res) => {
    try {
      const { userId } = req.params;
      const { progressId, title, description, isMajor, orderIndex } = req.body;

      const milestone = await db
        .insert(citizenshipMilestones)
        .values({
          userId,
          progressId,
          title,
          description,
          isMajor: isMajor || false,
          orderIndex: orderIndex || 0,
          completedDate: new Date()
        })
        .returning();

      res.json({
        success: true,
        data: milestone[0]
      });
    } catch (error) {
      console.error('Error adding milestone:', error);
      res.status(500).json({ error: 'Failed to add milestone' });
    }
  });

  // Initialize progress for existing users (admin endpoint)
  app.post('/api/citizenship-progress/initialize/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      // Verify user exists
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        return res.status(404).json({ error: 'User not found' });
      }

      const progress = await initializeUserProgress(userId);

      res.json({
        success: true,
        message: 'Citizenship progress initialized successfully',
        data: progress
      });
    } catch (error) {
      console.error('Error initializing progress:', error);
      res.status(500).json({ error: 'Failed to initialize progress' });
    }
  });

  // Get progress statistics (admin endpoint)
  app.get('/api/citizenship-progress/stats', async (req, res) => {
    try {
      const allProgress = await db
        .select()
        .from(citizenshipProgress);

      const stats = {
        totalUsers: new Set(allProgress.map(p => p.userId)).size,
        stageStats: DEFAULT_CITIZENSHIP_STAGES.map(stage => {
          const stageProgress = allProgress.filter(p => p.stageId === stage.stageId);
          return {
            stageId: stage.stageId,
            stageName: stage.stageName,
            total: stageProgress.length,
            completed: stageProgress.filter(p => p.status === 'completed').length,
            inProgress: stageProgress.filter(p => p.status === 'in-progress').length,
            pending: stageProgress.filter(p => p.status === 'pending').length,
            delayed: stageProgress.filter(p => p.status === 'delayed').length
          };
        })
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching progress statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });
}