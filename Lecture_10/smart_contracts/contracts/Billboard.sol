pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract Billboard is Ownable {

    uint256 public price = 50;
    address public billboardOwner;
    address[] public historyOfOwners;
    mapping(address => uint256) public moneySpent;
    string public slogan;
    address public billToken;

    constructor(address _billTokenContract) public {
        billToken = _billTokenContract;
    }

    /**
     * events
     */

    event LogBillboardBought(address buyer, uint256 paied, string slogan);
    event LogWithdrawal(uint256 amount, uint256 timestamp);

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

    function buy(string newSlogan, uint256 tokens) public {
        require(tokens > price, "The tokens sent was too low");

        billboardOwner = msg.sender;
        historyOfOwners.push(msg.sender);
        moneySpent[msg.sender] += tokens;
        slogan = newSlogan;
        price = tokens;

        require(ERC20(billToken).transferFrom(msg.sender, address(this), tokens));

        emit LogBillboardBought(msg.sender, tokens, newSlogan);
    }

    function setPrice(uint256 newPrice) public onlyOwner onlyPositive(newPrice) {
        price = newPrice;
    }

    function historyLength() public view returns (uint256) {
        return historyOfOwners.length;
    }

    function withdraw() public onlyOwner {
        ERC20 billContract = ERC20(billToken);
        uint256 balance = billContract.balanceOf(address(this));
        billContract.transfer(owner, balance);

        emit LogWithdrawal(balance, now);
    }

}