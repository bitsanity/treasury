// ===========================================================================
// $ node deploy.js
// ===========================================================================

var Mod = require('./TREASURY');

const web3 = Mod.getWeb3();

var abi = Mod.getABI();
var con = new web3.eth.Contract(abi);

var code = Mod.getBinary();
if (!code.startsWith("0x"))
  code = "0x" + code;

var gasEst;

var cb;
web3.eth.getAccounts().then( (res) => {
  cb = res[0];

  console.log( "cb: ", cb );

  web3.eth.estimateGas({data:code})
  .then( (est) => {

    gasEst = Math.round( 1.05 * est );
    console.log( "gasEst: ", gasEst );

    // gas: 1290096
    con
      .deploy({data:code, arguments: []} )
      .send({from: cb, gas: gasEst}, (err, txhash) => {
        if (txhash) console.log( "send txhash: ", txhash );
      } )
      .on('error', (err) => { console.log("err: ", err); })
      .on('transactionHash', (trhash) => {
        console.log( "trhash: ", trhash );
      } )
      .on('confirmation', (ref, rcpt) => {} )
      .then( (newinst) => {
        console.log( "SCA", newinst._address );
      } );
  } );

} );

