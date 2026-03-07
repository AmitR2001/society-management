const Bill = require('../models/Bill');
const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');

const addExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({
    ...req.body,
    society: req.user.society,
    recordedBy: req.user._id
  });

  res.status(201).json(expense);
});

const getMonthlyReport = asyncHandler(async (req, res) => {
  const { month } = req.query;
  const [year, mon] = month.split('-').map(Number);
  const startDate = new Date(year, mon - 1, 1);
  const endDate = new Date(year, mon, 1);

  const incomeAgg = await Bill.aggregate([
    {
      $match: {
        society: req.user.society,
        month,
        status: 'Paid'
      }
    },
    { $group: { _id: '$month', totalIncome: { $sum: '$totalAmount' } } }
  ]);

  const expenseAgg = await Expense.aggregate([
    {
      $match: {
        society: req.user.society,
        expenseDate: { $gte: startDate, $lt: endDate }
      }
    },
    { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
  ]);

  const defaulters = await Bill.find({
    society: req.user.society,
    month,
    status: { $in: ['Pending', 'Overdue'] }
  }).populate('flat resident', 'number fullName email');

  res.status(200).json({
    month,
    totalIncome: incomeAgg[0]?.totalIncome || 0,
    totalExpense: expenseAgg[0]?.totalExpense || 0,
    defaulters
  });
});

module.exports = { addExpense, getMonthlyReport };
