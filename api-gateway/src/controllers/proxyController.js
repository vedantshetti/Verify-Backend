const proxyService = require('../services/proxyService');

class ProxyController {
  async handleAuthProxy(req, res, next) {
    try {
      await proxyService.proxyToService('auth', '/api/auth', req, res, next);
    } catch (error) {
      next(error);
    }
  }

  async handleAnalyticsProxy(req, res, next) {
    try {
      await proxyService.proxyToService('analytics', '/api/analytics', req, res, next);
    } catch (error) {
      next(error);
    }
  }

  async handleResearchProxy(req, res, next) {
    try {
      await proxyService.proxyToService('research', '/api/research', req, res, next);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProxyController();
