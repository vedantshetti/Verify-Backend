// src/routes/proxy.routes.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

// Auth service proxy configuration
const authServiceProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/auth': '/api/auth' // Rewrite path for auth service
  },
  onError: (err, req, res) => {
    console.error('Auth Service Proxy Error:', err.message);
    res.status(503).json({
      success: false,
      message: 'Authentication service unavailable',
      timestamp: new Date().toISOString()
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[AUTH PROXY] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
  }
});

// ✅ Apply proxy to all auth routes - no wildcards needed here
router.use('/', authServiceProxy);

module.exports = router;
