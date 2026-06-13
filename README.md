# Charity Chain

Graduation/course project: **Researching Blockchain Applications to Improve Transparency in Charity Cash Flow Management**.

Charity Chain is a local Hardhat demo that shows how a charity fund can be managed by smart contracts. Donors send ETH into a campaign contract, the charity can only unlock funds by milestones, verifiers can dispute weak evidence, and every important action is recorded on-chain.

## Core Features

- Solidity smart contracts for milestone-based charity fund management.
- Campaign factory for creating and indexing charity campaigns.
- Fixed funding goal, milestone amounts, milestone purposes, charity wallet, and verifier wallets.
- IPFS CID submission for off-chain evidence such as invoices, images, and reports.
- Challenge period where verifiers can reject a submitted milestone.
- Dispute flow: 1 verifier can reject; 2 of 3 verifiers are required to resolve a dispute.
- Two-step disbursement: `release()` marks a milestone claimable, then the charity calls `claimMilestone()` to receive ETH.
- Dark dashboard frontend using HTML, CSS, JavaScript, MetaMask, and ethers.js.
- Fully local Hardhat demo. No testnet, faucet, or real money is required.

## Tech Stack

- Solidity `0.8.24`
- Hardhat `2.x`
- ethers.js `6.x`
- MetaMask
- HTML/CSS/JavaScript
- IPFS or Pinata for off-chain evidence

## Project Structure

```text
.
|-- contracts/
|   |-- CharityCampaignFactory.sol
|   `-- CharityMilestoneFund.sol
|-- frontend/
|   |-- index.html
|   |-- app.js
|   |-- styles.css
|   |-- server.mjs
|   `-- vendor/
|-- scripts/
|   `-- deploy-local.js
|-- docs/
|-- diagrams/
|-- appendix/
|-- hardhat.config.js
|-- package.json
`-- PLAN.md
```

## Installation

Install dependencies:

```powershell
npm.cmd install
```

Compile the contracts:

```powershell
npm.cmd run hardhat:compile
```

Optional ABI/BIN compilation:

```powershell
npm.cmd run compile
```

## Local Demo With Hardhat

### 1. Start the local blockchain

Open terminal 1:

```powershell
npm.cmd run node
```

Keep this terminal open during the demo. Hardhat prints local accounts and private keys. These accounts only exist for local testing.

### 2. Add Hardhat Local to MetaMask

Add a custom network in MetaMask:

```text
Network name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
```

Import the Hardhat private keys you want to use as admin, charity, verifiers, and donor.

### 3. Deploy the demo contracts

Open terminal 2:

```powershell
npm.cmd run deploy:local
```

The script prints both addresses:

```text
Factory : 0x...
Contract: 0x...
```

Use `Factory` when you want to create or browse campaigns from the frontend. Use `Contract` when you want to load the pre-created demo campaign directly.

### 4. Start the frontend

Open terminal 3:

```powershell
npm.cmd run frontend
```

Open:

```text
http://127.0.0.1:5500
```

In the app:

1. Click `Connect Wallet`.
2. Paste the factory address into `Factory Address`, then click `Load Factory`.
3. Paste the campaign contract address into `Contract Address`, then click `Load Contract`.
4. Use the `Factory`, `Donor`, `Charity`, `Verifier`, and `Milestones` tabs for the demo.

## Demo Accounts

The local deployment script uses these Hardhat accounts by role:

```text
Account #0: Admin / deployer
Account #1: Charity
Account #2: Verifier 1
Account #3: Verifier 2
Account #4: Verifier 3
Account #5: Donor
```

The donor is not restricted by the contract. Any Hardhat account with ETH can donate.

## Demo Scenario A: Normal Milestone Release

