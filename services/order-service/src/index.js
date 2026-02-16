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
const DRIVER_SERVICE_URL = process.env.DRIVER_SERVICE_URL || 'http://driver-service:4004';
const SOCKET_SERVICE_URL = process.env.SOCKET_SERVICE_URL || 'http://socket-service:4005';

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ service: 'order-service', status: 'ok' });
  } catch (error) {
    res.status(500).json({ status: 'db_error', error: error.message });
  }
});

// Create Order (Simulate matching)
app.post('/', async (req, res) => {
  try {
    const { authUserId, pickupLocation, dropoffLocation } = req.body;
    if (!authUserId || !pickupLocation || !dropoffLocation) {
      return res.status(400).json({ message: 'authUserId, pickupLocation, dropoffLocation are required' });
    }

    // 1. Validate User
    try {
      await axios.get(`${USER_SERVICE_URL}/profiles/${authUserId}`);
    } catch (_error) {
      return res.status(400).json({ message: 'user profile not found' });
    }

    // 2. Calculate Price (Mock)
    const distanceKm = Math.floor(Math.random() * 10) + 2; // Random 2-12 km
    const price = (5000 + (distanceKm * 2000)); // Base 5000 + 2000 per km

    // 3. Create Order
    const created = await pool.query(
      'INSERT INTO orders (auth_user_id, pickup_location, dropoff_location, price, distance_km, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [authUserId, pickupLocation, dropoffLocation, price, distanceKm, 'PENDING']
    );
    const order = created.rows[0];

    // 4. Find Driver (Mock: Get all online, pick first)
    try {
      const driversRes = await axios.get(`${DRIVER_SERVICE_URL}/nearby`);
      const drivers = driversRes.data;

      if (drivers.length > 0) {
        // In real app: loop through drivers, send request, wait for accept.
        // Here: Just notify them
        drivers.forEach(driver => {
          axios.post(`${SOCKET_SERVICE_URL}/notify/driver`, {
            driverId: driver.driver_id,
            event: 'ride:request',
            data: order
          }).catch(err => console.error('Socket error:', err.message));
        });
      }
    } catch (e) {
      console.error('Error finding drivers:', e.message);
    }

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Driver Accepts Order
app.post('/:orderId/accept', async (req, res) => {
  try {
    const { driverId } = req.body;
    const { orderId } = req.params;

    // Check if order is pending
    const orderCheck = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderCheck.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    if (orderCheck.rows[0].status !== 'PENDING') return res.status(409).json({ message: 'Order already taken' });

    // Assign driver
    const updated = await pool.query(
      'UPDATE orders SET driver_id = $1, status = $2 WHERE id = $3 RETURNING *',
      [driverId, 'ACCEPTED', orderId]
    );
    const order = updated.rows[0];

    // Notify Rider
    axios.post(`${SOCKET_SERVICE_URL}/notify/rider`, {
      userId: order.auth_user_id,
      event: 'ride:update',
      data: { status: 'ACCEPTED', driverId, orderId }
    }).catch(err => console.error(err.message));

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Update Order Status (Arrived, Completed)
app.patch('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body; // ARRIVED, IN_PROGRESS, COMPLETED
    const { orderId } = req.params;

    const validStatuses = ['ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const updated = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, orderId]
    );
    const order = updated.rows[0];

    // Notify Rider
    axios.post(`${SOCKET_SERVICE_URL}/notify/rider`, {
      userId: order.auth_user_id,
      event: 'ride:update',
      data: { status, orderId }
    }).catch(err => console.error(err.message));

    return res.json(order);
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
