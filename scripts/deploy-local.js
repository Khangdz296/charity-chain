const { ethers } = require("hardhat");

const challengePeriod = 60;

async function main() {
  const [deployer, charity, verifier1, verifier2, verifier3, donor] = await ethers.getSigners();

  const verifierAddresses = [
    await verifier1.getAddress(),
    await verifier2.getAddress(),
    await verifier3.getAddress()
  ];

  const amounts = [
    ethers.parseEther("0.01"),
    ethers.parseEther("0.01")
  ];

  const purposes = [
    "Mua nhu yeu pham dot 1",
    "Ho tro y te dot 2"
  ];

  const CharityMilestoneFund = await ethers.getContractFactory("CharityMilestoneFund");
  const fund = await CharityMilestoneFund.deploy(
    await charity.getAddress(),
    verifierAddresses,
    amounts,
    purposes,
    challengePeriod
  );

  await fund.waitForDeployment();

  const address = await fund.getAddress();
  const fundingGoal = await fund.fundingGoal();

  console.log("CharityMilestoneFund deployed");
  console.log("Contract:", address);
  console.log("Funding goal:", ethers.formatEther(fundingGoal), "ETH");
  console.log("Challenge period:", challengePeriod, "seconds");
  console.log("");
  console.log("Demo accounts");
  console.log("Deployer :", await deployer.getAddress());
  console.log("Charity  :", await charity.getAddress());
  console.log("Verifier1:", verifierAddresses[0]);
  console.log("Verifier2:", verifierAddresses[1]);
  console.log("Verifier3:", verifierAddresses[2]);
  console.log("Donor    :", await donor.getAddress());
  console.log("");
  console.log("Paste Contract into frontend:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
