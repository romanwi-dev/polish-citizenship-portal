// API Cases Tests  
// Tests case management CRUD operations

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes.js';
import { testUtils } from './setup.mjs';

describe('Cases API Tests', () => {
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

  describe('Case Creation', () => {
    it('should create a new case with valid data', async () => {
      const caseData = {
        clientName: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '+1234567890',
        birthCountry: 'Poland',
        citizenship: 'US'
      };

      // Note: Actual endpoint may vary - this tests the pattern
      const response = await request
        .post('/api/cases')
        .send(caseData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('caseId');
      expect(response.body.caseId).toMatch(/^C-\d+/);
    });

    it('should reject case creation with missing required fields', async () => {
      const incompleteData = {
        clientName: 'John Incomplete'
        // Missing required fields
      };

      await request
        .post('/api/cases')
        .send(incompleteData)
        .expect(400);
    });

    it('should validate email format', async () => {
      const invalidEmailData = {
        clientName: 'John Invalid',
        email: 'invalid-email',
        phone: '+1234567890',
        birthCountry: 'Poland'
      };

      await request
        .post('/api/cases')
        .send(invalidEmailData)
        .expect(400);
    });
  });

  describe('Case Retrieval', () => {
    it('should get case by ID', async () => {
      const caseId = testUtils.mockClientId;
      
      // This might be a different endpoint pattern
      const response = await request
        .get(`/api/cases/${caseId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', caseId);
      expect(response.body).toHaveProperty('status');
    });

    it('should return 404 for non-existent case', async () => {
      await request
        .get('/api/cases/NON-EXISTENT')
        .expect(404);
    });

    it('should list cases with pagination', async () => {
      const response = await request
        .get('/api/cases?limit=10&offset=0')
        .expect(200);

      expect(response.body).toHaveProperty('cases');
      expect(Array.isArray(response.body.cases)).toBe(true);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('limit', 10);
      expect(response.body).toHaveProperty('offset', 0);
    });
  });

  describe('Case Updates', () => {
    it('should update case status', async () => {
      const caseId = testUtils.mockClientId;
      const updateData = {
        status: 'in_review',
        notes: 'Updated for testing'
      };

      const response = await request
        .put(`/api/cases/${caseId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('updated', true);
    });

    it('should reject invalid status values', async () => {
      const caseId = testUtils.mockClientId;
      const invalidData = {
        status: 'invalid_status'
      };

      await request
        .put(`/api/cases/${caseId}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('Case Tree Operations', () => {
    it('should get family tree for case', async () => {
      const caseId = testUtils.mockClientId;

      const response = await request
        .get(`/api/cases/${caseId}/tree`)
        .expect(200);

      expect(response.body).toHaveProperty('tree');
      expect(response.body).toHaveProperty('caseId', caseId);
    });

    it('should update family tree data', async () => {
      const caseId = testUtils.mockClientId;
      const treeData = {
        proband: {
          id: '1',
          name: 'John Doe',
          birthDate: '1990-01-01',
          birthPlace: 'Warsaw, Poland'
        },
        parents: [],
        grandparents: []
      };

      const response = await request
        .post(`/api/cases/${caseId}/tree`)
        .send(treeData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Case Document Operations', () => {
    it('should get document status for case', async () => {
      const caseId = testUtils.mockClientId;

      const response = await request
        .get(`/api/cases/${caseId}/documents`)
        .expect(200);

      expect(response.body).toHaveProperty('documents');
      expect(Array.isArray(response.body.documents)).toBe(true);
    });

    it('should upload document to case', async () => {
      const caseId = testUtils.mockClientId;
      const mockFile = testUtils.createMockFile('passport.pdf');

      const response = await request
        .post(`/api/cases/${caseId}/documents`)
        .attach('file', mockFile, 'passport.pdf')
        .field('documentType', 'passport')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('fileId');
    });
  });

  describe('Case Search and Filtering', () => {
    it('should search cases by client name', async () => {
      const response = await request
        .get('/api/cases/search?q=John')
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should filter cases by status', async () => {
      const response = await request
        .get('/api/cases?status=active')
        .expect(200);

      expect(response.body).toHaveProperty('cases');
      response.body.cases.forEach(case => {
        expect(case.status).toBe('active');
      });
    });

    it('should filter cases by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      const response = await request
        .get(`/api/cases?startDate=${startDate}&endDate=${endDate}`)
        .expect(200);

      expect(response.body).toHaveProperty('cases');
      expect(response.body).toHaveProperty('dateRange');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      await request
        .post('/api/cases')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    it('should handle very large payloads', async () => {
      const largeData = {
        clientName: 'Large Data Test',
        notes: 'x'.repeat(10000) // 10KB of notes
      };

      const response = await request
        .post('/api/cases')
        .send(largeData);

      // Should either accept (200/201) or reject with proper error (413/400)
      expect([200, 201, 400, 413]).toContain(response.status);
    });
  });
});