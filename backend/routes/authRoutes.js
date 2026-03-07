const express = require('express');
const { register, verifyEmail, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { authValidators } = require('../middleware/validators');

const router = express.Router();

router.post('/register', authValidators.register, validate, register);
router.get('/verify-email', authValidators.verifyEmail, validate, verifyEmail);
router.post('/login', authValidators.login, validate, login);
router.get('/profile', protect, getProfile);

module.exports = router;
