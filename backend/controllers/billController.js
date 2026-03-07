const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');
const razorpay = require('../services/razorpayService');
const { generateMonthlyBills } = require('../services/billingService');
const { verifyRazorpaySignature, verifyWebhookSignature } = require('../utils/paymentUtils');

const generateBills = asyncHandler(async (req, res) => {
  const { month, dueDate } = req.body;
  const bills = await generateMonthlyBills(req.user.society, month, new Date(dueDate));
  res.status(201).json(bills);
});

const getBills = asyncHandler(async (req, res) => {
  const filter = { society: req.user.society };
  if (req.user.role === 'Resident') {
    filter.resident = req.user._id;
  }

  const bills = await Bill.find(filter).populate('flat resident', 'number fullName email').sort({ createdAt: -1 });
  res.status(200).json(bills);
});

const getBillDetails = asyncHandler(async (req, res) => {
  const bill = await Bill.findOne({ _id: req.params.billId, society: req.user.society })
    .populate('flat resident', 'number fullName email block');
  
  if (!bill) {
    return res.status(404).json({ message: 'Bill not found' });
  }

  const payment = await Payment.findOne({ bill: bill._id, status: 'Captured' });
  
  res.status(200).json({ bill, payment });
});

const createPaymentOrder = asyncHandler(async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ message: 'Payment service not configured' });
  }

  const bill = await Bill.findOne({ _id: req.params.billId, society: req.user.society });
  if (!bill) {
    return res.status(404).json({ message: 'Bill not found' });
  }

  const order = await razorpay.orders.create({
    amount: Math.round(bill.totalAmount * 100),
    currency: 'INR',
    receipt: `bill_${bill._id}`
  });

  const payment = await Payment.create({
    society: req.user.society,
    bill: bill._id,
    amount: bill.totalAmount,
    orderId: order.id,
    status: 'Created'
  });

  res.status(201).json({ order, paymentId: payment._id, key: process.env.RAZORPAY_KEY_ID });
});

const verifyPayment = asyncHandler(async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ message: 'Payment service not configured' });
  }

  const { orderId, paymentId, signature } = req.body;
  const valid = verifyRazorpaySignature({ orderId, paymentId, signature });

  if (!valid) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  const payment = await Payment.findOneAndUpdate(
    { orderId },
    {
      paymentId,
      signature,
      status: 'Captured',
      receiptNo: `RCPT-${Date.now()}`
    },
    { new: true }
  );

  if (!payment) {
    return res.status(404).json({ message: 'Payment record not found' });
  }

  await Bill.updateOne(
    { _id: payment.bill },
    { status: 'Paid', paidAt: new Date() }
  );

  res.status(200).json({ message: 'Payment verified', receiptNo: payment.receiptNo });
});

const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body;
  const payload = JSON.parse(rawBody.toString());

  if (!verifyWebhookSignature(rawBody, signature)) {
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  if (payload.event === 'payment.captured') {
    const orderId = payload.payload.payment.entity.order_id;
    const paymentId = payload.payload.payment.entity.id;

    const payment = await Payment.findOneAndUpdate(
      { orderId },
      { paymentId, status: 'Captured', receiptNo: `RCPT-${Date.now()}` },
      { new: true }
    );

    if (payment) {
      await Bill.updateOne(
        { _id: payment.bill },
        { status: 'Paid', paidAt: new Date() }
      );
    }
  }

  res.status(200).json({ message: 'Webhook received' });
});

const getReceipt = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ 
    _id: req.params.paymentId, 
    society: req.user.society,
    status: 'Captured' 
  }).populate({
    path: 'bill',
    populate: { path: 'flat resident', select: 'number block fullName email' }
  });

  if (!payment) {
    return res.status(404).json({ message: 'Receipt not found' });
  }

  const receipt = {
    receiptNo: payment.receiptNo,
    paymentId: payment.paymentId,
    orderId: payment.orderId,
    amount: payment.amount,
    paidAt: payment.updatedAt,
    bill: {
      month: payment.bill.month,
      amount: payment.bill.amount,
      latePenalty: payment.bill.latePenalty,
      totalAmount: payment.bill.totalAmount,
      flat: payment.bill.flat,
      resident: payment.bill.resident
    }
  };

  res.status(200).json(receipt);
});

const getPayments = asyncHandler(async (req, res) => {
  const filter = { society: req.user.society, status: 'Captured' };
  
  const payments = await Payment.find(filter)
    .populate({
      path: 'bill',
      populate: { path: 'flat resident', select: 'number block fullName' }
    })
    .sort({ createdAt: -1 });

  res.status(200).json(payments);
});

const markPaidCash = asyncHandler(async (req, res) => {
  const bill = await Bill.findOne({ _id: req.params.billId, society: req.user.society });
  
  if (!bill) {
    return res.status(404).json({ message: 'Bill not found' });
  }

  if (bill.status === 'Paid' || bill.status === 'PaidCash') {
    return res.status(400).json({ message: 'Bill is already paid' });
  }

  if (bill.status === 'Cancelled') {
    return res.status(400).json({ message: 'Cannot mark cancelled bill as paid' });
  }

  bill.status = 'PaidCash';
  bill.paidAt = new Date();
  bill.paidBy = 'Cash';
  await bill.save();

  res.status(200).json({ message: 'Bill marked as paid (cash)', bill });
});

const cancelBill = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const bill = await Bill.findOne({ _id: req.params.billId, society: req.user.society });
  
  if (!bill) {
    return res.status(404).json({ message: 'Bill not found' });
  }

  if (bill.status === 'Paid' || bill.status === 'PaidCash') {
    return res.status(400).json({ message: 'Cannot cancel a paid bill' });
  }

  if (bill.status === 'Cancelled') {
    return res.status(400).json({ message: 'Bill is already cancelled' });
  }

  bill.status = 'Cancelled';
  bill.cancelledAt = new Date();
  bill.cancelReason = reason || 'Cancelled by admin';
  await bill.save();

  res.status(200).json({ message: 'Bill cancelled', bill });
});

module.exports = { 
  generateBills, 
  getBills, 
  getBillDetails,
  createPaymentOrder, 
  verifyPayment, 
  razorpayWebhook,
  getReceipt,
  getPayments,
  markPaidCash,
  cancelBill
};
