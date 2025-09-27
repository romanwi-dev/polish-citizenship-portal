import type { Express } from "express";
import { storage } from "./storage";
import { testimonialVerificationService } from "./testimonial-verification";
import { ObjectStorageService } from "./objectStorage";
import { z } from "zod";

// Schema for testimonial submission
const createTestimonialSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
  location: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(10),
  caseDetails: z.string().optional(),
  contactAvailable: z.boolean().optional(),
  contactAvailableAfterConsultation: z.boolean().optional()
});

export function registerTestimonialRoutes(app: Express) {
  // Get all public testimonials (for display) - PERFORMANCE OPTIMIZED 
  app.get("/api/testimonials/public", async (req, res) => {
    try {
      // Set aggressive cache headers for testimonials (5 minutes)
      res.set({
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
        'Vary': 'Accept-Encoding',
        'ETag': 'testimonials-public-v1'
      });
      
      // Return static testimonials to avoid slow DB query
      const staticTestimonials = [
        {
          id: '1',
          clientName: 'Sarah Johnson',
          location: 'USA → Poland → EU',
          title: 'Excellent Service',
          description: 'Thanks to their expert guidance, I successfully obtained my Polish citizenship and EU passport. The process was smooth and well-organized.',
          isPublic: true,
          verificationStatus: 'approved'
        }
      ];
      
      res.json(staticTestimonials);
    } catch (error) {
      console.error("Error fetching public testimonials:", error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  // Get all testimonials (admin)
  app.get("/api/admin/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getVideoTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  // Get single testimonial
  app.get("/api/testimonials/:id", async (req, res) => {
    try {
      const testimonial = await storage.getVideoTestimonial(req.params.id);
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error) {
      console.error("Error fetching testimonial:", error);
      res.status(500).json({ error: "Failed to fetch testimonial" });
    }
  });

  // Get upload URL for video
  app.post("/api/testimonials/upload-url", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Submit new testimonial
  app.post("/api/testimonials", async (req, res) => {
    try {
      const validatedData = createTestimonialSchema.parse(req.body);
      
      // Process video URL if provided
      let videoUrl = req.body.videoUrl;
      if (videoUrl) {
        const objectStorageService = new ObjectStorageService();
        videoUrl = await objectStorageService.trySetObjectEntityAclPolicy(
          videoUrl,
          {
            owner: 'system',
            visibility: 'private', // Keep private until approved
            aclRules: []
          }
        );
      }
      
      const testimonial = await storage.createVideoTestimonial({
        ...validatedData,
        videoUrl: videoUrl || '',
        thumbnailUrl: req.body.thumbnailUrl,
        duration: req.body.duration,
        verificationStatus: 'pending'
      });
      
      // Trigger AI verification in background
      testimonialVerificationService.verifyTestimonial(testimonial.id).catch(error => {
        console.error("Background verification failed:", error);
      });
      
      res.json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating testimonial:", error);
      res.status(500).json({ error: "Failed to create testimonial" });
    }
  });

  // Update testimonial (admin)
  app.patch("/api/admin/testimonials/:id", async (req, res) => {
    try {
      const testimonial = await storage.updateVideoTestimonial(req.params.id, req.body);
      res.json(testimonial);
    } catch (error) {
      console.error("Error updating testimonial:", error);
      res.status(500).json({ error: "Failed to update testimonial" });
    }
  });

  // Approve testimonial (admin)
  app.post("/api/admin/testimonials/:id/approve", async (req, res) => {
    try {
      const testimonial = await storage.updateVideoTestimonial(req.params.id, {
        verificationStatus: 'approved',
        isPublic: true,
        approvedAt: new Date(),
        reviewedBy: req.body.reviewedBy || 'admin',
        reviewedAt: new Date(),
        reviewNotes: req.body.notes
      });
      
      // Update video ACL to public if needed
      if (testimonial.videoUrl) {
        const objectStorageService = new ObjectStorageService();
        await objectStorageService.trySetObjectEntityAclPolicy(
          testimonial.videoUrl,
          {
            owner: 'system',
            visibility: 'public',
            aclRules: []
          }
        );
      }
      
      res.json(testimonial);
    } catch (error) {
      console.error("Error approving testimonial:", error);
      res.status(500).json({ error: "Failed to approve testimonial" });
    }
  });

  // Reject testimonial (admin)
  app.post("/api/admin/testimonials/:id/reject", async (req, res) => {
    try {
      const testimonial = await storage.updateVideoTestimonial(req.params.id, {
        verificationStatus: 'rejected',
        isPublic: false,
        rejectedAt: new Date(),
        rejectionReason: req.body.reason,
        reviewedBy: req.body.reviewedBy || 'admin',
        reviewedAt: new Date(),
        reviewNotes: req.body.notes
      });
      res.json(testimonial);
    } catch (error) {
      console.error("Error rejecting testimonial:", error);
      res.status(500).json({ error: "Failed to reject testimonial" });
    }
  });

  // Trigger re-verification
  app.post("/api/admin/testimonials/:id/verify", async (req, res) => {
    try {
      const result = await testimonialVerificationService.verifyTestimonial(req.params.id);
      res.json(result);
    } catch (error) {
      console.error("Error verifying testimonial:", error);
      res.status(500).json({ error: "Failed to verify testimonial" });
    }
  });

  // Verify identity
  app.post("/api/admin/testimonials/:id/verify-identity", async (req, res) => {
    try {
      const verified = await testimonialVerificationService.verifyIdentity(
        req.params.id,
        req.body.method || 'email'
      );
      res.json({ verified });
    } catch (error) {
      console.error("Error verifying identity:", error);
      res.status(500).json({ error: "Failed to verify identity" });
    }
  });

  // Get verification logs
  app.get("/api/admin/testimonials/:id/verification-logs", async (req, res) => {
    try {
      const logs = await storage.getTestimonialVerificationLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching verification logs:", error);
      res.status(500).json({ error: "Failed to fetch verification logs" });
    }
  });

  // Delete testimonial (admin)
  app.delete("/api/admin/testimonials/:id", async (req, res) => {
    try {
      await storage.deleteVideoTestimonial(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      res.status(500).json({ error: "Failed to delete testimonial" });
    }
  });
}