pragma solidity ^0.4.23;
import "./BillboardOracle.sol";


contract Ownable {

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "This transaction was not sent by the owner");
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

}

contract Billboard is Ownable {

    uint256 public price = 1 ether;
    address public billboardOwner;
    address[] public historyOfOwners;
    mapping(address => uint256) public moneySpent;
    string public slogan;
    BillboardOracle public priceOracle;

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

    constructor(address _oracleAddress, string _slogan) {
        require(_oracleAddress != address(0));
        priceOracle = BillboardOracle(_oracleAddress);
        slogan = _slogan;
    }

    /**
     * functions
     */

    function buy(string newSlogan) public payable {
        require(msg.value >= price, "The ether sent was too low");

        billboardOwner = msg.sender;
        historyOfOwners.push(msg.sender);
        moneySpent[msg.sender] += msg.value;
        slogan = newSlogan;

        emit LogBillboardBought(msg.sender, msg.value, newSlogan);
    }

    function setPrice(uint256 newPrice) public onlyOwner onlyPositive(newPrice) {
        price = newPrice;
    }

    function getPriceInUSD() public view returns(uint256){
        uint256 priceInUSD = priceOracle.ethPriceInUSD();
        return priceInUSD*price;
    } 

    function moneySpentInUSD() public view returns(uint256) {
        uint256 priceInUSD = priceOracle.ethPriceInUSD();
        return moneySpent[msg.sender] * priceInUSD;
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