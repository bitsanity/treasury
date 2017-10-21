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
  bool[]    flagged; // flagging a trustee disables them from voting

  function add( address trustee ) onlyTreasurer
  {
    for (uint ix = 0; ix < trustees.length; ix++)
      if (trustees[ix] == msg.sender) return;

    trustees.push(trustee);
    flagged.push(false);

    Added( trustee );
  }

  function flag( bool isRaised, uint ix ) onlyTreasurer
  {
    require( ix < trustees.length );
    flagged[ix] = isRaised;

    Flagged( trustees[ix], flagged[ix] );
  }

  function replace( address newer, uint ix ) onlyTreasurer
  {
    require (ix < trustees.length);

    Replaced( trustees[ix], newer );

    trustees[ix] = newer;
    flagged[ix] = false;
  }

  function proposal( address _payee, uint _wei, string _eref )
  {
    uint ix = proposals.length++;

    proposals[ix].payee = _payee;
    proposals[ix].amount = _wei;
    proposals[ix].eref = _eref;

    Proposal( _payee, _wei, _eref );
  }

  function approve( uint pix )
  {
    require (pix < proposals.length);

    for (uint tix = 0; tix < trustees.length; tix++)
    {
      if (trustees[tix] == msg.sender)
      {
        for (uint ap = 0; ap < proposals[pix].approvals.length; ap++)
        {
          if (msg.sender == proposals[pix].approvals[ap] || flagged[tix])
          return;
        }

        proposals[pix].approvals.push( msg.sender );

        Approved( msg.sender,
                  proposals[pix].payee,
                  proposals[pix].amount,
                  proposals[pix].eref );
      }
    }

    if (    proposals[pix].amount > 0
         && this.balance >= proposals[pix].amount
         && proposals[pix].approvals.length > (trustees.length / 2) )
    {
      require (proposals[pix].payee.send(proposals[pix].amount)); // SEND MONEY

      Spent( proposals[pix].payee, proposals[pix].amount, proposals[pix].eref );

      proposals[pix].amount = 0; // prevent double spend
    }
  }
}
