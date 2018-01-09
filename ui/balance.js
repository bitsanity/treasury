function setBalance()
{
  var bal = document.getElementById("balance");
  var acct = document.getElementById("accounts").value;

  web3.eth.getBalance( acct, (err,res) => {
    if (!err) {
      bal.innerHTML = web3.fromWei(res);
    }
  } );
}
