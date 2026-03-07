const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['Admin', 'Resident', 'Security'],
      required: true
    },
    roleRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },
    flat: { type: mongoose.Schema.Types.ObjectId, ref: 'Flat' },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationExpiresAt: { type: Date }
  },
  { timestamps: true }
);

userSchema.index({ society: 1, role: 1 });
userSchema.index({ verificationToken: 1 });

module.exports = mongoose.model('User', userSchema);
