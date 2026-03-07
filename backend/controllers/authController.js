const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Role = require('../models/Role');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../utils/asyncHandler');
const Society = require('../models/Society');
const {
  getDefaultSocietyId,
  createDefaultSocietyForAdmin,
  attachAllUsersToSociety
} = require('../services/defaultSocietyService');

const buildVerification = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresMinutes = Number(process.env.EMAIL_VERIFY_EXPIRES_MINUTES || 60);
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
  return { token, expiresAt };
};

const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.isVerified) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const roleRef = await Role.findOne({ name: role });
  const hashed = await bcrypt.hash(password, 12);
  const { token: verificationToken, expiresAt: verificationExpiresAt } = buildVerification();
  const defaultSocietyId = await getDefaultSocietyId();

  const user = existingUser
    ? await User.findOneAndUpdate(
        { _id: existingUser._id },
        {
          fullName,
          email,
          phone,
          password: hashed,
          role,
          roleRef: roleRef?._id,
          society: defaultSocietyId || existingUser.society,
          isVerified: false,
          verificationToken,
          verificationExpiresAt
        },
        { new: true }
      )
    : await User.create({
        fullName,
        email,
        phone,
        password: hashed,
        role,
        roleRef: roleRef?._id,
        society: defaultSocietyId || undefined,
        verificationToken,
        verificationExpiresAt,
        isVerified: false
      });

  if (!defaultSocietyId && role === 'Admin') {
    const created = await createDefaultSocietyForAdmin(user._id);
    await attachAllUsersToSociety(created._id);
    user.society = created._id;
    await user.save();
  } else if (!defaultSocietyId) {
    const fallbackSociety = await Society.findOne().sort({ createdAt: 1 });
    if (fallbackSociety) {
      user.society = fallbackSociety._id;
      await user.save();
    }
  }

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  // Skip email verification if disabled
  if (process.env.SKIP_EMAIL_VERIFICATION === 'true') {
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpiresAt = undefined;
    await user.save();
    return res.status(201).json({
      message: 'Registration successful. You can now log in.'
    });
  }

  let sent = false;
  try {
    sent = await sendEmail({
      to: user.email,
      subject: 'Verify your email - Society Management System',
      html: `<p>Please verify your email by clicking this link:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in ${process.env.EMAIL_VERIFY_EXPIRES_MINUTES || 60} minutes.</p>`
    });
  } catch (error) {
    sent = false;
  }

  if (!sent) {
    // If email fails, provide verification link directly
    return res.status(201).json({
      message: 'Registration successful. Email service unavailable - please use the link below to verify.',
      verifyUrl
    });
  }

  return res.status(201).json({
    message: 'Registration successful. Check your email to verify your account.'
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({
    verificationToken: token,
    verificationExpiresAt: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired verification link' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpiresAt = undefined;
  await user.save();

  return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Please verify your email before login' });
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      society: user.society,
      flat: user.flat
    }
  });
});

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

module.exports = { register, verifyEmail, login, getProfile };
