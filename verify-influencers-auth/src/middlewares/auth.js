// src/middlewares/auth.js
const passport = require('passport');
const { errorResponse } = require('../utils/response');

const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return errorResponse(res, 'Authentication error', 500);
    }
    
    if (!user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

module.exports = {
  authenticateJWT,
  optionalAuth
};
