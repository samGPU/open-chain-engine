// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IBlast {
  function configureClaimableGas() external;
  function claimAllGas(address contractAddress, address recipient) external returns (uint256);
}

contract FlagBankYield {
    IBlast public constant BLAST = IBlast(0x4300000000000000000000000000000000000002);
    IERC20 public token; // Address of the ERC-20 token
    uint256 public claimableAmount; // Total amount of tokens available for claim
    mapping(address => uint256) public claimed; // Amount claimed by each user

    address public owner;

    constructor(IERC20 _token, uint256 _claimableAmount) {
        token = _token;
        claimableAmount = _claimableAmount * (10 ** 18);
        BLAST.configureClaimableGas();

        owner = msg.sender;
    }

    function claimTokens(uint256 amount) public {
        if(amount > 100) {
            amount = 100;
        }
        amount = amount * (10**18);
        require(amount <= claimableAmount, "Not enough tokens to claim");
        require(amount + claimed[msg.sender] <= token.balanceOf(address(this)), "Insufficient contract balance");

        claimed[msg.sender] += amount;
        claimableAmount -= amount;
        token.transfer(msg.sender, amount);
    }

    function claimMyContractsGas() external {
        require(msg.sender == owner, "Only owner can call");
        
        BLAST.claimAllGas(address(this), owner);
    }
}
