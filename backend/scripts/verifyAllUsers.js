// Script to verify all existing unverified users
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const verifyAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      { isVerified: false },
      { $set: { isVerified: true, verificationToken: null, verificationExpiresAt: null } }
    );

    console.log(`Verified ${result.modifiedCount} users`);
    
    // List all users
    const users = await User.find().select('email fullName role isVerified');
    console.log('\nAll users:');
    users.forEach(u => console.log(`- ${u.email} (${u.role}) - Verified: ${u.isVerified}`));

    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

verifyAllUsers();
