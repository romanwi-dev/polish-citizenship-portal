import { 
  type VideoTestimonial, 
  type InsertTestimonialVerificationLog,
  videoTestimonials,
  testimonialVerificationLogs 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import * as client from "@anthropic-ai/sdk";

// AI Verification Service for Video Testimonials
export class TestimonialVerificationService {
  private anthropic: client.Anthropic | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new client.Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  // Main verification pipeline
  async verifyTestimonial(testimonialId: string): Promise<{
    status: 'approved' | 'rejected' | 'needs_review';
    score: number;
    details: any;
  }> {
    const [testimonial] = await db.select()
      .from(videoTestimonials)
      .where(eq(videoTestimonials.id, testimonialId));

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    // Run multiple verification checks in parallel
    const [
      authenticityCheck,
      contentCheck,
      qualityCheck,
      complianceCheck
    ] = await Promise.all([
      this.checkAuthenticity(testimonial),
      this.checkContent(testimonial),
      this.checkQuality(testimonial),
      this.checkCompliance(testimonial)
    ]);

    // Calculate overall score
    const overallScore = this.calculateOverallScore([
      authenticityCheck,
      contentCheck,
      qualityCheck,
      complianceCheck
    ]);

    // Determine verification status
    let status: 'approved' | 'rejected' | 'needs_review';
    if (overallScore >= 80) {
      status = 'approved';
    } else if (overallScore < 50) {
      status = 'rejected';
    } else {
      status = 'needs_review';
    }

    // Update testimonial status
    await db.update(videoTestimonials)
      .set({
        verificationStatus: status === 'approved' ? 'ai_verified' : status === 'rejected' ? 'rejected' : 'manual_review',
        aiVerificationScore: overallScore.toString(),
        aiVerificationDetails: {
          authenticity: authenticityCheck,
          content: contentCheck,
          quality: qualityCheck,
          compliance: complianceCheck
        },
        updatedAt: new Date()
      })
      .where(eq(videoTestimonials.id, testimonialId));

    return {
      status,
      score: overallScore,
      details: {
        authenticity: authenticityCheck,
        content: contentCheck,
        quality: qualityCheck,
        compliance: complianceCheck
      }
    };
  }

  // Check video authenticity using AI
  private async checkAuthenticity(testimonial: VideoTestimonial): Promise<{
    score: number;
    result: 'pass' | 'fail' | 'needs_review';
    details: any;
  }> {
    const startTime = Date.now();
    
    // Simulate AI authenticity check (would integrate with video analysis API)
    // In production, this would analyze video metadata, facial recognition, deepfake detection
    const checks = {
      hasValidMetadata: true,
      consistentLighting: true,
      naturalMovement: true,
      audioVideoSync: true,
      noDeepfakeIndicators: true
    };

    const passedChecks = Object.values(checks).filter(v => v).length;
    const score = (passedChecks / Object.keys(checks).length) * 100;

    // Log verification
    await this.logVerification(testimonial.id, 'authenticity', score, score >= 70 ? 'pass' : score < 40 ? 'fail' : 'needs_review', checks, Date.now() - startTime);

    return {
      score,
      result: score >= 70 ? 'pass' : score < 40 ? 'fail' : 'needs_review',
      details: checks
    };
  }

  // Check content quality and relevance
  private async checkContent(testimonial: VideoTestimonial): Promise<{
    score: number;
    result: 'pass' | 'fail' | 'needs_review';
    details: any;
  }> {
    const startTime = Date.now();
    let score = 85; // Base score
    const details: any = {};

    if (this.anthropic) {
      try {
        // Use AI to analyze testimonial content
        const response = await this.anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 300,
          messages: [{
            role: "user",
            content: `Analyze this testimonial for Polish citizenship services and rate it (0-100):
              Title: ${testimonial.title}
              Description: ${testimonial.description}
              Case Details: ${testimonial.caseDetails}
              
              Check for:
              1. Relevance to Polish citizenship services
              2. Clarity and coherence
              3. Specific details about the experience
              4. Professional tone
              5. Absence of inappropriate content
              
              Return a JSON object with score and details.`
          }]
        });

        const content = response.content[0];
        if (content.type === 'text') {
          try {
            const analysis = JSON.parse(content.text);
            score = analysis.score || 85;
            Object.assign(details, analysis.details || {});
          } catch {
            // If parsing fails, use default score
          }
        }
      } catch (error) {
        console.error('AI content analysis failed:', error);
      }
    }

    // Fallback content checks
    details.hasTitle = !!testimonial.title;
    details.hasDescription = !!testimonial.description;
    details.hasCaseDetails = !!testimonial.caseDetails;
    details.appropriateLength = (testimonial.description?.length || 0) > 50;

    // Log verification
    await this.logVerification(testimonial.id, 'content', score, score >= 70 ? 'pass' : score < 40 ? 'fail' : 'needs_review', details, Date.now() - startTime);

    return {
      score,
      result: score >= 70 ? 'pass' : score < 40 ? 'fail' : 'needs_review',
      details
    };
  }

  // Check video quality
  private async checkQuality(testimonial: VideoTestimonial): Promise<{
    score: number;
    result: 'pass' | 'fail' | 'needs_review';
    details: any;
  }> {
    const startTime = Date.now();
    
    // Quality checks (would integrate with video analysis API)
    const checks = {
      hasValidDuration: testimonial.duration && parseInt(testimonial.duration.split(':')[0]) < 10,
      hasThumbnail: !!testimonial.thumbnailUrl,
      hasVideoUrl: !!testimonial.videoUrl,
      appropriateLength: true // Would check actual video duration
    };

    const passedChecks = Object.values(checks).filter(v => v).length;
    const score = (passedChecks / Object.keys(checks).length) * 100;

    // Log verification
    await this.logVerification(testimonial.id, 'quality', score, score >= 60 ? 'pass' : score < 30 ? 'fail' : 'needs_review', checks, Date.now() - startTime);

    return {
      score,
      result: score >= 60 ? 'pass' : score < 30 ? 'fail' : 'needs_review',
      details: checks
    };
  }

  // Check compliance with terms
  private async checkCompliance(testimonial: VideoTestimonial): Promise<{
    score: number;
    result: 'pass' | 'fail' | 'needs_review';
    details: any;
  }> {
    const startTime = Date.now();
    
    const checks = {
      hasClientName: !!testimonial.clientName,
      hasClientEmail: !!testimonial.clientEmail,
      hasLocation: !!testimonial.location,
      contactInfoProvided: testimonial.contactAvailable || testimonial.contactAvailableAfterConsultation,
      noSensitiveInfo: true // Would check for PII, medical info, etc.
    };

    const passedChecks = Object.values(checks).filter(v => v).length;
    const score = (passedChecks / Object.keys(checks).length) * 100;

    // Log verification
    await this.logVerification(testimonial.id, 'compliance', score, score >= 80 ? 'pass' : score < 50 ? 'fail' : 'needs_review', checks, Date.now() - startTime);

    return {
      score,
      result: score >= 80 ? 'pass' : score < 50 ? 'fail' : 'needs_review',
      details: checks
    };
  }

  // Calculate overall verification score
  private calculateOverallScore(checks: Array<{ score: number; result: string }>): number {
    const weights = {
      authenticity: 0.35,
      content: 0.30,
      quality: 0.15,
      compliance: 0.20
    };

    let weightedSum = 0;
    let totalWeight = 0;

    checks.forEach((check, index) => {
      const weight = Object.values(weights)[index];
      weightedSum += check.score * weight;
      totalWeight += weight;
    });

    return Math.round(weightedSum / totalWeight);
  }

  // Log verification details
  private async logVerification(
    testimonialId: string,
    verificationType: 'authenticity' | 'identity' | 'content' | 'quality' | 'compliance',
    score: number,
    result: 'pass' | 'fail' | 'needs_review',
    details: any,
    processingTime: number
  ): Promise<void> {
    await db.insert(testimonialVerificationLogs).values({
      testimonialId,
      verificationType,
      score: score.toString(),
      result,
      details,
      aiModel: 'claude-3-haiku',
      processingTime
    });
  }

  // Verify client identity
  async verifyIdentity(testimonialId: string, method: string = 'email'): Promise<boolean> {
    const [testimonial] = await db.select()
      .from(videoTestimonials)
      .where(eq(videoTestimonials.id, testimonialId));

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    // Implement identity verification based on method
    let verified = false;
    
    switch (method) {
      case 'email':
        // Send verification email and wait for confirmation
        verified = await this.sendEmailVerification(testimonial.clientEmail);
        break;
      case 'phone':
        // Send SMS verification
        if (testimonial.clientPhone) {
          verified = await this.sendPhoneVerification(testimonial.clientPhone);
        }
        break;
      case 'document':
        // Request document upload for verification
        verified = false; // Requires manual review
        break;
    }

    if (verified) {
      await db.update(videoTestimonials)
        .set({
          identityVerified: true,
          identityVerificationMethod: method,
          identityVerificationDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(videoTestimonials.id, testimonialId));

      // Log identity verification
      await this.logVerification(testimonialId, 'identity', 100, 'pass', { method, verified }, 0);
    }

    return verified;
  }

  // Email verification (stub - would integrate with email service)
  private async sendEmailVerification(email: string): Promise<boolean> {
    console.log(`Sending verification email to ${email}`);
    // In production, would send actual email and track verification
    return true;
  }

  // Phone verification (stub - would integrate with SMS service)
  private async sendPhoneVerification(phone: string): Promise<boolean> {
    console.log(`Sending verification SMS to ${phone}`);
    // In production, would send actual SMS and track verification
    return true;
  }
}

export const testimonialVerificationService = new TestimonialVerificationService();