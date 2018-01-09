function setSCA()
{
  const deny = /[^0x123456789abcdefABCDEF]/;
  var sca = document.getElementById("scafield");

  if (    !sca.value.startsWith("0x")
       || deny.test(sca.value)
       || sca.value.length != 42
     )
    sca.style.backgroundColor = "yellow";
  else
    sca.style.backgroundColor = "white";
}
