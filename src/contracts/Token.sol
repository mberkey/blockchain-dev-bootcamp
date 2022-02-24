// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Token {
    using SafeMath for uint;
    //Token Name
    string public name = 'BerKoin';
    //Symbol
    string public symbol = 'BKN';
    //Decimals
    uint256 public decimals = 18;
    //Total Supply 
    uint256 public totalSupply;

    //Track Balances
    mapping(address => uint256) public balanceOf;

    //Events, (indexed allows subscription to event)
    event Transfer(address indexed from, address indexed to , uint256 value);

    constructor() public {
        //1,000,000 Tokens total, converted to WEI
        totalSupply = 1000000 * (10 ** decimals);
        
        //Give total supply to owner, from there we can send tokens as 'BKN' is live.
        balanceOf[msg.sender] = totalSupply;

    }

    //Send Tokens    
    function transfer(address _to, uint256 _value) public returns (bool success){  
        require(balanceOf[msg.sender] >= _value);
        require(_to != address(0));
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);  
        emit Transfer(msg.sender,_to,_value);
        return true;

    }
}