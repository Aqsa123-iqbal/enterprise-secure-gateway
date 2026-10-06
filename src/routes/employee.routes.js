const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Sab authenticated roles
router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

module.exports = router;