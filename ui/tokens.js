/*
const transfer20 =
  web3.utils.keccak256( "Transfer(address,address,uint256)" );

const transfer223 =
  web3.utils.keccak256( "Transfer(address,address,uint256,bytes)" );
*/

// minimalist ERC20 ABI defines nothing but 'symbol' and 'balanceOf'
const CONABI = JSON.parse(
"[{\"constant\":true,\"inputs\":[{\"name\":\"_a\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"}]" );

var TOKENS = {}; // mapping (symbol => toksca)

function scaToSymbol(sca)
{
  for (var s in TOKENS)
    if (TOKENS[s] == sca)
      return s;

  return '';
}

function padLeft( addr ) {
  var n = addr.toString(16).replace(/^0x/, '');
  while (n.length < 64)
    n = "0" + n;

  return "0x" + n;
}

function isAddr()
{
  const deny = /[^0x123456789abcdefABCDEF]/;
  return sca.startsWith("0x")
         && !deny.test(sca)
         && sca.length == 42;
}

function xferProposal()
{
  if (!amTreasurer()) return;

  let cbase = ACCTS.options[ACCTS.selectedIndex].text;

  let sel = document.getElementById("xferselect");

  let sym = sel.options[sel.selectedIndex].text;
  if (!sym || sym.length == 0)
    return;

  let symsca = TOKENS[sym];

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

  console.log( 'xferProposal:\n\tsca: ', symsca, '\n\trcv: ', recip,
               '\n\tqty: ', qty, '\n\tref: ', eref );

  TRSCON.transferProposal( symsca, recip, qty, eref,
                           {from: cbase, gas:500000, gasPrice: MYGASPRICE} );

  document.getElementById( "xfertoval" ).value = '';
  document.getElementById( "xferqtyval" ).value = '';
  document.getElementById( "xfererefval" ).value = '';
}

function doTokens()
{
  let tokholdings = {}; // list of sca:value properties

  let sca = document.getElementById("scafield").value.toLowerCase();

  if (sca && isSCA(sca))
    sca = padLeft( sca );
  else return;

  let symlist = document.getElementById( "xferselect" );
    while (symlist.hasChildNodes())
      symlist.removeChild( symlist.firstChild );

  (async function(x) {

    let events = await web3.eth.getPastLogs(
                         { fromBlock: "0x1",
                           toBlock: 'latest',
                           topics: [transfer20, null, sca] // from any to this
                         });

    for( var ii = 0; ii < events.length; ii++ )
      tokholdings[ events[ii].address ] = 'ignored';

    events = await web3.eth.getPastLogs(
                     { fromBlock: "0x1",
                       toBlock: 'latest',
                       topics: [transfer20, sca] // from this to any
                     });

    for( var ii = 0; ii < events.length; ii++ )
      tokholdings[ events[ii].address ] = 'ignored';

    events = await web3.eth.getPastLogs(
                     { fromBlock: "0x1",
                       toBlock: 'latest',
                       topics: [transfer223, null, sca]
                     });

    for( var ii = 0; ii < events.length; ii++ )
      tokholdings[ events[ii].address ] = 'ignored';

    events = await web3.eth.getPastLogs(
                     { fromBlock: "0x1",
                       toBlock: 'latest',
                       topics: [transfer223, sca]
                     });

    for( var ii = 0; ii < events.length; ii++ )
      tokholdings[ events[ii].address ] = 'ignored';

    let contents = '';

    for ( var toksca in x ) {
      try {
        var con = new web3.eth.Contract(CONABI, toksca );
        var sym = await con.methods.symbol().call();
        var bal = await con.methods.balanceOf( sca ).call();

        symlist.add( sym );
        contents += '' + sym + ': ' + bal + '\n';

      } catch( err ) {}
    }

    return contents;

  })(tokholdings).then( (res) => {

    document.getElementById('tokenslist').value = res;

  } );

}

