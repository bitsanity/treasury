pragma solidity ^0.5.3;

contract ERC20Stub
{
  event Transfer(address indexed _from, address indexed _to, uint _value);

  string public name = "ERC20 Stub";
  string public symbol = "STUB";
  uint8  public decimals = uint8(18);
  uint   public totalSupply = 1e9;

  constructor() public {}

  function balanceOf( address _who ) view public returns (uint) {
    if (totalSupply > 0 && _who != address(0))
      return 1234567890;

    return 0;
  }

  function transfer(address _to, uint _value) public returns (bool) {
    require( _to != address(0) && _value > 0 );
    emit Transfer( msg.sender, _to, _value );
    return true;
  }
}

