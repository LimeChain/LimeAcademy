pragma solidity ^0.4.24;

/*
    Proposal statuses:
        0 -> NEW
        1 -> InProcess
        2 -> Done
        3 -> Expired
*/

contract NewCarProposal {

    address public proposalAdmin;

    address[] public proposalVoters;
    mapping(address => address) public voters;

    uint public votes;
    uint public endDate;
    bytes32 public proposalHash;
    uint public status = 0;

    modifier onlyProposalAdmin() {
        require(msg.sender == proposalAdmin, "Only proposal admin can execute operation");
        _;
    }

    modifier onlyOneVotePerProposal(address voter) {
        require(voters[voter] == address(0x0), "Only one vote per proposal is allowed");
        _;
    }

    modifier onlyInPeriod() {
        require(now <= endDate, "Proposal has been expired");
        _;
    }

    modifier onlyValidStatus(uint _status){
        require(_status <= 3, "Status is invalid");
        _;
    }

    constructor(bytes32 _proposalHash, uint _votes, uint _endDate, address _proposalAdmin) public {
        proposalHash = _proposalHash;
        votes = _votes;
        endDate = _endDate;
        proposalAdmin = _proposalAdmin;
    }

    function addVote(address voter) public onlyProposalAdmin onlyOneVotePerProposal(voter) onlyInPeriod {
        voters[voter] = voter;
        proposalVoters.push(voter);

        votes++;
    }

    function updateStatus(uint _status) public onlyProposalAdmin onlyValidStatus(_status) {
        status = _status;
    }
}