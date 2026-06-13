const hre = require("hardhat");

async function expectRevert(action, expectedMessage) {
  try {
    await action();
    console.log("❌ ERROR: Should have reverted!");
    process.exitCode = 1;
  } catch (error) {
    const message = error.shortMessage || error.message || String(error);
    if (expectedMessage && !message.includes(expectedMessage)) {
      console.log("❌ Unexpected revert:", message);
      process.exitCode = 1;
      return;
    }
    console.log("✅ Correctly rejected:", expectedMessage || message.split("(")[0]);
  }
}

async function main() {
  console.log("🧪 Testing Campaign Deactivation Enforcement\n");

  const [deployer, charity1, verifier1, verifier2, verifier3, donor, charity2] =
    await hre.ethers.getSigners();

  const Factory = await hre.ethers.getContractFactory("CharityCampaignFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ Factory deployed:", factoryAddress);
  console.log("👤 Admin:", deployer.address);

  const challengePeriod = 60;
  const fundingDeadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
  const amounts = [hre.ethers.parseEther("0.5")];
  const purposes = ["Test Milestone"];

  console.log("\n" + "=".repeat(60));
  console.log("📝 Creating 4 campaigns...");
  console.log("=".repeat(60));

  for (const charity of [charity1, charity2, charity1, charity1]) {
    await factory.createCampaign(
      charity.address,
      [verifier1.address, verifier2.address, verifier3.address],
      amounts,
      purposes,
      challengePeriod,
      fundingDeadline
    );
  }

  const campaign0Info = await factory.getCampaign(0);
  const campaign1Info = await factory.getCampaign(1);
  const campaign2Info = await factory.getCampaign(2);
  const campaign3Info = await factory.getCampaign(3);

  const campaign0 = await hre.ethers.getContractAt("CharityMilestoneFund", campaign0Info.campaign);
  const campaign1 = await hre.ethers.getContractAt("CharityMilestoneFund", campaign1Info.campaign);
  const campaign2 = await hre.ethers.getContractAt("CharityMilestoneFund", campaign2Info.campaign);
  const campaign3 = await hre.ethers.getContractAt("CharityMilestoneFund", campaign3Info.campaign);

  const goal = await campaign0.fundingGoal();
  const partialAmount = hre.ethers.parseEther("0.2");

  console.log("✅ Campaign addresses:");
  console.log("  Campaign 0:", campaign0Info.campaign, "(refund emergency test)");
  console.log("  Campaign 1:", campaign1Info.campaign, "(reactivation test)");
  console.log("  Campaign 2:", campaign2Info.campaign, "(milestone guard test)");
  console.log("  Campaign 3:", campaign3Info.campaign, "(claimed funds guard test)");

  console.log("\n" + "=".repeat(60));
  console.log("💰 Setup donations");
  console.log("=".repeat(60));

  await campaign0.connect(donor).donate({ value: partialAmount });
  await campaign1.connect(donor).donate({ value: partialAmount });
  await campaign2.connect(donor).donate({ value: goal });
  await campaign3.connect(donor).donate({ value: goal });
  console.log("✅ Initial funding completed");

  console.log("\n" + "=".repeat(60));
  console.log("🚫 Test 1: Deactivation blocks donate and enables emergency refund");
  console.log("=".repeat(60));

  await (await factory.deactivateCampaign(0, "Fraud detected during review")).wait();
  console.log("✅ Campaign 0 deactivated");

  await expectRevert(
    () => campaign0.connect(donor).donate({ value: hre.ethers.parseEther("0.01") }),
    "Campaign is deactivated"
  );

  const donorBalanceBeforeRefund = await hre.ethers.provider.getBalance(donor.address);
  const refundTx = await campaign0.connect(donor).refund();
  const refundReceipt = await refundTx.wait();
  const gasPrice = refundReceipt.gasPrice ?? refundTx.gasPrice ?? 0n;
  const refundGasCost = refundReceipt.gasUsed * gasPrice;
  const donorBalanceAfterRefund = await hre.ethers.provider.getBalance(donor.address);
  const netRefund = donorBalanceAfterRefund - donorBalanceBeforeRefund + refundGasCost;
  console.log("✅ Emergency refund successful:", hre.ethers.formatEther(netRefund), "ETH");

  console.log("\n" + "=".repeat(60));
  console.log("♻️ Test 2: Reactivation allows donate again");
  console.log("=".repeat(60));

  await (await factory.deactivateCampaign(1, "Temporary compliance review")).wait();
  await expectRevert(
    () => campaign1.connect(donor).donate({ value: hre.ethers.parseEther("0.01") }),
    "Campaign is deactivated"
  );

  await (await factory.reactivateCampaign(1)).wait();
  console.log("✅ Campaign 1 reactivated");

  await campaign1.connect(donor).donate({ value: hre.ethers.parseEther("0.01") });
  console.log("✅ Donate works again after reactivation");

  console.log("\n" + "=".repeat(60));
  console.log("🧱 Test 3: Deactivation blocks milestone workflow actions");
  console.log("=".repeat(60));

  await campaign2.connect(charity1).submitMilestone(0, "ipfs://milestone-proof");
  await (await factory.deactivateCampaign(2, "Investigation opened")).wait();
  console.log("✅ Campaign 2 deactivated after submission");

  await expectRevert(
    () => campaign2.connect(verifier1).reject(0, "Need more documents"),
    "Campaign is deactivated"
  );
  await expectRevert(
    () => campaign2.release(0),
    "Campaign is deactivated"
  );

  await (await factory.reactivateCampaign(2)).wait();
  console.log("✅ Campaign 2 reactivated for dispute flow checks");

  await campaign2.connect(verifier1).reject(0, "Evidence mismatch");
  await (await factory.deactivateCampaign(2, "Paused during dispute")).wait();

  await expectRevert(
    () => campaign2.connect(charity1).resubmitMilestone(0, "ipfs://updated-proof"),
    "Campaign is deactivated"
  );
  await expectRevert(
    () => campaign2.connect(verifier2).voteResolve(0),
    "Campaign is deactivated"
  );

  console.log("\n" + "=".repeat(60));
  console.log("🚫 Test 4: Cannot deactivate after milestone funds were claimed");
  console.log("=".repeat(60));

  await campaign3.connect(charity1).submitMilestone(0, "ipfs://claimable-proof");
  await hre.network.provider.send("evm_increaseTime", [challengePeriod + 10]);
  await hre.network.provider.send("evm_mine");
  await campaign3.release(0);
  await campaign3.connect(charity1).claimMilestone(0);
  console.log("✅ Campaign 3 milestone released and claimed");

  await expectRevert(
    () => factory.deactivateCampaign(3, "Attempting shutdown after payout"),
    "Cannot deactivate after funds have been claimed"
  );

  console.log("\n" + "=".repeat(60));
  console.log("✅ All deactivation enforcement tests completed!");
  console.log("=".repeat(60));
  console.log("\n💡 Factory address for frontend:", factoryAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
