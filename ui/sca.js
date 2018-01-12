function setSCA()
{
  const deny = /[^0x123456789abcdefABCDEF]/;
  let scaf = document.getElementById("scafield");
  let sca = scaf.value;

  if (    !sca.startsWith("0x")
       || deny.test(sca)
       || sca.length != 42 )
    scaf.style.backgroundColor = "yellow";
  else
  {
    scaf.style.backgroundColor = "white";

    TRSCON = getTreasury( sca );
    actionSelected();
  }
}
