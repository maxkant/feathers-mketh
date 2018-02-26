/* eslint-disable no-console */
const logger = require('winston');
const app = require('./app');
const port = app.get('port');
const server = app.listen(port);
const populate = require('./populate.js');
const getWeb3 = require('./getWeb3');

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () => {
    logger.info('Feathers application started on http://%s:%d', app.get('host'), port);
    var web3 = getWeb3();
    populate();
    console.log('Subscribing to new block headers');
    const subscription = web3.eth.subscribe('newBlockHeaders', (error, result) => {
      if (error != null) {console.log(error)}
    })
    subscription.on('data', (newHeader) => {
      console.log('New block: #', newHeader.number);
      populate();
    });
  }
);
