const deny = /[^0x123456789abcdefABCDEF]/;

function isSCA()
{
  return sca.startsWith("0x")
         && !deny.test(sca)
         && sca.length == 42;
}

function setSCA()
{
  let scaf = document.getElementById("scafield");
  let sca = scaf.value.toLowerCase();

  if (!isSCA(sca))
  {
    scaf.style.backgroundColor = "yellow";
    return;
  }

  scaf.style.backgroundColor = "white";

  TRSCON = getTreasury( sca );
  actionSelected();

  web3.eth.getBalance( sca, (err,res) => {
    if (!err) {
      document.getElementById("scabalvalue").innerHTML = res;
    }
  } );
}
