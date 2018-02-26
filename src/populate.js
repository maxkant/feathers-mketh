var Web3 = require('web3');
const nBlocksToSearch = 250000;
var app = require('./app');
var blockCounter = 0;
var txCounter = 0;
var txTotal = 0;

module.exports = async function(){
  var startTime = new Date();
  console.log(startTime);
  var ether_port = 'ws://localhost:8545';
  var web3 = await new Web3(new Web3.providers.WebsocketProvider(ether_port));
  console.log(web3);
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
    var nTransactions = 0;
    try{
      nTransactions = await web3.eth.getBlockTransactionCount(i);
    } catch(error){
      console.log('It happened');
    }

    //const blockTransactions = block.transactions;
    blockCounter += 1;
    for (let j = 0; j < nTransactions; j++){
      //const tx = blockTransactions[j];
      //get transactions details from hash
      var rawTX;
      try{
        rawTX = await web3.eth.getTransactionFromBlock(i, j);
      } catch(error){
        console.log(error);
      }
      //const rawTX = await web3.eth.getTransaction(tx);
      if (rawTX != undefined){
        //console.log(rawTX);
        app.service('transactions').create(rawTX);
        txTotal += 1;
        txCounter += 1;
      } else{
        console.log('rawTX undefined, paramters: ');
        console.log('block number: ' + i);
        console.log('transaction idx: ' + j);
        // const block = await web3.eth.getBlock(i);
        // console.log('block: ' + block);
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
  console.log('Up to date. ' + txTotal + ' transactions from ' + blockCounter + ' blocks added to database.');
  console.log('Began at ' + startTime + ', ended at ' + endTime);
};
