const Flat = require('../models/Flat');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const createFlat = asyncHandler(async (req, res) => {
  const flat = await Flat.create({ ...req.body, society: req.user.society });
  res.status(201).json(flat);
});

const getFlats = asyncHandler(async (req, res) => {
  const flats = await Flat.find({ society: req.user.society }).populate('resident', 'fullName email');
  res.status(200).json(flats);
});

const updateFlat = asyncHandler(async (req, res) => {
  // Get current flat to check existing resident
  const currentFlat = await Flat.findOne({ _id: req.params.id, society: req.user.society });
  if (!currentFlat) {
    return res.status(404).json({ message: 'Flat not found' });
  }

  // Prepare update data - separate resident handling from other fields
  const updateData = { ...req.body };
  delete updateData.resident; // Handle resident separately

  // Check if resident is being changed (only if resident field is in request)
  const isResidentBeingChanged = 'resident' in req.body;
  const oldResidentId = currentFlat.resident?.toString() || null;
  const newResidentId = isResidentBeingChanged 
    ? (req.body.resident && req.body.resident.trim() !== '' ? req.body.resident : null)
    : oldResidentId; // Keep existing if not changing

  let flat;
  if (isResidentBeingChanged && newResidentId === null) {
    // Unsetting resident - use $unset
    flat = await Flat.findOneAndUpdate(
      { _id: req.params.id, society: req.user.society },
      { $set: updateData, $unset: { resident: 1 } },
      { new: true }
    ).populate('resident', 'fullName email');
  } else if (isResidentBeingChanged && newResidentId) {
    // Setting new resident
    flat = await Flat.findOneAndUpdate(
      { _id: req.params.id, society: req.user.society },
      { ...updateData, resident: newResidentId },
      { new: true }
    ).populate('resident', 'fullName email');
  } else {
    // Not changing resident, just update other fields
    flat = await Flat.findOneAndUpdate(
      { _id: req.params.id, society: req.user.society },
      updateData,
      { new: true }
    ).populate('resident', 'fullName email');
  }

  // Sync User.flat field if resident changed
  if (isResidentBeingChanged && oldResidentId !== newResidentId) {
    // Remove flat from old resident
    if (oldResidentId) {
      await User.findByIdAndUpdate(oldResidentId, { $unset: { flat: 1 } });
    }
    // Assign flat to new resident
    if (newResidentId) {
      // First remove this user from any other flat they might be assigned to
      await Flat.updateMany(
        { _id: { $ne: req.params.id }, resident: newResidentId, society: req.user.society },
        { $unset: { resident: 1 } }
      );
      // Update user's flat reference
      await User.findByIdAndUpdate(newResidentId, { flat: req.params.id });
    }
  }

  res.status(200).json(flat);
});

// Get ALL residents for assignment dropdown (shows which ones are already assigned)
const getAvailableResidents = asyncHandler(async (req, res) => {
  const residents = await User.find({
    society: req.user.society,
    role: 'Resident'
  }).select('fullName email _id flat').populate('flat', 'number block');
  res.status(200).json(residents);
});

// Delete a flat
const deleteFlat = asyncHandler(async (req, res) => {
  const flat = await Flat.findOne({ _id: req.params.id, society: req.user.society });
  if (!flat) {
    res.status(404);
    throw new Error('Flat not found');
  }
  
  // If flat has a resident, remove their flat reference
  if (flat.resident) {
    await User.findByIdAndUpdate(flat.resident, { $unset: { flat: 1 } });
  }
  
  await Flat.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Flat deleted successfully' });
});

// Staff can get flats (for visitor logging)
const getFlatsByStaff = asyncHandler(async (req, res) => {
  const flats = await Flat.find({ society: req.staff.society }).select('number block');
  res.status(200).json(flats);
});

module.exports = { createFlat, getFlats, updateFlat, getAvailableResidents, deleteFlat, getFlatsByStaff };
