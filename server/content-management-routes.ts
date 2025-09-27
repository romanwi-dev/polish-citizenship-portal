import type { Express, Request, Response, NextFunction } from "express";
import { websiteContent, insertWebsiteContentSchema, insertContentEntrySchema } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { storage } from "./storage";
import { getUserFromToken } from "./auth";

// Authentication middleware for content editing
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// For development, strict bypass only if explicitly enabled
async function requireAuthOrDev(req: Request, res: Response, next: NextFunction) {
  // Only allow dev bypass if explicitly enabled AND in development
  if (process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_CONTENT_EDITING === 'true') {
    (req as any).user = { id: 'dev-user', email: 'dev@admin.com', role: 'admin' };
    return next();
  }
  
  return requireAuth(req, res, next);
}

export function registerContentManagementRoutes(app: Express) {
  // Get all content items
  app.get("/api/admin/content", requireAuth, async (req, res) => {
    try {
      const content = await db.select().from(websiteContent)
        .where(eq(websiteContent.isActive, true))
        .orderBy(websiteContent.section, websiteContent.orderIndex);
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Get content by section
  app.get("/api/admin/content/section/:section", requireAuth, async (req, res) => {
    try {
      const { section } = req.params;
      const content = await db.select().from(websiteContent)
        .where(and(
          eq(websiteContent.section, section),
          eq(websiteContent.isActive, true)
        ))
        .orderBy(websiteContent.orderIndex);
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching section content:", error);
      res.status(500).json({ error: "Failed to fetch section content" });
    }
  });

  // Get content by section (public route) - PERFORMANCE OPTIMIZED
  app.get("/api/content/section/:section", async (req, res) => {
    try {
      // Set aggressive cache headers for content (5 minutes)
      res.set({
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
        'Vary': 'Accept-Encoding',
        'ETag': `content-${req.params.section}-v1`
      });
      
      const { section } = req.params;
      
      // Quick return for homepage with static content to avoid DB query
      if (section === 'homepage') {
        const defaultContent = {
          hero_title: 'Secure Your Polish Citizenship',
          hero_subtitle: 'Expert legal assistance for Polish citizenship by descent. Professional document processing, genealogy research, and application support.',
          cta_button_text: 'Get Started Today'
        };
        return res.json(defaultContent);
      }
      
      const content = await db.select().from(websiteContent)
        .where(and(
          eq(websiteContent.section, section),
          eq(websiteContent.isActive, true)
        ))
        .orderBy(websiteContent.orderIndex);
      
      // Convert array to key-value object for easier frontend consumption
      const contentObj = content.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, any>);
      
      res.json(contentObj);
    } catch (error) {
      console.error("Error fetching section content:", error);
      res.status(500).json({ error: "Failed to fetch section content" });
    }
  });

  // Get single content item by key
  app.get("/api/content/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const [content] = await db.select().from(websiteContent)
        .where(and(
          eq(websiteContent.key, key),
          eq(websiteContent.isActive, true)
        ));
      
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching content item:", error);
      res.status(500).json({ error: "Failed to fetch content item" });
    }
  });

  // Create new content item
  app.post("/api/admin/content", requireAuth, async (req, res) => {
    try {
      const validatedData = insertWebsiteContentSchema.parse(req.body);
      
      const [newContent] = await db.insert(websiteContent)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newContent);
    } catch (error) {
      console.error("Error creating content:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create content" });
    }
  });

  // Update content item
  app.put("/api/admin/content/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertWebsiteContentSchema.partial().parse(req.body);
      
      const [updatedContent] = await db.update(websiteContent)
        .set({
          ...validatedData,
          updatedAt: new Date()
        })
        .where(eq(websiteContent.id, id))
        .returning();
      
      if (!updatedContent) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      res.json(updatedContent);
    } catch (error) {
      console.error("Error updating content:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update content" });
    }
  });

  // Delete content item (soft delete by setting isActive to false)
  app.delete("/api/admin/content/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      const [deletedContent] = await db.update(websiteContent)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(websiteContent.id, id))
        .returning();
      
      if (!deletedContent) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({ error: "Failed to delete content" });
    }
  });

  // Bulk content operations
  app.post("/api/admin/content/bulk", requireAuth, async (req, res) => {
    try {
      const { operation, items } = req.body;
      
      if (operation === 'create_defaults') {
        // Create default content items for the website
        const defaultContent = [
          // Homepage content
          {
            section: 'homepage',
            key: 'hero_title',
            type: 'text',
            value: 'Secure Your Polish Citizenship',
            label: 'Hero Section Title',
            description: 'Main headline on the homepage',
            orderIndex: 1
          },
          {
            section: 'homepage',
            key: 'hero_subtitle',
            type: 'textarea',
            value: 'Expert legal assistance for Polish citizenship by descent. Professional document processing, genealogy research, and application support.',
            label: 'Hero Section Subtitle',
            description: 'Subtitle text below the main headline',
            orderIndex: 2
          },
          {
            section: 'homepage',
            key: 'cta_button_text',
            type: 'text',
            value: 'Get Started Today',
            label: 'Call to Action Button',
            description: 'Text for the main CTA button',
            orderIndex: 3
          },
          
          // Navigation content
          {
            section: 'navigation',
            key: 'nav_home',
            type: 'text',
            value: 'Home',
            label: 'Navigation - Home',
            description: 'Home menu item text',
            orderIndex: 1
          },
          {
            section: 'navigation',
            key: 'nav_services',
            type: 'text',
            value: 'Services',
            label: 'Navigation - Services',
            description: 'Services menu item text',
            orderIndex: 2
          },
          {
            section: 'navigation',
            key: 'nav_dashboard',
            type: 'text',
            value: 'Dashboard',
            label: 'Navigation - Dashboard',
            description: 'Dashboard menu item text',
            orderIndex: 3
          },
          {
            section: 'navigation',
            key: 'nav_contact',
            type: 'text',
            value: 'Contact',
            label: 'Navigation - Contact',
            description: 'Contact menu item text',
            orderIndex: 4
          },
          
          // Footer content
          {
            section: 'footer',
            key: 'footer_company_name',
            type: 'text',
            value: 'Polish Citizenship Services',
            label: 'Company Name',
            description: 'Company name in footer',
            orderIndex: 1
          },
          {
            section: 'footer',
            key: 'footer_description',
            type: 'textarea',
            value: 'Professional legal services for Polish citizenship by descent and European passport acquisition.',
            label: 'Footer Description',
            description: 'Company description in footer',
            orderIndex: 2
          },
          {
            section: 'footer',
            key: 'footer_copyright',
            type: 'text',
            value: '© 2025 Polish Citizenship Services. All rights reserved.',
            label: 'Copyright Text',
            description: 'Copyright notice in footer',
            orderIndex: 3
          },
          
          // Forms content
          {
            section: 'forms',
            key: 'contact_form_title',
            type: 'text',
            value: 'Get Expert Consultation',
            label: 'Contact Form Title',
            description: 'Title above the contact form',
            orderIndex: 1
          },
          {
            section: 'forms',
            key: 'contact_form_subtitle',
            type: 'textarea',
            value: 'Schedule a free consultation to discuss your Polish citizenship eligibility and next steps.',
            label: 'Contact Form Subtitle',
            description: 'Subtitle below the contact form title',
            orderIndex: 2
          }
        ];
        
        let createdCount = 0;
        let updatedCount = 0;

        // Upsert each item (insert or update if exists)
        for (const item of defaultContent) {
          try {
            const result = await db.insert(websiteContent)
              .values({
                ...item,
                type: item.type as "text" | "textarea" | "url" | "icon"
              })
              .onConflictDoUpdate({
                target: websiteContent.key,
                set: {
                  value: item.value,
                  label: item.label,
                  description: item.description,
                  updatedAt: new Date()
                }
              })
              .returning();
            
            if (result.length > 0) {
              // Check if this was an insert (new createdAt) or update
              const isNew = result[0]?.createdAt && Math.abs(result[0].createdAt.getTime() - new Date().getTime()) < 1000;
              if (isNew) {
                createdCount++;
              } else {
                updatedCount++;
              }
            }
          } catch (itemError) {
            console.error(`Error processing item ${item.key}:`, itemError);
          }
        }
        
        res.json({ 
          success: true,
          message: `Content initialized: ${createdCount} created, ${updatedCount} updated`,
          stats: { created: createdCount, updated: updatedCount }
        });
      } else {
        res.status(400).json({ error: "Invalid bulk operation" });
      }
    } catch (error) {
      console.error("Error in bulk operation:", error);
      res.status(500).json({ error: "Failed to perform bulk operation" });
    }
  });

  // ============ NEW JSON-BASED EDITING SYSTEM ROUTES ============
  
  // GET /api/content-editable - Get editable content (JSON-based system)
  app.get('/api/content-editable', async (req, res) => {
    try {
      const { keys, path } = req.query;
      
      if (keys) {
        // Get specific content entries by keys
        const keyArray = Array.isArray(keys) ? keys : [keys];
        const content: Record<string, any> = {};
        
        for (const key of keyArray) {
          const entry = await storage.getContent(key as string);
          if (entry) {
            content[key as string] = entry;
          }
        }
        
        res.json(content);
      } else if (path) {
        // Get all content for a specific path
        const entries = await storage.listContentByPath(path as string);
        const content: Record<string, any> = {};
        
        entries.forEach(entry => {
          content[entry.key] = entry;
        });
        
        res.json(content);
      } else {
        // Get all content
        const entries = await storage.listAllContent();
        const content: Record<string, any> = {};
        
        entries.forEach(entry => {
          content[entry.key] = entry;
        });
        
        res.json(content);
      }
    } catch (error) {
      console.error('Error fetching editable content:', error);
      res.status(500).json({ error: 'Failed to fetch editable content' });
    }
  });

  // GET /api/content-editable/:key - Get single editable content entry by key
  app.get('/api/content-editable/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const entry = await storage.getContent(key);
      
      if (!entry) {
        return res.status(404).json({ error: 'Content not found' });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error fetching editable content:', error);
      res.status(500).json({ error: 'Failed to fetch editable content' });
    }
  });

  // PUT /api/content-editable/:key - Update or create editable content entry
  app.put('/api/content-editable/:key', requireAuthOrDev, async (req, res) => {
    try {
      const { key } = req.params;
      const user = (req as any).user;
      
      // Get existing content to avoid overwriting metadata
      const existing = await storage.getContent(key);
      
      // For updates, only accept provided fields to avoid overwrites
      const updateData = {
        key,
        value: req.body.value,
        type: req.body.type ?? existing?.type ?? 'text',
        path: req.body.path ?? existing?.path ?? '/',
        locale: req.body.locale ?? existing?.locale ?? 'en'
      };

      // Validate input
      const validationResult = insertContentEntrySchema.safeParse(updateData);

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        });
      }

      const entry = await storage.setContent(
        key, 
        updateData.value, 
        updateData.type, 
        updateData.path, 
        updateData.locale, 
        user.email || user.id
      );

      // Return 201 if this was a creation, 200 if update
      const status = existing ? 200 : 201;
      res.status(status).json(entry);
    } catch (error) {
      console.error('Error updating editable content:', error);
      res.status(500).json({ error: 'Failed to update editable content' });
    }
  });

  // POST /api/content-editable - Create new editable content entry
  app.post('/api/content-editable', requireAuthOrDev, async (req, res) => {
    try {
      const user = (req as any).user;
      const validationResult = insertContentEntrySchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        });
      }

      const { key, value, type, path, locale = 'en' } = validationResult.data;
      
      // Check if content already exists
      const existing = await storage.getContent(key);
      if (existing) {
        return res.status(409).json({ error: 'Content with this key already exists' });
      }

      const entry = await storage.setContent(
        key, 
        value, 
        type, 
        path, 
        locale, 
        user.email || user.id
      );

      res.status(201).json(entry);
    } catch (error) {
      console.error('Error creating editable content:', error);
      res.status(500).json({ error: 'Failed to create editable content' });
    }
  });

  console.log('✅ Content management routes registered (both database and JSON-based editing system)');
}