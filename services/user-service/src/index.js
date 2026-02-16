const express = require('express');
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

const PORT = process.env.PORT || 4002;

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ service: 'user-service', status: 'ok' });
  } catch (error) {
    res.status(500).json({ status: 'db_error', error: error.message });
  }
});

app.post('/profiles', async (req, res) => {
  try {
    const { authUserId, fullName, phone } = req.body;
    if (!authUserId || !fullName) {
      return res.status(400).json({ message: 'authUserId and fullName are required' });
    }

    const created = await pool.query(
      'INSERT INTO user_profiles (auth_user_id, full_name, phone) VALUES ($1, $2, $3) RETURNING *',
      [authUserId, fullName, phone || null]
    );

    return res.status(201).json(created.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'profile for auth user already exists' });
    }
    return res.status(500).json({ message: error.message });
  }
});

app.get('/profiles/:authUserId', async (req, res) => {
  try {
    const profile = await pool.query('SELECT * FROM user_profiles WHERE auth_user_id = $1', [req.params.authUserId]);
    if (!profile.rows.length) {
      return res.status(404).json({ message: 'profile not found' });
    }

    return res.json(profile.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`user-service running on ${PORT}`);
});
