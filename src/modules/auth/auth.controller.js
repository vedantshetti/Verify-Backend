const authService = require('./auth.service');
const { successResponse, errorResponse } = require('../../utils/response');

exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    successResponse(res, 'Registration successful. Please check your email to verify your account.', { user }, 201);
  } catch (err) {
    errorResponse(res, err.message, 400);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    await authService.verifyEmail(req.params.token);
    successResponse(res, 'Email verified successfully. You can now log in.');
  } catch (err) {
    errorResponse(res, err.message, 400);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await authService.login(req.body);
    const tokens = authService.generateTokens(user);
    successResponse(res, 'Login successful', { user, tokens });
  } catch (err) {
    errorResponse(res, err.message, 401);
  }
};

// Google OAuth callback
exports.googleCallback = async (req, res) => {
  const user = req.user;
  const tokens = authService.generateTokens(user);
  // Redirect or respond with tokens as needed
  res.json({ success: true, user, tokens });
};

// GitHub OAuth callback
exports.githubCallback = async (req, res) => {
  const user = req.user;
  const tokens = authService.generateTokens(user);
  res.json({ success: true, user, tokens });
};
