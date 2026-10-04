import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app, pool } from './index.js';

describe('Driver Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /health', () => {
    it('returns 200 when database connection is healthy', async () => {
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ service: 'driver-service', status: 'ok' });
    });

    it('returns 500 when database check fails', async () => {
      vi.spyOn(pool, 'query').mockRejectedValueOnce(new Error('Connection error'));
      const res = await request(app).get('/health');
      expect(res.status).toBe(500);
      expect(res.body.status).toBe('db_error');
    });
  });

  describe('POST /profiles', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app).post('/profiles').send({ authUserId: 1 });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Missing required fields');
    });

    it('creates driver profile with status in transaction and returns 201', async () => {
      const mockClient = {
        query: vi.fn(),
        release: vi.fn(),
      };
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 101, auth_user_id: 1, license_number: 'AA123', plate_number: '01A777AA' }] })
        .mockResolvedValueOnce({}) // INSERT driver_status
        .mockResolvedValueOnce({}); // COMMIT

      vi.spyOn(pool, 'connect').mockResolvedValueOnce(mockClient);

      const res = await request(app)
        .post('/profiles')
        .send({
          authUserId: 1,
          licenseNumber: 'AA123',
          vehicleMake: 'Chevrolet',
          vehicleModel: 'Cobalt',
          vehicleYear: 2023,
          plateNumber: '01A777AA',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(101);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('returns 409 when driver/license/plate already exists', async () => {
      const mockClient = {
        query: vi.fn(),
        release: vi.fn(),
      };
      const duplicateErr = new Error('duplicate key');
      duplicateErr.code = '23505';

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(duplicateErr) // INSERT duplicate
        .mockResolvedValueOnce({}); // ROLLBACK

      vi.spyOn(pool, 'connect').mockResolvedValueOnce(mockClient);

      const res = await request(app)
        .post('/profiles')
        .send({
          authUserId: 1,
          licenseNumber: 'DUP123',
          plateNumber: '01B999BB',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Driver/License/Plate already exists');
    });
  });

  describe('GET /profiles/:authUserId', () => {
    it('returns 404 when driver profile is not found', async () => {
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [] });
      const res = await request(app).get('/profiles/999');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Driver profile not found');
    });

    it('returns driver profile with status when found', async () => {
      const driver = {
        id: 7,
        auth_user_id: 50,
        license_number: 'LN555',
        is_online: true,
        current_lat: 41.3111,
        current_lon: 69.2797,
      };
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [driver] });

      const res = await request(app).get('/profiles/50');
      expect(res.status).toBe(200);
      expect(res.body.license_number).toBe('LN555');
      expect(res.body.is_online).toBe(true);
    });
  });

  describe('PATCH /status/:driverId', () => {
    it('updates driver online status and coordinates', async () => {
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rowCount: 1 });
      const res = await request(app)
        .patch('/status/7')
        .send({ isOnline: true, lat: 41.3, lon: 69.2 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Status updated');
    });
  });

  describe('GET /nearby', () => {
    it('returns online drivers', async () => {
      const onlineDrivers = [
        { driver_id: 1, auth_user_id: 10, current_lat: 41.3, current_lon: 69.2 },
        { driver_id: 2, auth_user_id: 11, current_lat: 41.31, current_lon: 69.25 },
      ];
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: onlineDrivers });

      const res = await request(app).get('/nearby');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].driver_id).toBe(1);
    });
  });
});
