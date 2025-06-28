require('dotenv').config();

module.exports = {
  gateway: {
    port: process.env.GATEWAY_PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  },
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      timeout: 5000,
      retries: 3
    },
    // Add more services as your platform grows
    analytics: {
      url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3002',
      timeout: 5000,
      retries: 3
    },
    research: {
      url: process.env.RESEARCH_SERVICE_URL || 'http://localhost:3003',
      timeout: 10000,
      retries: 2
    }
  },
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString()
    }
  }
};
