// ===========================================================================
// $ node sendEther.js <to SCA> <amount wei>
// ===========================================================================

var Mod = require('./TREASURY');

var cb;
Mod.getWeb3().eth.getAccounts().then( (res) => {
  cb = res[0];
  console.log( "cb: ", cb );

  // gas: 53000 (?)
  Mod.getWeb3().eth.sendTransaction( {from: cb,
                                      to: process.argv[2],
                                      value: process.argv[3],
                                      gas: 100000}, (err, res) => {
    if (err) console.log( 'err: ', err );
    if (res) console.log( 'res: ', res );
  } );

} );

