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
        CharityMilestoneFund fund = new CharityMilestoneFund(
            charity,
            verifiers,
            amounts,
            purposes,
            challengePeriod,
            fundingDeadline
        );

        campaign = address(fund);
        uint256 campaignId = campaigns.length;
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
}
