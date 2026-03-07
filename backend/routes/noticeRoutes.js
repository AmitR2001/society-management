const express = require('express');
const { createNotice, getNotices } = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', authorize('Admin'), createNotice);
router.get('/', getNotices);

module.exports = router;
