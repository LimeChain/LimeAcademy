pragma solidity ^0.4.23;


contract IDelegate1 {

    function getX() public view returns (uint256);
    function setX(uint256 _x) public;
    function upgradeImpl(address _impl) public;

}