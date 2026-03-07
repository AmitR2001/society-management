const express = require('express');
const { addExpense, getMonthlyReport } = require('../controllers/accountController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { billValidators } = require('../middleware/validators');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);
router.post('/expenses', authorize('Admin'), addExpense);
router.get('/monthly-report', authorize('Admin'), billValidators.report, validate, getMonthlyReport);

module.exports = router;
