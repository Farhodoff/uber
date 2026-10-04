import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './index.js';

describe('Location Service', () => {
  it('GET /health returns 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ service: 'location-service', status: 'ok' });
  });

  describe('GET /autocomplete', () => {
    it('returns 400 when input query parameter is missing', async () => {
      const res = await request(app).get('/autocomplete');
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('input parameter is required');
    });

    it('returns mock predictions when API key is not configured', async () => {
      const res = await request(app).get('/autocomplete?input=Chorsu');
      expect(res.status).toBe(200);
      expect(res.body.predictions).toBeDefined();
      expect(res.body.predictions.length).toBeGreaterThan(0);
      expect(res.body.predictions[0].description).toContain('Chorsu');
    });
  });

  describe('GET /geocode', () => {
    it('returns 400 when placeId parameter is missing', async () => {
      const res = await request(app).get('/geocode');
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('placeId parameter is required');
    });

    it('returns mock geometry location when placeId is provided', async () => {
      const res = await request(app).get('/geocode?placeId=mock1');
      expect(res.status).toBe(200);
      expect(res.body.result).toBeDefined();
      expect(res.body.result.geometry.location.lat).toBe(41.2995);
      expect(res.body.result.geometry.location.lng).toBe(69.2401);
    });
  });

  describe('GET /reverse-geocode', () => {
    it('returns 400 when lat or lng is missing', async () => {
      const res = await request(app).get('/reverse-geocode?lat=41.2995');
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('lat and lng parameters are required');
    });

    it('returns mock formatted address when coordinates are provided', async () => {
      const res = await request(app).get('/reverse-geocode?lat=41.2995&lng=69.2401');
      expect(res.status).toBe(200);
      expect(res.body.result.formatted_address).toContain('41.2995');
    });
  });
});
