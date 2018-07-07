// file to include all the Ethereum-specific logic
// makes it more maintainable as the web3 api keeps changing
// goal is not to see web3 used outside of this file

var ΞTRSCON;
var Ξweb3;

function ΞmyGasPriceWei() {
  return '' + 1e9; // 1 Gigawei
}

function Ξkeccak( something ) {
  return Ξweb3.utils.sha3( something );
}

function ΞweiToEth( wei ) {
  return Ξweb3.utils.fromWei( wei, 'ether' );
}

// 1. NOTE ganache wants port 8545 but geth uses 8545 and 8546 differently
// 2. Web3 available because index.html sources web3.js or web3.min.js
// 3. WebSocket connector supports event retrieval, Http does not

function Ξconnect() {

  if (typeof Ξweb3 !== 'undefined')
    Ξweb3 = new Web3(Ξweb3.currentProvider);
  else
    Ξweb3 =
      new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"));
}

function ΞgetTreasury( sca ) {
  ΞTRSCON = new Ξweb3.eth.Contract( JSON.parse(ΞABI), sca );
  return ΞTRSCON;
}

function ΞisSCA( sca )
{
  const deny = /[^0x123456789abcdefABCDEF]/;

  return    null != sca
         && sca.startsWith("0x")
         && !deny.test(sca)
         && sca.length == 42;
}

function ΞpadLeft( addr ) {
  var n = addr.toString(16).replace(/^0x/, '');
  while (n.length < 64)
    n = "0" + n;

  return "0x" + n;
}

function ΞisAddr( addr )
{
  const deny = /[^0x123456789abcdefABCDEF]/;
  return addr.startsWith("0x")
         && !deny.test(addr)
         && addr.length == 42;
}

async function Ξbalance( acct ) {
  return await Ξweb3.eth.getBalance( acct );
}

async function ΞlocalAccounts() {
  var result = await Ξweb3.eth.getAccounts();
  return result;
}

// rest is ugly data, dont bother to read it it just defines the Ethereum ABI
// for the Treasury
const ΞABI =
"[{\"constant\":false,\"inputs\":[{\"name\":\"trustee\",\"type\":\"address\"}],\"name\":\"add\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_payee\",\"type\":\"address\"},{\"name\":\"_wei\",\"type\":\"uint256\"},{\"name\":\"_eref\",\"type\":\"string\"}],\"name\":\"proposal\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"trustee\",\"type\":\"address\"},{\"name\":\"isRaised\",\"type\":\"bool\"}],\"name\":\"flag\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_toksca\",\"type\":\"address\"},{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_amount\",\"type\":\"uint256\"},{\"name\":\"_eref\",\"type\":\"string\"}],\"name\":\"approveTransfer\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_payee\",\"type\":\"address\"},{\"name\":\"_wei\",\"type\":\"uint256\"},{\"name\":\"_eref\",\"type\":\"string\"}],\"name\":\"approve\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"older\",\"type\":\"address\"},{\"name\":\"newer\",\"type\":\"address\"}],\"name\":\"replace\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"newTreasurer\",\"type\":\"address\"}],\"name\":\"setTreasurer\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_toksca\",\"type\":\"address\"},{\"name\":\"_to\",\"type\":\"address\"},{\"name\":\"_amount\",\"type\":\"uint256\"},{\"name\":\"_eref\",\"type\":\"string\"}],\"name\":\"proposeTransfer\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"treasurer\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"payable\":true,\"stateMutability\":\"payable\",\"type\":\"fallback\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"trustee\",\"type\":\"address\"}],\"name\":\"Added\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"trustee\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"isRaised\",\"type\":\"bool\"}],\"name\":\"Flagged\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"older\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"newer\",\"type\":\"address\"}],\"name\":\"Replaced\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"payee\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"amt\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"eref\",\"type\":\"string\"}],\"name\":\"Proposal\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"approver\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"eref\",\"type\":\"string\"}],\"name\":\"Approved\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"payee\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"amt\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"eref\",\"type\":\"string\"}],\"name\":\"Spent\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"toksca\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"amt\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"eref\",\"type\":\"string\"}],\"name\":\"TransferProposal\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"approver\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"toksca\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"eref\",\"type\":\"string\"}],\"name\":\"TransferApproved\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"toksca\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"eref\",\"type\":\"string\"}],\"name\":\"Transferred\",\"type\":\"event\"}]";
