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

  function setNewTreasurer( address newTreasurer ) onlyTreasurer {
    treasurer = newTreasurer;
  }

  function closedown() onlyTreasurer {
    selfdestruct( treasurer );
  }
}

contract Treasury {

  function Treasury() {}

  function() payable {}

  struct SpendProposal {
    address payee;
    uint amount;
    address[] approvals;
  }

  SpendProposal[] proposals;

  address[] trustees;
  bool[]    flagged; // flagging a trustee disables them from voting

  function addTrustee(address trustee) onlyTreasurer
  {
    for (uint ix = 0; ix < trustees.length; ix++)
      if (trustees[ix] == msg.sender) return;

    trustees.push(trustee);
    flagged.push(false);
  }

  function trusteeFlag( bool flag, uint ix ) onlyTreasurer
  {
    require( ix < trustees.length );
    flagged[ix] = flag;
  }

  function replaceTrustee( address newtrustee, uint ix ) onlyTreasurer
  {
    require (ix < trustees.length);
    trustees[ix] = newtrustee;
    flagged[ix] = false;
  }

  function trusteeCount() constant returns (uint) { return trustees.length; }

  function trustee( uint ix ) constant returns (address)
  {
    require (ix < proposals.length);
    return trustees[ix];
  }

  function addProposal( address _payee, uint _wei )
  {
    uint ix = proposals.length++;
    proposals[ix].payee = _payee;
    proposals[ix].amount = _wei;
  }

  function proposalCount() constant returns (uint) { return proposals.length; }

  function getProposal(uint ix) constant returns (address, uint)
  {
    require( ix < proposals.length );
    return (proposals[ix].payee, proposals[ix].amount);
  }

  function approvalCountForProposal( uint pix ) constant returns (uint)
  {
    require( pix < proposals.length );
    return proposals[pix].approvals.length;
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
      }
    }

    if (    proposals[pix].amount > 0
         && this.balance >= proposals[pix].amount
         && proposals[pix].approvals.length > (trustees.length / 2) )
    {
      require (proposals[pix].payee.send(prop.amount)); // SEND MONEY
      proposals[pix].amount = 0;
    }
  }
}
