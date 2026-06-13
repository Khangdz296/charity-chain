// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICharityCampaignFactory {
    function isDeactivated(uint256 campaignId) external view returns (bool);
}

/// @title CharityMilestoneFund
/// @notice Demo contract for transparent charity disbursement by fixed milestones.
contract CharityMilestoneFund {
    enum MilestoneState {
        Planned,
        Submitted,
        Disputed,
        Approved,
        Released
    }

    struct Milestone {
        uint256 amount;
        string purpose;
        string evidenceCID;
        uint256 submittedAt;
        uint8 rejectCount;
        uint8 resolveVoteCount;
        MilestoneState state;
    }

    address public immutable factory;
    uint256 public immutable campaignId;
    address payable public immutable charity;
    uint256 public immutable fundingGoal;
    uint256 public immutable challengePeriod;
    uint256 public immutable fundingDeadline;
    address[3] public verifiers;

    uint256 public totalDonated;
    bool private locked;

    Milestone[] private milestones;
    mapping(address => uint256) public donations;
    mapping(address => bool) public isVerifier;
    mapping(uint256 => mapping(address => bool)) public hasRejected;
    mapping(uint256 => mapping(address => bool)) public hasVotedResolve;
    mapping(uint256 => bool) public milestoneClaimable;
    mapping(uint256 => bool) public milestoneClaimed;

    event DonationReceived(address indexed donor, uint256 amount);
    event MilestoneSubmitted(uint256 indexed milestoneId, string evidenceCID);
    event MilestoneRejected(uint256 indexed milestoneId, address indexed verifier, string reason);
    event DisputeResolved(uint256 indexed milestoneId);
    event MilestoneReleased(uint256 indexed milestoneId, address indexed charity, uint256 amount);
    event MilestoneClaimed(uint256 indexed milestoneId, address indexed charity, uint256 amount);
    event DonationRefunded(address indexed donor, uint256 amount);

    modifier onlyCharity() {
        require(msg.sender == charity, "Only charity");
        _;
    }

    modifier onlyVerifier() {
        require(isVerifier[msg.sender], "Only verifier");
        _;
    }

    modifier onlyActiveCampaign() {
        require(!_isDeactivated(), "Campaign is deactivated");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "Reentrancy blocked");
        locked = true;
        _;
        locked = false;
    }

    constructor(
        address _factory,
        uint256 _campaignId,
        address payable _charity,
        address[3] memory _verifiers,
        uint256[] memory _amounts,
        string[] memory _purposes,
        uint256 _challengePeriod,
        uint256 _fundingDeadline
    ) {
        require(_factory != address(0), "Invalid factory");
        require(_charity != address(0), "Invalid charity");
        require(_amounts.length > 0, "No milestones");
        require(_amounts.length == _purposes.length, "Length mismatch");
        require(_challengePeriod > 0, "Invalid challenge period");
        require(_fundingDeadline > block.timestamp, "Invalid funding deadline");

        factory = _factory;
        campaignId = _campaignId;
        charity = _charity;
        challengePeriod = _challengePeriod;
        fundingDeadline = _fundingDeadline;

        for (uint256 i = 0; i < 3; i++) {
            require(_verifiers[i] != address(0), "Invalid verifier");
            require(_verifiers[i] != _charity, "Verifier cannot be charity");
            for (uint256 j = 0; j < i; j++) {
                require(_verifiers[i] != _verifiers[j], "Duplicate verifier");
            }
            verifiers[i] = _verifiers[i];
            isVerifier[_verifiers[i]] = true;
        }

        uint256 total;
        for (uint256 i = 0; i < _amounts.length; i++) {
            require(_amounts[i] > 0, "Invalid amount");
            total += _amounts[i];
            milestones.push(
                Milestone({
                    amount: _amounts[i],
                    purpose: _purposes[i],
                    evidenceCID: "",
                    submittedAt: 0,
                    rejectCount: 0,
                    resolveVoteCount: 0,
                    state: MilestoneState.Planned
                })
            );
        }
        fundingGoal = total;
    }

    receive() external payable {
        donate();
    }

    function donate() public payable nonReentrant onlyActiveCampaign {
        require(msg.value > 0, "No ETH sent");
        require(block.timestamp <= fundingDeadline, "Funding deadline passed");

        uint256 acceptableAmount = msg.value;
        if (totalDonated + msg.value > fundingGoal) {
            acceptableAmount = fundingGoal - totalDonated;
            require(acceptableAmount > 0, "Funding goal already reached");

            // Refund excess
            uint256 excess = msg.value - acceptableAmount;
            (bool refunded, ) = payable(msg.sender).call{value: excess}("");
            require(refunded, "Refund failed");
        }

        donations[msg.sender] += acceptableAmount;
        totalDonated += acceptableAmount;

        emit DonationReceived(msg.sender, acceptableAmount);
    }

    function refund() external nonReentrant {
        if (!_isDeactivated()) {
            require(block.timestamp > fundingDeadline, "Deadline not passed");
            require(totalDonated < fundingGoal, "Goal was reached");
        }

        uint256 amount = donations[msg.sender];
        require(amount > 0, "No donation to refund");

        donations[msg.sender] = 0;
        totalDonated -= amount;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Refund failed");

        emit DonationRefunded(msg.sender, amount);
    }

    function submitMilestone(uint256 milestoneId, string calldata evidenceCID)
        external
        onlyCharity
        onlyActiveCampaign
    {
        require(totalDonated == fundingGoal, "Funding not complete");
        require(bytes(evidenceCID).length > 0, "Empty evidence CID");

        // Enforce sequential milestone submission
        if (milestoneId > 0) {
            require(milestones[milestoneId - 1].state == MilestoneState.Released,
                    "Previous milestone not released");
        }

        Milestone storage milestone = _milestone(milestoneId);
        require(milestone.state == MilestoneState.Planned, "Invalid state");

        milestone.evidenceCID = evidenceCID;
        milestone.submittedAt = block.timestamp;
        milestone.state = MilestoneState.Submitted;

        emit MilestoneSubmitted(milestoneId, evidenceCID);
    }

    function reject(uint256 milestoneId, string calldata reason)
        external
        onlyVerifier
        onlyActiveCampaign
    {
        Milestone storage milestone = _milestone(milestoneId);
        require(milestone.state == MilestoneState.Submitted, "Not submitted");
        require(block.timestamp < milestone.submittedAt + challengePeriod, "Challenge period ended");
        require(!hasRejected[milestoneId][msg.sender], "Already rejected");
        require(bytes(reason).length > 0, "Empty reason");

        hasRejected[milestoneId][msg.sender] = true;
        milestone.rejectCount += 1;
        milestone.state = MilestoneState.Disputed;

        emit MilestoneRejected(milestoneId, msg.sender, reason);
    }

    function resubmitMilestone(uint256 milestoneId, string calldata newEvidenceCID)
        external
        onlyCharity
        onlyActiveCampaign
    {
        Milestone storage milestone = _milestone(milestoneId);
        require(milestone.state == MilestoneState.Disputed, "Not disputed");
        require(bytes(newEvidenceCID).length > 0, "Empty evidence CID");

        // Reset dispute state
        milestone.evidenceCID = newEvidenceCID;
        milestone.submittedAt = block.timestamp;
        milestone.rejectCount = 0;
        milestone.resolveVoteCount = 0;
        milestone.state = MilestoneState.Submitted;

        // Clear rejection and resolve votes
        for (uint256 i = 0; i < 3; i++) {
            hasRejected[milestoneId][verifiers[i]] = false;
            hasVotedResolve[milestoneId][verifiers[i]] = false;
        }

        emit MilestoneSubmitted(milestoneId, newEvidenceCID);
    }

    function voteResolve(uint256 milestoneId)
        external
        onlyVerifier
        onlyActiveCampaign
    {
        Milestone storage milestone = _milestone(milestoneId);
        require(milestone.state == MilestoneState.Disputed, "Not disputed");
        require(!hasVotedResolve[milestoneId][msg.sender], "Already voted");

        hasVotedResolve[milestoneId][msg.sender] = true;
        milestone.resolveVoteCount += 1;

        if (milestone.resolveVoteCount >= 2) {
            milestone.state = MilestoneState.Approved;
            emit DisputeResolved(milestoneId);
        }
    }

    function release(uint256 milestoneId) external nonReentrant onlyActiveCampaign {
        Milestone storage milestone = _milestone(milestoneId);
        require(milestone.state != MilestoneState.Released, "Already released");

        bool optimisticApproved = milestone.state == MilestoneState.Submitted
            && block.timestamp > milestone.submittedAt + challengePeriod;
        bool disputeApproved = milestone.state == MilestoneState.Approved;
        require(optimisticApproved || disputeApproved, "Not releasable");

        milestone.state = MilestoneState.Released;
        milestoneClaimable[milestoneId] = true;

        emit MilestoneReleased(milestoneId, charity, milestone.amount);
    }

    function claimMilestone(uint256 milestoneId)
        external
        nonReentrant
        onlyActiveCampaign
    {
        require(msg.sender == charity, "Only charity");
        require(milestoneClaimable[milestoneId], "Not claimable");
        require(!milestoneClaimed[milestoneId], "Already claimed");

        Milestone storage milestone = _milestone(milestoneId);
        uint256 amount = milestone.amount;
        require(address(this).balance >= amount, "Insufficient balance");

        milestoneClaimed[milestoneId] = true;

        (bool sent, ) = charity.call{value: amount}("");
        require(sent, "Transfer failed");

        emit MilestoneClaimed(milestoneId, charity, amount);
    }

    function milestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    function hasAnyClaimedMilestone() external view returns (bool) {
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestoneClaimed[i]) {
                return true;
            }
        }
        return false;
    }

    function getMilestone(uint256 milestoneId)
        external
        view
        returns (
            uint256 amount,
            string memory purpose,
            string memory evidenceCID,
            uint256 submittedAt,
            uint8 rejectCount,
            uint8 resolveVoteCount,
            MilestoneState state
        )
    {
        Milestone storage milestone = _milestone(milestoneId);
        return (
            milestone.amount,
            milestone.purpose,
            milestone.evidenceCID,
            milestone.submittedAt,
            milestone.rejectCount,
            milestone.resolveVoteCount,
            milestone.state
        );
    }

    function _isDeactivated() private view returns (bool) {
        return ICharityCampaignFactory(factory).isDeactivated(campaignId);
    }

    function _milestone(uint256 milestoneId) private view returns (Milestone storage) {
        require(milestoneId < milestones.length, "Invalid milestone");
        return milestones[milestoneId];
    }
}
