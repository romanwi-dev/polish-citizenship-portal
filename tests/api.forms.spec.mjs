// API Forms Tests
// Tests OBY schema and form draft operations

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes.ts';
import { testUtils } from './setup.mjs';

describe('Forms API Tests', () => {
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

  describe('OBY Schema', () => {
    it('should get OBY form schema', async () => {
      const response = await request
        .get('/api/oby/schema')
        .expect(200);

      expect(response.body).toHaveProperty('schema');
      expect(response.body).toHaveProperty('version');
      expect(response.body.schema).toHaveProperty('fields');
      expect(Array.isArray(response.body.schema.fields)).toBe(true);
    });

    it('should have required OBY fields in schema', async () => {
      const response = await request
        .get('/api/oby/schema')
        .expect(200);

      const fields = response.body.schema.fields;
      const fieldNames = fields.map(f => f.name);

      // Check for essential OBY fields
      expect(fieldNames).toContain('applicant_full_name');
      expect(fieldNames).toContain('applicant_birth_date');
      expect(fieldNames).toContain('applicant_birth_place');
      expect(fieldNames).toContain('father_full_name');
      expect(fieldNames).toContain('mother_full_name');
    });

    it('should validate field types in schema', async () => {
      const response = await request
        .get('/api/oby/schema')
        .expect(200);

      const fields = response.body.schema.fields;
      
      fields.forEach(field => {
        expect(field).toHaveProperty('name');
        expect(field).toHaveProperty('type');
        expect(field).toHaveProperty('label');
        expect(['text', 'date', 'select', 'textarea', 'checkbox']).toContain(field.type);
      });
    });

    it('should include field validation rules', async () => {
      const response = await request
        .get('/api/oby/schema')
        .expect(200);

      const fields = response.body.schema.fields;
      const requiredFields = fields.filter(f => f.required);
      
      expect(requiredFields.length).toBeGreaterThan(0);
      
      // Check date fields have proper format
      const dateFields = fields.filter(f => f.type === 'date');
      dateFields.forEach(field => {
        expect(field).toHaveProperty('format');
      });
    });
  });

  describe('Form Drafts', () => {
    let testDraftId;

    beforeEach(async () => {
      // Create a test draft
      const draftData = {
        caseId: testUtils.mockClientId,
        formType: 'OBY',
        data: {
          applicant_full_name: 'John Test Doe',
          applicant_birth_date: '1990-01-01',
          applicant_birth_place: 'Warsaw, Poland'
        }
      };

      const response = await request
        .post('/api/oby/draft')
        .send(draftData)
        .expect(200);

      testDraftId = response.body.draftId;
    });

    it('should create new form draft', async () => {
      const draftData = {
        caseId: testUtils.mockClientId,
        formType: 'OBY',
        data: {
          applicant_full_name: 'Jane Test Smith',
          applicant_birth_date: '1985-06-15'
        }
      };

      const response = await request
        .post('/api/oby/draft')
        .send(draftData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('draftId');
      expect(response.body).toHaveProperty('status', 'draft');
    });

    it('should get existing form draft', async () => {
      const response = await request
        .get(`/api/oby/draft/${testDraftId}`)
        .expect(200);

      expect(response.body).toHaveProperty('draftId', testDraftId);
      expect(response.body).toHaveProperty('formType', 'OBY');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('applicant_full_name', 'John Test Doe');
    });

    it('should update form draft', async () => {
      const updateData = {
        data: {
          applicant_full_name: 'John Updated Doe',
          applicant_birth_date: '1990-01-01',
          applicant_birth_place: 'Krakow, Poland',
          father_full_name: 'Michael Doe'
        }
      };

      const response = await request
        .post(`/api/oby/draft/${testDraftId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('updated', true);

      // Verify the update
      const getResponse = await request
        .get(`/api/oby/draft/${testDraftId}`)
        .expect(200);

      expect(getResponse.body.data).toHaveProperty('applicant_full_name', 'John Updated Doe');
      expect(getResponse.body.data).toHaveProperty('father_full_name', 'Michael Doe');
    });

    it('should return 404 for non-existent draft', async () => {
      await request
        .get('/api/oby/draft/NON-EXISTENT')
        .expect(404);
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const incompleteData = {
        caseId: testUtils.mockClientId,
        formType: 'OBY',
        data: {
          // Missing required fields
          applicant_birth_date: '1990-01-01'
        }
      };

      const response = await request
        .post('/api/oby/draft')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should validate date formats', async () => {
      const invalidDateData = {
        caseId: testUtils.mockClientId,
        formType: 'OBY',
        data: {
          applicant_full_name: 'Test User',
          applicant_birth_date: 'invalid-date'
        }
      };

      await request
        .post('/api/oby/draft')
        .send(invalidDateData)
        .expect(400);
    });

    it('should validate field lengths', async () => {
      const longFieldData = {
        caseId: testUtils.mockClientId,
        formType: 'OBY',
        data: {
          applicant_full_name: 'a'.repeat(300), // Too long
          applicant_birth_date: '1990-01-01'
        }
      };

      await request
        .post('/api/oby/draft')
        .send(longFieldData)
        .expect(400);
    });
  });

  describe('Form Progress Tracking', () => {
    it('should calculate form completion percentage', async () => {
      const partialData = {
        caseId: testUtils.mockClientId,
        formType: 'OBY',
        data: {
          applicant_full_name: 'John Progress Test',
          applicant_birth_date: '1990-01-01'
          // Missing other fields
        }
      };

      const response = await request
        .post('/api/oby/draft')
        .send(partialData)
        .expect(200);

      expect(response.body).toHaveProperty('completionRate');
      expect(response.body.completionRate).toBeGreaterThan(0);
      expect(response.body.completionRate).toBeLessThan(100);
    });

    it('should identify missing required fields', async () => {
      const partialData = {
        caseId: testUtils.mockClientId,
        formType: 'OBY',
        data: {
          applicant_full_name: 'John Missing Fields'
        }
      };

      const response = await request
        .post('/api/oby/draft')
        .send(partialData)
        .expect(200);

      expect(response.body).toHaveProperty('missingFields');
      expect(Array.isArray(response.body.missingFields)).toBe(true);
      expect(response.body.missingFields.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-Language Form Support', () => {
    it('should support Polish language form', async () => {
      const polishData = {
        caseId: testUtils.mockClientId,
        formType: 'OBY',
        language: 'pl',
        data: {
          applicant_full_name: 'Jan Kowalski',
          applicant_birth_place: 'Warszawa, Polska'
        }
      };

      const response = await request
        .post('/api/oby/draft')
        .send(polishData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('language', 'pl');
    });

    it('should get form schema in different languages', async () => {
      const response = await request
        .get('/api/oby/schema?lang=pl')
        .expect(200);

      expect(response.body).toHaveProperty('schema');
      expect(response.body).toHaveProperty('language', 'pl');
      
      // Check that labels are in Polish
      const fields = response.body.schema.fields;
      const nameField = fields.find(f => f.name === 'applicant_full_name');
      if (nameField) {
        expect(nameField.label).toContain('Imię'); // Polish for name
      }
    });
  });

  describe('Form Export and Import', () => {
    it('should export form data as PDF', async () => {
      const draftData = {
        caseId: testUtils.mockClientId,
        formType: 'OBY',
        data: {
          applicant_full_name: 'Export Test User',
          applicant_birth_date: '1990-01-01',
          applicant_birth_place: 'Warsaw, Poland'
        }
      };

      const draftResponse = await request
        .post('/api/oby/draft')
        .send(draftData)
        .expect(200);

      const exportResponse = await request
        .get(`/api/oby/draft/${draftResponse.body.draftId}/export/pdf`)
        .expect(200);

      expect(exportResponse.headers['content-type']).toContain('application/pdf');
    });

    it('should export form data as JSON', async () => {
      const draftData = {
        caseId: testUtils.mockClientId,
        formType: 'OBY',
        data: {
          applicant_full_name: 'JSON Export Test',
          applicant_birth_date: '1990-01-01'
        }
      };

      const draftResponse = await request
        .post('/api/oby/draft')
        .send(draftData)
        .expect(200);

      const exportResponse = await request
        .get(`/api/oby/draft/${draftResponse.body.draftId}/export/json`)
        .expect(200);

      expect(exportResponse.body).toHaveProperty('formData');
      expect(exportResponse.body).toHaveProperty('schema');
      expect(exportResponse.body).toHaveProperty('exportedAt');
    });
  });

  describe('Form Security and Access Control', () => {
    it('should prevent access to drafts from different cases', async () => {
      // Create draft for one case
      const draftData = {
        caseId: 'CASE-A',
        formType: 'OBY',
        data: { applicant_full_name: 'Case A User' }
      };

      const response = await request
        .post('/api/oby/draft')
        .send(draftData)
        .expect(200);

      const draftId = response.body.draftId;

      // Try to access with different case context (would need auth implementation)
      // This test assumes there would be access control based on case ownership
      const accessResponse = await request
        .get(`/api/oby/draft/${draftId}`)
        .set('X-Case-Context', 'CASE-B'); // Simulated case context header

      // Should either deny access or not include sensitive data
      expect([403, 404]).toContain(accessResponse.status);
    });

    it('should sanitize form input data', async () => {
      const maliciousData = {
        caseId: testUtils.mockClientId,
        formType: 'OBY',
        data: {
          applicant_full_name: '<script>alert("xss")</script>John Hacker',
          applicant_birth_place: 'Warsaw</p><script>console.log("injected")</script>'
        }
      };

      const response = await request
        .post('/api/oby/draft')
        .send(maliciousData)
        .expect(200);

      // Get the draft back and check that scripts are sanitized
      const getResponse = await request
        .get(`/api/oby/draft/${response.body.draftId}`)
        .expect(200);

      expect(getResponse.body.data.applicant_full_name).not.toContain('<script>');
      expect(getResponse.body.data.applicant_birth_place).not.toContain('<script>');
    });
  });
});