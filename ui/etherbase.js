var accts = document.getElementById("accounts");

var eaccts = web3.eth.accounts;
if (eaccts) {
  for (ii = 0; ii < eaccts.length; ii++)
  {
    let op = document.createElement("option");
    op.text = eaccts[ii];
    accts.add(op);
  }
}
else {
  let op = document.createElement("option");
  op.text = "ERROR";
  accts.add(op);
}
