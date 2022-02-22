// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Token {
    //Token Name
    string public name = 'BerKoin';

    //Symbol
    string public symbol = 'BKN';

    //Decimals
    uint256 public decimals = 18;

    //Total Supply 
    uint256 public totalSupply;

    constructor() public {
        totalSupply = 1000000 * (10 ** decimals);

    }
}