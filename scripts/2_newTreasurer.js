// ===========================================================================
// $ node this.js <SCA> <New Treasurer EOA>
// ===========================================================================

var Mod = require('./TREASURY');

var con = Mod.getContract( process.argv[2] );

var cb;
Mod.getWeb3().eth.getAccounts().then( (res) => {
  cb = res[0];
  console.log( "cb: ", cb );

  // gas: 28541
  con.methods.setTreasurer( process.argv[3] )
     .send({from: cb, gas: 100000}, (err, res) => {
       if (err) console.log( 'err: ', err );
       if (res) console.log( 'res: ', res );
     } );
} );