1. Select the donor wallet in MetaMask.
2. In `Donor`, donate enough ETH to reach the campaign goal, for example `0.02 ETH`.
3. Select the charity wallet.
4. In `Charity`, submit milestone `0` with an evidence CID, for example `ipfs://demo-milestone-0`.
5. Wait until the challenge period ends.
6. In `Milestones`, release milestone `0`.
7. Select the charity wallet if it is not already selected.
8. In `Charity`, claim milestone `0`.

Meaning: if no verifier rejects the evidence during the challenge period, the milestone becomes releasable. `release()` records that the milestone is approved for payment, and `claimMilestone()` transfers ETH to the charity.

## Demo Scenario B: Dispute And Resolution

1. Select the charity wallet.
2. In `Charity`, submit milestone `1`.
3. Select verifier 1.
4. In `Verifier`, reject milestone `1` with a reason, for example `Invoice cannot be verified`.
5. The milestone moves to `Disputed`.
6. Verifier 1 votes resolve.
7. Verifier 2 votes resolve.
8. In `Milestones`, release milestone `1`.
9. Select the charity wallet.
10. In `Charity`, claim milestone `1`.

Meaning: one verifier can stop immediate payment, but two verifier votes are required to resolve the dispute and continue the disbursement process.

## Creating A New Campaign From The Frontend

1. Load the factory address.
2. Connect with the admin/deployer wallet.
3. Open the `Factory` tab.
4. Enter the charity address, three verifier addresses, challenge period, funding duration, milestone amounts, and purposes.
5. Click `Create Campaign`.
6. The frontend selects the newly created campaign automatically.

Only the factory admin can create, deactivate, or reactivate campaigns.

## IPFS Evidence

For a quick local demo, fake CIDs are acceptable:

```text
ipfs://demo-milestone-1
```

For a more realistic demo:

1. Upload an invoice, image, or report to Pinata or another IPFS service.
2. Copy the CID.
3. Submit it as:

```text
ipfs://<CID>
```

Verifier check URL:

```text
https://gateway.pinata.cloud/ipfs/<CID>
```

The blockchain does not decide whether an invoice is true or false. Verifiers inspect off-chain evidence, while the smart contract records the CID, rejection, resolution votes, release, and claim events.

## Useful Commands

```powershell
npm.cmd run hardhat:compile
npm.cmd run node
npm.cmd run deploy:local
npm.cmd run frontend
```

## Troubleshooting

### MetaMask shows no ETH

Check that MetaMask is using `Hardhat Local` and that you imported a Hardhat account. If you restarted the Hardhat node, import accounts again if needed and deploy the contracts again.

### The frontend cannot find the contract

You are probably on the wrong network or using an old address. Run:

```powershell
npm.cmd run deploy:local
```

Then copy the latest `Factory` and `Contract` addresses into the frontend.

### State disappears after closing the node

Hardhat Local is temporary. If you close the terminal running `npm.cmd run node`, blockchain state is lost. Start the node and deploy again.

### Release succeeded but charity balance did not increase

This is expected in the current design. `release()` only marks the milestone as claimable. The charity must call `claimMilestone(milestoneId)` to receive ETH.

## Project Documents

- [Complete report](docs/bao_cao_hoan_chinh.md)
- [Smart contract design](docs/thiet_ke_smart_contract.md)
- [Hardhat local demo guide](docs/demo_hardhat_local.md)
- [Detailed demo script](docs/kich_ban_demo.md)
- [Defense Q&A](appendix/huong_dan_bao_ve.md)
- [Flowchart](diagrams/flowchart.md)
- [Sequence diagram](diagrams/sequence.md)

## Defense Notes

This project should not be presented as a tool that guarantees real-world truth. The main limitation is the **oracle problem**: a blockchain cannot automatically know whether an off-chain invoice, image, or delivery report is authentic.

The value of the system is that it:

- publishes the spending plan before donations are accepted;
- keeps donated funds inside a smart contract;
- requires milestone evidence before funds can be unlocked;
- records dispute and resolution actions on-chain;
- makes the payment process auditable and harder to alter quietly.
