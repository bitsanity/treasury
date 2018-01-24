const fs = require('fs');

const MYGASPRICE = 4000000000; // 4 Gwei, lower cost but higher delays

if (typeof web3 !== 'undefined')
  web3 = new Web3(web3.currentProvider);
else
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

function getABI() {
  return JSON.parse(fs.readFileSync('Treasury_sol_Treasury.abi').toString());
}

function getTreasury(sca) {
  return web3.eth.contract( getABI() ).at( sca );
}

var TRSCON;
