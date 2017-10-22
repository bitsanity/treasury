// ===========================================================================
// $ node this.js <SCA> <old Trustee EOA> <New Trustee EOA>
// ===========================================================================

var Mod = require('./TREASURY');
var con = Mod.getContract( process.argv[2] );

var cb;
Mod.getWeb3().eth.getAccounts().then( (res) => {
  cb = res[0];
  console.log( "cb: ", cb );

  // gas: 75422
  con.methods.replace( process.argv[3], process.argv[4] )
     .send({from: cb, gas: 100000}, (err, res) => {
       if (err) console.log( 'err: ', err );
       if (res) console.log( 'res: ', res );
     } );
} );

