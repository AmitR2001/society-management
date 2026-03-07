const otpStore = new Map();

const createOtp = (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });
  return otp;
};

const verifyOtp = (email, otp) => {
  const record = otpStore.get(email);
  if (!record) return false;
  const valid = record.otp === otp && record.expiresAt > Date.now();
  if (valid) otpStore.delete(email);
  return valid;
};

module.exports = { createOtp, verifyOtp };
