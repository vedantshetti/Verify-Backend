const jwt = require('jsonwebtoken');

// Middleware to extract and validate JWT tokens
const extractToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.token = authHeader.substring(7);
  }
  
  next();
};

// Middleware to log authentication attempts
const logAuthAttempt = (req, res, next) => {
  if (req.path.includes('/auth/')) {
    console.log(`[AUTH] ${req.method} ${req.originalUrl} from ${req.ip}`);
  }
  next();
};

module.exports = {
  extractToken,
  logAuthAttempt
};
