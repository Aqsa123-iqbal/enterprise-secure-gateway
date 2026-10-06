const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // sirf failed attempts count hon
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many failed login attempts. Try again after 15 minutes.' }
});

module.exports = { loginLimiter };