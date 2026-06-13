// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CharityMilestoneFund.sol";

/// @title CharityCampaignFactory
/// @notice Deploys CharityMilestoneFund campaigns and keeps an on-chain index.
contract CharityCampaignFactory {
    address public immutable admin;

    struct CampaignInfo {
        address campaign;
        address creator;
        address charity;
        uint256 fundingGoal;
        uint256 fundingDeadline;
        uint256 createdAt;
    }

    CampaignInfo[] private campaigns;
    mapping(uint256 => bool) public isDeactivated;
    mapping(uint256 => string) public deactivationReason;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed campaign,
        address indexed creator,
        address charity,
        uint256 fundingGoal,
        uint256 fundingDeadline
    );

    event CampaignDeactivated(
        uint256 indexed campaignId,
        address indexed campaign,
        string reason
    );

    event CampaignReactivated(
        uint256 indexed campaignId,
        address indexed campaign
    );

    constructor() {
        admin = msg.sender;
    }

    function createCampaign(
        address payable charity,
        address[3] calldata verifiers,
        uint256[] calldata amounts,
        string[] calldata purposes,
        uint256 challengePeriod,
        uint256 fundingDeadline
    ) external onlyAdmin returns (address campaign) {
        uint256 campaignId = campaigns.length;
        CharityMilestoneFund fund = new CharityMilestoneFund(
            address(this),
            campaignId,
            charity,
            verifiers,
            amounts,
            purposes,
            challengePeriod,
            fundingDeadline
        );

        campaign = address(fund);
        campaigns.push(
            CampaignInfo({
                campaign: campaign,
                creator: msg.sender,
                charity: charity,
                fundingGoal: fund.fundingGoal(),
                fundingDeadline: fundingDeadline,
                createdAt: block.timestamp
            })
        );

        emit CampaignCreated(
            campaignId,
            campaign,
            msg.sender,
            charity,
            fund.fundingGoal(),
            fundingDeadline
        );
    }

    function campaignCount() external view returns (uint256) {
        return campaigns.length;
    }

    function getCampaign(uint256 campaignId)
        external
        view
        returns (
            address campaign,
            address creator,
            address charity,
            uint256 fundingGoal,
            uint256 fundingDeadline,
            uint256 createdAt
        )
    {
        require(campaignId < campaigns.length, "Invalid campaign");
        CampaignInfo storage info = campaigns[campaignId];
        return (
            info.campaign,
            info.creator,
            info.charity,
            info.fundingGoal,
            info.fundingDeadline,
            info.createdAt
        );
    }

    function deactivateCampaign(uint256 campaignId, string calldata reason) external onlyAdmin {
        require(campaignId < campaigns.length, "Invalid campaign");
        require(!isDeactivated[campaignId], "Already deactivated");
        require(bytes(reason).length > 0, "Reason required");
        require(
            !CharityMilestoneFund(payable(campaigns[campaignId].campaign)).hasAnyReleasedMilestone(),
            "Cannot deactivate after funds have been released"
        );

        isDeactivated[campaignId] = true;
        deactivationReason[campaignId] = reason;

        emit CampaignDeactivated(campaignId, campaigns[campaignId].campaign, reason);
    }

    function reactivateCampaign(uint256 campaignId) external onlyAdmin {
        require(campaignId < campaigns.length, "Invalid campaign");
        require(isDeactivated[campaignId], "Not deactivated");

        isDeactivated[campaignId] = false;
        deactivationReason[campaignId] = "";

        emit CampaignReactivated(campaignId, campaigns[campaignId].campaign);
    }
}
