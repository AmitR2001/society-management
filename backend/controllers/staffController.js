const Staff = require('../models/Staff');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');

const addStaff = asyncHandler(async (req, res) => {
  const staffData = { ...req.body, society: req.user.society };
  
  // Hash password if provided
  if (staffData.password) {
    staffData.password = await bcrypt.hash(staffData.password, 12);
  }
  
  const staff = await Staff.create(staffData);
  const staffResponse = staff.toObject();
  delete staffResponse.password;
  res.status(201).json(staffResponse);
});

const getStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.find({ society: req.user.society })
    .select('-password')
    .sort({ createdAt: -1 });
  res.status(200).json(staff);
});

const updateStaff = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  
  // Hash password if being updated
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 12);
  }
  
  const staff = await Staff.findOneAndUpdate(
    { _id: req.params.id, society: req.user.society },
    updateData,
    { new: true }
  ).select('-password');

  if (!staff) {
    return res.status(404).json({ message: 'Staff not found' });
  }

  res.status(200).json(staff);
});

const deleteStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findOneAndDelete({ _id: req.params.id, society: req.user.society });

  if (!staff) {
    return res.status(404).json({ message: 'Staff not found' });
  }

  res.status(200).json({ message: 'Staff deleted successfully' });
});

const markAttendance = asyncHandler(async (req, res) => {
  const { date, status } = req.body;
  const staff = await Staff.findOne({ _id: req.params.id, society: req.user.society });

  if (!staff) {
    return res.status(404).json({ message: 'Staff not found' });
  }

  // Check if attendance already exists for this date
  const existingIndex = staff.attendance.findIndex(
    a => new Date(a.date).toDateString() === new Date(date).toDateString()
  );

  if (existingIndex >= 0) {
    staff.attendance[existingIndex].status = status;
  } else {
    staff.attendance.push({ date, status });
  }

  await staff.save();
  res.status(200).json(staff);
});

module.exports = { addStaff, getStaff, updateStaff, deleteStaff, markAttendance };
