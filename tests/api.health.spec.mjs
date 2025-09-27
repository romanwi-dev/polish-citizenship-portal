// API Health Tests
// Tests health endpoints for system monitoring

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes.ts';

describe('Health API Tests', () => {
  let app;
  let server;
  let request;

  beforeAll(async () => {
    // Create test Express app with routes
    app = express();
    server = await registerRoutes(app);
    request = supertest(app);
  });

  afterAll(async () => {
    if (server && typeof server.close === 'function') {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('GET /health', () => {
    it('should return 200 OK with status information', async () => {
      const response = await request
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('time');
      expect(new Date(response.body.time)).toBeInstanceOf(Date);
    });

    it('should return health check in under 100ms', async () => {
      const start = Date.now();
      await request.get('/health').expect(200);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100);
    });
  });

  describe('GET /healthz', () => {
    it('should return detailed health information', async () => {
      const response = await request
        .get('/healthz')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('env');
      
      // Validate memory object structure
      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
      expect(response.body.memory).toHaveProperty('external');
      expect(typeof response.body.memory.used).toBe('number');
    });

    it('should show test environment', async () => {
      const response = await request
        .get('/healthz')
        .expect(200);

      expect(response.body.env).toBe('test');
    });
  });

  describe('GET /api/health', () => {
    it('should return API health status', async () => {
      const response = await request
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      
      // Should include webhook status if enabled
      if (response.body.webhooksEnabled) {
        expect(response.body).toHaveProperty('server', 'express');
      }
    });

    it('should have correct content-type', async () => {
      await request
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('Health Endpoint Performance', () => {
    it('should handle concurrent health checks', async () => {
      const promises = Array(10).fill().map(() => 
        request.get('/health').expect(200)
      );
      
      const responses = await Promise.all(promises);
      
      // All responses should be successful
      responses.forEach(response => {
        expect(response.body).toHaveProperty('ok', true);
      });
    });
  });

  describe('Health Content Validation', () => {
    it('should return consistent timestamp format', async () => {
      const response = await request
        .get('/healthz')
        .expect(200);

      const timestamp = response.body.timestamp;
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      // Should be recent (within last 5 seconds)
      const age = Date.now() - new Date(timestamp).getTime();
      expect(age).toBeLessThan(5000);
    });

    it('should return reasonable uptime', async () => {
      const response = await request
        .get('/healthz')
        .expect(200);

      expect(response.body.uptime).toBeGreaterThan(0);
      expect(response.body.uptime).toBeLessThan(3600); // Less than 1 hour for tests
    });
  });
});