// NOTES:
//
// 1. script uses hardcoded gasPrice -- CHECK ethgasstation.info

const fs = require('fs');
const Web3 = require('web3');
const web3 =
  new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"));
//new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8546"));
//new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const MYGASPRICE = '' + 1 * 1e9;

function getABI() {
  return JSON.parse(
    fs.readFileSync('../build/Treasury_sol_Treasury.abi').toString() );
}

function getStubABI() {
  return JSON.parse(
    fs.readFileSync('../build/ERC20Stub_sol_ERC20Stub.abi').toString() );
}

function getBinary() {
  var binary =
    fs.readFileSync('../build/Treasury_sol_Treasury.bin').toString();

  if (!binary.startsWith('0x')) binary = '0x' + binary;
  return binary;
}

function getStubBinary() {
  var binary =
    fs.readFileSync('../build/ERC20Stub_sol_ERC20Stub.bin').toString();

  if (!binary.startsWith('0x')) binary = '0x' + binary;
  return binary;
}

function getContract(sca) {
  return new web3.eth.Contract( getABI(), sca );
}

function checkAddr(addr) {
  try {
    let isaddr = parseInt( addr );
  } catch( e ) {
    usage();
    process.exit(1);
  }
}

function shorten(addr) {
  var saddr = "" + addr;
  return "0x" + saddr.substring(26);
}

function printEvent(evt) {
  if (evt.event == 'Added' ) {
    console.log( 'Added:\n\tTrustee: ' + shorten(evt.raw.topics[1] ) );
  }
  else if (evt.event == 'Flagged' ) {
    console.log( "Flagged:\n\tTrustee: " +
                 shorten(evt.raw.topics[1]) +
                 "\n\tisRaised: " +
                 parseInt(evt.raw.data,16) );
  }
  else if (evt.event == 'Replaced' ) {
    console.log( "Replaced:\n\told: " +
                 shorten(evt.raw.topics[1]) +
                 "\n\tnew: " + shorten(evt.raw.topics[2]) );
  }
  else if (evt.event == 'Proposal' ) {
    var decoded = web3.eth.abi.decodeParameters(
                  ["uint256","string"],
                  evt.raw.data );
        
    console.log( "Proposal:\n\trecipient: " +
                 shorten(evt.raw.topics[1]) +
                 "\n\tamount(wei): " + decoded['0'] +
                 "\n\text ref: " + decoded['1'] );
  }
  else if (evt.event == 'TransferProposal' ) {
    var decoded = web3.eth.abi.decodeParameters(
                  ["uint256","string"],
                  evt.raw.data );

    console.log( "TransferProposal:\n\ttoksca: " +
                  shorten(evt.raw.topics[1]) +
                  "\n\tto: " + shorten(evt.raw.topics[2]) +
                  "\n\tqty: " + decoded['0'] +
                  "\n\text ref: " + decoded['1'] );
  }
  else if (evt.event == 'Approved' ) {
    var decoded = web3.eth.abi.decodeParameters(
                  ["uint256","string"],
                  evt.raw.data );

    console.log( "Approved:\n\tapprover: " +
                   shorten(evt.raw.topics[1]) +
                   "\n\treceipient: " +
                   shorten(evt.raw.topics[2]) +
                   "\n\tamount(wei): " + decoded['0'] +
                   "\n\teref: " + decoded['1'] );
  }
  else if (evt.event == 'TransferApproved' ) {
    var decoded = web3.eth.abi.decodeParameters(
                  ["uint256","string"],
                  evt.raw.data );

    console.log( "TransferApproved:\n\ttoksca: " +
                   shorten(evt.raw.topics[2]) +
                   "\n\tapprover: " +
                   shorten(evt.raw.topics[1]) +
                   "\n\tto: " +
                   shorten(evt.raw.topics[3]) +
                   "\n\tqty: " + decoded['0'] +
                   "\n\teref: " + decoded['1'] );
  }
  else if (evt.event == 'Spent' ) {
    var decoded = web3.eth.abi.decodeParameters(
                  ["uint256","string"],
                  evt.raw.data );

    console.log( "Spent:\n\treceiver: " +
                   shorten(evt.raw.topics[1]) +
                   "\n\tamount(wei): " + decoded['0'] +
                   "\n\teref: " + decoded['1'] );

  }
  else if (evt.event == 'Transferred' ) {
    var decoded = web3.eth.abi.decodeParameters(
                  ["uint256","string"],
                  evt.raw.data );

    console.log( "Transfered:\n\ttoksca: " +
                   shorten(evt.raw.topics[1]) +
                   "\n\tto: " + shorten(evt.raw.topics[2]) +
                   "\n\tqty: " + decoded['0'] +
                   "\n\text ref: " + decoded['1'] );
  }
  else {
    console.log( evt );
  }
}

const cmds =
  [
   'deploy',
   'stub',
   'chown',
   'shutdown',
   'events',
   'variables',
   'add',
   'flag',
   'replace',
   'proposal',
   'proposeTransfer',
   'approve',
   'approveTransfer'
  ];

function usage() {
  console.log(
    '\nUsage:\n$ node cli.js <acctindex> <SCA> <command> [arg]*\n',
     'Commands:\n',
     '\tdeploy |\n',
     '\tstub |\n',
     '\tchown <new owner eoa> |\n',
     '\tshutdown |\n',
     '\tevents |\n',
     '\tvariables |\n',
     '\tadd <eoa> |\n',
     '\tflag <eoa> <true|false> |\n',
     '\treplace <oldeoa> <neweoa> |\n',
     '\tproposal <payeeeoa> <wei> <eref> |\n',
     '\tproposeTransfer <tokensca> <transfereeeoa> <qty> <eref> |\n',
     '\tapprove <payeeeoa> <wei> <eref>\n',
     '\tapproveTransfer <tokensca> <transfereeeoa> <qty> <eref>\n'
  );
}

