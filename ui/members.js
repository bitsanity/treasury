var TRUSTEES;

function amTreasurer() {
  let cb = ACCTS.options[ACCTS.selectedIndex].text;
  let trs = TRSCON.treasurer();
  return cb == trs;
}

function actionSelected() {
  let ix = document.getElementById("actions").selectedIndex;
  let amtr = amTreasurer();

  document.getElementById("action1").disabled = !amtr;
  document.getElementById("actioncommand").disabled = !amtr;
  document.getElementById("action2").disabled = (ix != "3") || !amtr;
}

function performAction() {
  let cbase = ACCTS.options[ACCTS.selectedIndex].text;
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

  if (ix == "0") {
    console.log( 'adding ' + uaddr1 );
    TRSCON.add( uaddr1, {from: cbase, gas:100000, gasPrice: MYGASPRICE} );
  }
  else if (ix == "1") {
    console.log( 'flagging ' + uaddr1 );
    TRSCON.flag( uaddr1, true,
                 {from: cbase, gas:100000, gasPrice: MYGASPRICE} );
  }
  else if (ix == "2") {
    console.log( 'unflagging ' + uaddr1 );
    TRSCON.flag( uaddr1, false,
                 {from: cbase, gas:100000, gasPrice: MYGASPRICE} );
  }
  else if (ix == "3") {
    console.log( 'replacing ' + uaddr1 + ' with ' + uaddr2 );
    TRSCON.replace( uaddr1, uaddr2,
                    {from: cbase, gas:100000, gasPrice: MYGASPRICE} );
  }

  document.getElementById("actions").selectedIndex = 0;
  document.getElementById("action1").value = "";
  document.getElementById("action2").value = "";
  document.getElementById("action2").disabled = true;

  setTimeout( doMembers(), 1000 );
}

function doMembers()
{
  let trs = TRSCON.treasurer();
  document.getElementById( "treasurerval" ).value = trs;

  TRUSTEES = {}; // set of ("address" : "isFlagged") tuples

  var events = TRSCON.allEvents({fromBlock:0,toBlock:'latest'});
  events.get( (error, logs) => {

    console.log( "log has " + logs.length + " entries" );

    for( var ii = 0; ii < logs.length; ii++) {

      console.log( logs[ii] );

      if (logs[ii].event == 'Added' ) {
        TRUSTEES[ logs[ii].args.trustee ] = false;
      }
      else if (logs[ii].event == 'Replaced') {
        delete TRUSTEES[ logs[ii].args.older ];
        TRUSTEES[ logs[ii].args.newer ] = false;
      }
      else if (logs[ii].event == 'Flagged') {
        TRUSTEES[ logs[ii].args.trustee ] = logs[ii].args.isRaised;
      }
    }

    let trslist = '';
    for( var addrs in TRUSTEES ) {
      console.log( addrs + ' ' + TRUSTEES[addrs] );
      if (TRUSTEES[addrs])
        trslist += addrs.toString() + " (FLAGGED)\n";
      else
        trslist += addrs.toString() + "\n";
    }

    document.getElementById( "trusteeslist" ).value = trslist;
  } );
}

