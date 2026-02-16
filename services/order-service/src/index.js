const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const PORT = process.env.PORT || 4003;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:4002';

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ service: 'order-service', status: 'ok' });
  } catch (error) {
    res.status(500).json({ status: 'db_error', error: error.message });
  }
});

app.post('/', async (req, res) => {
  try {
    const { authUserId, pickupLocation, dropoffLocation } = req.body;
    if (!authUserId || !pickupLocation || !dropoffLocation) {
      return res.status(400).json({ message: 'authUserId, pickupLocation, dropoffLocation are required' });
    }

    try {
      await axios.get(`${USER_SERVICE_URL}/profiles/${authUserId}`);
    } catch (_error) {
      return res.status(400).json({ message: 'user profile not found in user-service' });
    }

    const created = await pool.query(
      'INSERT INTO orders (auth_user_id, pickup_location, dropoff_location) VALUES ($1, $2, $3) RETURNING *',
      [authUserId, pickupLocation, dropoffLocation]
    );

    return res.status(201).json(created.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get('/user/:authUserId', async (req, res) => {
  try {
    const orders = await pool.query('SELECT * FROM orders WHERE auth_user_id = $1 ORDER BY created_at DESC', [req.params.authUserId]);
    return res.json(orders.rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`order-service running on ${PORT}`);
});
