const Visitor = require('../models/Visitor');
const asyncHandler = require('../utils/asyncHandler');

const logVisitorEntry = asyncHandler(async (req, res) => {
  const visitor = await Visitor.create({
    ...req.body,
    society: req.user.society,
    recordedBy: req.user._id
  });

  res.status(201).json(visitor);
});

const logVisitorExit = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findOneAndUpdate(
    { _id: req.params.id, society: req.user.society },
    { exitTime: new Date() },
    { new: true }
  );

  if (!visitor) {
    return res.status(404).json({ message: 'Visitor not found' });
  }

  res.status(200).json(visitor);
});

const getVisitors = asyncHandler(async (req, res) => {
  let filter = { society: req.user.society };

  // Residents can only see visitors to their own flat
  if (req.user.role === 'Resident') {
    if (!req.user.flat) {
      return res.status(200).json([]); // No flat assigned, no visitors to show
    }
    filter.flat = req.user.flat;
  }
  // Admin and Security can see all visitors

  const visitors = await Visitor.find(filter)
    .populate('flat recordedBy', 'number fullName')
    .sort({ entryTime: -1 });

  res.status(200).json(visitors);
});

// Staff-specific visitor functions
const logVisitorEntryByStaff = asyncHandler(async (req, res) => {
  const visitor = await Visitor.create({
    ...req.body,
    society: req.staff.society,
    recordedBy: req.staff._id
  });

  res.status(201).json(visitor);
});

const logVisitorExitByStaff = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findOneAndUpdate(
    { _id: req.params.id, society: req.staff.society },
    { exitTime: new Date() },
    { new: true }
  );

  if (!visitor) {
    return res.status(404).json({ message: 'Visitor not found' });
  }

  res.status(200).json(visitor);
});

const getVisitorsByStaff = asyncHandler(async (req, res) => {
  const visitors = await Visitor.find({ society: req.staff.society })
    .populate('flat recordedBy', 'number fullName')
    .sort({ entryTime: -1 });

  res.status(200).json(visitors);
});

module.exports = { 
  logVisitorEntry, 
  logVisitorExit, 
  getVisitors,
  logVisitorEntryByStaff,
  logVisitorExitByStaff,
  getVisitorsByStaff
};
