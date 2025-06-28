// src/config/proxy.js
const config = require('./index');

const createProxyConfig = (serviceName) => {
  const service = config.services[serviceName];
  
  if (!service) {
    throw new Error(`Service ${serviceName} not configured`);
  }

  return {
    target: service.url,
    changeOrigin: true,
    timeout: service.timeout,
    // ✅ Remove the custom onProxyReq - let fixRequestBody handle it
    onError: (err, req, res) => {
      console.error(`${serviceName} Service Proxy Error:`, err.message);
      res.status(503).json({
        success: false,
        message: `${serviceName} service unavailable`,
        error: err.code || 'SERVICE_UNAVAILABLE',
        timestamp: new Date().toISOString()
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[${serviceName.toUpperCase()} RESPONSE] ${proxyRes.statusCode} for ${req.originalUrl}`);
    }
  };
};

module.exports = {
  createProxyConfig
};
