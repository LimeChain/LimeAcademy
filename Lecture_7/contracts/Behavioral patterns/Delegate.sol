pragma solidity ^0.4.23;

import "./IDelegate.sol";


contract Delegate is IDelegate {

    address public impl;

    uint256 public x;

    function getX() public view returns (uint256) {
        return x;
    }

    function setX(uint256 _x) public {
        x = _x;
    }

    function upgradeImpl(address _impl) public {
        impl = _impl;
    }

}