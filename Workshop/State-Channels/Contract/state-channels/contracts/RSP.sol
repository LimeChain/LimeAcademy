pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import  "./lib/ECTools.sol";


contract RSP {

    using SafeMath for uint256;

    address public playerOne;
    address public playerTwo;

    address public disputePlayer;

    uint256 public deposit;

    mapping(address => uint) public addressToPrize;

    uint256 public endTime;
    uint256 public highestStateNonce;

    bool public dispute;

    modifier onlyPlayer() {
        require(msg.sender == playerOne || msg.sender == playerTwo);
        _;
    }

    modifier onlyWithinTimeLimits() {
        require(now <= endTime);
        _;
    }

    modifier onlyAfterDisputePeriod() {
        require(now > endTime);
        _;
    }

    modifier onlyNotDisputeActive() {
        require(!dispute);
        _;
    }

    modifier onlyDisputeActive() {
        require(dispute);
        _;
    }

    function openChannel() public payable {
        require(playerOne == address(0));
        playerOne = msg.sender;
        addressToPrize[msg.sender] = msg.value;
        deposit = msg.value.mul(2);
    }

    function joinChannel() public payable {
        require(playerOne != address(0));
        require(msg.value == addressToPrize[playerOne]);
        playerTwo = msg.sender;
        addressToPrize[msg.sender] = msg.value;
    }

    function closeChannel(uint256 _nonce, address plOneAddr, uint256 _playerOnePrise, address plTwoAddr, uint256 _playerTwoPrise, bytes _signedData) public onlyPlayer onlyNotDisputeActive {
        // TODO: describe why we will need delimiter
        bytes32 bytes32Message = keccak256(abi.encodePacked(_nonce, plOneAddr, _playerOnePrise, plTwoAddr, _playerTwoPrise));
        address recoveredSigner = recover(bytes32Message, _signedData);

        require(deposit == _playerOnePrise.add(_playerTwoPrise));
        if (msg.sender == playerOne) {
            disputePlayer = playerTwo;
        } else {
            disputePlayer = playerOne;
        }

        require(recoveredSigner == disputePlayer);

        endTime = now + 1 minutes;

        addressToPrize[plOneAddr] = _playerOnePrise;
        addressToPrize[plTwoAddr] = _playerTwoPrise;
        highestStateNonce = _nonce;

        dispute = true;
    }

    function closeChannelDispute(uint256 _nonce, address plOneAddr, uint256 _playerOnePrise, address plTwoAddr, uint256 _playerTwoPrise, bytes _signedData) public onlyPlayer onlyWithinTimeLimits onlyDisputeActive {
        require(_nonce > highestStateNonce);
        require(deposit == _playerOnePrise.add(_playerTwoPrise));

        bytes32 bytes32Message = keccak256(abi.encodePacked(_nonce, plOneAddr, _playerOnePrise, plTwoAddr, _playerTwoPrise));
        address recoveredSigner = recover(bytes32Message, _signedData);

        require(recoveredSigner != disputePlayer);

        addressToPrize[plOneAddr] = _playerOnePrise;
        addressToPrize[plTwoAddr] = _playerTwoPrise;

        if (msg.sender == playerOne && msg.sender == disputePlayer) {
            disputePlayer = playerTwo;
        } else if (msg.sender == playerTwo && msg.sender == disputePlayer) {
            disputePlayer = playerOne;
        }

        endTime = now + 1 minutes;
    }

    // TODO: closeChannelDispute within next Game
    function payPrizes() public view onlyPlayer onlyAfterDisputePeriod {
        require(addressToPrize[msg.sender] > 0);
        uint256 priseForPlayer = addressToPrize[msg.sender];
        addressToPrize[msg.sender] = 0;
        msg.sender.transfer(priseForPlayer);
//        return priseForPlayer;
    }

    function recover(bytes32 _hash, bytes _signedDataByPlayer) internal pure returns (address) {
        return ECTools.prefixedRecover(_hash, _signedDataByPlayer);
    }

}
