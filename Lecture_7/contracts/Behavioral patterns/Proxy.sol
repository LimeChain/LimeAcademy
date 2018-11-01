pragma solidity ^0.4.23;


contract Proxy {

    address public impl;

    constructor(address _impl) public {
        impl = _impl;
    }

    function() public payable {
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize)

            let result := delegatecall(gas, _dst, ptr, calldatasize, 0, 0)

            let size := returndatasize
            returndatacopy(ptr, 0, size)

            switch result
            case 0 {revert(ptr, size)}
            default {return (ptr, size)}
        }
    }

}