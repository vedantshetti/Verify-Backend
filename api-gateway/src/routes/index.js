const express = require('express');
const healthRoutes = require('./health.routes');
const proxyRoutes = require('./proxy.routes');
const indexController = require('../controllers');

const router = express.Router();

// API info route
router.get('/', indexController.getApiInfo);

// Health routes
router.use('/health', healthRoutes);

// Proxy routes
router.use('/api/v1', proxyRoutes);

// Express 5 compatible catch-all route
router.all('/{*catchall}', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
