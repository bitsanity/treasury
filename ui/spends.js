async function doSpends()
{
  let spends = {}; // list of ("<toaddr> <amtwei> <extref>":"owing") properties

  let logs = await τallEvents();

  for( var ii = 0; ii < logs.length; ii++)
  {
    if (logs[ii].event == 'Proposal' ) {
      spends[ '' + logs[ii].returnValues.payee +
              ' ' + logs[ii].returnValues.amt +
              ' ' + logs[ii].returnValues.eref ] = logs[ii].returnValues.amt;
    }
    else if (logs[ii].event == 'Spent') {
      spends[ '' + logs[ii].returnValues.payee +
              ' ' + logs[ii].returnValues.amt +
              ' ' + logs[ii].returnValues.eref ] -= logs[ii].returnValues.amt;
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
  var amT = await amTreasurer();
  document.getElementById( "proposecommand" ).disabled = !amT;
}

async function newProposal()
{
  if (!await amTreasurer())
  {
    document.getElementById( "proposecommand" ).disabled = true;
    return;
  }

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
  if (eref && eref.length > 0)
    document.getElementById( "erefval" ).style.backgroundColor = "white";
  else
  {
    document.getElementById( "erefval" ).style.backgroundColor = "yellow";
    return;
  }

  τproposal( recip, amt, eref );

  document.getElementById( "recipval" ).value = '';
  document.getElementById( "amtval" ).value = '';
  document.getElementById( "erefval" ).value = '';

  doSpends();
}

async function searchProposals()
{
  document.getElementById( "spendslist" ).value = 'Search Results:\n';

  let recip = document.getElementById( "recipval" ).value;
  let amt = document.getElementById( "amtval" ).value;
  let eref = document.getElementById( "erefval" ).value;

  var logs = await τallEvents();

  for( var ii = 0; ii < logs.length; ii++ )
  {
    if (    logs[ii].event == 'Proposal'
         || logs[ii].event == 'Spent' ) {

      if (eref && eref.length > 0 && eref != logs[ii].returnValues.eref)
        continue;

      if (recip && recip.length > 0 && recip != logs[ii].returnValues.payee)
        continue;

      if (amt && amt.length > 0 && amt != logs[ii].returnValues.amt)
        continue;

      document.getElementById( "spendslist" ).value =
        document.getElementById( "spendslist" ).value +
          logs[ii].returnValues.payee + ' ' +
          logs[ii].returnValues.amt   + ' '  +
          logs[ii].returnValues.eref + '\n';
    }
  }
}

