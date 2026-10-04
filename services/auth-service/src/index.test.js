import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app, pool } from './index.js';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /health', () => {
    it('returns 200 when database connection is healthy', async () => {
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ service: 'auth-service', status: 'ok' });
    });

    it('returns 500 when database connection fails', async () => {
      vi.spyOn(pool, 'query').mockRejectedValueOnce(new Error('Connection lost'));
      const res = await request(app).get('/health');
      expect(res.status).toBe(500);
      expect(res.body.status).toBe('db_error');
    });
  });

  describe('POST /register', () => {
    it('returns 400 when email or password is missing', async () => {
      const res = await request(app).post('/register').send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('email and password are required');
    });

    it('returns 409 when email already exists', async () => {
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const res = await request(app)
        .post('/register')
        .send({ email: 'existing@example.com', password: 'password123' });
      expect(res.status).toBe(409);
      expect(res.body.message).toBe('email already exists');
    });

    it('creates a new user and returns 201 with role default RIDER', async () => {
      vi.spyOn(pool, 'query')
        .mockResolvedValueOnce({ rows: [] }) // exists check
        .mockResolvedValueOnce({
          rows: [{ id: 5, email: 'new@example.com', role: 'RIDER', created_at: new Date().toISOString() }],
        });

      const res = await request(app)
        .post('/register')
        .send({ email: 'new@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(5);
      expect(res.body.email).toBe('new@example.com');
      expect(res.body.role).toBe('RIDER');
    });
  });

  describe('POST /login', () => {
    it('returns 400 when credentials are missing', async () => {
      const res = await request(app).post('/login').send({ email: 'test@example.com' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('email and password are required');
    });

    it('returns 401 when user does not exist', async () => {
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [] });
      const res = await request(app)
        .post('/login')
        .send({ email: 'notfound@example.com', password: 'password123' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('invalid credentials');
    });

    it('returns 401 when password does not match', async () => {
      const hashed = await bcrypt.hash('realPassword', 10);
      vi.spyOn(pool, 'query').mockResolvedValueOnce({
        rows: [{ id: 1, email: 'user@example.com', password_hash: hashed, role: 'RIDER' }],
      });

      const res = await request(app)
        .post('/login')
        .send({ email: 'user@example.com', password: 'wrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('invalid credentials');
    });

    it('returns 200 with JWT token upon valid credentials', async () => {
      const plainPassword = 'securePassword123';
      const hashed = await bcrypt.hash(plainPassword, 10);
      vi.spyOn(pool, 'query').mockResolvedValueOnce({
        rows: [{ id: 10, email: 'driver@example.com', password_hash: hashed, role: 'DRIVER' }],
      });

      const res = await request(app)
        .post('/login')
        .send({ email: 'driver@example.com', password: plainPassword });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.userId).toBe(10);
      expect(res.body.role).toBe('DRIVER');
    });
  });
});
