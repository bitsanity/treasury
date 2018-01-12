var ACCTS = document.getElementById("accounts");

var eaccts = web3.eth.accounts;
if (eaccts) {
  for (ii = 0; ii < eaccts.length; ii++)
  {
    let op = document.createElement("option");
    op.text = eaccts[ii];
    ACCTS.add(op);
  }
}
else {
  let op = document.createElement("option");
  op.text = "ERROR";
  ACCTS.add(op);
}
