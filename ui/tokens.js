var transfer20 = '' + Ξkeccak( "Transfer(address,address,uint256)" );

// minimalist ERC20 ABI defines nothing but 'symbol' and 'balanceOf'
const CONABI = JSON.parse(
"[{\"constant\":true,\"inputs\":[{\"name\":\"_a\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"}]" );

var TOKENS = {}; // mapping (symbol => toksca)

function scaToSymbol(sca)
{
  for (var sym in TOKENS)
    if (TOKENS[sym] == sca)
      return sym;

  return '';
}

async function xferProposal()
{
  if (! await amTreasurer()) return;

  let sel = document.getElementById("tokselect");
  let sym = sel.options[sel.selectedIndex].text;
  if (!sym || sym.length == 0)
    return;

  let symsca = this.TOKENS[sym];

  let recip = document.getElementById( "xfertoval" ).value;
  let qty = document.getElementById( "xferqtyval" ).value;
  let eref = document.getElementById( "xfererefval" ).value;

  if (recip && recip.length == 42)
    document.getElementById("xfertoval").style.backgroundColor = "white";
  else
  {
    document.getElementById("xfertoval").style.backgroundColor = "yellow";
    return;
  }
  if (qty && parseInt(qty))
    document.getElementById( "xferqtyval" ).style.backgroundColor = "white";
  else
  {
    document.getElementById( "xferqtyval" ).style.backgroundColor = "yellow";
    return;
  }

  await τproposeTransfer( symsca, recip, qty, eref );

  document.getElementById( "xfertoval" ).value = '';
  document.getElementById( "xferqtyval" ).value = '';
  document.getElementById( "xfererefval" ).value = '';
}

async function doTokens()
{
  let tokholdings = {}; // list of sca:value properties

  let sca = document.getElementById("scafield").value.toLowerCase();

  if (sca && ΞisSCA(sca))
    scapad = ΞpadLeft( sca );
  else return;

  document.getElementById("xfercommand").disabled = !(await amTreasurer());

  let symlist = document.getElementById( "tokselect" );
  symlist.options.length = 0;

  let events = await Ξweb3.eth.getPastLogs(
                       { fromBlock: "0x1",
                         toBlock: 'latest',
                         topics: [transfer20, null, scapad] // from any to this
                       });

  for( var ii = 0; ii < events.length; ii++ )
    tokholdings[ events[ii].address ] = 'ignored';

  this.TOKENS = {};
  let contents = '';

  for ( var toksca in tokholdings ) {

    var con = new Ξweb3.eth.Contract(CONABI, toksca );
    var sym = await con.methods.symbol().call();
    var bal = await con.methods.balanceOf( sca ).call();

    let op = document.createElement("option");
    op.value = sym;
    op.text = sym;
    symlist.add( op );

    console.log( 'this.TOKENS[' + sym + '] = ' + toksca );
    this.TOKENS[sym] = toksca;

    contents += '' + sym + ': ' + bal + '\n';
  }

  document.getElementById('tokenslist').value = contents;
}

