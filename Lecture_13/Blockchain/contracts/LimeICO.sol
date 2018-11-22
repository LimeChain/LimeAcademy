// pragma solidity ^0.4.24;

// contract LimeICO {

// bool private _finalized;
// uint256 private _goal;
// uint256 private _weiRaised;



// function finalized() public view returns (bool) {
//     return _finalized;
//   }

// function goalReached() public view returns (bool) {
// 	return weiRaised() >= _goal;
//   }

//     function weiRaised() public view returns (uint256) {
//     return _weiRaised;
//   }

// function claimRefund(address[] refundees) public {
// 	require(finalized());
//    	require(!goalReached());

// 	for(uint256 i= 0 , i<refundees.length, i++) {
// 		uint256 payment = _deposits[refundees[i]];

//    		_deposits[refundeesp[i]] = 0;
// 		refundees[i].transfer(payment);

//     emit Withdrawn(refundees[i], payment);
// 	}
// }

// function withdraw(address payee) public {
	
// }

// }