pragma solidity ^0.4.23;

import "./Upgradeability/OwnableUpgradeableImplementation/IOwnableUpgradeableImplementation.sol";

contract IBillboard is IOwnableUpgradeableImplementation {

    /**
     * events
     */

    event LogBillboardBought(address buyer, uint256 paied, string slogan);
    event LogWithdrawal(uint256 amount, uint256 timestamp);


    /**
     * functions
     */

    function buy(string newSlogan) public payable;

    function getSlogan() public view returns (string);

    function setPrice(uint256 newPrice) public;

    function getPrice() public view returns (uint256);

    function historyLength() public view returns (uint256);

    function withdraw() public;

}