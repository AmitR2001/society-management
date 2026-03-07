const mongoose = require('mongoose');

const societySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    maintenanceBaseAmount: { type: Number, default: 0 },
    // Payment Details (for manual payments)
    paymentDetails: {
      upiId: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      accountHolderName: { type: String, default: '' },
      qrCodeUrl: { type: String, default: '' } // Base64 or URL to QR image
    }
  },
  { timestamps: true }
);

societySchema.index({ name: 1, city: 1 });

module.exports = mongoose.model('Society', societySchema);
