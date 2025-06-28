// src/services/authService.js
const User = require('../models/User');
const tokenService = require('./tokenService');

class AuthService {
  async register({ username, email, password }) {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already registered');
      }
      if (existingUser.username === username) {
        throw new Error('Username already taken');
      }
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate tokens
    const tokens = tokenService.generateTokens({
      id: user._id,
      email: user.email,
      username: user.username
    });

    return { user, tokens };
  }

  async login({ username, password }) {
    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      isActive: true
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = tokenService.generateTokens({
      id: user._id,
      email: user.email,
      username: user.username
    });

    return { user, tokens };
  }

  async refreshToken(token) {
    try {
      const decoded = tokenService.verifyToken(token);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        throw new Error('User not found');
      }

      const tokens = tokenService.generateTokens({
        id: user._id,
        email: user.email,
        username: user.username
      });

      return { user, tokens };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

module.exports = new AuthService();
