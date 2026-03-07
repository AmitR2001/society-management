const Vehicle = require('../models/Vehicle');
const ParkingSlot = require('../models/ParkingSlot');
const asyncHandler = require('../utils/asyncHandler');

const addVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create({ ...req.body, society: req.user.society });
  res.status(201).json(vehicle);
});

const createParkingSlot = asyncHandler(async (req, res) => {
  const slot = await ParkingSlot.create({ ...req.body, society: req.user.society });
  res.status(201).json(slot);
});

const assignParking = asyncHandler(async (req, res) => {
  const { slotId, vehicleId } = req.body;
  const slot = await ParkingSlot.findOneAndUpdate(
    { _id: slotId, society: req.user.society },
    { vehicle: vehicleId, isOccupied: true },
    { new: true }
  ).populate('vehicle');

  if (!slot) {
    return res.status(404).json({ message: 'Parking slot not found' });
  }

  res.status(200).json(slot);
});

module.exports = { addVehicle, createParkingSlot, assignParking };
