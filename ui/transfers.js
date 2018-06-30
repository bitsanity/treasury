var SCAS = [];
var HLDRS = [];
var QTYS = [];
var EREFS = [];

function doTransfers()
{
  SCAS = [];
  HLDRS = [];
  QTYS = [];
  EREFS = [];

  let xfers = {}; // list of ("<sca>Ξ<to>Ξ<qty>Ξ<eref>":"qty") properties

  let events = TRSCON.allEvents( {fromBlock:0,toBlock:'latest'} );
  events.get( (error, logs) => {

    for( var ii = 0; ii < logs.length; ii++)
    {
      if (logs[ii].event == 'TransferProposal' ) {
        xfers[ '' + logs[ii].args.toksca +
               'Ξ' + logs[ii].args.to +
               'Ξ' + logs[ii].args.amt +
               'Ξ' + logs[ii].args.eref ] += logs[ii].args.amt;
      }
      else if (logs[ii].event == 'Transferred') {
        xfers[ '' + logs[ii].args.toksca +
               'Ξ' + logs[ii].args.to +
               'Ξ' + logs[ii].args.amt +
               'Ξ' + logs[ii].args.eref ] -= logs[ii].args.amt;
      }
    }

    var xferlist = document.getElementById( "xferselect" );

    while (xferlist.hasChildNodes())
      xferlist.removeChild( xferlist.firstChild );

    let index = 0;
    for (var s in xfers)
    {
      let v = parseInt(xfers[s]);

      if (v > 0)
      {
        let op = document.createElement("option");
        op.text = ' ' + index + ' ';
        xferlist.add(op);

        let vals = s.split('Ξ');
        SCAS[index] = vals[0];
        HLDRS[index] = vals[1];
        QTYS[index] = vals[2];
        EREFS[index] = vals[3];

        op.value = 0;
        index++;
      }
    }

    transferSelected();

  } );
}

function transferSelected()
{
  let ix = document.getElementById( "xferselect" ).selectedIndex;
  if (-1 == ix) return;

  var sym = scaToSymbol( SCAS[ix] );
  document.getElementById( "toksymfield" ).innerHTML = sym;
  document.getElementById( "xferrecipfield" ).innerHTML = HLDRS[ix];
  document.getElementById( "xferqtyfield" ).innerHTML = QTYS[ix];
  document.getElementById( "xferereffield" ).innerHTML = EREFS[ix];

  let cbase = ACCTS.options[ACCTS.selectedIndex].text;

  var amtrustee = false;
  for (var t in TRUSTEES)
  {
    if (t == cbase && !TRUSTEES[t])
      amtrustee = true;
  }

  document.getElementById( "xferapprovebtn" ).disabled = !amtrustee;
}

function approveTransfer()
{
  let ix = document.getElementById( "xferselect" ).selectedIndex;
  if (-1 == ix) return;

  let cbase = ACCTS.options[ACCTS.selectedIndex].text;

  TRSCON.approveTransfer( SCAS[ix], HLDRS[ix], QTYS[ix], EREFS[ix],
                          {from: cbase, gas:250000, gasPrice: MYGASPRICE} );

  document.getElementById( "toksymfield" ).innerHTML = '      ';
  document.getElementById( "xferrecipfield" ).innerHTML = '      ';
  document.getElementById( "xferqtyfield" ).innerHTML = '      ';
  document.getElementById( "xferereffield" ).innerHTML = '      ';

  setTimeout( doTransfers(), 1000 );
}

