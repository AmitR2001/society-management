const Society = require('../models/Society');
const User = require('../models/User');
const logger = require('../config/logger');

const DEFAULT_SOCIETY = {
  name: process.env.DEFAULT_SOCIETY_NAME || 'Default Society',
  address: process.env.DEFAULT_SOCIETY_ADDRESS || 'Not Provided',
  city: process.env.DEFAULT_SOCIETY_CITY || 'Not Provided',
  state: process.env.DEFAULT_SOCIETY_STATE || 'Not Provided',
  pincode: process.env.DEFAULT_SOCIETY_PINCODE || '000000',
  maintenanceBaseAmount: Number(process.env.DEFAULT_SOCIETY_MAINTENANCE || 0)
};

const buildDefaultSocietyData = (adminId) => ({
  ...DEFAULT_SOCIETY,
  admin: adminId
});

const createDefaultSocietyForAdmin = async (adminId) => {
  const society = await Society.create(buildDefaultSocietyData(adminId));
  return society;
};

const ensureDefaultSociety = async () => {
  // Always return the first society (by creation date)
  const existing = await Society.findOne().sort({ createdAt: 1 });
  if (existing) {
    return existing;
  }

  const adminUser =
    (await User.findOne({ role: 'Admin' }).sort({ createdAt: 1 })) ||
    (await User.findOne().sort({ createdAt: 1 }));

  if (!adminUser) {
    logger.warn('Default society not created: no users found to assign as admin.');
    return null;
  }

  return createDefaultSocietyForAdmin(adminUser._id);
};

const attachAllUsersToSociety = async (societyId) => {
  if (!societyId) {
    return { matchedCount: 0, modifiedCount: 0 };
  }

  const result = await User.updateMany({}, { $set: { society: societyId } });
  return result;
};

const ensureDefaultSocietyAndAttachUsers = async () => {
  const society = await ensureDefaultSociety();
  if (!society) {
    return null;
  }
  await attachAllUsersToSociety(society._id);
  return society;
};

const getDefaultSocietyId = async () => {
  const society = await ensureDefaultSociety();
  return society ? society._id : null;
};

module.exports = {
  ensureDefaultSociety,
  ensureDefaultSocietyAndAttachUsers,
  createDefaultSocietyForAdmin,
  attachAllUsersToSociety,
  getDefaultSocietyId
};
