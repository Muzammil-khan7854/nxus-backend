const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdminUsers = async () => {
  try {
    const adminEmail = (process.env.ADMIN_First || 'firstadmin@gamil.com').trim().toLowerCase();
    const superadminEmail = (process.env.SUPERADMIN_First || 'superadmin@gamil.com').trim().toLowerCase();

    // Seed Admin
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const adminUser = new User({
        name: 'System Admin',
        email: adminEmail,
        password: 'admin123', // Standard Step 1 password
        phone: '123-456-7890',
        role: 'admin',
        isVerified: true
      });
      await adminUser.save();
    }

    // Seed Superadmin
    const superadminExists = await User.findOne({ email: superadminEmail });
    if (!superadminExists) {
      const superadminUser = new User({
        name: 'Super Admin',
        email: superadminEmail,
        password: 'superadmin123', // Standard Step 1 password
        phone: '987-654-3210',
        role: 'superadmin',
        isVerified: true
      });
      await superadminUser.save();
    }
  } catch (error) {
    console.error(`Error seeding admin users: ${error.message}`);
  }
};

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nxus';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000, // Increased timeout for Vercel cold starts
      family: 4 // Force IPv4 to fix Node 18+ DNS resolution issues on Vercel
    });
    await seedAdminUsers();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Server is running in offline mode. Will retry connection later on demand.');
    // Do not crash the process: allow the server to continue running so it can answer requests
    // with database status checks or try to reconnect.
  }
};

module.exports = connectDB;
