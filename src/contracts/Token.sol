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

    //Track Allowance
    //Address of person that approved spending, inner mapping is address of exchange with the amount it can spend.
    mapping(address => mapping(address => uint256)) public allowance;

    //Events, (indexed allows subscription to event)
    event Transfer(address indexed from, address indexed to , uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() public {
        //1,000,000 Tokens total, converted to WEI
        totalSupply = 1000000 * (10 ** decimals);
        
        //Give total supply to owner, from there we can send tokens as 'BKN' is live.
        balanceOf[msg.sender] = totalSupply;

    }

    //Send Tokens from deployer to and address of a certain amount of tokens
    //Fire 'Transfer' event 
    function transfer(address _to, uint256 _value) public returns (bool success){  
        require(balanceOf[msg.sender] >= _value);
        _transfer(msg.sender, _to, _value);
        return true;

    }

    function _transfer(address _from, address _to, uint _value) internal{
   require(_to != address(0));
        balanceOf[_from] = balanceOf[_from].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);  
        emit Transfer(_from,_to,_value);
    }

    //Approve Tokens, Allow spender (the exchange) to spend (X) amount of tokens
    //Fire 'Approval' event
    function approve(address _spender, uint256 _value) public returns (bool success){
        require(_spender != address(0));
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;

    }


    //Transfer From
    //Make sure allowance of the sender is the balance-amount
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool sucess){
        require(_value <=balanceOf[_from]);
        require(_value <=allowance[_from][msg.sender]);
        allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
        _transfer(_from, _to, _value);
        
        return true;

    }

}