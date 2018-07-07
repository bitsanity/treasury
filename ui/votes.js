var PAYEES = [];
var AMTS = [];
var EREFS = [];

async function doVotes()
{
  this.PAYEES = [];
  this.AMTS = [];
  this.EREFS = [];

  var spends = {}; // list of ("<toaddr>Ξ<amtwei>Ξ<extref>":"owing") properties

  var logs = await τallEvents();

  for( var ii = 0; ii < logs.length; ii++)
  {
    if (logs[ii].event == 'Proposal' || logs[ii].event == 'Spent' )
    {
      let key = '' + logs[ii].returnValues.payee +
                'Ξ' + logs[ii].returnValues.amt +
                'Ξ' + logs[ii].returnValues.eref;

      if (logs[ii].event == 'Proposal' ) {
        if (null == spends[key])
          spends[key] = logs[ii].returnValues.amt;
        else
          spends[key] += logs[ii].returnValues.amt;
      }
      else if (logs[ii].event == 'Spent') {
        spends[key] -= logs[ii].returnValues.amt;
      }
    }
  }

  var outlist = document.getElementById( "outselect" );

  while (outlist.hasChildNodes())
    outlist.removeChild( outlist.firstChild );

  let index = 0;
  for (var s in spends)
  {
    let v = parseInt(spends[s]);

    if (v > 0)
    {
      let op = document.createElement("option");
      op.text = ' ' + index + ' ';
      outlist.add(op);

      let vals = s.split('Ξ');
      this.PAYEES[index] = vals[0];
      this.AMTS[index] = vals[1];
      this.EREFS[index] = vals[2];

      op.value = 0;
      index++;
    }
  }

  proposalSelected();
}

function proposalSelected()
{
  let ix = document.getElementById( "outselect" ).selectedIndex;

  if (-1 == ix)
  {
    let note = "select proposal above...";
    document.getElementById( "t3recipfield" ).innerHTML = note;
    document.getElementById( "t3amtfield" ).innerHTML = note;
    document.getElementById( "t3ereffield" ).innerHTML = note;
  }
  else
  {
    document.getElementById( "t3recipfield" ).innerHTML = PAYEES[ix];
    document.getElementById( "t3amtfield" ).innerHTML = AMTS[ix];
    document.getElementById( "t3ereffield" ).innerHTML = EREFS[ix];
  }

  document.getElementById( "approvebtn" ).disabled = !amTrustee();
}

async function approveSpend()
{
  let ix = document.getElementById( "outselect" ).selectedIndex;
  if (-1 == ix) return;

  await τapprove ( this.PAYEES[ix], this.AMTS[ix], this.EREFS[ix] );

  document.getElementById( "t3recipfield" ).innerHTML = '      ';
  document.getElementById( "t3amtfield" ).innerHTML = '      ';
  document.getElementById( "t3ereffield" ).innerHTML = '      ';

  await doVotes();
}

