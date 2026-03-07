const express = require('express');
<<<<<<< HEAD
const { getPublicSocietyInfo, createSociety, getMySociety, updateSociety } = require('../controllers/societyController');
=======
const { createSociety, getMySociety, updateSociety } = require('../controllers/societyController');
>>>>>>> efa04fab56a99b2fd817ec62ef51439cb528ec9a
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

<<<<<<< HEAD
// Public route - no auth required
router.get('/public', getPublicSocietyInfo);

=======
>>>>>>> efa04fab56a99b2fd817ec62ef51439cb528ec9a
router.post('/', protect, authorize('Admin'), createSociety);
router.get('/me', protect, getMySociety);
router.patch('/me', protect, authorize('Admin'), updateSociety);

module.exports = router;
