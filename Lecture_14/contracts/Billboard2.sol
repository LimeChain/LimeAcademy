pragma solidity ^0.4.23;

import "./Upgradeability/OwnableUpgradeableImplementation/OwnableUpgradeableImplementation.sol";
import "./IBillboard2.sol";

contract Billboard2 is IBillboard2, OwnableUpgradeableImplementation {

    uint256 public price = 1 ether;
    address public billboardOwner;
    address[] public historyOfOwners;
    mapping(address => uint256) public moneySpent;
    string public slogan;
    uint256 public time;

    /**
     * modifiers
     */

    modifier onlyPositive(uint256 newPrice) {
        require(newPrice > 0, "The price cannot be 0");
        _;
    }

    /**
     * functions
     */

    function buy(string newSlogan, uint256 newTime) public payable {
        require(msg.value >= price, "The ether sent was too low");

        billboardOwner = msg.sender;
        historyOfOwners.push(msg.sender);
        moneySpent[msg.sender] += msg.value;
        slogan = newSlogan;
        time = newTime;

        emit LogBillboardBought(msg.sender, msg.value, newSlogan);
    }

    function getSlogan() public view returns (string) {
        return slogan;
    }

    function getTime() public view returns (uint256) {
        return time;
    }

    function setPrice(uint256 newPrice) public onlyOwner onlyPositive(newPrice) {
        price = newPrice;
    }

    function getPrice() public view returns (uint256) {
        return price;
    }

    function historyLength() public view returns (uint256) {
        return historyOfOwners.length;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;

        require(balance > 0, "Contract balance is 0");

        owner.transfer(address(this).balance);

        emit LogWithdrawal(balance, now);
    }

}