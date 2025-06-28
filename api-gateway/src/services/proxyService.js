const { createProxyMiddleware } = require('http-proxy-middleware');
const { createProxyConfig } = require('../config/proxy');

class ProxyService {
  constructor() {
    this.proxies = new Map();
  }

  getProxy(serviceName, pathRewrite) {
    const proxyKey = `${serviceName}-${JSON.stringify(pathRewrite)}`;
    
    if (!this.proxies.has(proxyKey)) {
      const config = createProxyConfig(serviceName);
      if (pathRewrite) {
        config.pathRewrite = pathRewrite;
      }
      
      const proxy = createProxyMiddleware(config);
      this.proxies.set(proxyKey, proxy);
    }
    
    return this.proxies.get(proxyKey);
  }

  async proxyToService(serviceName, targetPath, req, res, next) {
    const pathRewrite = {};
    pathRewrite[`^/api/v1/${serviceName}`] = targetPath;
    
    const proxy = this.getProxy(serviceName, pathRewrite);
    return proxy(req, res, next);
  }
}

module.exports = new ProxyService();
