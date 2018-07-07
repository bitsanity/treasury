var TRUSTEES = {};

async function amTreasurer() {
  let cb = ACCTS.options[ACCTS.selectedIndex].text;
  let trs = await τgetTreasurer();
  return cb == trs;
}

function amTrustee() {
  let cb = getCoinbase();

  for (var t in this.TRUSTEES) {
    console.log( 't: ' + t + ', cb: ' + cb );
    if (cb == t)
      return true;
  }

  return false;
}

async function actionSelected() {
  let ix = document.getElementById("actions").selectedIndex;
  let amtr = await amTreasurer();

  document.getElementById("action1").disabled = !amtr;
  document.getElementById("actioncommand").disabled = !amtr;
  document.getElementById("action2").disabled = (ix != "3") || !amtr;
}

function performAction() {
  let ix = document.getElementById("actions").selectedIndex;

  let uaddr1 = document.getElementById("action1").value;
  if (!uaddr1 || uaddr1.length != 42)
  {
    document.getElementById("action1").style.backgroundColor = "yellow";
    return;
  }
  else
    document.getElementById("action1").style.backgroundColor = "white";

  let uaddr2 = document.getElementById("action2").value;
  if (ix == "3" && (!uaddr2 || uaddr2.length != 42))
  {
    document.getElementById("action2").style.backgroundColor = "yellow";
    return;
  }
  else
    document.getElementById("action2").style.backgroundColor = "white";

  if (ix == "0") τadd( uaddr1 );
  else if (ix == "1") τflag( uaddr1, true );
  else if (ix == "2") τflag( uaddr1, false );
  else if (ix == "3") τreplace( uaddr1, uaddr2 );

  document.getElementById("actions").selectedIndex = 0;
  document.getElementById("action1").value = "";
  document.getElementById("action2").value = "";
  document.getElementById("action2").disabled = true;

  setTimeout( doMembers(), 1000 );
}

async function doMembers()
{
  let trs = await τgetTreasurer();

  document.getElementById( "treasurerval" ).value = trs;

  var logs = await τallEvents();

  this.TRUSTEES = {};

  for( var ii = 0; ii < logs.length; ii++) {

    if (logs[ii].event == 'Added' ) {
      this.TRUSTEES[ logs[ii].returnValues.trustee ] = false;
    }
    else if (logs[ii].event == 'Replaced') {
      delete this.TRUSTEES[ logs[ii].returnValues.older ];
      this.TRUSTEES[ logs[ii].returnValues.newer ] = false;
    }
    else if (logs[ii].event == 'Flagged') {
      this.TRUSTEES[ logs[ii].returnValues.trustee ] =
        logs[ii].returnValues.isRaised;
    }

    let trslist = '';
    for( var addrs in this.TRUSTEES ) {
      if (this.TRUSTEES[addrs])
        trslist += addrs.toString() + " (FLAGGED)\n";
      else
        trslist += addrs.toString() + "\n";
    }

    document.getElementById( "trusteeslist" ).value = trslist;
  }
}

