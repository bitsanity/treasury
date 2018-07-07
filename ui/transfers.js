var SCAS = [];
var HLDRS = [];
var QTYS = [];
var EREFS = [];

async function doTransfers()
{
  this.SCAS = [];
  this.HLDRS = [];
  this.QTYS = [];
  this.EREFS = [];

  let logs = await τallEvents();
  let xfers = {}; // list of ("<sca>Ξ<to>Ξ<qty>Ξ<eref>":"qty") properties

  for( var ii = 0; ii < logs.length; ii++) {
    if (logs[ii].event == 'TransferProposal' ) {
      let key = '' + logs[ii].returnValues.toksca +
                'Ξ' + logs[ii].returnValues.to +
                'Ξ' + logs[ii].returnValues.amt +
                'Ξ' + logs[ii].returnValues.eref;

      if (xfers[key])
        xfers[key] += parseInt( logs[ii].returnValues.amt );
      else
        xfers[key] = parseInt( logs[ii].returnValues.amt );
    }
    else if (logs[ii].event == 'Transferred') {
      let key = '' + logs[ii].returnValues.toksca +
                'Ξ' + logs[ii].returnValues.to +
                'Ξ' + logs[ii].returnValues.amount +
                'Ξ' + logs[ii].returnValues.eref;

      if (xfers[key])
        xfers[key] -= parseInt( logs[ii].returnValues.amt );
    }
  }

  var xferlist = document.getElementById( "xferselect" );
  xferlist.options.length = 0; // clear old values

  let index = 0;
  for (var s in xfers)
  {
    let v = parseInt( xfers[s] );

    if (v > 0)
    {
      let op = document.createElement("option");
      op.text = ' ' + index + ' ';
      op.value = op.text;
      xferlist.add(op);

      let vals = s.split('Ξ');
      this.SCAS[index] = '' + vals[0];
      this.HLDRS[index] = '' + vals[1];
      this.QTYS[index] = '' + vals[2];
      this.EREFS[index] = '' + vals[3];

      index++;
    }

    transferSelected();
  }
}

function transferSelected()
{
  let ix = document.getElementById( "xferselect" ).selectedIndex;
  if (-1 == ix) return;

  var sym = scaToSymbol( '' + this.SCAS[ix] );
console.log( 'sca: ' + this.SCAS[ix] + ', sym: ' + sym );
  document.getElementById( "toksymfield" ).innerHTML = sym;
  document.getElementById( "xferrecipfield" ).innerHTML = this.HLDRS[ix];
  document.getElementById( "xferqtyfield" ).innerHTML = this.QTYS[ix];
  document.getElementById( "xferereffield" ).innerHTML = this.EREFS[ix];

  document.getElementById( "xferapprovebtn" ).disabled = !amTrustee();
}

async function approveTransfer()
{
  let ix = document.getElementById( "xferselect" ).selectedIndex;
  if (-1 == ix) return;

  await τapproveTransfer( SCAS[ix], HLDRS[ix], QTYS[ix], EREFS[ix] );

  document.getElementById( "toksymfield" ).innerHTML = '      ';
  document.getElementById( "xferrecipfield" ).innerHTML = '      ';
  document.getElementById( "xferqtyfield" ).innerHTML = '      ';
  document.getElementById( "xferereffield" ).innerHTML = '      ';

  doTransfers();
}

