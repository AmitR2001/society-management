const express = require('express');
const { 
  logVisitorEntry, 
  logVisitorExit, 
  getVisitors,
  logVisitorEntryByStaff,
  logVisitorExitByStaff,
  getVisitorsByStaff
} = require('../controllers/visitorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { protectStaff } = require('../controllers/staffAuthController');

const router = express.Router();

// Staff routes (staff members like security guards)
router.get('/staff', protectStaff, getVisitorsByStaff);
router.post('/staff', protectStaff, logVisitorEntryByStaff);
router.patch('/staff/:id/exit', protectStaff, logVisitorExitByStaff);

// User routes (Admin, Security role users, Residents)
router.use(protect);
router.post('/', authorize('Security', 'Admin'), logVisitorEntry);
router.patch('/:id/exit', authorize('Security', 'Admin'), logVisitorExit);
router.get('/', authorize('Security', 'Admin', 'Resident'), getVisitors);

module.exports = router;
