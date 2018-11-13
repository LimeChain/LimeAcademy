pragma solidity ^0.4.21;

import "./../../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract KYC is Ownable {

    mapping(address => bool) public kycAddresses;

    modifier onlyKYCAddress(address methodInvoker) {
        require(kycAddresses[methodInvoker], "Method Invoker is not a kyc address");
        _;
    }

    function markAsKYCVerified(address kycCandidate) public onlyOwner {
        kycAddresses[kycCandidate] = true;
    }
}