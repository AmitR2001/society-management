const express = require('express');
const { createComplaint, getComplaints, updateComplaintStatus } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', authorize('Resident'), createComplaint);
router.get('/', getComplaints);
router.patch('/:id', authorize('Admin', 'Security'), updateComplaintStatus);

module.exports = router;
