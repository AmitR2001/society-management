const express = require('express');
const { getPublicSocietyInfo, createSociety, getMySociety, updateSociety } = require('../controllers/societyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route - no auth required
router.get('/public', getPublicSocietyInfo);

router.post('/', protect, authorize('Admin'), createSociety);
router.get('/me', protect, getMySociety);
router.patch('/me', protect, authorize('Admin'), updateSociety);

module.exports = router;
