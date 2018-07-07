var ACCTS = document.getElementById("accounts");

async function etherbaseinit()
{
  var eaccts = await ΞlocalAccounts();

  if (eaccts) {
    for (ii = 0; ii < eaccts.length; ii++)
    {
      let op = document.createElement("option");
      op.text = eaccts[ii];
      ACCTS.add(op);
    }

    await setBalance();
  }
  else {
    let op = document.createElement("option");
    op.text = "ERROR";
    ACCTS.add(op);
  }

}

function getCoinbase() {
  return ACCTS.options[ACCTS.selectedIndex].text;
}

async function setBalance()
{
  var balfield = document.getElementById("balance");
  var acct = document.getElementById("accounts").value;
  balfield.innerHTML = ΞweiToEth( await Ξbalance(acct) );
}
