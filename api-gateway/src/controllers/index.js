const { successResponse } = require('../utils/response');
const config = require('../config');

class IndexController {
  async getApiInfo(req, res) {
    const apiInfo = {
      message: 'VerifyInfluencers API Gateway',
      version: '1.0.0',
      environment: config.gateway.environment,
      services: Object.keys(config.services).reduce((acc, serviceName) => {
        acc[serviceName] = config.services[serviceName].url;
        return acc;
      }, {}),
      endpoints: {
        health: '/health',
        detailedHealth: '/health/detailed',
        auth: '/api/v1/auth/*',
        analytics: '/api/v1/analytics/*',
        research: '/api/v1/research/*'
      },
      documentation: '/docs'
    };

    successResponse(res, 'API Gateway Information', apiInfo);
  }
}

module.exports = new IndexController();
