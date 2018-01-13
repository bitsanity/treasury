function setSCA()
{
  const deny = /[^0x123456789abcdefABCDEF]/;
  let scaf = document.getElementById("scafield");
  let sca = scaf.value.toLowerCase();

  if (    !sca.startsWith("0x")
       || deny.test(sca)
       || sca.length != 42 )
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
