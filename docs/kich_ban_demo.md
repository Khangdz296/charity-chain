# Detailed Demo Script

Use this script when presenting the project.

## 1. Opening Statement

This project demonstrates a charity fund managed by smart contracts. Donors can inspect the campaign plan before donating. The charity cannot withdraw funds freely. Each payment is tied to a milestone, evidence CID, verifier review, release event, and final claim transaction.

## 2. Preparation

Run three terminals:

```powershell
npm.cmd run node
npm.cmd run deploy:local
npm.cmd run frontend
```

Open:

```text
http://127.0.0.1:5500
```

MetaMask must use:

```text
Network: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
```

Import these roles:

```text
Account #0: Admin / deployer
Account #1: Charity
Account #2: Verifier 1
Account #3: Verifier 2
Account #4: Verifier 3
Account #5: Donor
```

## 3. Scenario A: Normal Release And Claim

### Step 1: Load The Campaign

Connect the wallet, paste the factory address, load the factory, paste the campaign contract address, and load the contract.

Explain:

```text
The contract shows funding goal, donated amount, charity address, verifier role, and milestone count.
```

### Step 2: Donor Donates

Switch to the donor wallet.

In `Donor`:

```text
Amount: 0.02
Action: Donate
```

Explain:

```text
The money is now inside the smart contract, not inside the charity wallet.
```

### Step 3: Charity Submits Evidence

Switch to the charity wallet.

In `Charity`:

```text
Milestone ID: 0
CID: ipfs://demo-milestone-0
Action: Submit milestone
```

Explain:

```text
The CID points to off-chain evidence. The blockchain stores the reference and the submission time.
```

### Step 4: Challenge Period

Wait until the challenge period ends.

Explain:

```text
During this time, verifiers can reject the milestone if the evidence is suspicious.
```

### Step 5: Release

In `Milestones`:

```text
Milestone ID: 0
Action: Release
```

Explain:

```text
Release does not transfer ETH yet. It marks the milestone as approved for payment and claimable.
```

### Step 6: Claim

Switch to the charity wallet.

In `Charity`:

```text
Milestone ID: 0
Action: Claim milestone
```

Explain:

```text
This is the transaction that transfers ETH from the contract to the charity wallet.
```

## 4. Scenario B: Dispute And Resolution

### Step 1: Submit Milestone 1

Switch to the charity wallet.

```text
Milestone ID: 1
CID: ipfs://demo-milestone-1
Action: Submit milestone
```

### Step 2: Verifier Rejects

Switch to verifier 1.

```text
Milestone ID: 1
Reason: Invoice cannot be verified
Action: Reject
```

Explain:

```text
One verifier is enough to stop immediate release.
```

### Step 3: Two Verifiers Resolve

Verifier 1 votes resolve.

Switch to verifier 2 and vote resolve again.

Explain:

```text
The contract requires 2 of 3 verifier votes to resolve the dispute.
```

### Step 4: Release And Claim

Release milestone `1`, then switch to the charity wallet and claim milestone `1`.

Explain:

```text
The dispute was recorded on-chain, the resolution votes were recorded, and payment only happened after the claim transaction.
```

## 5. Key Points For Defense

- Blockchain does not automatically verify real-world invoices.
- Verifiers inspect evidence off-chain.
- The smart contract makes the process transparent and auditable.
- Donated funds stay in the contract until milestone conditions are satisfied.
- `release()` and `claimMilestone()` are separated to make the approval and transfer steps explicit.
