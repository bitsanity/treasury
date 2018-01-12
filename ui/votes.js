var PAYEES = [];
var AMTS = [];
var EREFS = [];

function doVotes()
{
  PAYEES = [];
  AMTS = [];
  EREFS = [];

  let spends = {}; // list of ("<toaddr>Ξ<amtwei>Ξ<extref>":"owing") properties

  let events = TRSCON.allEvents( {fromBlock:0,toBlock:'latest'} );
  events.get( (error, logs) => {

    for( var ii = 0; ii < logs.length; ii++)
    {
      if (logs[ii].event == 'Proposal' ) {
        spends[ '' + logs[ii].args.payee +
                'Ξ' + logs[ii].args.amt +
                'Ξ' + logs[ii].args.eref ] = logs[ii].args.amt;
      }
      else if (logs[ii].event == 'Spent') {
        spends[ '' + logs[ii].args.payee +
                'Ξ' + logs[ii].args.amt +
                'Ξ' + logs[ii].args.eref ] -= logs[ii].args.amt;
      }
    }

    var outlist = document.getElementById( "outselect" );

    let index = 0;
    for (var s in spends)
    {
      let v = spends[s].toNumber();

      if (v > 0)
      {
        let op = document.createElement("option");
        op.text = ' ' + index + ' ';
        outlist.add(op);

        let vals = s.split('Ξ');
        PAYEES[index] = vals[0];
        AMTS[index] = vals[1];
        EREFS[index] = vals[2];

        index++;
      }
    }
    proposalSelected();
  } );
}

function proposalSelected()
{
  let ix = document.getElementById( "outselect" ).selectedIndex;
  if (-1 == ix) return;

  document.getElementById( "t3recipfield" ).innerHTML = PAYEES[ix];
  document.getElementById( "t3amtfield" ).innerHTML = AMTS[ix];
  document.getElementById( "t3ereffield" ).innerHTML = EREFS[ix];
}

function approveSpend()
{
  let ix = document.getElementById( "outselect" ).selectedIndex;
  if (-1 == ix) return;

  let cbase = ACCTS.options[ACCTS.selectedIndex].text;

  console.log( PAYEES[ix], ' ', AMTS[ix], ' ', EREFS[ix] );

  TRSCON.approve( PAYEES[ix], AMTS[ix], EREFS[ix],
                  {from: cbase, gas:200000} );

}