var cmd = process.argv[4];

let found = false;
for (let ii = 0; ii < cmds.length; ii++)
  if (cmds[ii] == cmd) found = true;

if (!found) {
  usage();
  process.exit(1);
}

var ebi = process.argv[2]; // etherbaseindex, i.e. use eth.accounts[ebi]
var sca = process.argv[3];

var eb;
web3.eth.getAccounts().then( (res) => {
    eb = res[ebi];
    if (cmd == 'deploy')
    {
      let con = new web3.eth.Contract( getABI() );

      con
        .deploy({data:getBinary()} )
        .send({from: eb, gas: 1452525, gasPrice: MYGASPRICE}, (err, txhash) => {
          if (txhash) console.log( "send txhash: ", txhash );
        } )
        .on('error', (err) => { console.log("err: ", err); })
        .on('transactionHash', (h) => { console.log( "hash: ", h ); } )
        .on('receipt', (r) => { console.log( 'rcpt: ' + r.contractAddress); } )
        .on('confirmation', (cn, rcpt) => { console.log( 'cn: ', cn ); } )
        .then( (nin) => {
          console.log( "SCA", nin.options.address );
          process.exit(0);
        } );
    }
    else if (cmd == 'stub')
    {
      let con = new web3.eth.Contract( getStubABI() );
      con
        .deploy({data:getStubBinary()} )
        .send({from: eb, gas: 500000, gasPrice: MYGASPRICE}, (err, txhash) => {
          if (txhash) console.log( "send txhash: ", txhash );
        } )
        .on('error', (err) => { console.log("err: ", err); })
        .on('transactionHash', (h) => { console.log( "hash: ", h ); } )
        .on('receipt', (r) => { console.log( 'rcpt: ' + r.contractAddress); } )
        .on('confirmation', (cn, rcpt) => { console.log( 'cn: ', cn ); } )
        .then( (nin) => {
          console.log( "SCA", nin.options.address );
          process.exit(0);
        } );
    }
    else
    {
      let con = new web3.eth.Contract( getABI(), sca );

      if (cmd == 'chown')
      {
        let addr = process.argv[5];
        checkAddr(addr);
        con.methods.setTreasurer( addr )
                   .send( {from: eb, gas: 30000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'shutdown')
      {
        console.log( 'for your protection: remove comment to closedown()' );
        con.methods.closedown()
                   .send( {from: eb, gas: 21000, gasPrice: MYGASPRICE} );
      }

      if (cmd == 'events')
      {
        console.log( "events:" );

        con.getPastEvents('allEvents', {fromBlock: 0, toBlock: 'latest'})
           .then( (events) =>
        {
          console.log( "events.length is " + events.length );

          for (var ii = 0; ii < events.length; ii++) {
            printEvent( events[ii] );
          } // end foreach event
        }); // end then
      } // end if events command

      if (cmd == 'variables')
      {
        con.methods.treasurer().call().then( (res) => {
          console.log( "owner = ", res );
        } );

        web3.eth.getBalance( sca ).then( (bal) => {
          console.log( "balance (wei): " + bal );
        } );
      }

      if (cmd == 'add')
      {
        let addr = process.argv[5];
        checkAddr(addr);
        con.methods.add( addr )
                   .send( {from: eb, gas: 100000, gasPrice: MYGASPRICE} );
      }
      if (cmd == 'flag')
      {
        let addr = process.argv[5];
        checkAddr(addr);
        let arg = process.argv[6].toLowerCase();
        let isRaised = (arg == 'true' || arg.startsWith('t') );

        con.methods.flag( addr, isRaised )
                   .send( {from: eb, gas: 100000, gasPrice: MYGASPRICE} );
      }
      if (cmd == 'replace')
      {
        let oldaddr = process.argv[5];
        checkAddr(oldaddr);
        let newaddr = process.argv[6];
        checkAddr(newaddr);
        con.methods.replace( oldaddr, newaddr )
                   .send( {from: eb, gas: 100000, gasPrice: MYGASPRICE} );
      }
      if (cmd == 'proposal')
      {
        let payee = process.argv[5];
        checkAddr( payee );
        let wei = parseInt( process.argv[6] );
        let eref = process.argv[6];

        con.methods.proposal( payee, wei, eref )
                   .send( {from: eb, gas: 120000, gasPrice: MYGASPRICE} );
      }
      if (cmd == 'proposeTransfer')
      {
        let tokensca = process.argv[5];
        checkAddr( tokensca );
        let transferee = process.argv[6]
        checkAddr( transferee );
        let qty = parseInt( process.argv[7] );
        let eref = process.argv[8];

        con.methods.proposeTransfer( tokensca, transferee, qty, eref )
                   .send( {from: eb, gas: 120000, gasPrice: MYGASPRICE} );
      }
      if (cmd == 'approve')
      {
        let payee = process.argv[5];
        checkAddr( payee );
        let wei = parseInt( process.argv[6] );
        let eref = process.argv[6];

        con.methods.approve( payee, wei, eref )
                   .send( {from: eb, gas: 120000, gasPrice: MYGASPRICE} );
      }
      if (cmd == 'approveTransfer')
      {
        let tokensca = process.argv[5];
        checkAddr( tokensca );
        let transferee = process.argv[6]
        checkAddr( transferee );
        let qty = parseInt( process.argv[7] );
        let eref = process.argv[8];

        con.methods.approveTransfer( tokensca, transferee, qty, eref )
                   .send( {from: eb, gas: 120000, gasPrice: MYGASPRICE} );
      }

//    process.exit(0);
    }
} );

