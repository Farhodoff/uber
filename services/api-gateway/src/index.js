const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 4000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:4001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:4002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:4003';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

function requireAuth(req, res, next) {
  if (req.path === '/health') {
    return next();
  }

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'invalid or expired token' });
  }
}

app.get('/health', (_req, res) => {
  res.json({ service: 'api-gateway', status: 'ok' });
});

app.use('/auth', createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/auth': '' }
}));

app.use('/users', requireAuth, createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/users': '' }
}));

app.use('/orders', requireAuth, createProxyMiddleware({
  target: ORDER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/orders': '' }
}));

app.listen(PORT, () => {
  console.log(`api-gateway running on ${PORT}`);
});
