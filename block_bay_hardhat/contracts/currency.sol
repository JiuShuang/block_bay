// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// this is the buyer contract
contract currency is ERC20 {
    constructor() 
    ERC20("crypto currency", "C"){
             _mint(msg.sender, 1 * 10 ** 8 * 10 ** decimals());
        } 
}