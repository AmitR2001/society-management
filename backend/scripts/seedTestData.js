require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Society = require('../models/Society');
const Flat = require('../models/Flat');
const Amenity = require('../models/Amenity');

const seedTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Find the default society
    const society = await Society.findOne().sort({ createdAt: 1 });
    if (!society) {
      console.log('No society found. Please register an Admin user first.');
      process.exit(1);
    }
    console.log(`Found society: ${society.name} (${society._id})`);

    // Update all users to have this society
    const usersWithoutSociety = await User.updateMany(
      { society: null },
      { society: society._id }
    );
    console.log(`Updated ${usersWithoutSociety.modifiedCount} users with society`);

    // Create flats if none exist
    const existingFlats = await Flat.countDocuments({ society: society._id });
    if (existingFlats === 0) {
      const flats = [];
      const blocks = ['A', 'B'];
      
      for (const block of blocks) {
        for (let floor = 1; floor <= 3; floor++) {
          for (let unit = 1; unit <= 4; unit++) {
            flats.push({
              society: society._id,
              block,
              floor,
              number: `${block}-${floor}0${unit}`,
              maintenanceCharge: society.maintenanceBaseAmount || 2000
            });
          }
        }
      }

      await Flat.insertMany(flats);
      console.log(`Created ${flats.length} flats`);
    } else {
      console.log(`${existingFlats} flats already exist`);
    }

    // Assign residents to flats if not already assigned
    const residents = await User.find({ role: 'Resident', society: society._id, flat: null });
    const availableFlats = await Flat.find({ society: society._id, resident: null });

    for (let i = 0; i < Math.min(residents.length, availableFlats.length); i++) {
      const resident = residents[i];
      const flat = availableFlats[i];

      resident.flat = flat._id;
      await resident.save();

      flat.resident = resident._id;
      flat.ownerName = resident.fullName;
      await flat.save();

      console.log(`Assigned ${resident.fullName} to flat ${flat.number}`);
    }

    // Create amenities if none exist
    const existingAmenities = await Amenity.countDocuments({ society: society._id });
    if (existingAmenities === 0) {
      const amenities = [
        { name: 'Swimming Pool', description: 'Olympic size swimming pool', feePerSlot: 200, society: society._id },
        { name: 'Gym', description: 'Fully equipped fitness center', feePerSlot: 100, society: society._id },
        { name: 'Party Hall', description: 'Hall for events and parties', feePerSlot: 500, society: society._id },
        { name: 'Tennis Court', description: 'Outdoor tennis court', feePerSlot: 150, society: society._id }
      ];

      await Amenity.insertMany(amenities);
      console.log(`Created ${amenities.length} amenities`);
    } else {
      console.log(`${existingAmenities} amenities already exist`);
    }

    // Show summary
    console.log('\n--- Summary ---');
    const allUsers = await User.find({ society: society._id }).select('fullName email role flat');
    console.log(`\nUsers in society:`);
    for (const user of allUsers) {
      const flatInfo = user.flat ? await Flat.findById(user.flat).select('number') : null;
      console.log(`  - ${user.fullName} (${user.role}) ${flatInfo ? `-> Flat ${flatInfo.number}` : '-> No flat assigned'}`);
    }

    const flatCount = await Flat.countDocuments({ society: society._id });
    const amenityCount = await Amenity.countDocuments({ society: society._id });
    console.log(`\nTotal Flats: ${flatCount}`);
    console.log(`Total Amenities: ${amenityCount}`);

    console.log('\n✓ Test data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test data:', error.message);
    process.exit(1);
  }
};

seedTestData();
