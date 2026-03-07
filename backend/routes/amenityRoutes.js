const express = require('express');
const { createAmenity, getAmenities, bookAmenity, getBookings } = require('../controllers/amenityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/amenities', authorize('Admin'), createAmenity);
router.get('/amenities', getAmenities);
router.post('/bookings', authorize('Resident', 'Admin'), bookAmenity);
router.get('/bookings', getBookings);

module.exports = router;
