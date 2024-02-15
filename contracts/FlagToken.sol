// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

contract FlagToken is ERC20 {
    uint constant _initial_supply = 1000000 * (10**18);

    constructor() ERC20("FlagToken", "FLAG") {
        _mint(msg.sender, _initial_supply);
    }
}