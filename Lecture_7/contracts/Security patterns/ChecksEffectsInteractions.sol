pragma solidity ^0.4.23;


contract HoneyPot {

    mapping(address => uint256) public balances;
    mapping(address => bool) public approvedMembers;

    constructor(address[] members) public {
        for (uint256 i = 0; i < members.length; i++) {
            approvedMembers[members[i]] = true;
        }
    }

    function put() public payable {
        balances[msg.sender] += msg.value;
    }

    function get(uint256 value) public {
        // checks
        require(approvedMembers[msg.sender]);
        require(balances[msg.sender] >= value);

        // efects
        balances[msg.sender] -= value;

        // interactions
        require(msg.sender.call.value(value)());
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
        honeypot.get(msg.value);
    }

    function bal() public view returns (uint256) {
        return address(this).balance;
    }

    function () public payable {
        if (address(honeypot).balance >= msg.value) {
            honeypot.get(msg.value);
        }
    }

}