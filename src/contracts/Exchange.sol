// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0 <0.9.0;
import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

//Will deposit & withdraw
//Manage Orders: Make & Cancel
//Handle Trades: Charge fees

// TODO:
// [x] Set the fee account
// [x] Deposit Ether
// [ ] Withdraw Ether
// [x] Deposit tokens
// [ ] Withdraw tokens
// [ ] Check balances
// [ ] Make order
// [ ] Cancel order
// [ ] Fill order
// [ ] Charge fees

contract Exchange{
    using SafeMath for uint;
    uint256 public feePercent; 
    address public feeAccount; //Account to receive tx fees
    address constant ETHER = address(0); //Store Ether tokens in mapping w blank address
    //Mapping for tokens in exchange
    //first address is token address, second is user address and tokens held by user
    mapping(address => mapping(address => uint256)) public tokens;

    //Set Fee Account
    constructor (address _feeAccount, uint256 _feePercent ) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);

    //Fallback: reverts if Ether is sent to this contract by mistake
    function fallback() external {        
        revert();
    }

    //Must have payable modifier because we need this function to accept Ether 
    function depositEther() payable public {
        //Add amount to users balance.
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);

        //Emit event
        emit Deposit(ETHER, msg.sender,msg.value,tokens[ETHER][msg.sender]);
   
    }

    function depositToken(address _token, uint _amount) public {
        //Dont Allow Ether Deposit
        require(_token !=ETHER);

        //Our token gets transferred
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        
        //Add amount to users balance.
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);

        //Emit event
        emit Deposit(_token, msg.sender,_amount,tokens[_token][msg.sender]);
    }

}