const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent'], default: 'Present' }
  },
  { _id: false }
);

const staffSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    password: { type: String },
    role: { type: String, required: true },
    phone: { type: String, required: true },
    salary: { type: Number, required: true },
    joinDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    attendance: [attendanceSchema]
  },
  { timestamps: true }
);

staffSchema.index({ society: 1, role: 1 });
staffSchema.index({ email: 1 });

module.exports = mongoose.model('Staff', staffSchema);
