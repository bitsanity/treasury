
const tokcon = new web3.eth.Contract(Mod.tokenABI());
const tokbin = Mod.tokenBinary();

const trscon = new web3.eth.Contract(Mod.treasuryABI());
const trsbin = Mod.treasuryBinary();

var cb;
web3.eth.getAccounts().then( (res) => {
  cb = res[0];

  tokcon.deploy( {data: tokbin, arguments: []} )
        .send( {from: cb, gas: 2000000}, (err,res) =>
        {
          if (err) console.log(err);
          if (res) console.log(res);
        } )
        .then( (receipt) => {
          console.log( 'ERC20Stub SCA: ', receipt.options.address );
        } );

  trscon.deploy( {data: trsbin, arguments: []} )
        .send( {from: cb, gas: 2000000}, (err,res) =>
        {
          if (err) console.log(err);
          if (res) console.log(res);
        } )
        .then( (receipt) => {
          console.log( 'TreasuryStub SCA: ', receipt.options.address );
        } );
} );
