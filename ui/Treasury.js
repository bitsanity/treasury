async function τgetTreasurer() {
  return await ΞTRSCON.methods.treasurer().call();
}

function τadd( trustee ) {
  ΞTRSCON.methods.add( trustee )
         .send( {from: getCoinbase(), gas:100000, gasPrice: ΞmyGasPriceWei()} );
}

function τflag( trustee, isRaised ) {
  ΞTRSCON.methods.flag( trustee, isRaised )
         .send( {from: getCoinbase(), gas:100000, gasPrice: ΞmyGasPriceWei()} );
}

function τreplace( older, newer ) {
  ΞTRSCON.methods.replace( older, newer )
         .send( {from: getCoinbase(), gas:100000, gasPrice: ΞmyGasPriceWei()} );
}

function τproposal( payee, wei, eref ) {
  ΞTRSCON.methods.proposal( payee, wei, eref )
         .send( {from: getCoinbase(), gas:500000, gasPrice: ΞmyGasPriceWei()} );
}

function τproposeTransfer( symsca, recip, qty, eref ) {
  ΞTRSCON.methods.proposeTransfer( symsca, recip, qty, eref )
         .send( {from: getCoinbase(), gas:500000, gasPrice: ΞmyGasPriceWei()} );
}

function τapprove( payee, wei, eref ) {
  ΞTRSCON.methods.approve( payee, wei, eref )
         .send( {from: getCoinbase(), gas:250000, gasPrice: ΞmyGasPriceWei()} )
         .catch( e => { console.log; } );
}

function τapproveTransfer( toksca, to, amount, eref ) {
  ΞTRSCON.methods.approveTransfer( toksca, to, amount, eref )
         .send( {from: getCoinbase(), gas:250000, gasPrice: ΞmyGasPriceWei()} );
}

async function τallEvents() {
  return await ΞTRSCON.getPastEvents({fromBlock:0,toBlock:'latest'});
}
