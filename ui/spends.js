function doSpends()
{
  let spends = {}; // list of ("<toaddr> <amtwei> <extref>":"owing") properties

  let events = TRSCON.allEvents( {fromBlock:0,toBlock:'latest'} );
  events.get( (error, logs) => {

    for( var ii = 0; ii < logs.length; ii++)
    {
      if (logs[ii].event == 'Proposal' ) {
        spends[ '' + logs[ii].args.payee +
                ' ' + logs[ii].args.amt +
                ' ' + logs[ii].args.eref ] = logs[ii].args.amt;
      }
      else if (logs[ii].event == 'Spent') {
        spends[ '' + logs[ii].args.payee +
                ' ' + logs[ii].args.amt +
                ' ' + logs[ii].args.eref ] -= logs[ii].args.amt;
      }
    }

    let spendsstr = '';
    for (var s in spends)
    {
      let owing = spends[s];
      if (parseInt(owing) > 0)
        spendsstr += s + '\n';
    }
    document.getElementById( "spendslist" ).value = spendsstr;

    let trs = amTreasurer();
    document.getElementById( "proposecommand" ).disabled = !trs;
  } );
}

function newProposal()
{
  if (!amTreasurer())
  {
    document.getElementById( "proposecommand" ).disabled = true;
    return;
  }

  let cbase = ACCTS.options[ACCTS.selectedIndex].text;

  let recip = document.getElementById( "recipval" ).value;
  let amt = document.getElementById( "amtval" ).value;
  let eref = document.getElementById( "erefval" ).value;

  if (recip && recip.length == 42)
    document.getElementById("recipval").style.backgroundColor = "white";
  else
  {
    document.getElementById("recipval").style.backgroundColor = "yellow";
    return;
  }
  if (amt && parseInt(amt))
    document.getElementById( "amtval" ).style.backgroundColor = "white";
  else
  {
    document.getElementById( "amtval" ).style.backgroundColor = "yellow";
    return;
  }

  TRSCON.proposal( recip, amt, eref,
                   {from: cbase, gas:500000, gasPrice: MYGASPRICE} );

  document.getElementById( "recipval" ).value = '';
  document.getElementById( "amtval" ).value = '';
  document.getElementById( "erefval" ).value = '';

  doSpends();
}

function searchProposals()
{
  document.getElementById( "spendslist" ).value = 'Search Results:\n';

  let recip = document.getElementById( "recipval" ).value;
  let amt = document.getElementById( "amtval" ).value;
  let eref = document.getElementById( "erefval" ).value;

  var events = TRSCON.allEvents( {fromBlock:0,toBlock:'latest'} );
  events.get( (error, logs) => {

    for( var ii = 0; ii < logs.length; ii++ )
    {
      if (    logs[ii].event == 'Proposal'
           || logs[ii].event == 'Spent' ) {

        if (eref && eref.length > 0 && eref != logs[ii].args.eref)
          continue;

        if (recip && recip.length > 0 && recip != logs[ii].args.payee)
          continue;

        if (amt && amt.length > 0 && amt != logs[ii].args.amt)
          continue;

        document.getElementById( "spendslist" ).value =
          document.getElementById( "spendslist" ).value +
            logs[ii].args.payee + ' ' +
            logs[ii].args.amt   + ' '  +
            logs[ii].args.eref + '\n';
      }
    }

  } );
}

