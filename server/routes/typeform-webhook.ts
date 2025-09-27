import { Router } from 'express';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { leads, insertLeadSchema } from '@shared/schema';
import { emailService } from '../email-service.js';
import { z } from 'zod';

const router = Router();

// Typeform webhook payload schema
const typeformWebhookSchema = z.object({
  event_id: z.string(),
  event_type: z.string(),
  form_response: z.object({
    form_id: z.string(),
    token: z.string(),
    submitted_at: z.string(),
    calculated: z.object({
      score: z.number().optional()
    }).optional(),
    answers: z.array(z.object({
      field: z.object({
        id: z.string(),
        type: z.string(),
        ref: z.string().optional()
      }),
      type: z.string(),
      text: z.string().optional(),
      email: z.string().optional(),
      number: z.number().optional(),
      boolean: z.boolean().optional(),
      choice: z.object({
        label: z.string().optional()
      }).optional(),
      choices: z.object({
        labels: z.array(z.string()).optional()
      }).optional()
    }))
  })
});

// Verify Typeform webhook signature
function verifyTypeformSignature(payload: Buffer, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64');
    
    // Typeform sends signature as "sha256=<hash>"
    const receivedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Extract email from Typeform answers
function extractEmail(answers: any[]): string | null {
  for (const answer of answers) {
    if (answer.email) {
      return answer.email;
    }
    if (answer.type === 'email' && answer.text) {
      return answer.text;
    }
  }
  return null;
}

// Extract name from Typeform answers
function extractName(answers: any[]): string | null {
  for (const answer of answers) {
    if (answer.type === 'short_text' && answer.field?.ref?.includes('name')) {
      return answer.text;
    }
    if (answer.text && (
      answer.field?.ref?.toLowerCase().includes('name') ||
      answer.field?.ref?.toLowerCase().includes('first') ||
      answer.field?.ref?.toLowerCase().includes('last')
    )) {
      return answer.text;
    }
  }
  return answers.find(a => a.text)?.text || null;
}

// Compute lead tier based on score
function computeLeadTier(score: number | null): 'A' | 'B' | 'C' {
  if (score === null || score === undefined) return 'C';
  if (score >= 80) return 'A';
  if (score >= 50) return 'B';
  return 'C';
}

// Generate secure token
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// POST /api/hook/typeform - Typeform webhook handler
router.post('/typeform', async (req, res) => {
  try {
    const typeformSecret = process.env.TYPEFORM_SECRET;
    if (!typeformSecret) {
      console.error('TYPEFORM_SECRET environment variable not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Get raw body for signature verification
    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      console.error('Typeform webhook: Raw body not available for signature verification');
      return res.status(400).json({ error: 'Raw body not available' });
    }

    const signature = req.headers['x-typeform-signature'] as string;
    if (!signature) {
      console.warn('Typeform webhook: Missing X-Typeform-Signature header');
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Verify signature
    if (!verifyTypeformSignature(rawBody, signature, typeformSecret)) {
      console.warn('Typeform webhook: Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Validate payload structure
    const webhookData = typeformWebhookSchema.parse(req.body);
    const { form_response } = webhookData;

    // Extract data from form response
    const email = extractEmail(form_response.answers);
    if (!email) {
      console.warn('Typeform webhook: No email found in response');
      return res.status(400).json({ error: 'No email found in response' });
    }

    const name = extractName(form_response.answers);
    const score = form_response.calculated?.score || null;
    const tier = computeLeadTier(score);
    const token = generateSecureToken();

    // Check if lead already exists
    const existingLead = await db
      .select()
      .from(leads)
      .where(eq(leads.email, email))
      .limit(1);

    let leadId: string;

    if (existingLead.length > 0) {
      // Update existing lead
      const updatedLead = await db
        .update(leads)
        .set({
          name,
          score,
          tier,
          token,
          typeformData: form_response,
          emailSent: false,
          updatedAt: new Date()
        })
        .where(eq(leads.email, email))
        .returning({ id: leads.id });
      
      leadId = updatedLead[0].id;
      console.log(`Updated existing lead: ${email} (ID: ${leadId})`);
    } else {
      // Create new lead
      const newLead = await db
        .insert(leads)
        .values({
          email,
          name,
          score,
          tier,
          token,
          typeformData: form_response,
          emailSent: false
        })
        .returning({ id: leads.id });
      
      leadId = newLead[0].id;
      console.log(`Created new lead: ${email} (ID: ${leadId}, Tier: ${tier})`);
    }

    // Send email invitation
    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
    const inviteLink = `${appUrl}/tree/${leadId}/${token}`;
    
    try {
      const emailSent = await emailService.sendLeadInvitation({
        lead: { id: leadId, email, name, score, tier, token } as any,
        inviteLink
      });

      if (emailSent) {
        // Update email sent status
        await db
          .update(leads)
          .set({ 
            emailSent: true, 
            emailSentAt: new Date() 
          })
          .where(eq(leads.id, leadId));
        
        console.log(`✅ Invitation email sent to ${email}`);
      }
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }

    // Send staff alert for tier A/B leads
    if (tier === 'A' || tier === 'B') {
      try {
        await emailService.sendStaffAlert({
          id: leadId,
          email,
          name,
          score,
          tier,
          token,
          createdAt: new Date()
        } as any);
      } catch (alertError) {
        console.error('Failed to send staff alert:', alertError);
      }
    }

    res.status(200).json({ 
      success: true, 
      leadId,
      tier,
      message: 'Lead processed successfully' 
    });

  } catch (error) {
    console.error('Typeform webhook error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid payload structure',
        details: error.errors 
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;