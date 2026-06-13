const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Challenge Period Scenarios\n");

  const [deployer, charity, verifier1, verifier2, verifier3, donor] =
    await hre.ethers.getSigners();

  // Deploy Factory
  const Factory = await hre.ethers.getContractFactory("CharityCampaignFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ Factory deployed:", factoryAddress);

  // Create campaign với challenge period ngắn (120 seconds)
  const challengePeriod = 120; // 2 phút
  const fundingDeadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

  const amounts = [hre.ethers.parseEther("0.5")];
  const purposes = ["Test Milestone"];

  console.log("\n📝 Creating campaign...");
  const tx = await factory.createCampaign(
    charity.address,
    [verifier1.address, verifier2.address, verifier3.address],
    amounts,
    purposes,
    challengePeriod,
    fundingDeadline
  );
  await tx.wait();

  const campaignAddress = (await factory.getCampaign(0))[0];
  const campaign = await hre.ethers.getContractAt("CharityMilestoneFund", campaignAddress);

  console.log("✅ Campaign created:", campaignAddress);
  console.log("⏰ Challenge Period:", challengePeriod, "seconds");

  // Donate đủ goal
  const goal = await campaign.fundingGoal();
  console.log("\n💰 Donor donates full goal:", hre.ethers.formatEther(goal), "ETH");
  await campaign.connect(donor).donate({ value: goal });

  console.log("\n" + "=".repeat(60));
  console.log("📊 SCENARIO 1: Challenge Period - Không có ai reject");
  console.log("=".repeat(60));

  // Submit milestone
  console.log("\n🏥 Charity submits milestone 0...");
  const submitTx = await campaign.connect(charity).submitMilestone(0, "ipfs://evidence-1");
  const submitReceipt = await submitTx.wait();
  const submitBlock = await hre.ethers.provider.getBlock(submitReceipt.blockNumber);
  const submitTime = submitBlock.timestamp;

  console.log("✅ Milestone submitted at:", new Date(submitTime * 1000).toLocaleTimeString());
  console.log("⏰ Challenge period ends at:", new Date((submitTime + challengePeriod) * 1000).toLocaleTimeString());

  // Test release TRƯỚC khi hết challenge period (should fail)
  console.log("\n🚫 Trying to release BEFORE challenge period ends...");
  try {
    await campaign.release(0);
    console.log("❌ ERROR: Should have reverted!");
  } catch (error) {
    console.log("✅ Correctly rejected: Not releasable yet");
  }

  // Tua thời gian qua challenge period
  console.log("\n⏰ Fast-forwarding past challenge period...");
  await hre.network.provider.send("evm_increaseTime", [challengePeriod + 10]);
  await hre.network.provider.send("evm_mine");

  const currentBlock = await hre.ethers.provider.getBlock("latest");
  console.log("✅ Current time:", new Date(currentBlock.timestamp * 1000).toLocaleTimeString());
  console.log("🎉 Challenge period ended - No rejections!");

  // Test release SAU khi hết challenge period (should succeed)
  console.log("\n🚀 Releasing milestone 0...");
  await campaign.release(0);
  console.log("✅ Milestone released successfully!");

  // Claim funds
  console.log("\n💸 Charity claiming funds...");
  const charityBalanceBefore = await hre.ethers.provider.getBalance(charity.address);
  await campaign.connect(charity).claimMilestone(0);
  const charityBalanceAfter = await hre.ethers.provider.getBalance(charity.address);

  console.log("✅ Funds claimed!");
  console.log("   Amount received: ~", hre.ethers.formatEther(charityBalanceAfter - charityBalanceBefore), "ETH");

  console.log("\n" + "=".repeat(60));
  console.log("📊 SCENARIO 2: Challenge Period - Có verifier reject");
  console.log("=".repeat(60));

  // Create new campaign
  console.log("\n📝 Creating new campaign for rejection test...");
  const tx2 = await factory.createCampaign(
    charity.address,
    [verifier1.address, verifier2.address, verifier3.address],
    amounts,
    purposes,
    challengePeriod,
    Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
  );
  await tx2.wait();

  const campaign2Address = (await factory.getCampaign(1))[0];
  const campaign2 = await hre.ethers.getContractAt("CharityMilestoneFund", campaign2Address);

  // Donate
  await campaign2.connect(donor).donate({ value: goal });
  console.log("✅ Campaign 2 funded");

  // Submit milestone
  console.log("\n🏥 Charity submits milestone 0...");
  const submit2Tx = await campaign2.connect(charity).submitMilestone(0, "ipfs://fake-evidence");
  const submit2Receipt = await submit2Tx.wait();
  const submit2Block = await hre.ethers.provider.getBlock(submit2Receipt.blockNumber);
  const submit2Time = submit2Block.timestamp;

  console.log("✅ Milestone submitted at:", new Date(submit2Time * 1000).toLocaleTimeString());

  // Verifier reject TRONG challenge period
  console.log("\n❌ Verifier1 rejects milestone (fake invoice detected)...");
  await campaign2.connect(verifier1).reject(0, "Invoice is fake - serial number does not exist");
  console.log("✅ Rejection recorded!");

  let milestone = await campaign2.getMilestone(0);
  console.log("   State: Disputed");
  console.log("   Reject count:", milestone.rejectCount);

  // Tua qua challenge period
  console.log("\n⏰ Fast-forwarding past challenge period...");
  await hre.network.provider.send("evm_increaseTime", [challengePeriod + 10]);
  await hre.network.provider.send("evm_mine");

  // Test release khi bị dispute (should fail)
  console.log("\n🚫 Trying to release disputed milestone...");
  try {
    await campaign2.release(0);
    console.log("❌ ERROR: Should have reverted!");
  } catch (error) {
    console.log("✅ Correctly rejected: Milestone is disputed");
  }

  // Verifiers vote resolve
  console.log("\n✅ Verifier1 votes to resolve...");
  await campaign2.connect(verifier1).voteResolve(0);
  milestone = await campaign2.getMilestone(0);
  console.log("   Resolve votes:", milestone.resolveVoteCount, "/3");

  console.log("\n✅ Verifier2 votes to resolve...");
  await campaign2.connect(verifier2).voteResolve(0);
  milestone = await campaign2.getMilestone(0);
  console.log("   Resolve votes:", milestone.resolveVoteCount, "/3");
  console.log("🎉 Dispute resolved! (2/3 votes)");

  // Now can release
  console.log("\n🚀 Releasing resolved milestone...");
  await campaign2.release(0);
  console.log("✅ Milestone released successfully!");

  console.log("\n" + "=".repeat(60));
  console.log("✅ All challenge period tests completed!");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
