const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    flat: { type: mongoose.Schema.Types.ObjectId, ref: 'Flat', required: true },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleNo: { type: String, required: true, uppercase: true },
    type: { type: String, enum: ['2W', '4W', 'Other'], default: '4W' }
  },
  { timestamps: true }
);

vehicleSchema.index({ society: 1, vehicleNo: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
