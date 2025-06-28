// src/routes/proxy.routes.js
const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const { createProxyConfig } = require('../config/proxy');

const router = express.Router();

// ✅ Auth service proxy with proper fixRequestBody usage
router.use('/auth', createProxyMiddleware({
  ...createProxyConfig('auth'),
  pathRewrite: { '^/api/v1/auth': '/api/auth' },
  onProxyReq: (proxyReq, req, res) => {
    // ✅ Call fixRequestBody first
    fixRequestBody(proxyReq, req);
    // Then add logging
    console.log(`[AUTH PROXY] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
  }
}));

// Analytics service proxy
router.use('/analytics', createProxyMiddleware({
  ...createProxyConfig('analytics'),
  pathRewrite: { '^/api/v1/analytics': '/api/analytics' },
  onProxyReq: (proxyReq, req, res) => {
    fixRequestBody(proxyReq, req);
    console.log(`[ANALYTICS PROXY] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
  }
}));

// Research service proxy
router.use('/research', createProxyMiddleware({
  ...createProxyConfig('research'),
  pathRewrite: { '^/api/v1/research': '/api/research' },
  onProxyReq: (proxyReq, req, res) => {
    fixRequestBody(proxyReq, req);
    console.log(`[RESEARCH PROXY] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
  }
}));

// Journals service proxy
router.use('/journals', createProxyMiddleware({
  ...createProxyConfig('journals'),
  pathRewrite: { '^/api/v1/journals': '/api/journals' },
  onProxyReq: (proxyReq, req, res) => {
    fixRequestBody(proxyReq, req);
    console.log(`[JOURNALS PROXY] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
  }
}));

// Influencers service proxy
router.use('/influencers', createProxyMiddleware({
  ...createProxyConfig('influencers'),
  pathRewrite: { '^/api/v1/influencers': '/api/influencers' },
  onProxyReq: (proxyReq, req, res) => {
    fixRequestBody(proxyReq, req);
    console.log(`[INFLUENCERS PROXY] ${req.method} ${req.originalUrl} -> ${proxyReq.path}`);
  }
}));

module.exports = router;
