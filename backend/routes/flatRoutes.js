const express = require('express');
const { createFlat, getFlats, updateFlat, getAvailableResidents, deleteFlat, getFlatsByStaff } = require('../controllers/flatController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { protectStaff } = require('../controllers/staffAuthController');

const router = express.Router();

// Staff route (must be before protect middleware)
router.get('/staff', protectStaff, getFlatsByStaff);

router.use(protect);
router.post('/', authorize('Admin'), createFlat);
router.get('/', getFlats);
router.get('/available-residents', authorize('Admin'), getAvailableResidents);
router.patch('/:id', authorize('Admin'), updateFlat);
router.delete('/:id', authorize('Admin'), deleteFlat);

module.exports = router;
