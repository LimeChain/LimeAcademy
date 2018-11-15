pragma solidity ^0.4.24;

import "./../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Car is Ownable {
    
    uint public price;
    address public owner;
    bytes32 public model;
    bytes32 public engine;
    
    constructor(uint _price, address _owner, bytes32 _model, bytes32 _engine) public{
        price = _price * 1 ether;
        owner = _owner;
        model = _model;
        engine = _engine;
    }

    function changeOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}