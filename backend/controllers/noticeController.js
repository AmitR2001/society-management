const Notice = require('../models/Notice');
const asyncHandler = require('../utils/asyncHandler');

const createNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.create({
    ...req.body,
    society: req.user.society,
    postedBy: req.user._id
  });

  res.status(201).json(notice);
});

const getNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find({ society: req.user.society })
    .populate('postedBy', 'fullName role')
    .sort({ createdAt: -1 });

  res.status(200).json(notices);
});

module.exports = { createNotice, getNotices };
