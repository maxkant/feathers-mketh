var Web3 = require('web3');

module.exports = function(){
  var ether_port = 'ws://localhost:8545';
  var web3 = new Web3(new Web3.providers.WebsocketProvider(ether_port));
  return web3;
}
