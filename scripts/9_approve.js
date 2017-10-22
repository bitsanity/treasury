// ===========================================================================
// $ node this.js <SCA> <recip address> <amount to spend in wei> <ext ref>
// ===========================================================================

var Mod = require('./TREASURY');
var con = Mod.getContract( process.argv[2] );

var cb;
Mod.getWeb3().eth.getAccounts().then( (res) => {
  cb = res[0];
  console.log( "cb: ", cb );

  // gas:
  con.methods.approve( process.argv[3], process.argv[4], process.argv[5] )
     .send({from: cb, gas: 500000}, (err, res) => {
       if (err) console.log( 'err: ', err );
       if (res) console.log( 'res: ', res );
     } );
} );

