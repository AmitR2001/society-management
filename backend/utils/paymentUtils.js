const crypto = require('crypto');

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generated === signature;
};

const verifyWebhookSignature = (body, signature) => {
  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return generated === signature;
};

module.exports = { verifyRazorpaySignature, verifyWebhookSignature };
