pragma solidity ^0.5.0;

import "./ECTools.sol";

contract ECToolsTest {

	function recover(bytes32 _msg, bytes memory sig) public pure returns (address) {
		return ECTools.prefixedRecover(_msg, sig);
	}

}