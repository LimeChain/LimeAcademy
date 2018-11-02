pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract EmergencyStop is Ownable {

    bool public stopped = false;

    modifier haltInEmergency {
        if (!stopped) _;
    }

    modifier enableInEmergency {
        if (contractStopped) _;
    }

    function toggleContractStopped() public onlyOwner {
        stopped = !stopped;
    }

    function deposit() public payable haltInEmergency {
        // some code
    }

    function withdraw() public view enableInEmergency {
        // some code
    }

}