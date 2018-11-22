pragma solidity ^0.4.24;

contract LimeLoop {

	uint funds = 1 wei;

    function sendFunds(address[] _addressesToFund) public {
      
	  for (uint i = 0 ; i < _addressesToFund.length; i++) {
		  _addressesToFund[i].transfer(funds);
	  }
    }

	function () public payable {} 
}