const Bill = require('../models/Bill');
const Flat = require('../models/Flat');

const generateMonthlyBills = async (societyId, month, dueDate) => {
  // Only generate bills for flats that have residents assigned
  const flats = await Flat.find({ society: societyId, resident: { $ne: null } });
  const latePenaltyPercent = Number(process.env.LATE_PENALTY_PERCENT || 5);

  if (flats.length === 0) {
    return { bills: [], message: 'No flats with assigned residents found' };
  }

  const jobs = flats.map(async (flat) => {
    const amount = flat.maintenanceCharge || 0;
    const latePenalty = Number(((amount * latePenaltyPercent) / 100).toFixed(2));

    await Bill.updateOne(
      { flat: flat._id, month },
      {
        $setOnInsert: {
          society: societyId,
          flat: flat._id,
          resident: flat.resident,
          month,
          amount,
          dueDate,
          latePenalty,
          totalAmount: amount,
          status: 'Pending'
        }
      },
      { upsert: true }
    );
  });

  await Promise.all(jobs);

  return Bill.find({ society: societyId, month }).populate('flat resident', 'number fullName email');
};

const applyPenaltyToOverdueBills = async () => {
  const today = new Date();
  const overdueBills = await Bill.find({ status: 'Pending', dueDate: { $lt: today } });

  const updates = overdueBills.map((bill) => {
    const totalAmount = Number((bill.amount + bill.latePenalty).toFixed(2));
    return Bill.updateOne(
      { _id: bill._id },
      { $set: { status: 'Overdue', totalAmount } }
    );
  });

  await Promise.all(updates);
};

module.exports = { generateMonthlyBills, applyPenaltyToOverdueBills };
