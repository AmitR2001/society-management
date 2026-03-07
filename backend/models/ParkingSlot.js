const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    slotNumber: { type: String, required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    isOccupied: { type: Boolean, default: false }
  },
  { timestamps: true }
);

parkingSlotSchema.index({ society: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
