// src/controllers/authController.js
const authService = require('../services/authService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { username, email, password } = req.body;
      const result = await authService.register({ username, email, password });

      logger.info(`New user registered: ${email}`);
      
      successResponse(res, 'User registered successfully', {
        user: result.user,
        tokens: result.tokens
      }, 201);
    } catch (error) {
      logger.error('Registration error:', error);
      errorResponse(res, error.message, 400);
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { username, password } = req.body;
      const result = await authService.login({ username, password });

      logger.info(`User logged in: ${result.user.email}`);
      
      successResponse(res, 'Login successful', {
        user: result.user,
        tokens: result.tokens
      });
    } catch (error) {
      logger.error('Login error:', error);
      errorResponse(res, error.message, 401);
    }
  }

  async googleCallback(req, res) {
    try {
      const user = req.user;
      const tokens = require('../services/tokenService').generateTokens({
        id: user._id,
        email: user.email,
        username: user.username
      });

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.CLIENT_URL}/auth/success?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Google callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth/error`);
    }
  }

  async githubCallback(req, res) {
    try {
      const user = req.user;
      const tokens = require('../services/tokenService').generateTokens({
        id: user._id,
        email: user.email,
        username: user.username
      });

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.CLIENT_URL}/auth/success?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('GitHub callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth/error`);
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return errorResponse(res, 'Refresh token required', 400);
      }

      const result = await authService.refreshToken(refreshToken);
      
      successResponse(res, 'Token refreshed successfully', {
        user: result.user,
        tokens: result.tokens
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      errorResponse(res, error.message, 401);
    }
  }

  async logout(req, res) {
    try {
      // In a real application, you might want to blacklist the token
      successResponse(res, 'Logout successful');
    } catch (error) {
      logger.error('Logout error:', error);
      errorResponse(res, 'Logout failed', 500);
    }
  }

  async getProfile(req, res) {
    try {
      const user = req.user;
      successResponse(res, 'Profile retrieved successfully', { user });
    } catch (error) {
      logger.error('Get profile error:', error);
      errorResponse(res, 'Failed to get profile', 500);
    }
  }
}

module.exports = new AuthController();
