const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
    amount: { type: Number, required: true },
    provider: { type: String, default: 'Razorpay' },
    orderId: { type: String, required: true },
    paymentId: { type: String },
    signature: { type: String },
    status: {
      type: String,
      enum: ['Created', 'Captured', 'Failed'],
      default: 'Created'
    },
    receiptNo: { type: String }
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1 }, { unique: true });
paymentSchema.index({ bill: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
