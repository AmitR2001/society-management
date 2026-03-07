const express = require('express');
const { addVehicle, createParkingSlot, assignParking } = require('../controllers/assetController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/vehicles', authorize('Admin'), addVehicle);
router.post('/parking-slots', authorize('Admin'), createParkingSlot);
router.post('/parking-assign', authorize('Admin'), assignParking);

module.exports = router;
