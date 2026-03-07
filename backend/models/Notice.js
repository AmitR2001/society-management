const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

noticeSchema.index({ society: 1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
