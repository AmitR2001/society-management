const express = require('express');
const { 
  generateBills, 
  getBills, 
  getBillDetails,
  createPaymentOrder, 
  verifyPayment,
  getReceipt,
  getPayments,
  markPaidCash,
  cancelBill
} = require('../controllers/billController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { billValidators } = require('../middleware/validators');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);
router.post('/generate', authorize('Admin'), billValidators.generate, validate, generateBills);
router.get('/', getBills);
router.get('/payments', getPayments);
router.get('/:billId', getBillDetails);
router.post('/:billId/payment-order', authorize('Resident', 'Admin'), billValidators.paymentOrder, validate, createPaymentOrder);
router.post('/verify-payment', authorize('Resident', 'Admin'), verifyPayment);
router.patch('/:billId/mark-paid-cash', authorize('Admin'), markPaidCash);
router.patch('/:billId/cancel', authorize('Admin'), cancelBill);
router.get('/receipt/:paymentId', getReceipt);

module.exports = router;
