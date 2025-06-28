// src/routes/auth.routes.js
const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../middlewares/validation');
const { authenticateJWT } = require('../middlewares/auth');

const router = express.Router();

// Local authentication routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticateJWT, authController.logout);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/auth/error` }),
  authController.googleCallback
);

// GitHub OAuth routes
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL}/auth/error` }),
  authController.githubCallback
);

// Protected routes
router.get('/profile', authenticateJWT, authController.getProfile);

module.exports = router;
