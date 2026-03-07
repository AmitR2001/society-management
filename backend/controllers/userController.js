const User = require('../models/User');
const Flat = require('../models/Flat');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');

const createUser = asyncHandler(async (req, res) => {
  const data = { ...req.body, society: req.user.society };
  data.password = await bcrypt.hash(req.body.password, 12);
  const user = await User.create(data);
  res.status(201).json(user);
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ society: req.user.society }).select('-password').populate('flat', 'block number');
  res.status(200).json(users);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, society: req.user.society },
    req.body,
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOneAndDelete({ _id: req.params.id, society: req.user.society });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json({ message: 'User deleted' });
});

const assignResidentToFlat = asyncHandler(async (req, res) => {
  const { residentId, flatId } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: residentId, society: req.user.society, role: 'Resident' },
    { flat: flatId },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: 'Resident not found' });
  }

  await Flat.updateOne({ _id: flatId, society: req.user.society }, { resident: residentId });

  res.status(200).json({ message: 'Resident assigned to flat', user });
});

module.exports = { createUser, getUsers, updateUser, deleteUser, assignResidentToFlat };
