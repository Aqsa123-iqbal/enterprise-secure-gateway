require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const users = [
  { name: 'Super Admin', email: 'superadmin@gateway.com', password: 'SuperAdmin@123', role: 'SuperAdmin' },
  { name: 'Manager User', email: 'manager@gateway.com', password: 'Manager@123', role: 'Manager' },
  { name: 'Employee User', email: 'employee@gateway.com', password: 'Employee@123', role: 'Employee' }
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  for (const u of users) {
    await User.deleteOne({ email: u.email });
    await User.create({ ...u, password: await bcrypt.hash(u.password, 12) });
    console.log(`Created ${u.role}: ${u.email}`);
  }
  await mongoose.disconnect();
})();