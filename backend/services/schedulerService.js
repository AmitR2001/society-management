const cron = require('node-cron');
const { applyPenaltyToOverdueBills } = require('../services/billingService');
const logger = require('../config/logger');

const startSchedulers = () => {
  // Runs daily at 1 AM server time.
  cron.schedule('0 1 * * *', async () => {
    try {
      await applyPenaltyToOverdueBills();
      logger.info('Overdue bill penalties applied');
    } catch (error) {
      logger.error(`Penalty cron failed: ${error.message}`);
    }
  });
};

module.exports = startSchedulers;
