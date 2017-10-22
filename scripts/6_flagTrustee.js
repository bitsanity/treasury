// ===========================================================================
// $ node this.js <SCA> <Trustee> <flag>
// ===========================================================================

var Mod = require('./TREASURY');
var con = Mod.getContract( process.argv[2] );

var isRaised = parseInt(process.argv[4]) != 0;

var cb;
Mod.getWeb3().eth.getAccounts().then( (res) => {
  cb = res[0];
  console.log( "cb: ", cb );

  // gas:
  con.methods.flag( process.argv[3], isRaised )
     .send({from: cb, gas: 100000}, (err, res) => {
       if (err) console.log( 'err: ', err );
       if (res) console.log( 'res: ', res );
     } );
} );

