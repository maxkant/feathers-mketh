//var Web3 = require('web3');
const getWeb3 = require('./getWeb3.js');
const nBlocksToSearch = 10000;
var app = require('./app');

module.exports = async function(){
  var blockCounter = 0;
  var txCounter = 0;
  var txTotal = 0;
  var startTime = new Date();
  //console.log(startTime);
  var ether_port = 'ws://localhost:8545';
  //var web3 = await new Web3(new Web3.providers.WebsocketProvider(ether_port));
  var web3 = getWeb3();
  //console.log(web3);
  const blockchainInfo = await app.service('blockchain-info').find();
  const currentBlock = await web3.eth.getBlockNumber();
  var startBlock;
  if (blockchainInfo.total === 0){
    // No stored data, initialize...
    startBlock = currentBlock - nBlocksToSearch;
    if (startBlock < 0) {startBlock = 0;}
    const info = {
      startBlock: startBlock,
      _id: 1,
    };
    await app.service('blockchain-info').create(info);
    console.log('No data, begining from block ' + startBlock);
  } else {
    startBlock = blockchainInfo.data[0].startBlock;
    console.log('Resuming at block ' + startBlock);
  }

  // should probably grab promises then do them after instead of waiting....
  for (let i = startBlock; i < currentBlock; i++){
    //const block = await web3.eth.getBlock(i);
    const nTransactions = await web3.eth.getBlockTransactionCount(i);

    //const blockTransactions = block.transactions;
    blockCounter += 1;
    for (let j = 0; j < nTransactions; j++){
      //const tx = blockTransactions[j];
      //get transactions details from hash
      const rawTX = await web3.eth.getTransactionFromBlock(i, j);
      //const rawTX = await web3.eth.getTransaction(tx);
      if (rawTX != undefined){
        //console.log(rawTX);
        app.service('transactions').create(rawTX);
        txTotal += 1;
        txCounter += 1;
      }
    }
    app.service('blockchain-info').update(1, {startBlock: (i + 1)});
    //console.log(blockCounter);
    if (blockCounter % 10 === 0){
      console.log(txCounter + ' transactions added from 10 blocks. ' + blockCounter + ' blocks total.');
      txCounter = 0;
    }
  }
  var endTime = new Date();
  const time = (endTime - startTime) / 1000;
  const minutes = Math.floor(time / 60);
  const seconds = ((time / 60) - minutes);
  console.log('Up to date. ' + txTotal + ' transactions from ' + blockCounter + ' blocks added to database in ' + minutes + 'm ' + seconds + 's');
  //setInterval(this, 5000);
};
