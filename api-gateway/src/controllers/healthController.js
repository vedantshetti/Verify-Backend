const healthService = require('../services/healthService');
const { successResponse } = require('../utils/response');

class HealthController {
  async getHealth(req, res, next) {
    try {
      const healthData = await healthService.getGatewayHealth();
      successResponse(res, 'Gateway health check successful', healthData);
    } catch (error) {
      next(error);
    }
  }

  async getDetailedHealth(req, res, next) {
    try {
      const detailedHealth = await healthService.getDetailedHealth();
      const allServicesHealthy = Object.values(detailedHealth.services).every(
        service => service.status === 'OK'
      );
      
      const statusCode = allServicesHealthy ? 200 : 503;
      res.status(statusCode).json({
        success: allServicesHealthy,
        message: allServicesHealthy ? 'All services healthy' : 'Some services unavailable',
        data: detailedHealth,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  async getServiceStatus(req, res, next) {
    try {
      const { serviceName } = req.params;
      const serviceHealth = await healthService.getServiceHealth(serviceName);
      successResponse(res, `${serviceName} service status`, serviceHealth);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HealthController();
