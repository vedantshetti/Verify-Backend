// gateway.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Proxy to auth microservice
app.use('/api/v1/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { 
    '^/api/v1/auth': '/api/auth' // Rewrite to match your auth service routes
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err.message);
    res.status(503).json({
      success: false,
      message: 'Auth service unavailable',
      timestamp: new Date().toISOString()
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
  }
}));

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'VerifyInfluencers API Gateway',
    version: '1.0.0',
    services: {
      auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001'
    }
  });
});

// ✅ Express 5 compatible catch-all route - MUST be named
app.all('/{*catchall}', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.GATEWAY_PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth service proxy: http://localhost:${PORT}/api/v1/auth/*`);
});

module.exports = app;
