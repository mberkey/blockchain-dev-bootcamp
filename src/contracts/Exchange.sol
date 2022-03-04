// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0 < 0.9.0;
import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

//Will deposit & withdraw
//Manage Orders: Make & Cancel
//Handle Trades: Charge fees

// TODO:
// [x] Set the fee account
// [x] Deposit Ether
// [x] Withdraw Ether
// [x] Deposit tokens
// [x] Withdraw tokens
// [x] Check balances
// [x] Make order
// [ ] Cancel order
// [ ] Fill order
// [ ] Charge fees

contract Exchange{
    using SafeMath for uint;
    uint256 public feePercent; 
    address public feeAccount; //Account to receive tx fees
    address constant ETHER = address(0); //Store Ether tokens in mapping w blank address
    uint256 public orderCount;
  
    //Mapping for tokens in exchange
    //first address is token address, second is user address and tokens held by user
    mapping(address => mapping(address => uint256)) public tokens;
    
    //Store the orders Id, and each order.
    mapping(uint256 => _Order) public orders;

    //Store canceled orders
    mapping(uint256 => bool)public orderCancelled;

    //Set Fee Account
    constructor (address _feeAccount, uint256 _feePercent ) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(uint256 id,address user,address tokenGet,uint256 amountGet,address tokenGive,uint256 amountGive,uint256 timestamp);
    event Cancel(uint256 id,address user,address tokenGet,uint256 amountGet,address tokenGive,uint256 amountGive,uint256 timestamp);


    //Model the order
    struct _Order{
        uint256 id;
        address user;          //Person who made order
        address tokenGet;      
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    //Fallback: reverts if Ether is sent to this contract by mistake
    function fallback() pure external {        
        revert();
    }

    //Must have payable modifier because we need this function to accept Ether 
    function depositEther() payable public {
        //Add amount to users balance.
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);

        //Emit event
        emit Deposit(ETHER, msg.sender,msg.value,tokens[ETHER][msg.sender]);   
    }

    function withdrawEther(uint _amount) public {
        require(tokens[ETHER][msg.sender]>= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);

        //Solidity prefered method of sending ETH forwards all gas. 
        //(bool success, ) = msg.sender.call{value:_amount}("");
        //For Solidity  0.7+ :( 

        msg.sender.transfer(_amount);
        emit Withdraw(ETHER,msg.sender,_amount,tokens[ETHER][msg.sender]);
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

    function withdrawToken(address _token, uint256 _amount) public{
        require(_token !=ETHER);
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] =   tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender,_amount));
        emit Withdraw(ETHER,msg.sender,_amount,tokens[ETHER][msg.sender]);
    }

    function balanceOf(address _token, address _user) public view returns (uint256){
        return tokens[_token][_user];
    }

    //Add order to storage
    //token you want to get, amount in that, token youre giving, amount in that
    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(orderCount, msg.sender,_tokenGet, _amountGet, _tokenGive, _amountGive, now);
        emit Order(orderCount, msg.sender,_tokenGet, _amountGet, _tokenGive, _amountGive, now);
    }

    function cancelOrder(uint256 _id) public{
        _Order storage _order = orders[_id];
        
        //Must by "my" order
        require(address(_order.user) == msg.sender);
        
        //Order must exist
        require(_order.id == _id); 
        
        orderCancelled[_id] = true;
        emit Cancel(_order.id,msg.sender,_order.tokenGet, _order.amountGet,_order.tokenGive, _order.amountGive,_order.timestamp);

    }
}