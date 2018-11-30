pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./ECTools.sol";

contract MetaBatchProxy {

	address public owner;

	function() external payable {}

	constructor() public {
		owner = msg.sender;
		// TODO Relayer - change the owner
	}

	function getSigner(bytes32 raw, bytes memory sig) public pure returns(address signer) {
		return ECTools.prefixedRecover(raw, sig);
	}

	modifier onlyValidSignature(address[] memory target, uint256[] memory value, bytes[] memory data, bytes[] memory dataHashSignature) {
		// TODO limit the number of transactions

		// TODO loop through transactions and verify them
		
		_;
	}

	/**
     * @dev executes a transaction only if it is formatted and signed by the owner of this. Anyone can call execute. Nonce introduced as anti replay attack mechanism.
     * 
     * @param target - the contract to be called
     * @param value - the value to be sent to the target
     * @param data - the data to be sent to be target
     * @param dataHashSignature - signed bytes of the keccak256 of target, nonce, value and data keccak256(target, nonce, value, data)
     */

	function execute(address[] memory target, uint256[] memory value, bytes[] memory data, bytes[] memory dataHashSignature) public onlyValidSignature(target, value, data, dataHashSignature) returns (bool) {
		// TODO loop through the transactions and execute them
		return true;
	}

}
