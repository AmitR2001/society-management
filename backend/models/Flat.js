const mongoose = require('mongoose');

const flatSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    block: { type: String, required: true },
    floor: { type: Number, required: true },
    number: { type: String, required: true },
    ownerName: { type: String },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    maintenanceCharge: { type: Number, default: 0 }
  },
  { timestamps: true }
);

flatSchema.index({ society: 1, block: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Flat', flatSchema);
