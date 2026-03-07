const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    flat: { type: mongoose.Schema.Types.ObjectId, ref: 'Flat', required: true },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    month: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    latePenalty: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'PaidCash', 'Overdue', 'Cancelled'],
      default: 'Pending'
    },
    paidAt: { type: Date },
    paidBy: { type: String, enum: ['Online', 'Cash'], default: null },
    cancelledAt: { type: Date },
    cancelReason: { type: String }
  },
  { timestamps: true }
);

billSchema.index({ flat: 1, month: 1 }, { unique: true });
billSchema.index({ society: 1, status: 1 });

module.exports = mongoose.model('Bill', billSchema);
