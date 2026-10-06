require('dotenv').config();

const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

async function seed() {
  try {
    await connectDB();

    await User.deleteMany({});

    const users = [
      {
        name: 'Super Admin',
        email: 'superadmin@gateway.com',
        password: 'SuperAdmin@123',
        role: 'SuperAdmin',
        provider: 'local'
      },
      {
        name: 'Manager User',
        email: 'manager@gateway.com',
        password: 'Manager@123',
        role: 'Manager',
        provider: 'local'
      },
      {
        name: 'Employee User',
        email: 'employee@gateway.com',
        password: 'Employee@123',
        role: 'Employee',
        provider: 'local'
      }
    ];

    for (const user of users) {
      user.password = await bcrypt.hash(user.password, 12);

      await User.create(user);

      console.log(`Created ${user.role}: ${user.email}`);
    }

    console.log('Seed completed successfully');

    process.exit(0);

  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();