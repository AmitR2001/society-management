const Complaint = require('../models/Complaint');
const asyncHandler = require('../utils/asyncHandler');

const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.create({
    ...req.body,
    society: req.user.society,
    resident: req.user._id,
    history: [{ status: 'Pending', note: 'Complaint created', changedBy: req.user._id }]
  });

  res.status(201).json(complaint);
});

const getComplaints = asyncHandler(async (req, res) => {
  const filter = { society: req.user.society };
  if (req.user.role === 'Resident') {
    filter.resident = req.user._id;
  }

  const complaints = await Complaint.find(filter)
    .populate('resident assignedTo flat', 'fullName number email')
    .populate('history.changedBy', 'fullName')
    .sort({ createdAt: -1 });

  res.status(200).json(complaints);
});

const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, note, assignedTo } = req.body;

  const complaint = await Complaint.findOne({
    _id: req.params.id,
    society: req.user.society
  });

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found' });
  }

  if (status) complaint.status = status;
  if (assignedTo) complaint.assignedTo = assignedTo;

  complaint.history.push({
    status: complaint.status,
    note: note || `Status updated to ${complaint.status}`,
    changedBy: req.user._id
  });

  await complaint.save();
  res.status(200).json(complaint);
});

module.exports = { createComplaint, getComplaints, updateComplaintStatus };
