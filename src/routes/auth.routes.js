const router = require('express').Router();
const passport = require('passport');
const { register, login, refresh, logout, oauthCallback } = require('../controllers/auth.controller');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/?error=oauth_failed' }),
  oauthCallback
);

module.exports = router;