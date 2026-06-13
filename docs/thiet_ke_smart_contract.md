# Smart Contract Design

## 1. Design Goal

The smart contract system is designed to improve transparency in charity fund management. It does not try to prove whether a real-world invoice is true. Instead, it enforces a public process:

- publish the spending plan before donations are accepted;
- keep donated funds inside a smart contract;
- require milestone evidence before funds can be unlocked;
- allow independent verifiers to dispute suspicious evidence;
- record donation, evidence, dispute, release, and claim actions on-chain.

## 2. Contracts

| Contract | Role |
|---|---|
| `CharityCampaignFactory` | Deploys and indexes charity campaign contracts |
| `CharityMilestoneFund` | Holds donated ETH and manages milestone states |

The factory admin can create campaigns. Each campaign has one charity wallet, three verifier wallets, fixed milestones, a challenge period, and a funding deadline.

## 3. Participants

| Participant | Role |
|---|---|
| Donor | Sends ETH to the campaign contract |
| Charity | Submits milestone evidence and claims approved funds |
| Verifier | Rejects weak evidence or votes to resolve a dispute |
| Factory admin | Creates, deactivates, and reactivates campaigns |
| Smart contract | Enforces the payment workflow |

## 4. Fixed Data At Deployment

Each `CharityMilestoneFund` contract stores:

- factory address;
- campaign id;
- charity address;
- three verifier addresses;
- milestone amounts;
- milestone purposes;
- challenge period;
- funding deadline.

`fundingGoal` is calculated as the sum of all milestone amounts.

## 5. Milestone State Machine

| State | Meaning |
|---|---|
| `Planned` | The milestone exists but no evidence has been submitted |
| `Submitted` | The charity submitted evidence and the challenge period started |
| `Disputed` | At least one verifier rejected the milestone |
| `Approved` | A disputed milestone received 2 of 3 resolve votes |
| `Released` | The milestone is approved for payment and can be claimed |

Important: `Released` does not mean ETH has already been transferred. It means the milestone is claimable. The charity receives ETH only after calling `claimMilestone()`.

## 6. Funding Flow

1. Donors call `donate()`.
2. The contract accepts donations until `fundingGoal` is reached.
3. If a donation is larger than the remaining goal, the contract records the accepted amount and refunds the excess.
4. If the funding deadline passes before the goal is reached, donors can call `refund()`.

## 7. Normal Milestone Flow

1. The charity calls `submitMilestone(milestoneId, evidenceCID)`.
2. The contract stores the evidence CID and submission timestamp.
3. Verifiers can reject during the challenge period.
4. If no verifier rejects, any address can call `release(milestoneId)` after the challenge period.
5. `release()` marks the milestone as `Released` and claimable.
6. The charity calls `claimMilestone(milestoneId)` to receive ETH.

## 8. Dispute Flow

1. A verifier calls `reject(milestoneId, reason)` during the challenge period.
2. The milestone state becomes `Disputed`.
3. Two of the three verifiers must call `voteResolve(milestoneId)`.
4. The milestone state becomes `Approved`.
5. Any address can call `release(milestoneId)`.
6. The charity calls `claimMilestone(milestoneId)` to receive ETH.

## 9. Main Functions

| Function | Caller | Purpose |
|---|---|---|
| `donate()` | Any donor | Sends ETH into the campaign |
| `refund()` | Donor | Refunds donations if the goal fails or the campaign is deactivated |
| `submitMilestone()` | Charity | Submits IPFS evidence |
| `resubmitMilestone()` | Charity | Replaces evidence after a dispute |
| `reject()` | Verifier | Rejects submitted evidence |
| `voteResolve()` | Verifier | Votes to resolve a dispute |
| `release()` | Any address | Marks a milestone as claimable |
| `claimMilestone()` | Charity | Transfers approved ETH to the charity |
| `getMilestone()` | Any address | Reads milestone details |

## 10. Safety Rules

- Only the charity can submit, resubmit, and claim milestones.
- Only registered verifiers can reject or vote resolve.
- A milestone can only be claimed once.
- Milestones must be submitted sequentially.
- `release()` uses `>= submittedAt + challengePeriod` to avoid a boundary-time dead zone.
- Campaign deactivation is blocked after any milestone has been released, so a claimable milestone cannot be frozen before the charity claims it.
- External ETH transfers are protected by a simple `nonReentrant` guard.

## 11. Limitations

- The contract cannot verify whether an invoice or image is true in the real world.
- IPFS only proves that a specific file is referenced by a CID.
- If two verifiers collude, a dispute can be resolved incorrectly.
- Real deployments should add stronger governance, verifier reputation, legal identity checks, and audit procedures.
