const transactions = require('./transactions/transactions.service.js');
const blockchainInfo = require('./blockchain-info/blockchain-info.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(transactions);
  app.configure(blockchainInfo);
};
