require('dotenv').config();

module.exports = {
  GATEWAY_PORT: process.env.GATEWAY_PORT || 3000,
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:5001'
};
