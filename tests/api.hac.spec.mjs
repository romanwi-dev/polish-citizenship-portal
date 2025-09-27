// API HAC Tests
// Tests Human Approval Chain (HAC) workflow system

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes.js';
import { testUtils } from './setup.mjs';

describe('HAC API Tests', () => {
  let app;
  let server;
  let request;

  beforeAll(async () => {
    app = express();
    server = await registerRoutes(app);
    request = supertest(app);
  });

  afterAll(async () => {
    if (server && typeof server.close === 'function') {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('HAC Submission', () => {
    it('should submit case for human approval', async () => {
      const hacData = {
        caseId: testUtils.mockClientId,
        type: 'ELIGIBILITY_REVIEW',
        priority: 'normal',
        notes: 'Please review eligibility documentation',
        submittedBy: 'qa-test-system'
      };

      const response = await request
        .post('/api/hac/submit')
        .send(hacData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('hacId');
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body.hacId).toMatch(/^HAC-\d+/);
    });

    it('should reject HAC submission with invalid case ID', async () => {
      const invalidHacData = {
        caseId: 'INVALID-CASE',
        type: 'ELIGIBILITY_REVIEW'
      };

      await request
        .post('/api/hac/submit')
        .send(invalidHacData)
        .expect(400);
    });

    it('should validate HAC type', async () => {
      const invalidTypeData = {
        caseId: testUtils.mockClientId,
        type: 'INVALID_TYPE'
      };

      await request
        .post('/api/hac/submit')
        .send(invalidTypeData)
        .expect(400);
    });

    it('should handle priority levels', async () => {
      const priorities = ['low', 'normal', 'high', 'urgent'];
      
      for (const priority of priorities) {
        const hacData = {
          caseId: testUtils.mockClientId,
          type: 'DOCUMENT_REVIEW',
          priority,
          notes: `Testing ${priority} priority`
        };

        const response = await request
          .post('/api/hac/submit')
          .send(hacData)
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('HAC Queue Management', () => {
    it('should get pending HAC items', async () => {
      const response = await request
        .get('/api/hac/pending')
        .expect(200);

      expect(response.body).toHaveProperty('pendingItems');
      expect(Array.isArray(response.body.pendingItems)).toBe(true);
      expect(response.body).toHaveProperty('totalCount');
    });

    it('should filter HAC queue by type', async () => {
      const response = await request
        .get('/api/hac/pending?type=ELIGIBILITY_REVIEW')
        .expect(200);

      expect(response.body).toHaveProperty('pendingItems');
      response.body.pendingItems.forEach(item => {
        expect(item.type).toBe('ELIGIBILITY_REVIEW');
      });
    });

    it('should filter HAC queue by priority', async () => {
      const response = await request
        .get('/api/hac/pending?priority=high')
        .expect(200);

      expect(response.body).toHaveProperty('pendingItems');
      response.body.pendingItems.forEach(item => {
        expect(item.priority).toBe('high');
      });
    });

    it('should sort HAC queue by date', async () => {
      const response = await request
        .get('/api/hac/pending?sort=date&order=desc')
        .expect(200);

      const items = response.body.pendingItems;
      if (items.length > 1) {
        for (let i = 0; i < items.length - 1; i++) {
          const current = new Date(items[i].submittedAt);
          const next = new Date(items[i + 1].submittedAt);
          expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
        }
      }
    });
  });

  describe('HAC Approval Process', () => {
    let testHacId;

    beforeEach(async () => {
      // Create a test HAC item for approval testing
      const hacData = {
        caseId: testUtils.mockClientId,
        type: 'TEST_APPROVAL',
        priority: 'normal',
        notes: 'Test approval flow'
      };

      const response = await request
        .post('/api/hac/submit')
        .send(hacData)
        .expect(200);

      testHacId = response.body.hacId;
    });

    it('should approve HAC item', async () => {
      const approvalData = {
        hacId: testHacId,
        decision: 'approved',
        notes: 'Approval granted by QA test',
        reviewedBy: 'qa-reviewer'
      };

      const response = await request
        .post('/api/hac/approve')
        .send(approvalData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 'approved');
      expect(response.body).toHaveProperty('reviewedAt');
    });

    it('should decline HAC item with reason', async () => {
      const declineData = {
        hacId: testHacId,
        decision: 'declined',
        notes: 'Declined due to insufficient documentation',
        reviewedBy: 'qa-reviewer'
      };

      const response = await request
        .post('/api/hac/decline')
        .send(declineData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 'declined');
      expect(response.body).toHaveProperty('declineReason');
    });

    it('should require reviewer information', async () => {
      const incompleteData = {
        hacId: testHacId,
        decision: 'approved'
        // Missing reviewedBy
      };

      await request
        .post('/api/hac/approve')
        .send(incompleteData)
        .expect(400);
    });
  });

  describe('HAC History and Tracking', () => {
    it('should get HAC history for case', async () => {
      const caseId = testUtils.mockClientId;

      const response = await request
        .get(`/api/hac/history?caseId=${caseId}`)
        .expect(200);

      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
      expect(response.body).toHaveProperty('caseId', caseId);
    });

    it('should get HAC statistics', async () => {
      const response = await request
        .get('/api/hac/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalSubmitted');
      expect(response.body).toHaveProperty('totalApproved'); 
      expect(response.body).toHaveProperty('totalDeclined');
      expect(response.body).toHaveProperty('averageProcessingTime');
      expect(response.body).toHaveProperty('pendingCount');
    });

    it('should track HAC processing times', async () => {
      const response = await request
        .get('/api/hac/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('processingTimes');
      expect(response.body).toHaveProperty('approvalRates');
      expect(response.body).toHaveProperty('volumeByType');
    });
  });

  describe('HAC Types and Validation', () => {
    const validHacTypes = [
      'ELIGIBILITY_REVIEW',
      'DOCUMENT_REVIEW', 
      'GENEALOGY_VERIFICATION',
      'CASE_ESCALATION',
      'PAYMENT_REVIEW',
      'LEGAL_CONSULTATION',
      'FINAL_APPROVAL'
    ];

    it('should accept all valid HAC types', async () => {
      for (const type of validHacTypes) {
        const hacData = {
          caseId: testUtils.mockClientId,
          type,
          priority: 'normal',
          notes: `Testing ${type} submission`
        };

        const response = await request
          .post('/api/hac/submit')
          .send(hacData)
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });

    it('should validate required fields for each HAC type', async () => {
      const documentReviewData = {
        caseId: testUtils.mockClientId,
        type: 'DOCUMENT_REVIEW',
        documentIds: ['doc1', 'doc2'],
        priority: 'normal'
      };

      const response = await request
        .post('/api/hac/submit')
        .send(documentReviewData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('HAC Error Handling', () => {
    it('should handle non-existent HAC ID gracefully', async () => {
      const approvalData = {
        hacId: 'HAC-NONEXISTENT',
        decision: 'approved',
        reviewedBy: 'qa-reviewer'
      };

      await request
        .post('/api/hac/approve')
        .send(approvalData)
        .expect(404);
    });

    it('should prevent double-approval', async () => {
      // First, submit and approve an item
      const hacData = {
        caseId: testUtils.mockClientId,
        type: 'TEST_DOUBLE_APPROVAL',
        priority: 'normal'
      };

      const submitResponse = await request
        .post('/api/hac/submit')
        .send(hacData)
        .expect(200);

      const hacId = submitResponse.body.hacId;

      // Approve it
      await request
        .post('/api/hac/approve')
        .send({ hacId, decision: 'approved', reviewedBy: 'qa-reviewer' })
        .expect(200);

      // Try to approve again
      await request
        .post('/api/hac/approve')
        .send({ hacId, decision: 'approved', reviewedBy: 'qa-reviewer' })
        .expect(409); // Conflict
    });

    it('should validate decision values', async () => {
      const hacData = {
        caseId: testUtils.mockClientId,
        type: 'TEST_INVALID_DECISION',
        priority: 'normal'
      };

      const submitResponse = await request
        .post('/api/hac/submit')
        .send(hacData)
        .expect(200);

      const invalidDecisionData = {
        hacId: submitResponse.body.hacId,
        decision: 'invalid_decision',
        reviewedBy: 'qa-reviewer'
      };

      await request
        .post('/api/hac/approve')
        .send(invalidDecisionData)
        .expect(400);
    });
  });
});