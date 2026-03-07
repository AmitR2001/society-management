const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    flat: { type: mongoose.Schema.Types.ObjectId, ref: 'Flat', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    purpose: { type: String, required: true },
    vehicleNo: { type: String },
    entryTime: { type: Date, default: Date.now },
    exitTime: { type: Date },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

visitorSchema.index({ society: 1, entryTime: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);
