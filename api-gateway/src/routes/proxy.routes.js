const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createProxyConfig } = require('../config/proxy');

const router = express.Router();

// Auth service proxy
router.use('/auth', createProxyMiddleware({
  ...createProxyConfig('auth'),
  pathRewrite: { '^/api/v1/auth': '/api/auth' }
}));

// Analytics service proxy (for future use)
router.use('/analytics', createProxyMiddleware({
  ...createProxyConfig('analytics'),
  pathRewrite: { '^/api/v1/analytics': '/api/analytics' }
}));

// Research service proxy (for future use)
router.use('/research', createProxyMiddleware({
  ...createProxyConfig('research'),
  pathRewrite: { '^/api/v1/research': '/api/research' }
}));

module.exports = router;
