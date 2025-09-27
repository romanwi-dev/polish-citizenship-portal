// Unit tests for admin role enforcement - prevents privilege escalation regression
// SECURITY CRITICAL: These tests verify only admin role users can access QA proxy endpoints

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

// Mock the auth module
vi.mock('../../server/auth.js', () => ({
  getUserFromToken: vi.fn()
}));

import { getUserFromToken } from '../../server/auth.js';
import selfcheckRouter from '../../server/routes/selfcheck.js';

const app = express();
app.use(express.json());
app.use('/api', selfcheckRouter);

// Test JWT secret
const TEST_JWT_SECRET = 'test-jwt-secret';

// Helper to create test tokens
function createTestToken(userId) {
  return jwt.sign({ userId }, TEST_JWT_SECRET, { expiresIn: '1h' });
}

// Helper to create mock users
function createMockUser(role = 'user') {
  return {
    id: `user-${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    role,
    firstName: 'Test',
    lastName: 'User'
  };
}

describe('Admin Role Enforcement - Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireAdminAuth middleware', () => {
    it('should reject requests without Authorization header', async () => {
      const response = await request(app)
        .get('/api/admin/qa-status')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Authentication required',
        message: 'Admin endpoints require valid authentication token'
      });
    });

    it('should reject requests with invalid Bearer token format', async () => {
      const response = await request(app)
        .get('/api/admin/qa-status')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Authentication required',
        message: 'Admin endpoints require valid authentication token'
      });
    });

    it('should reject requests with invalid/expired tokens', async () => {
      getUserFromToken.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/admin/qa-status')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Invalid or expired token',
        message: 'Please log in to access admin features'
      });
    });

    it('SECURITY CRITICAL: should deny access to non-admin users (prevents privilege escalation)', async () => {
      const regularUser = createMockUser('user');
      getUserFromToken.mockResolvedValue(regularUser);

      const token = createTestToken(regularUser.id);

      const response = await request(app)
        .get('/api/admin/qa-status')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body).toMatchObject({
        error: 'Access denied',
        message: 'Admin privileges required. This incident has been logged.',
        incident_id: expect.stringMatching(/^SEC_\d+_\w+$/)
      });

      // Verify getUserFromToken was called
      expect(getUserFromToken).toHaveBeenCalledWith(token);
    });

    it('SECURITY CRITICAL: should deny access to staff users (only admin allowed)', async () => {
      const staffUser = createMockUser('staff');
      getUserFromToken.mockResolvedValue(staffUser);

      const token = createTestToken(staffUser.id);

      const response = await request(app)
        .get('/api/admin/qa-status')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body).toMatchObject({
        error: 'Access denied',
        message: 'Admin privileges required. This incident has been logged.',
        incident_id: expect.stringMatching(/^SEC_\d+_\w+$/)
      });
    });

    it('should allow access to admin users', async () => {
      const adminUser = createMockUser('admin');
      getUserFromToken.mockResolvedValue(adminUser);

      const token = createTestToken(adminUser.id);

      // Note: This test will fail due to missing QA environment setup, 
      // but we're testing the auth middleware passes through
      const response = await request(app)
        .get('/api/admin/qa-status')
        .set('Authorization', `Bearer ${token}`);

      // Should pass auth check (not 401/403) - may fail on actual QA check
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
      
      // Verify getUserFromToken was called
      expect(getUserFromToken).toHaveBeenCalledWith(token);
    });

    it('should handle authentication errors gracefully', async () => {
      getUserFromToken.mockRejectedValue(new Error('Database connection failed'));

      const token = createTestToken('user-123');

      const response = await request(app)
        .get('/api/admin/qa-status')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Authentication failed',
        message: 'An error occurred during authentication'
      });
    });
  });

  describe('Role validation edge cases', () => {
    it('should handle users with undefined/null role', async () => {
      const userWithoutRole = {
        id: 'user-123',
        email: 'test@example.com',
        // role: undefined
      };
      getUserFromToken.mockResolvedValue(userWithoutRole);

      const token = createTestToken(userWithoutRole.id);

      const response = await request(app)
        .get('/api/admin/qa-status')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body).toMatchObject({
        error: 'Access denied',
        message: 'Admin privileges required. This incident has been logged.'
      });
    });

    it('should handle case-sensitive role checking', async () => {
      const userWithWrongCase = createMockUser('ADMIN'); // uppercase
      getUserFromToken.mockResolvedValue(userWithWrongCase);

      const token = createTestToken(userWithWrongCase.id);

      const response = await request(app)
        .get('/api/admin/qa-status')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body).toMatchObject({
        error: 'Access denied',
        message: 'Admin privileges required. This incident has been logged.'
      });
    });
  });

  describe('Both admin endpoints', () => {
    const adminUser = createMockUser('admin');
    const regularUser = createMockUser('user');

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should protect GET /api/admin/qa-status with admin role', async () => {
      getUserFromToken.mockResolvedValue(regularUser);
      const token = createTestToken(regularUser.id);

      const response = await request(app)
        .get('/api/admin/qa-status')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied');
    });

    it('should protect POST /api/admin/qa-status with admin role', async () => {
      getUserFromToken.mockResolvedValue(regularUser);
      const token = createTestToken(regularUser.id);

      const response = await request(app)
        .post('/api/admin/qa-status')
        .set('Authorization', `Bearer ${token}`);

      // Should be either 403 (access denied) or 429 (rate limited) - both are security responses
      expect([403, 429]).toContain(response.status);
      
      if (response.status === 403) {
        expect(response.body.error).toBe('Access denied');
      }
      // Rate limiting is also a valid security response
    });
  });
});