import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app, pool } from './index.js';

describe('User Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /health', () => {
    it('returns 200 when database connection is healthy', async () => {
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ service: 'user-service', status: 'ok' });
    });

    it('returns 500 when database query fails', async () => {
      vi.spyOn(pool, 'query').mockRejectedValueOnce(new Error('DB failure'));
      const res = await request(app).get('/health');
      expect(res.status).toBe(500);
      expect(res.body.status).toBe('db_error');
    });
  });

  describe('POST /profiles', () => {
    it('returns 400 when authUserId or fullName is missing', async () => {
      const res = await request(app).post('/profiles').send({ authUserId: 1 });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('authUserId and fullName are required');
    });

    it('returns 409 when profile for auth user already exists', async () => {
      const err = new Error('duplicate key');
      err.code = '23505';
      vi.spyOn(pool, 'query').mockRejectedValueOnce(err);

      const res = await request(app)
        .post('/profiles')
        .send({ authUserId: 1, fullName: 'John Doe', phone: '+998901234567' });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('profile for auth user already exists');
    });

    it('creates profile and returns 201', async () => {
      const newProfile = {
        id: 1,
        auth_user_id: 2,
        full_name: 'Alisher Navoiy',
        phone: '+998901112233',
        created_at: new Date().toISOString(),
      };
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [newProfile] });

      const res = await request(app)
        .post('/profiles')
        .send({ authUserId: 2, fullName: 'Alisher Navoiy', phone: '+998901112233' });

      expect(res.status).toBe(201);
      expect(res.body.full_name).toBe('Alisher Navoiy');
      expect(res.body.auth_user_id).toBe(2);
    });
  });

  describe('GET /profiles/:authUserId', () => {
    it('returns 404 when profile is not found', async () => {
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [] });
      const res = await request(app).get('/profiles/999');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('profile not found');
    });

    it('returns 200 and profile data when found', async () => {
      const profile = {
        id: 10,
        auth_user_id: 42,
        full_name: 'Farhod S',
        phone: '+998991234567',
      };
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [profile] });

      const res = await request(app).get('/profiles/42');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(profile);
    });
  });
});
