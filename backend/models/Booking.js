const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    amenity: { type: mongoose.Schema.Types.ObjectId, ref: 'Amenity', required: true },
    flat: { type: mongoose.Schema.Types.ObjectId, ref: 'Flat', required: true },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['Booked', 'Cancelled'], default: 'Booked' }
  },
  { timestamps: true }
);

bookingSchema.index({ amenity: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
