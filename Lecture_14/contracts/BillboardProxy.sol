pragma solidity ^0.4.15;

import "./Upgradeability/UpgradeableProxy.sol";

contract BillboardProxy is UpgradeableProxy {
	constructor(address initialImplementation) UpgradeableProxy(initialImplementation) {}
}