const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
const Notice = require('../models/Notice');
const asyncHandler = require('../utils/asyncHandler');

// Staff Login
const staffLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const staff = await Staff.findOne({ email }).populate('society', 'name');

  if (!staff) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!staff.password) {
    return res.status(401).json({ message: 'Account not set up for login. Contact admin.' });
  }

  if (!staff.isActive) {
    return res.status(401).json({ message: 'Account is deactivated. Contact admin.' });
  }

  const isMatch = await bcrypt.compare(password, staff.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { staffId: staff._id, type: 'staff' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(200).json({
    token,
    staff: {
      id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      phone: staff.phone,
      society: staff.society,
      type: 'staff'
    }
  });
});

// Get staff profile
const getStaffProfile = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.staff._id)
    .select('-password')
    .populate('society', 'name');
  res.status(200).json(staff);
});

// Self mark attendance
const markSelfAttendance = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.staff._id);
  
  if (!staff) {
    return res.status(404).json({ message: 'Staff not found' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already marked today
  const existingIndex = staff.attendance.findIndex(a => {
    const attendanceDate = new Date(a.date);
    attendanceDate.setHours(0, 0, 0, 0);
    return attendanceDate.getTime() === today.getTime();
  });

  if (existingIndex >= 0) {
    return res.status(400).json({ message: 'Attendance already marked for today' });
  }

  staff.attendance.push({ date: today, status: 'Present' });
  await staff.save();

  res.status(200).json({ message: 'Attendance marked successfully', staff });
});

// Get own attendance history
const getMyAttendance = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.staff._id).select('attendance name role');
  
  if (!staff) {
    return res.status(404).json({ message: 'Staff not found' });
  }

  res.status(200).json(staff);
});

// Get notices for staff (read only)
const getNoticesForStaff = asyncHandler(async (req, res) => {
  const notices = await Notice.find({ society: req.staff.society })
    .populate('postedBy', 'fullName')
    .sort({ createdAt: -1 });
  res.status(200).json(notices);
});

// Staff middleware - verify staff token
const protectStaff = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'staff') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    const staff = await Staff.findById(decoded.staffId).select('-password');

    if (!staff || !staff.isActive) {
      return res.status(401).json({ message: 'Invalid or deactivated staff account' });
    }

    req.staff = staff;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { 
  staffLogin, 
  getStaffProfile, 
  markSelfAttendance, 
  getMyAttendance, 
  getNoticesForStaff,
  protectStaff 
};
