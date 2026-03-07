const Amenity = require('../models/Amenity');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');

const createAmenity = asyncHandler(async (req, res) => {
  const amenity = await Amenity.create({ ...req.body, society: req.user.society });
  res.status(201).json(amenity);
});

const getAmenities = asyncHandler(async (req, res) => {
  const amenities = await Amenity.find({ society: req.user.society, isActive: true });
  res.status(200).json(amenities);
});

const bookAmenity = asyncHandler(async (req, res) => {
  const { amenity, flat, startTime, endTime } = req.body;

  const conflict = await Booking.findOne({
    amenity,
    status: 'Booked',
    $or: [
      {
        startTime: { $lt: new Date(endTime) },
        endTime: { $gt: new Date(startTime) }
      }
    ]
  });

  if (conflict) {
    return res.status(409).json({ message: 'Selected slot is already booked' });
  }

  const booking = await Booking.create({
    society: req.user.society,
    amenity,
    flat,
    resident: req.user._id,
    startTime,
    endTime
  });

  res.status(201).json(booking);
});

const getBookings = asyncHandler(async (req, res) => {
  const filter = { society: req.user.society };
  if (req.user.role === 'Resident') {
    filter.resident = req.user._id;
  }

  const bookings = await Booking.find(filter)
    .populate('amenity', 'name')
    .populate('flat', 'number block')
    .populate('resident', 'fullName email')
    .sort({ startTime: -1 });

  res.status(200).json(bookings);
});

module.exports = { createAmenity, getAmenities, bookAmenity, getBookings };
