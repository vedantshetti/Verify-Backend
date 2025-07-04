const authService = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/response');

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    const tokens = authService.generateTokens(user);
    successResponse(res, 'User registered successfully', { user, tokens }, 201);
  } catch (err) {
    errorResponse(res, err.message, 400);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await authService.login(req.body);
    const tokens = authService.generateTokens(user);
    successResponse(res, 'Login successful', { user, tokens });
  } catch (err) {
    errorResponse(res, err.message, 401);
  }
};
