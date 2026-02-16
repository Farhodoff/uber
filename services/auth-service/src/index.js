const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ service: 'auth-service', status: 'ok' });
  } catch (error) {
    res.status(500).json({ status: 'db_error', error: error.message });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const userRole = role && ['RIDER', 'DRIVER', 'ADMIN'].includes(role) ? role : 'RIDER';

    const exists = await pool.query('SELECT id FROM auth_users WHERE email = $1', [email]);
    if (exists.rows.length) {
      return res.status(409).json({ message: 'email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const created = await pool.query(
      'INSERT INTO auth_users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [email, hash, userRole]
    );

    return res.status(201).json(created.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const result = await pool.query('SELECT * FROM auth_users WHERE email = $1', [email]);
    if (!result.rows.length) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, userId: user.id, email: user.email, role: user.role });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`auth-service running on ${PORT}`);
});
