const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },               // OAuth users ke liye optional
  role: { type: String, enum: ['SuperAdmin', 'Manager', 'Employee'], default: 'Employee' },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String },
  failedAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);