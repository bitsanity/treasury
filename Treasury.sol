//
// compiler: 0.4.21+commit.dfe3193c.Emscripten.clang
//
pragma solidity ^0.4.21;

// ---------------------------------------------------------------------------
// Treasury smart contract. Owner (Treasurer) is only account that can submit
// proposals, yet cannot actually spend. The Treasurer appoints Trustees to
// approve spending proposals. Funds are released automatically once a
// proposal is approved by a simple majority of trustees.
//
// Trustees can be flagged as inactive by the Treasurer. An inactive Trustee
// cannot vote. The Treasurer may set/reset flags on trustees.
// ---------------------------------------------------------------------------

interface Token {
  // note: function implemented by ERC20 and ERC223
  function transfer( address to, uint amount ) external;
}

contract owned
{
  address public treasurer;

  function owned() public { treasurer = msg.sender; }

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

  // Spend... to pay the payee some amount of wei
  event Proposal( address indexed payee, uint amt, string eref );

  // Token... to transfer amount of token units from (this) to given address
  event TransferProposal( address indexed toksca,
                          address indexed to,
                          uint            amt,
                          string          eref );

  // Spend...
  event Approved( address indexed approver,
                  address indexed to,
                  uint            amount,
                  string          eref );

  // Token...
  event TransferApproved( address indexed approver,
                          address indexed toksca,
                          address indexed to,
                          uint            amount,
                          string          eref );

  // wei...
  event Spent( address indexed payee, uint amt, string eref );

  // Tokens...
  event Transferred( address indexed toksca,
                     address indexed to,
                     uint amount,
                     string eref );

  struct SpendProp {
    address   payee;
    uint      amount;
    string    eref;
    address[] approvals;
  }

  struct TransferProp {
    address   toksca;
    address   to;
    uint      amount;
    string    eref;
    address[] approvals;
  }

  mapping( bytes32 => SpendProp ) proposals;
  mapping( bytes32 => TransferProp ) tokprops;

  address[] trustees;
  bool[]    flags; // 'true' means trustee is not allowed to vote

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
    flags.push( false );

    emit Added( trustee );
  }

  function flag( address trustee, bool isRaised ) public onlyTreasurer
  {
    for( uint ix = 0; ix < trustees.length; ix++ )
      if (trustees[ix] == trustee)
      {
        flags[ix] = isRaised;
        emit Flagged( trustees[ix], flags[ix] );
        break;
      }
  }

  function replace( address older, address newer ) public onlyTreasurer
  {
    for( uint ix = 0; ix < trustees.length; ix++ )
      if (trustees[ix] == older)
      {
        emit Replaced( trustees[ix], newer );
        trustees[ix] = newer;
        flags[ix] = false;
        break;
      }
  }

  function proposal( address _payee, uint _wei, string _eref )
  public onlyTreasurer
  {
    validate( _payee, _wei, _eref );

    bytes32 key = keccak256( _payee, _wei, _eref );
    proposals[key].payee = _payee;
    proposals[key].amount = _wei;
    proposals[key].eref = _eref;

    emit Proposal( _payee, _wei, _eref );
  }

  function proposeTransfer( address _toksca,
                            address _to,
                            uint _amount,
                            string _eref )
  public onlyTreasurer
  {
    validate( _to, _amount, _eref );

    bytes32 key = keccak256( _toksca, _to, _amount, _eref );
    tokprops[key].toksca = _toksca;
    tokprops[key].to = _to;
    tokprops[key].amount = _amount;
    tokprops[key].eref = _eref;

    emit TransferProposal( _toksca, _to, _amount, _eref );
  }

  function approve( address _payee, uint _wei, string _eref ) public
  {
    validate( _payee, _wei, _eref );
    require( inGoodStanding(msg.sender) );

    // fetch matching proposal. if already actioned amount will be zero
    bytes32 key = keccak256( _payee, _wei, _eref );

    // check proposal exists and not already actioned (amount would be 0)
    require( proposals[key].amount > 0 );

    // prevent voting twice
    for (uint ix = 0; ix < proposals[key].approvals.length; ix++)
      if (msg.sender == proposals[key].approvals[ix])
        revert();

    proposals[key].approvals.push( msg.sender );

    emit Approved( msg.sender, _payee, _wei, _eref );

    if ( proposals[key].approvals.length > (trustees.length / 2) )
    {
      require( address(this).balance >= proposals[key].amount );
      proposals[key].payee.transfer(proposals[key].amount); // throws if error
      proposals[key].amount = 0; // prevents double spend
      emit Spent( _payee, _wei, _eref );
    }
  }

  function approveTransfer( address _toksca,
                            address _to,
                            uint    _amount,
                            string  _eref ) public
  {
    validate( _to, _amount, _eref );
    require( inGoodStanding(msg.sender) );

    bytes32 key = keccak256( _toksca, _to, _amount, _eref );
    require( tokprops[key].amount > 0 );

    for (uint ix = 0; ix < tokprops[key].approvals.length; ix++)
      if (msg.sender == tokprops[key].approvals[ix])
        revert();

    tokprops[key].approvals.push( msg.sender );

    emit TransferApproved( msg.sender, _toksca, _to, _amount, _eref );

    if ( tokprops[key].approvals.length > (trustees.length / 2) )
    {
      Token token = Token(_toksca);
      token.transfer( _to, _amount ); // throws if error
      emit Transferred( _toksca, _to, _amount, _eref );
      tokprops[key].amount = 0; // prevents double spend
    }
  }

  function validate( address _to, uint _amount, string _eref ) pure internal
  {
    bytes memory erefb = bytes(_eref);
    require(    _to != address(0)
             && _amount > 0
             && erefb.length > 0
             && erefb.length <= 32 );
  }

  function inGoodStanding( address _who ) view internal returns (bool)
  {
    bool result = false;

    for (uint tix = 0; tix < trustees.length; tix++) {
      if (_who == trustees[tix]) {
        if (flags[tix])
          return false;

        result = true;
      }
    }
    return result;
  }

  function strcmp( string _a, string _b ) pure internal returns (bool)
  {
    return keccak256(_a) == keccak256(_b);
  }
}
