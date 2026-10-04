import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app, io, riders, drivers } from './index.js';

describe('Socket Service', () => {
  beforeEach(() => {
    // Clear riders and drivers maps
    for (const key of Object.keys(riders)) delete riders[key];
    for (const key of Object.keys(drivers)) delete drivers[key];
    vi.restoreAllMocks();
  });

  it('GET /health returns 200 ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ service: 'socket-service', status: 'ok' });
  });

  describe('POST /notify/driver', () => {
    it('returns 404 when driver is not connected', async () => {
      const res = await request(app).post('/notify/driver').send({
        driverId: 999,
        event: 'ride:request',
        data: { id: 1 },
      });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ success: false, message: 'Driver not connected' });
    });

    it('emits event and returns 200 when driver is connected', async () => {
      const emitSpy = vi.fn();
      vi.spyOn(io, 'to').mockReturnValue({ emit: emitSpy });
      drivers[5] = 'socket-driver-5';

      const res = await request(app).post('/notify/driver').send({
        driverId: 5,
        event: 'ride:request',
        data: { id: 101, status: 'PENDING' },
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
      expect(io.to).toHaveBeenCalledWith('socket-driver-5');
      expect(emitSpy).toHaveBeenCalledWith('ride:request', { id: 101, status: 'PENDING' });
    });
  });

  describe('POST /notify/rider', () => {
    it('returns 404 when rider is not connected', async () => {
      const res = await request(app).post('/notify/rider').send({
        userId: 888,
        event: 'ride:update',
        data: { status: 'ACCEPTED' },
      });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ success: false, message: 'Rider not connected' });
    });

    it('emits event and returns 200 when rider is connected', async () => {
      const emitSpy = vi.fn();
      vi.spyOn(io, 'to').mockReturnValue({ emit: emitSpy });
      riders[42] = 'socket-rider-42';

      const res = await request(app).post('/notify/rider').send({
        userId: 42,
        event: 'ride:update',
        data: { status: 'ACCEPTED', driverId: 5 },
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
      expect(io.to).toHaveBeenCalledWith('socket-rider-42');
      expect(emitSpy).toHaveBeenCalledWith('ride:update', { status: 'ACCEPTED', driverId: 5 });
    });
  });
});
