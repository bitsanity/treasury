pragma solidity ^0.4.15;

// ---------------------------------------------------------------------------
// Treasury smart contract. Owner (the Treasurer) does not have the ability to
// spend.
//
// Instead, the Treasurer appoints Trustees who approve spending proposals.
// Funds are sent automatically once a proposal is approved by a simple
// majority of trustees.
//
// Trustees can be flagged as inactive by the Treasurer. An inactive Trustee
// cannot vote. The Treasurer may set/reset flags. The Treasurer can replace
// any Trustee, though any approvals already made will count.
// ---------------------------------------------------------------------------

contract owned
{
  address public treasurer;

  function owned() { treasurer = msg.sender; }

  modifier onlyTreasurer {
    require( msg.sender == treasurer );
    _;
  }

  function setTreasurer( address newTreasurer ) onlyTreasurer {
    treasurer = newTreasurer;
  }

  function closedown() onlyTreasurer {
    selfdestruct( treasurer );
  }
}

contract Treasury is owned {

  event Added( address indexed trustee );
  event Flagged( address indexed trustee, bool isRaised );
  event Replaced( address indexed older, address indexed newer );

  event Proposal( address indexed payee, uint amt, string eref );
  event Approved( address indexed approver,
                  address indexed to,
                  uint amount,
                  string eref );
  event Spent( address indexed payee, uint amt, string eref );

  function Treasury() {}

  function() payable {}

  struct SpendProposal {
    address payee;
    uint amount;
    string eref;
    address[] approvals;
  }

  SpendProposal[] proposals;

  address[] trustees;
  bool[]    flagged; // flagging trustee disables from voting

  function add( address trustee ) onlyTreasurer
  {
    require( trustee != treasurer ); // separate Treasurer and Trustees

    for (uint ix = 0; ix < trustees.length; ix++)
      if (trustees[ix] == trustee) return;

    trustees.push(trustee);
    flagged.push(false);

    Added( trustee );
  }

  function flag( address trustee, bool isRaised ) onlyTreasurer
  {
    for( uint ix = 0; ix < trustees.length; ix++ )
      if (trustees[ix] == trustee)
      {
        flagged[ix] = isRaised;
        Flagged( trustees[ix], flagged[ix] );
      }
  }

  function replace( address older, address newer ) onlyTreasurer
  {
    for( uint ix = 0; ix < trustees.length; ix++ )
      if (trustees[ix] == older)
      {
        Replaced( trustees[ix], newer );
        trustees[ix] = newer;
        flagged[ix] = false;
      }
  }

  function proposal( address _payee, uint _wei, string _eref ) onlyTreasurer
  {
    bytes memory erefb = bytes(_eref);
    require(    _payee != address(0)
             && _wei > 0
             && erefb.length > 0
             && erefb.length <= 32 );

    uint ix = proposals.length++;
    proposals[ix].payee = _payee;
    proposals[ix].amount = _wei;
    proposals[ix].eref = _eref;

    Proposal( _payee, _wei, _eref );
  }

  function approve( address _payee, uint _wei, string _eref )
  {
    // ensure caller is a trustee in good standing
    bool senderValid = false;
    for (uint tix = 0; tix < trustees.length; tix++) {
      if (msg.sender == trustees[tix]) {
        if (flagged[tix])
          revert();

        senderValid = true;
      }
    }
    if (!senderValid) revert();

    // find the matching proposal not already actioned (amount would be 0)
    for (uint pix = 0; pix < proposals.length; pix++)
    {
      if (    proposals[pix].payee == _payee
           && proposals[pix].amount == _wei
           && strcmp(proposals[pix].eref, _eref) )
      {
        // prevent voting twice
        for (uint ap = 0; ap < proposals[pix].approvals.length; ap++)
        {
          if (msg.sender == proposals[pix].approvals[ap])
            revert();
        }

        proposals[pix].approvals.push( msg.sender );

        Approved( msg.sender,
                  proposals[pix].payee,
                  proposals[pix].amount,
                  proposals[pix].eref );

        if ( proposals[pix].approvals.length > (trustees.length / 2) )
        {
          require( this.balance >= proposals[pix].amount );

          if ( proposals[pix].payee.send(proposals[pix].amount) )
          {
            Spent( proposals[pix].payee,
                   proposals[pix].amount,
                   proposals[pix].eref );

            proposals[pix].amount = 0; // prevent double spend
          }
        }
      }
    }
  }

  function strcmp( string _a, string _b ) constant internal returns (bool)
  {
    return keccak256(_a) == keccak256(_b);
  }
}