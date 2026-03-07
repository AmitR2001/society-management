const express = require('express');
const { addStaff, getStaff, updateStaff, deleteStaff, markAttendance } = require('../controllers/staffController');
const { 
  staffLogin, 
  getStaffProfile, 
  markSelfAttendance, 
  getMyAttendance, 
  getNoticesForStaff,
  protectStaff 
} = require('../controllers/staffAuthController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Staff self-service routes (staff login)
router.post('/login', staffLogin);
router.get('/me', protectStaff, getStaffProfile);
router.post('/me/attendance', protectStaff, markSelfAttendance);
router.get('/me/attendance', protectStaff, getMyAttendance);
router.get('/me/notices', protectStaff, getNoticesForStaff);

// Admin routes for staff management
router.use(protect);
router.post('/', authorize('Admin'), addStaff);
router.get('/', authorize('Admin', 'Security'), getStaff);
router.patch('/:id', authorize('Admin'), updateStaff);
router.delete('/:id', authorize('Admin'), deleteStaff);
router.patch('/:id/attendance', authorize('Admin', 'Security'), markAttendance);

module.exports = router;
