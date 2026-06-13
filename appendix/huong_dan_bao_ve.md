# Defense Q&A Guide

## 1. What problem does the project solve?

The project addresses the lack of transparency in charity cash flow management. Instead of relying only on reports published after spending, the system fixes the spending plan in advance, keeps donated ETH inside a smart contract, and requires each milestone payment to go through evidence submission and verifier supervision.

## 2. Can blockchain prove that an invoice is real?

No. This is the oracle problem. Blockchain can prove that a CID, transaction, vote, or event was recorded and not quietly changed later. It cannot automatically know whether an off-chain invoice, photo, or report is true. Real-world verification is still done by verifiers and auditors.

## 3. What if the charity and verifiers collude?

No system can remove all collusion risk when humans are involved. The goal is to make fraud harder, more visible, and easier to audit. Every submit, reject, vote, release, and claim leaves an on-chain trace. In a real deployment, this should be combined with verifier identity, reputation, audits, and possible stake/slashing.

## 4. Why can one verifier reject?

The rejection threshold is intentionally low to prioritize safety before payment. If one verifier sees suspicious evidence, the milestone is paused. To continue, the system then requires 2 of 3 verifiers to vote resolve.

## 5. Why can anyone call `release()`?

This follows an optimistic automation model. Once the conditions are satisfied, unlocking a milestone should not depend on one specific wallet. Anyone can call `release()`, but it only marks the milestone as claimable. ETH is transferred only when the charity calls `claimMilestone()`.

## 6. Why not store full invoices on-chain?

Large files are expensive to store on-chain and may expose private data. The better design is to store files off-chain using IPFS or a pinning service, then store only the CID or hash reference on-chain.

## 7. What is the new point of the project?

The project is not about creating a new blockchain. The contribution is the milestone-based charity fund workflow:

- fixed spending plan before donation;
- funds held by smart contract;
- evidence-based milestone submission;
- verifier challenge period;
- 2-of-3 dispute resolution;
- separate `release()` and `claimMilestone()` steps for clearer auditability.

## 8. What are the main limitations?

The largest limitation is the oracle problem. The demo also simplifies verifier governance, real-world audit procedures, personal data protection, and legal identity checks. These are suitable directions for future work.

## 9. What should be demonstrated?

Demo two scenarios:

1. Normal flow: donor funds the campaign, charity submits evidence, no verifier rejects, the milestone is released, then the charity claims ETH.
2. Dispute flow: charity submits evidence, one verifier rejects, two verifiers vote resolve, the milestone is released, then the charity claims ETH.

During the demo, emphasize the event log because it is the transparent audit trail of the process.
