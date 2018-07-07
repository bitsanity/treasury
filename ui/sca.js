async function setSCA()
{
  let scaf = document.getElementById("scafield");
  let sca = scaf.value.toLowerCase();

  if (!ΞisSCA(sca))
  {
    scaf.style.backgroundColor = "yellow";
    return;
  }

  scaf.style.backgroundColor = "white";

  ΞgetTreasury( sca );
  actionSelected();

  let res = await Ξbalance( sca );

  document.getElementById("scabalvalue").innerHTML = res;
}
