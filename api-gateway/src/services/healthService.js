const axios = require('axios');
const config = require('../config');

class HealthService {
  async getGatewayHealth() {
    return {
      status: 'OK',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: config.gateway.environment
    };
  }

  async getDetailedHealth() {
    const healthData = {
      gateway: await this.getGatewayHealth(),
      services: {}
    };

    // Check all configured services
    for (const [serviceName, serviceConfig] of Object.entries(config.services)) {
      try {
        const response = await axios.get(`${serviceConfig.url}/health`, {
          timeout: 5000
        });
        
        healthData.services[serviceName] = {
          status: 'OK',
          url: serviceConfig.url,
          responseTime: response.headers['x-response-time'] || 'N/A',
          data: response.data
        };
      } catch (error) {
        healthData.services[serviceName] = {
          status: 'ERROR',
          url: serviceConfig.url,
          error: error.message,
          code: error.code || 'UNKNOWN'
        };
      }
    }

    return healthData;
  }

  async getServiceHealth(serviceName) {
    const serviceConfig = config.services[serviceName];
    
    if (!serviceConfig) {
      throw new Error(`Service ${serviceName} not configured`);
    }

    try {
      const response = await axios.get(`${serviceConfig.url}/health`, {
        timeout: 5000
      });
      
      return {
        status: 'OK',
        service: serviceName,
        url: serviceConfig.url,
        data: response.data
      };
    } catch (error) {
      return {
        status: 'ERROR',
        service: serviceName,
        url: serviceConfig.url,
        error: error.message
      };
    }
  }
}

module.exports = new HealthService();
