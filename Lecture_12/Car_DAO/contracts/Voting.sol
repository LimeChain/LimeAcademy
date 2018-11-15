pragma solidity ^0.4.24;

import "./NewCarProposal.sol";
import "./../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Voting is Ownable {

    uint public constant VOTING_REWARD = 500 finney; // 0.5 ethers

    address public carShopContract;

    mapping(address => uint) public voters;
    mapping(address => NewCarProposal) public proposals;
    mapping(address => address[]) public votersProposals;


    modifier onlyVoter() {
        require(voters[msg.sender] > 0, "Non-existent voter");
        _;
    }

    modifier onlyCarShopContract() {
        require(msg.sender == carShopContract, "Only car shop contract");
        _;
    }

    modifier onlyEnoughVotingFunds(){
        require(voters[msg.sender] >= VOTING_REWARD, "Not enough voting funds");
        _;
    }
    
    function addVoter(address newVoter) public payable onlyCarShopContract {
        voters[newVoter] += msg.value;
    }

    function addProposal(address proposalsAddress) public onlyOwner {
        proposals[proposalsAddress] = NewCarProposal(proposalsAddress);
    }

    function vote(address proposalAddress) public onlyVoter onlyEnoughVotingFunds {
        require(proposals[proposalAddress] != address(0x0), "Proposal does not exists");
        
        proposals[proposalAddress].addVote(msg.sender);
        votersProposals[msg.sender].push(proposalAddress);

        msg.sender.transfer(VOTING_REWARD);
    }

    function withdrawVotingFunds() public onlyVoter {
        require(voters[msg.sender] < VOTING_REWARD, "You should vote");
        
        uint votingFunds = voters[msg.sender];
        voters[msg.sender] = 0;

        msg.sender.transfer(votingFunds);
    }

    function setCarShopContract(address _carShopContract) public onlyOwner {
        carShopContract = _carShopContract;
    }
}