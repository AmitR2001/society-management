const Society = require('../models/Society');
const User = require('../models/User');
const Flat = require('../models/Flat');
const asyncHandler = require('../utils/asyncHandler');

<<<<<<< HEAD
// Public endpoint - get default society info (no auth required)
const getPublicSocietyInfo = asyncHandler(async (req, res) => {
  const society = await Society.findOne().sort({ createdAt: 1 }).select('name address city state');
  if (!society) {
    return res.status(200).json({ 
      name: process.env.DEFAULT_SOCIETY_NAME || 'Society Management System',
      address: '',
      city: '',
      state: ''
    });
  }
  return res.status(200).json(society);
});

=======
>>>>>>> efa04fab56a99b2fd817ec62ef51439cb528ec9a
const createSociety = asyncHandler(async (req, res) => {
  const society = await Society.create({ ...req.body, admin: req.user._id });

  await User.updateOne({ _id: req.user._id }, { $set: { society: society._id } });

  res.status(201).json(society);
});

const getMySociety = asyncHandler(async (req, res) => {
  const society = await Society.findById(req.user.society).populate('admin', 'fullName email');
  if (!society) {
    return res.status(404).json({ message: 'Society not found' });
  }
  return res.status(200).json(society);
});

const updateSociety = asyncHandler(async (req, res) => {
  const { maintenanceBaseAmount, name, address, city, state, pincode, paymentDetails } = req.body;
  
  const updateData = {};
  
  if (maintenanceBaseAmount !== undefined) updateData.maintenanceBaseAmount = maintenanceBaseAmount;
  if (name) updateData.name = name;
  if (address) updateData.address = address;
  if (city) updateData.city = city;
  if (state) updateData.state = state;
  if (pincode) updateData.pincode = pincode;
  
  // Handle payment details update
  if (paymentDetails) {
    updateData['paymentDetails.upiId'] = paymentDetails.upiId || '';
    updateData['paymentDetails.bankName'] = paymentDetails.bankName || '';
    updateData['paymentDetails.accountNumber'] = paymentDetails.accountNumber || '';
    updateData['paymentDetails.ifscCode'] = paymentDetails.ifscCode || '';
    updateData['paymentDetails.accountHolderName'] = paymentDetails.accountHolderName || '';
    updateData['paymentDetails.qrCodeUrl'] = paymentDetails.qrCodeUrl || '';
  }
  
  const society = await Society.findOneAndUpdate(
    { _id: req.user.society },
    { $set: updateData },
    { new: true }
  );

  if (!society) {
    return res.status(404).json({ message: 'Society not found' });
  }

  // If maintenance base amount changed, update all flats that don't have custom charges
  if (maintenanceBaseAmount !== undefined) {
    await Flat.updateMany(
      { society: society._id, maintenanceCharge: { $in: [0, null] } },
      { maintenanceCharge: maintenanceBaseAmount }
    );
  }

  res.status(200).json(society);
});

<<<<<<< HEAD
module.exports = { getPublicSocietyInfo, createSociety, getMySociety, updateSociety };
=======
module.exports = { createSociety, getMySociety, updateSociety };
>>>>>>> efa04fab56a99b2fd817ec62ef51439cb528ec9a
