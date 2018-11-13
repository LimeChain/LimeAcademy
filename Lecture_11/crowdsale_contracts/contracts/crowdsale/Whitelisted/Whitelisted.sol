pragma solidity ^0.4.21;

import "./../../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./../../../node_modules/openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";


contract Whitelisted is Ownable {

    mapping(address => uint) public preSalesSpecialUsers;
    mapping(address => bool) public publicSalesSpecialUsers;

    address public lister;

    event LogPresalesSpecialUserSet(address userAddress, uint userRate);
    event LogMultiplePresalesSpecialUsersSet(address[] userAddresses, uint userRate);
    event LogPublicsalesSpecialUserAdd(address addedUser);
    event LogMultiplePublicsalesSpecialUsersSet(address[] userAddresses);
    event LogPublicsalesSpecialUserRemove(address removedUser);
    event LogListerSet(address listerAddress);

    modifier onlyLister() {
        require(msg.sender == lister);
        
        _;
    }

    modifier notZeroAddress(address addressForValidation) {
        require(addressForValidation != address(0));
        _;
    }

    function addPreSalesSpecialUser(address user, uint userRate) external onlyLister notZeroAddress(user) {
        preSalesSpecialUsers[user] = userRate;

        emit LogPresalesSpecialUserSet(user, userRate);
    }

    function addPublicSalesSpecialUser(address user) external onlyLister notZeroAddress(user) {
        publicSalesSpecialUsers[user] = true;

        emit LogPublicsalesSpecialUserAdd(user);
    }

    function removePublicSalesSpecialUser(address user) external onlyLister notZeroAddress(user) {
        publicSalesSpecialUsers[user] = false;

        emit LogPublicsalesSpecialUserRemove(user);
    }

    function setLister(address newLister) external onlyOwner notZeroAddress(newLister) {
        lister = newLister;

        emit LogListerSet(newLister);
    }
}