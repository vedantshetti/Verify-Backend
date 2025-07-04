const express = require('express');
const passport = require('passport');
const controller = require('./auth.controller');
const router = express.Router();

router.post('/register', controller.register);
router.get('/verify-email/:token', controller.verifyEmail);
router.post('/login', controller.login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  controller.googleCallback
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  controller.githubCallback
);

module.exports = router;
