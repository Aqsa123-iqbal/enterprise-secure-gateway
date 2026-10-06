const router = require('express').Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Sirf Manager aur SuperAdmin
router.post('/approve', auth, checkRole(['Manager', 'SuperAdmin']), (req, res) => {
  res.json({ message: `Payroll approved by ${req.user.role}` });
});

module.exports = router;