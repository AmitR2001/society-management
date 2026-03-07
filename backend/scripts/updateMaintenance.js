require('dotenv').config();
const mongoose = require('mongoose');
const Flat = require('../models/Flat');
const Society = require('../models/Society');

const updateMaintenanceCharges = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Update society maintenance base amount
    const society = await Society.findOne();
    if (society && society.maintenanceBaseAmount === 0) {
      society.maintenanceBaseAmount = 2000;
      await society.save();
      console.log('Updated society base maintenance to ₹2000');
    }

    // Update all flats with 0 maintenance charge
    const result = await Flat.updateMany(
      { maintenanceCharge: { $in: [0, null] } },
      { maintenanceCharge: 2000 }
    );
    console.log(`Updated ${result.modifiedCount} flats with ₹2000 maintenance charge`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

updateMaintenanceCharges();
