//
// compiler: 0.4.19+commit.c4cbbb05.Emscripten.clang
//
pragma solidity ^0.4.19;

// ---------------------------------------------------------------------------
// Treasury smart contract. Owner (Treasurer) is only account that can submit
// proposals, yet cannot actually spend. The Treasurer appoints Trustees to
// approve spending proposals. Funds are released automatically once a
// proposal is approved by a simple majority of trustees.
//
// Trustees can be flagged as inactive by the Treasurer. An inactive Trustee
// cannot vote. The Treasurer may set/reset flags on trustees.
// ---------------------------------------------------------------------------

contract owned
{
  address public treasurer;

  function owned() public { treasurer = msg.sender; }

  function closedown() public onlyTreasurer { selfdestruct( treasurer ); }

  function setTreasurer( address newTreasurer ) public onlyTreasurer
  { treasurer = newTreasurer; }

  modifier onlyTreasurer {
    require( msg.sender == treasurer );
    _;
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

  struct SpendProposal {
    address   payee;
    uint      amount;
    string    eref;
    address[] approvals;
  }

  mapping( bytes32 => SpendProposal ) proposals;

  // use array instead of mapping as we need the length property for voting
  address[] trustees;
  bool[]    flagged; // true means trustee is not allowed to vote

  function Treasury() public {}

  function() public payable {}

  function add( address trustee ) public onlyTreasurer
  {
    require( trustee != address(0) );
    require( trustee != treasurer );

    for (uint ix = 0; ix < trustees.length; ix++)
      if (trustees[ix] == trustee)
        return;

    trustees.push( trustee );
    flagged.push( false );

    Added( trustee );
  }

  function flag( address trustee, bool isRaised ) public onlyTreasurer
  {
    for( uint ix = 0; ix < trustees.length; ix++ )
      if (trustees[ix] == trustee)
      {
        flagged[ix] = isRaised;
        Flagged( trustees[ix], flagged[ix] );
        break;
      }
  }

  function replace( address older, address newer ) public onlyTreasurer
  {
    for( uint ix = 0; ix < trustees.length; ix++ )
      if (trustees[ix] == older)
      {
        Replaced( trustees[ix], newer );
        trustees[ix] = newer;
        flagged[ix] = false;
        break;
      }
  }

  function proposal( address _payee, uint _wei, string _eref )
  public onlyTreasurer
  {
    bytes memory erefb = bytes(_eref);
    require(    _payee != address(0)
             && _wei > 0
             && erefb.length > 0
             && erefb.length <= 32 );

    bytes32 key = keccak256( _payee, _wei, _eref );
    proposals[key].payee = _payee;
    proposals[key].amount = _wei;
    proposals[key].eref = _eref;

    Proposal( _payee, _wei, _eref );
  }

  function approve( address _payee, uint _wei, string _eref ) public
  {
    // scan trustees - ensure caller is a trustee in good standing
    bool senderValid = false;
    for (uint tix = 0; tix < trustees.length; tix++) {
      if (msg.sender == trustees[tix]) {
        if (flagged[tix])
          revert();

        senderValid = true;
      }
    }
    if (!senderValid) revert();

    // fetch matching proposal. if already actioned amount will be zero
    bytes32 key = keccak256( _payee, _wei, _eref );

    // check proposal exists and not already actioned (amount would be 0)
    require(    proposals[key].payee != address(0)
             && proposals[key].amount > 0 );

    bytes memory erefb = bytes(proposals[key].eref);
    require( erefb.length > 0 );

    // prevent voting twice
    for (uint ix = 0; ix < proposals[key].approvals.length; ix++)
      if (msg.sender == proposals[key].approvals[ix])
        revert();

    proposals[key].approvals.push( msg.sender );

    Approved( msg.sender, _payee, _wei, _eref );

    if ( proposals[key].approvals.length > (trustees.length / 2) )
    {
      require( this.balance >= proposals[key].amount );

      if ( proposals[key].payee.send(proposals[key].amount) )
      {
        Spent( _payee, _wei, _eref );
        proposals[key].amount = 0; // prevents double spend
      }
    }
  }

  function strcmp( string _a, string _b ) pure internal returns (bool)
  {
    return keccak256(_a) == keccak256(_b);
  }
}
