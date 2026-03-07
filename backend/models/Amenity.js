const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    name: { type: String, required: true },
    description: { type: String },
    feePerSlot: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

amenitySchema.index({ society: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Amenity', amenitySchema);
