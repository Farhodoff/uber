import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from './index.js';

describe('API Gateway Service', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

  it('GET /health returns 200 with service info', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ service: 'api-gateway', status: 'ok' });
  });

  describe('Authentication Middleware (requireAuth)', () => {
    it('blocks protected routes when Authorization header is missing', async () => {
      const res = await request(app).get('/users/profiles/1');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('missing or invalid authorization header');
    });

    it('blocks protected routes when Authorization header does not start with Bearer', async () => {
      const res = await request(app)
        .get('/orders/user/1')
        .set('Authorization', 'Basic token123');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('missing or invalid authorization header');
    });

    it('blocks protected routes when Bearer token is invalid or expired', async () => {
      const res = await request(app)
        .get('/drivers/profiles/1')
        .set('Authorization', 'Bearer invalid-token-string');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('invalid or expired token');
    });

    it('allows valid JWT token through requireAuth', async () => {
      const token = jwt.sign({ sub: 123, email: 'rider@example.com', role: 'RIDER' }, JWT_SECRET, { expiresIn: '1h' });
      const res = await request(app)
        .get('/users/profiles/123')
        .set('Authorization', `Bearer ${token}`);
      
      // Since downstream user-service is not running in unit test, proxy returns 504 / 500 / ECONNREFUSED
      // but NOT 401 Unauthorized!
      expect(res.status).not.toBe(401);
    });
  });
});
