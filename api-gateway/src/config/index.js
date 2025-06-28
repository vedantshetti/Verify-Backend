require('dotenv').config();

module.exports = {
  gateway: {
    port: process.env.GATEWAY_PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  },
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      timeout: 5000
    }
  },
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
  }
};
