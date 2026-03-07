const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['Admin', 'Resident', 'Security'],
      unique: true,
      required: true
    },
    permissions: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
