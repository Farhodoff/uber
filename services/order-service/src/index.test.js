import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createRequire } from 'module';
import { app, pool } from './index.js';

const require = createRequire(import.meta.url);
const axios = require('axios');

describe('Order Service', () => {
  let axiosGetSpy;
  let axiosPostSpy;

  beforeEach(() => {
    vi.restoreAllMocks();
    axiosGetSpy = vi.spyOn(axios, 'get').mockResolvedValue({ data: [] });
    axiosPostSpy = vi.spyOn(axios, 'post').mockResolvedValue({ data: { success: true } });
  });

  describe('GET /health', () => {
    it('returns 200 when database connection is healthy', async () => {
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ service: 'order-service', status: 'ok' });
    });

    it('returns 500 when database fails', async () => {
      vi.spyOn(pool, 'query').mockRejectedValueOnce(new Error('DB err'));
      const res = await request(app).get('/health');
      expect(res.status).toBe(500);
      expect(res.body.status).toBe('db_error');
    });
  });

  describe('POST / (Create Order)', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app).post('/').send({ authUserId: 1 });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('authUserId, pickupLocation, dropoffLocation are required');
    });

    it('returns 400 when user profile is not found in user-service', async () => {
      axiosGetSpy.mockRejectedValueOnce(new Error('User not found'));
      const res = await request(app).post('/').send({
        authUserId: 99,
        pickupLocation: 'Tashkent City',
        dropoffLocation: 'Chorsu Bazaar',
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('user profile not found');
    });

    it('creates order, queries nearby drivers, and returns 201', async () => {
      axiosGetSpy
        .mockResolvedValueOnce({ data: { id: 1, auth_user_id: 10 } }) // user profile
        .mockResolvedValueOnce({ data: [{ driver_id: 5 }] }); // nearby drivers
      axiosPostSpy.mockResolvedValue({ data: { success: true } }); // socket notify

      const createdOrder = {
        id: 100,
        auth_user_id: 10,
        pickup_location: 'Tashkent City',
        dropoff_location: 'Chorsu',
        price: 15000,
        distance_km: 5,
        status: 'PENDING',
      };
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [createdOrder] });

      const res = await request(app).post('/').send({
        authUserId: 10,
        pickupLocation: 'Tashkent City',
        dropoffLocation: 'Chorsu',
      });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(100);
      expect(res.body.status).toBe('PENDING');
    });
  });

  describe('POST /:orderId/accept', () => {
    it('returns 404 when order does not exist', async () => {
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [] });
      const res = await request(app).post('/999/accept').send({ driverId: 5 });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Order not found');
    });

    it('returns 409 when order is already taken/accepted', async () => {
      vi.spyOn(pool, 'query').mockResolvedValueOnce({
        rows: [{ id: 100, status: 'ACCEPTED', driver_id: 3 }],
      });
      const res = await request(app).post('/100/accept').send({ driverId: 5 });
      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Order already taken');
    });

    it('assigns driver and returns 200 upon valid acceptance', async () => {
      vi.spyOn(pool, 'query')
        .mockResolvedValueOnce({ rows: [{ id: 100, status: 'PENDING' }] }) // order check
        .mockResolvedValueOnce({
          rows: [{ id: 100, status: 'ACCEPTED', driver_id: 5, auth_user_id: 10 }],
        }); // update

      const res = await request(app).post('/100/accept').send({ driverId: 5 });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ACCEPTED');
      expect(res.body.driver_id).toBe(5);
    });
  });

  describe('PATCH /:orderId/status', () => {
    it('returns 400 for an invalid status transition', async () => {
      const res = await request(app).patch('/100/status').send({ status: 'INVALID_STATUS' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid status');
    });

    it('updates status to COMPLETED and notifies rider', async () => {
      vi.spyOn(pool, 'query').mockResolvedValueOnce({
        rows: [{ id: 100, status: 'COMPLETED', auth_user_id: 10 }],
      });

      const res = await request(app).patch('/100/status').send({ status: 'COMPLETED' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('COMPLETED');
    });
  });

  describe('GET /user/:authUserId', () => {
    it('returns list of orders for the user', async () => {
      const orders = [
        { id: 1, auth_user_id: 10, status: 'COMPLETED' },
        { id: 2, auth_user_id: 10, status: 'PENDING' },
      ];
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: orders });

      const res = await request(app).get('/user/10');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });
});
