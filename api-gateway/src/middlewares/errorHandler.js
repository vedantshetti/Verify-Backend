const errorHandler = (err, req, res, next) => {
    console.error('Gateway Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  
    // Handle specific error types
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        error: 'SERVICE_UNAVAILABLE',
        timestamp: new Date().toISOString()
      });
    }
  
    if (err.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        message: 'Service timeout',
        error: 'GATEWAY_TIMEOUT',
        timestamp: new Date().toISOString()
      });
    }
  
    // Default error response
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal server error',
      error: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  };
  
  module.exports = errorHandler;
  