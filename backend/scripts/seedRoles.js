require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');

const roles = [
  { name: 'Admin', permissions: ['all'] },
  { name: 'Resident', permissions: ['read:self', 'book:amenity', 'raise:complaint', 'pay:bill'] },
  { name: 'Security', permissions: ['visitor:entry', 'visitor:exit', 'complaint:update'] }
];

const seedRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all(
      roles.map((role) => Role.updateOne({ name: role.name }, { $set: role }, { upsert: true }))
    );
    console.log('Roles seeded successfully');
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedRoles();
