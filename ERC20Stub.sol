pragma solidity ^0.4.21;

contract ERC20Stub
{
  event Transfer(address indexed _from, address indexed _to, uint _value);

  function ERC20Stub() public {}

  function transfer(address _to, uint _value) public returns (bool success)
  {
    emit Transfer( msg.sender, _to, _value );
    return _to != address(0) && _value > 0;
  }
}

