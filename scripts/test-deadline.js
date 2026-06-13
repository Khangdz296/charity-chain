const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Funding Deadline Scenarios\n");

  const [deployer, charity, verifier1, verifier2, verifier3, donor1, donor2] =
    await hre.ethers.getSigners();

  // Deploy Factory
  const Factory = await hre.ethers.getContractFactory("CharityCampaignFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ Factory deployed:", factoryAddress);

  // Create campaign với deadline ngắn (2 phút)
  const challengePeriod = 60; // 60 seconds
  const fundingDays = 1; // 1 ngày
  const fundingDeadline = Math.floor(Date.now() / 1000) + (fundingDays * 24 * 60 * 60);

  const amounts = [
    hre.ethers.parseEther("0.5"),
    hre.ethers.parseEther("0.5")
  ];
  const purposes = ["Milestone 1", "Milestone 2"];

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
  console.log("✅ Campaign created:", campaignAddress);

  const campaign = await hre.ethers.getContractAt(
    "CharityMilestoneFund",
    campaignAddress
  );

  const goal = await campaign.fundingGoal();
  console.log("🎯 Funding Goal:", hre.ethers.formatEther(goal), "ETH");
  console.log("⏰ Funding Deadline:", new Date(fundingDeadline * 1000).toLocaleString());

  // Scenario 1: Donate một phần và để hết hạn
  console.log("\n" + "=".repeat(60));
  console.log("📊 SCENARIO 1: Funding Failed - Không đạt goal");
  console.log("=".repeat(60));

  const partialAmount = hre.ethers.parseEther("0.3"); // Chỉ donate 0.3/1.0 ETH
  console.log("\n💰 Donor1 donates:", hre.ethers.formatEther(partialAmount), "ETH");
  await campaign.connect(donor1).donate({ value: partialAmount });

  let donated = await campaign.totalDonated();
  console.log("📊 Total donated:", hre.ethers.formatEther(donated), "ETH");
  console.log("🎯 Still need:", hre.ethers.formatEther(goal - donated), "ETH");

  // Tua thời gian qua deadline
  console.log("\n⏰ Fast-forwarding time past deadline...");
  const deadline = await campaign.fundingDeadline();
  await hre.network.provider.send("evm_increaseTime", [Number(deadline) - Math.floor(Date.now() / 1000) + 10]);
  await hre.network.provider.send("evm_mine");

  const currentTime = (await hre.ethers.provider.getBlock("latest")).timestamp;
  console.log("✅ Current time:", new Date(currentTime * 1000).toLocaleString());
  console.log("❌ Deadline passed! Funding failed.");

  // Test refund
  console.log("\n🔄 Donor1 requesting refund...");
  const balanceBefore = await hre.ethers.provider.getBalance(donor1.address);
  const donorDonation = await campaign.donations(donor1.address);
  console.log("   Donated amount:", hre.ethers.formatEther(donorDonation), "ETH");

  const refundTx = await campaign.connect(donor1).refund();
  const receipt = await refundTx.wait();
  const gasCost = receipt.gasUsed * receipt.gasPrice;

  const balanceAfter = await hre.ethers.provider.getBalance(donor1.address);
  const netGain = balanceAfter - balanceBefore + gasCost;

  console.log("✅ Refund successful!");
  console.log("   Received:", hre.ethers.formatEther(netGain), "ETH");

  // Verify refund
  const donationAfterRefund = await campaign.donations(donor1.address);
  console.log("   Donation after refund:", hre.ethers.formatEther(donationAfterRefund), "ETH");

  // Test charity cannot submit milestone
  console.log("\n🏥 Testing charity cannot submit milestone...");
  try {
    await campaign.connect(charity).submitMilestone(0, "ipfs://test");
    console.log("❌ ERROR: Should have reverted!");
  } catch (error) {
    console.log("✅ Correctly rejected:", error.message.split("(")[0]);
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 SCENARIO 2: Funding Success - Đạt goal đúng hạn");
  console.log("=".repeat(60));

  // Reset và tạo campaign mới
  console.log("\n📝 Creating new campaign...");
  const latestBlock = await hre.ethers.provider.getBlock("latest");
  const newDeadline = latestBlock.timestamp + (1 * 24 * 60 * 60);
  const tx2 = await factory.createCampaign(
    charity.address,
    [verifier1.address, verifier2.address, verifier3.address],
    amounts,
    purposes,
    challengePeriod,
    newDeadline
  );
  await tx2.wait();

  const campaign2Address = (await factory.getCampaign(1))[0];
  const campaign2 = await hre.ethers.getContractAt("CharityMilestoneFund", campaign2Address);

  console.log("✅ Campaign 2 created:", campaign2Address);

  // Donate đủ goal
  console.log("\n💰 Donor1 donates full goal...");
  await campaign2.connect(donor1).donate({ value: goal });

  donated = await campaign2.totalDonated();
  console.log("✅ Total donated:", hre.ethers.formatEther(donated), "ETH");
  console.log("🎉 Funding goal reached!");

  // Test charity CAN submit milestone
  console.log("\n🏥 Charity submitting milestone...");
  await campaign2.connect(charity).submitMilestone(0, "ipfs://milestone-0-evidence");
  console.log("✅ Milestone submitted successfully!");

  // Test refund should fail when goal reached
  console.log("\n🔄 Testing refund should fail when goal reached...");

  // Tua qua deadline
  const deadline2 = await campaign2.fundingDeadline();
  await hre.network.provider.send("evm_increaseTime", [Number(deadline2) - Math.floor(Date.now() / 1000) + 10]);
  await hre.network.provider.send("evm_mine");

  try {
    await campaign2.connect(donor1).refund();
    console.log("❌ ERROR: Should have reverted!");
  } catch (error) {
    console.log("✅ Correctly rejected:", error.message.split("(")[0]);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ All deadline tests completed!");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
