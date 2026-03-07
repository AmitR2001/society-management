const { body, param, query } = require('express-validator');

const authValidators = {
  register: [
    body('fullName').notEmpty(),
    body('email').isEmail(),
    body('phone').isLength({ min: 10 }),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['Admin', 'Resident', 'Security'])
  ],
  login: [body('email').isEmail(), body('password').notEmpty()],
  verifyEmail: [query('token').isString().notEmpty()]
};

const billValidators = {
  generate: [body('month').matches(/^\d{4}-\d{2}$/), body('dueDate').isISO8601()],
  paymentOrder: [param('billId').isMongoId()],
  report: [query('month').matches(/^\d{4}-\d{2}$/)]
};

module.exports = { authValidators, billValidators };
