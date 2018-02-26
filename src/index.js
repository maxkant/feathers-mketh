/* eslint-disable no-console */
const logger = require('winston');
const app = require('./app');
const port = app.get('port');
const server = app.listen(port);
const populate = require('./populate.js');

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () => {
    logger.info('Feathers application started on http://%s:%d', app.get('host'), port);
    populate();
    //setInterval(() => {populate()}, 1000);
  }
);
