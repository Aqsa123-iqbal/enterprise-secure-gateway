const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshToken, hashToken, cookieOptions } = require('../utils/tokens');

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

const issueTokens = async (user, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res.cookie('refreshToken', refreshToken, cookieOptions);
  return accessToken;
};

exports.issueTokens = issueTokens; // OAuth mein bhi use hoga

// POST /api/v1/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email and password are required' });
    if (typeof email !== 'string' || typeof password !== 'string')
      return res.status(400).json({ message: 'Invalid input' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed }); // role hamesha Employee

    res.status(201).json({
      message: 'Registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string')
      return res.status(400).json({ message: 'Invalid input' });

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(401).json({ message: 'Invalid credentials' });

    if (user.lockUntil && user.lockUntil > Date.now())
      return res.status(423).json({ message: 'Account locked. Try again later.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
        user.failedAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.failedAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const accessToken = await issueTokens(user, res);
    res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/v1/auth/refresh  (rotation)
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const stored = await RefreshToken.findOne({ tokenHash: hashToken(token) });
    if (!stored) {
      // token pehle use ho chuka tha: reuse detection, user ke sab tokens revoke
      await RefreshToken.deleteMany({ user: decoded.id });
      res.clearCookie('refreshToken');
      return res.status(401).json({ message: 'Token reuse detected. Please login again.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    await stored.deleteOne(); // purana token revoke
    const accessToken = await issueTokens(user, res); // naya pair
    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/v1/auth/logout
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) await RefreshToken.deleteOne({ tokenHash: hashToken(token) });
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
// Google OAuth callback ke baad
exports.oauthCallback = async (req, res) => {
  try {
    await issueTokens(req.user, res);
    res.redirect('/?login=success');
  } catch (err) {
    res.redirect('/?error=oauth_failed');
  }
};