const express = require('express');
const axios = require('axios');

const router = express.Router();

// Gateway health check
router.get('/', async (req, res) => {
  const healthData = {
    status: 'OK',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {}
  };

  // Check auth service health
  try {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const authResponse = await axios.get(`${authServiceUrl}/health`, { timeout: 5000 });
    healthData.services.auth = {
      status: 'OK',
      url: authServiceUrl,
      response: authResponse.data
    };
  } catch (error) {
    healthData.services.auth = {
      status: 'ERROR',
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      error: error.message
    };
  }

  // Determine overall health
  const allServicesHealthy = Object.values(healthData.services).every(
    service => service.status === 'OK'
  );

  res.status(allServicesHealthy ? 200 : 503).json(healthData);
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  const detailedHealth = {
    gateway: {
      status: 'OK',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString()
    },
    services: {}
  };

  // Check all microservices
  const services = [
    { name: 'auth', url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001' }
    // Add more services here as you build them
  ];

  for (const service of services) {
    try {
      const response = await axios.get(`${service.url}/health`, { timeout: 5000 });
      detailedHealth.services[service.name] = {
        status: 'OK',
        url: service.url,
        responseTime: response.headers['x-response-time'] || 'N/A',
        data: response.data
      };
    } catch (error) {
      detailedHealth.services[service.name] = {
        status: 'ERROR',
        url: service.url,
        error: error.message,
        code: error.code || 'UNKNOWN'
      };
    }
  }

  res.json(detailedHealth);
});

module.exports = router;
