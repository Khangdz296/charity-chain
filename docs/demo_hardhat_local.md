# Hardhat Local Demo Guide

This is the recommended demo flow. It does not require Sepolia, faucets, or real ETH.

## 1. Start Hardhat Local

Open terminal 1:

```powershell
npm.cmd run node
```

Keep this terminal open. Hardhat will print local accounts and private keys.

## 2. Add The Network To MetaMask

Create a custom network:

```text
Network name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
```

Import these local accounts from the Hardhat terminal:

```text
Account #0: Admin / deployer
Account #1: Charity
Account #2: Verifier 1
Account #3: Verifier 2
Account #4: Verifier 3
Account #5: Donor
```

These private keys are public demo keys. Never use them on mainnet.

## 3. Deploy Contracts

Open terminal 2:

```powershell
npm.cmd run deploy:local
```

The script prints:

```text
Factory : 0x...
Contract: 0x...
```

Copy both addresses.

## 4. Start The Frontend

Open terminal 3:

```powershell
npm.cmd run frontend
```

Open:

```text
http://127.0.0.1:5500
```

In the frontend:

1. Connect MetaMask.
2. Paste `Factory` into `Factory Address`, then load it.
3. Paste `Contract` into `Contract Address`, then load it.

## 5. Normal Milestone Demo

1. Switch MetaMask to the donor account.
2. In `Donor`, donate `0.02 ETH`.
3. Switch MetaMask to the charity account.
4. In `Charity`, submit milestone `0` with `ipfs://demo-milestone-0`.
5. Wait for the challenge period to end.
6. In `Milestones`, release milestone `0`.
7. In `Charity`, claim milestone `0`.

Expected result:

- milestone state becomes `Released`;
- milestone claim status becomes `Claimed`;
- the charity account receives ETH.

## 6. Dispute Demo

1. Switch to the charity account.
2. Submit milestone `1` with `ipfs://demo-milestone-1`.
3. Switch to verifier 1.
4. Reject milestone `1` with a reason.
5. Vote resolve as verifier 1.
6. Switch to verifier 2.
7. Vote resolve as verifier 2.
8. In `Milestones`, release milestone `1`.
9. Switch to the charity account.
10. In `Charity`, claim milestone `1`.

Expected result:

- one verifier can stop immediate payment;
- two verifier votes resolve the dispute;
- `release()` makes the milestone claimable;
- `claimMilestone()` transfers ETH to the charity.

## 7. Common Errors

| Error | Fix |
|---|---|
| MetaMask has no ETH | Check that the selected network is `Hardhat Local` |
| Cannot load contract | Check the address and make sure the Hardhat node is still running |
| `Only charity` | Switch MetaMask to the charity account |
| `Only verifier` | Switch MetaMask to verifier 1, 2, or 3 |
| `Funding not complete` | Donate until the full funding goal is reached |
| `Not releasable` | Wait for the challenge period or resolve the dispute |
| `Not claimable` | Release the milestone before claiming |
