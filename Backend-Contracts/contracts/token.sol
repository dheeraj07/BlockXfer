//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenOZ is ERC20
{
    constructor(uint256 totalSupply, string memory name, string memory symbol) ERC20(name, symbol)
    {
        _mint(msg.sender, totalSupply * (10 ** decimals()));
    }
}