// ===========================================================================
// $ node
//   9_approve.js
//   <coinbase>
//   <SCA>
//   <recip address>
//   <amount to spend in wei>
//   <ext ref>
// ===========================================================================

var Mod = require('./TREASURY');
var con = Mod.getContract( process.argv[3] );

console.log( "cb: ", process.argv[2] );

// gas:
con.methods.approve( process.argv[4], process.argv[5], process.argv[6] )
   .send({from: process.argv[2], gas: 500000}, (err, res) => {
     if (err) console.log( 'err: ', err );
     if (res) console.log( 'res: ', res );
} );

