const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

// Sirf SuperAdmin
router.delete('/:id', auth, checkRole(['SuperAdmin']), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: 'Invalid user id' });

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  await RefreshToken.deleteMany({ user: req.params.id });
  res.json({ message: 'User deleted' });
});

module.exports = router;