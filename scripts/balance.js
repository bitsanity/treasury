//
// $ node this.js <SCA>
//

const Mod = require('./TREASURY');
const contract = Mod.getContract( process.argv[2] );

Mod.getWeb3().eth.getBalance( process.argv[2] ).then( (bal) => {
  console.log( "bal: " + bal );
} );
