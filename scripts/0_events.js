//
// $ node 0_events.js <SCA>
//

const Mod = require('./TREASURY');
const contract = Mod.getContract( process.argv[2] );

function shorten(addr) {
  var saddr = "" + addr;
  return "0x" + saddr.substring(26);
}

contract.getPastEvents('allEvents',
                       {fromBlock: 0,
                        toBlock: 'latest'})
.then( (events) =>
{
  for (var ii = 0; ii < events.length; ii++) {

    if (events[ii].event == 'Added' )
    {
      console.log( 'Added:\n\tTrustee: ' +
                   shorten(events[ii].raw.topics[1] ) );
    }
    else if (events[ii].event == 'Flagged' )
    {
      console.log( "Flagged:\n\tTrustee: " + shorten(events[ii].raw.topics[1]) +
                   "\n\tisRaised: " + parseInt(events[ii].raw.data,16) );
    }
    else if (events[ii].event == 'Replaced' )
    {
      console.log( "Replaced:\n\told: " +
                   shorten(events[ii].raw.topics[1]) +
                   "\n\tnew: " + shorten(events[ii].raw.topics[2]) );
    }
    else if (events[ii].event == 'Proposal' )
    {
      var decoded = Mod.getWeb3().eth.abi.decodeParameters(
          ["uint256","string"],
          events[ii].raw.data );

      console.log( "Proposal:\n\trecipient: " +
                   shorten(events[ii].raw.topics[1]) +
                   "\n\tamount(wei): " + decoded['0'] +
                   "\n\text ref: " + decoded['1'] );
    }
    else if (events[ii].event == 'Approved' )
    {
      var decoded = Mod.getWeb3().eth.abi.decodeParameters(
          ["uint256","string"],
          events[ii].raw.data );

      console.log( "Approved:\n\tapprover: " +
                   shorten(events[ii].raw.topics[1]) +
                   "\n\treceipient: " +
                   shorten(events[ii].raw.topics[2]) +
                   "\n\tamount(wei): " + decoded['0'] +
                   "\n\teref: " + decoded['1'] );
    }
    else if (events[ii].event == 'Spent' )
    {
      var decoded = Mod.getWeb3().eth.abi.decodeParameters(
          ["uint256","string"],
          events[ii].raw.data );

      console.log( "Spent:\n\treceiver: " +
                   shorten(events[ii].raw.topics[1]) +
                   "\n\tamount(wei): " + decoded['0'] +
                   "\n\teref: " + decoded['1'] );

    }

    console.log( "" );
  }
});

