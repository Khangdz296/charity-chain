const CONTRACT_ABI = [
  "function charity() view returns (address)",
  "function fundingGoal() view returns (uint256)",
  "function totalDonated() view returns (uint256)",
  "function milestoneCount() view returns (uint256)",
  "function fundingDeadline() view returns (uint256)",
  "function isVerifier(address) view returns (bool)",
  "function milestoneClaimable(uint256) view returns (bool)",
  "function milestoneClaimed(uint256) view returns (bool)",
  "function getMilestone(uint256) view returns (uint256 amount,string purpose,string evidenceCID,uint256 submittedAt,uint8 rejectCount,uint8 resolveVoteCount,uint8 state)",
  "function donate() payable",
  "function refund()",
  "function submitMilestone(uint256 milestoneId,string evidenceCID)",
  "function resubmitMilestone(uint256 milestoneId,string newEvidenceCID)",
  "function reject(uint256 milestoneId,string reason)",
  "function voteResolve(uint256 milestoneId)",
  "function release(uint256 milestoneId)",
  "function claimMilestone(uint256 milestoneId)",
  "event DonationReceived(address indexed donor,uint256 amount)",
  "event DonationRefunded(address indexed donor,uint256 amount)",
  "event MilestoneSubmitted(uint256 indexed milestoneId,string evidenceCID)",
  "event MilestoneRejected(uint256 indexed milestoneId,address indexed verifier,string reason)",
  "event DisputeResolved(uint256 indexed milestoneId)",
  "event MilestoneReleased(uint256 indexed milestoneId,address indexed charity,uint256 amount)",
  "event MilestoneClaimed(uint256 indexed milestoneId,address indexed charity,uint256 amount)"
];

const FACTORY_ABI = [
  "function admin() view returns (address)",
  "function createCampaign(address charity,address[3] verifiers,uint256[] amounts,string[] purposes,uint256 challengePeriod,uint256 fundingDeadline) returns (address campaign)",
  "function campaignCount() view returns (uint256)",
  "function getCampaign(uint256 campaignId) view returns (address campaign,address creator,address charity,uint256 fundingGoal,uint256 fundingDeadline,uint256 createdAt)",
  "function isDeactivated(uint256) view returns (bool)",
  "function deactivationReason(uint256) view returns (string)",
  "function deactivateCampaign(uint256 campaignId, string reason)",
  "function reactivateCampaign(uint256 campaignId)",
  "event CampaignCreated(uint256 indexed campaignId,address indexed campaign,address indexed creator,address charity,uint256 fundingGoal,uint256 fundingDeadline)",
  "event CampaignDeactivated(uint256 indexed campaignId,address indexed campaign,string reason)",
  "event CampaignReactivated(uint256 indexed campaignId,address indexed campaign)"
];

const STATE_NAMES = ["Planned", "Submitted", "Disputed", "Approved", "Released"];

const state = {
  account: "",
  chainId: "",
  provider: null,
  signer: null,
  contract: null,
  factory: null,
  factoryAdmin: "",
  contractAddress: localStorage.getItem("charityFlowContract") || "",
  factoryAddress: localStorage.getItem("charityFlowFactory") || "",
  milestoneCount: 0
};

const $ = (id) => document.getElementById(id);

const ui = {
  networkBadge: $("networkBadge"),
  connectWalletBtn: $("connectWalletBtn"),
  contractAddress: $("contractAddress"),
  loadContractBtn: $("loadContractBtn"),
  factoryAddress: $("factoryAddress"),
  loadFactoryBtn: $("loadFactoryBtn"),
  loadCampaignsBtn: $("loadCampaignsBtn"),
  refreshBtn: $("refreshBtn"),
  contractShort: $("contractShort"),
  fundingGoal: $("fundingGoal"),
  totalDonated: $("totalDonated"),
  milestoneCount: $("milestoneCount"),
  fundingDeadline: $("fundingDeadline"),
  accountText: $("accountText"),
  walletBalanceText: $("walletBalanceText"),
  charityText: $("charityText"),
  verifierText: $("verifierText"),
  donateForm: $("donateForm"),
  donateAmount: $("donateAmount"),
  refundForm: $("refundForm"),
  submitForm: $("submitForm"),
  submitMilestoneId: $("submitMilestoneId"),
  evidenceCid: $("evidenceCid"),
  resubmitForm: $("resubmitForm"),
  resubmitMilestoneId: $("resubmitMilestoneId"),
  resubmitEvidenceCid: $("resubmitEvidenceCid"),
  claimForm: $("claimForm"),
  claimMilestoneId: $("claimMilestoneId"),
  rejectForm: $("rejectForm"),
  rejectMilestoneId: $("rejectMilestoneId"),
  rejectReason: $("rejectReason"),
  resolveForm: $("resolveForm"),
  resolveMilestoneId: $("resolveMilestoneId"),
  loadMilestonesBtn: $("loadMilestonesBtn"),
  releaseForm: $("releaseForm"),
  releaseMilestoneId: $("releaseMilestoneId"),
  milestoneList: $("milestoneList"),
  activityLog: $("activityLog"),
  clearLogBtn: $("clearLogBtn")
};

Object.assign(ui, {
  createCampaignForm: $("createCampaignForm"),
  factoryAdminText: $("factoryAdminText"),
  newCharityAddress: $("newCharityAddress"),
  newVerifier1: $("newVerifier1"),
  newVerifier2: $("newVerifier2"),
  newVerifier3: $("newVerifier3"),
  newChallengePeriod: $("newChallengePeriod"),
  newFundingDays: $("newFundingDays"),
  newMilestoneRows: $("newMilestoneRows"),
  addMilestoneRowBtn: $("addMilestoneRowBtn"),
  refreshCampaignsBtn: $("refreshCampaignsBtn"),
  campaignList: $("campaignList")
});

function log(message, kind = "info") {
  const item = document.createElement("li");
  item.className = kind;
  const icon = kind === "success" ? "✅" : kind === "error" ? "❌" : "ℹ️";
  item.textContent = `${icon} ${new Date().toLocaleTimeString()} - ${message}`;
  ui.activityLog.prepend(item);
}

function hasEthers() {
  return typeof window.ethers !== "undefined";
}

function requireWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask or an EVM wallet was not detected in this browser.");
  }
  if (!hasEthers()) {
    throw new Error("ethers.js could not be loaded.");
  }
}

function requireContract() {
  if (!state.contract) {
    throw new Error("Enter a contract address and load the contract first.");
  }
  return state.contract;
}

function requireFactory() {
  if (!state.factory) {
    throw new Error("Enter a factory address and load the factory first.");
  }
  return state.factory;
}

function isAddress(value) {
  return hasEthers() && window.ethers.isAddress(value || "");
}

function shortAddress(value) {
  if (!isAddress(value)) return "--";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatEth(value) {
  return window.ethers.formatEther(value);
}

function parseEth(value) {
  const text = String(value || "").trim();
  if (!/^\d+(\.\d{1,18})?$/.test(text)) {
    throw new Error("Invalid ETH amount.");
  }
  return window.ethers.parseEther(text);
}

function parsePositiveInteger(value, label) {
  const text = String(value || "").trim();
  if (!/^\d+$/.test(text) || BigInt(text) === 0n) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return BigInt(text);
}

function readMilestoneId(input, label = "Milestone ID") {
  const text = String(input.value || "").trim();
  if (!/^\d+$/.test(text)) {
    throw new Error(`${label} is required.`);
  }
  return BigInt(text);
}

function buildProvider() {
  requireWallet();
  state.provider = new window.ethers.BrowserProvider(window.ethereum);
  return state.provider;
}

async function connectWallet() {
  const provider = buildProvider();
  await provider.send("eth_requestAccounts", []);
  state.signer = await provider.getSigner();
  state.account = await state.signer.getAddress();
  const network = await provider.getNetwork();
  state.chainId = network.chainId.toString();

  if (state.contractAddress && isAddress(state.contractAddress)) {
    state.contract = new window.ethers.Contract(state.contractAddress, CONTRACT_ABI, state.signer);
  }
  if (state.factoryAddress && isAddress(state.factoryAddress)) {
    state.factory = new window.ethers.Contract(state.factoryAddress, FACTORY_ABI, state.signer);
  }

  renderAccount();
  await refreshWalletBalance();
  if (state.factory) {
    await refreshFactoryAdmin();
    await loadCampaigns();
  }
  log(`Connected ${shortAddress(state.account)}`, "success");
}

async function loadContract() {
  requireWallet();
  const address = ui.contractAddress.value.trim();
  if (!isAddress(address)) {
    throw new Error("Invalid contract address.");
  }

  state.contractAddress = address;
  localStorage.setItem("charityFlowContract", address);

  if (!state.provider) {
    state.provider = new window.ethers.BrowserProvider(window.ethereum);
  }

  const runner = state.signer || state.provider;
  const code = await state.provider.getCode(address);
  if (code === "0x") {
    throw new Error("No contract code was found at this address on the current network. Check that MetaMask is on Hardhat Local and that you pasted the latest deployed contract address.");
  }

  state.contract = new window.ethers.Contract(address, CONTRACT_ABI, runner);

  await refreshSummary();
  log("Contract loaded.", "success");
}

async function loadFactory() {
  requireWallet();
  const address = ui.factoryAddress.value.trim();
  if (!isAddress(address)) {
    throw new Error("Invalid factory address.");
  }

  state.factoryAddress = address;
  localStorage.setItem("charityFlowFactory", address);

  if (!state.provider) {
    state.provider = new window.ethers.BrowserProvider(window.ethereum);
  }

  const runner = state.signer || state.provider;
  const code = await state.provider.getCode(address);
  if (code === "0x") {
    throw new Error("No factory contract code was found at this address on the current network.");
  }

  state.factory = new window.ethers.Contract(address, FACTORY_ABI, runner);

  await refreshFactoryAdmin();
  await loadCampaigns();
  log("Factory loaded.", "success");
}

async function refreshFactoryAdmin() {
  const factory = requireFactory();
  state.factoryAdmin = await factory.admin();

  const isAdmin = state.account
    && state.factoryAdmin.toLowerCase() === state.account.toLowerCase();
  ui.factoryAdminText.textContent = isAdmin
    ? `${shortAddress(state.factoryAdmin)} - current wallet can create campaigns`
    : `${shortAddress(state.factoryAdmin)} - only this wallet can create campaigns`;
  ui.factoryAdminText.parentElement.classList.toggle("warning", Boolean(state.account) && !isAdmin);

  const submitButton = ui.createCampaignForm.querySelector('button[type="submit"]');
  submitButton.disabled = Boolean(state.account) && !isAdmin;
}

async function refreshSummary() {
  const contract = requireContract();
  ui.contractShort.textContent = shortAddress(state.contractAddress);
  ui.contractAddress.value = state.contractAddress;

  const [charity, goal, donated, count, deadline] = await Promise.all([
    contract.charity(),
    contract.fundingGoal(),
    contract.totalDonated(),
    contract.milestoneCount(),
    contract.fundingDeadline()
  ]);

  state.milestoneCount = Number(count);
  ui.charityText.textContent = shortAddress(charity);
  ui.fundingGoal.textContent = `${formatEth(goal)} ETH`;
  ui.totalDonated.textContent = `${formatEth(donated)} ETH`;
  ui.milestoneCount.textContent = String(state.milestoneCount);

  const deadlineDate = new Date(Number(deadline) * 1000);

  // Get current blockchain time
  const currentBlock = await state.provider.getBlock("latest");
  const currentTime = currentBlock.timestamp;

  if (currentTime > Number(deadline)) {
    ui.fundingDeadline.textContent = `${deadlineDate.toLocaleString()} ❌ PASSED`;
  } else {
    const remaining = Number(deadline) - currentTime;
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    ui.fundingDeadline.textContent = `${deadlineDate.toLocaleString()} (${days}d ${hours}h ${minutes}m left)`;
  }

  if (state.account) {
    const isVerifier = await contract.isVerifier(state.account);
    ui.verifierText.textContent = isVerifier ? "Verifier account" : "Not a verifier";
    await refreshWalletBalance();
  }
}

async function refreshWalletBalance() {
  if (!state.provider || !state.account) {
    ui.walletBalanceText.textContent = "-- ETH";
    return;
  }

  const balance = await state.provider.getBalance(state.account);
  ui.walletBalanceText.textContent = `${formatEth(balance)} ETH`;
}

async function loadMilestones() {
  await refreshSummary();
  ui.milestoneList.innerHTML = "";

  if (state.milestoneCount === 0) {
    ui.milestoneList.textContent = "No milestones found.";
    return;
  }

  for (let index = 0; index < state.milestoneCount; index++) {
    const milestone = await state.contract.getMilestone(index);
    const claimable = await state.contract.milestoneClaimable(index);
    const claimed = await state.contract.milestoneClaimed(index);
    ui.milestoneList.appendChild(renderMilestoneCard(index, milestone, claimable, claimed));
  }
}

async function loadCampaigns() {
  const factory = requireFactory();
  ui.campaignList.innerHTML = "";

  const count = Number(await factory.campaignCount());
  if (count === 0) {
    ui.campaignList.textContent = "No campaigns have been deployed by this factory.";
    return;
  }

  for (let index = 0; index < count; index++) {
    const campaign = await factory.getCampaign(index);
    const isDeactivated = await factory.isDeactivated(index);
    const deactivationReason = isDeactivated ? await factory.deactivationReason(index) : "";
    ui.campaignList.appendChild(renderCampaignCard(index, campaign, isDeactivated, deactivationReason));
  }
}

function renderCampaignCard(index, campaign, isDeactivated, deactivationReason) {
  const card = document.createElement("article");
  card.className = "campaign-card";
  if (isDeactivated) {
    card.classList.add("deactivated");
  }

  const deadline = new Date(Number(campaign.fundingDeadline) * 1000).toLocaleString();
  const statusBadge = isDeactivated
    ? `<span class="status-badge deactivated">🚫 Deactivated</span>`
    : `<span class="status-badge active">✅ Active</span>`;

  const reasonText = isDeactivated
    ? `<span class="deactivation-reason">Reason: ${escapeHtml(deactivationReason)}</span>`
    : "";

  card.innerHTML = `
    <div>
      <strong>Campaign #${index} - ${shortAddress(campaign.campaign)} ${statusBadge}</strong>
      <span>Goal: ${formatEth(campaign.fundingGoal)} ETH</span>
      <span>Charity: ${shortAddress(campaign.charity)} | Creator: ${shortAddress(campaign.creator)}</span>
      <span>Funding deadline: ${escapeHtml(deadline)}</span>
      ${reasonText}
    </div>
    <div class="campaign-actions">
      <button type="button" class="select-btn">Select</button>
      ${state.account && state.factoryAdmin && state.account.toLowerCase() === state.factoryAdmin.toLowerCase() ?
        (isDeactivated
          ? `<button type="button" class="reactivate-btn" data-id="${index}">♻️ Reactivate</button>`
          : `<button type="button" class="deactivate-btn" data-id="${index}">🚫 Deactivate</button>`
        ) : ''
      }
    </div>
  `;

  card.querySelector(".select-btn").addEventListener("click", () => {
    ui.contractAddress.value = campaign.campaign;
    run(loadContract);
  });

  const deactivateBtn = card.querySelector(".deactivate-btn");
  if (deactivateBtn) {
    deactivateBtn.addEventListener("click", () => {
      run(() => deactivateCampaign(index));
    });
  }

  const reactivateBtn = card.querySelector(".reactivate-btn");
  if (reactivateBtn) {
    reactivateBtn.addEventListener("click", () => {
      run(() => reactivateCampaign(index));
    });
  }

  return card;
}

function renderMilestoneCard(index, milestone, claimable, claimed) {
  const card = document.createElement("article");
  card.className = "milestone-card";

  const submittedAt = BigInt(milestone.submittedAt);
  const submitted = submittedAt > 0n
    ? new Date(Number(submittedAt) * 1000).toLocaleString()
    : "Not submitted";
  const stateId = Number(milestone.state);
  const stateName = STATE_NAMES[stateId] || "Unknown";

  const claimStatus = claimed ? "✅ Claimed" : (claimable ? "🔓 Claimable" : "🔒 Not claimable");

  card.innerHTML = `
    <header>
      <h2>Milestone #${index}</h2>
      <span class="state-pill ${stateName}">${stateName}</span>
    </header>
    <p>${escapeHtml(milestone.purpose || "--")}</p>
    <div class="milestone-meta">
      <span>${formatEth(milestone.amount)} ETH</span>
      <span>Reject: ${Number(milestone.rejectCount)}</span>
      <span>Resolve: ${Number(milestone.resolveVoteCount)}/3</span>
    </div>
    <div class="milestone-meta">
      <span>${escapeHtml(submitted)}</span>
      <span>${escapeHtml(milestone.evidenceCID || "No CID submitted")}</span>
      <span>ID: ${index}</span>
    </div>
    <div class="milestone-meta">
      <span style="font-weight: bold;">${claimStatus}</span>
    </div>
  `;

  return card;
}

function addMilestoneRow(amount = "", purpose = "") {
  const row = document.createElement("div");
  row.className = "milestone-row";
  row.innerHTML = `
    <div>
      <label>Amount (ETH)</label>
      <input class="new-milestone-amount" type="number" min="0" step="0.001" value="${escapeHtml(amount)}" placeholder="0.01">
    </div>
    <div>
      <label>Purpose</label>
      <input class="new-milestone-purpose" type="text" value="${escapeHtml(purpose)}" placeholder="Mua nhu yeu pham dot 1">
    </div>
    <button type="button">Remove</button>
  `;

  row.querySelector("button").addEventListener("click", () => {
    if (ui.newMilestoneRows.children.length <= 1) {
      log("A campaign must have at least one milestone.", "error");
      return;
    }
    row.remove();
  });

  ui.newMilestoneRows.appendChild(row);
}

function readCampaignForm() {
  const charity = ui.newCharityAddress.value.trim();
  const verifiers = [
    ui.newVerifier1.value.trim(),
    ui.newVerifier2.value.trim(),
    ui.newVerifier3.value.trim()
  ];

  if (!isAddress(charity)) {
    throw new Error("Invalid charity address.");
  }
  verifiers.forEach((verifier, index) => {
    if (!isAddress(verifier)) {
      throw new Error(`Invalid verifier ${index + 1} address.`);
    }
  });

  const uniqueParticipants = new Set([charity.toLowerCase(), ...verifiers.map((item) => item.toLowerCase())]);
  if (uniqueParticipants.size !== 4) {
    throw new Error("Charity and verifier addresses must be different.");
  }

  const amounts = [];
  const purposes = [];
  ui.newMilestoneRows.querySelectorAll(".milestone-row").forEach((row, index) => {
    const amount = row.querySelector(".new-milestone-amount").value.trim();
    const purpose = row.querySelector(".new-milestone-purpose").value.trim();
    if (!amount) {
      throw new Error(`Milestone ${index} amount is required.`);
    }
    if (!purpose) {
      throw new Error(`Milestone ${index} purpose is required.`);
    }
    amounts.push(parseEth(amount));
    purposes.push(purpose);
  });

  if (amounts.length === 0) {
    throw new Error("Add at least one milestone.");
  }

  const challengePeriod = parsePositiveInteger(ui.newChallengePeriod.value, "Challenge period");
  const fundingDays = parsePositiveInteger(ui.newFundingDays.value, "Funding duration");
  const fundingDeadline = BigInt(Math.floor(Date.now() / 1000)) + fundingDays * 24n * 60n * 60n;

  return {
    charity,
    verifiers,
    amounts,
    purposes,
    challengePeriod,
    fundingDeadline
  };
}

async function createCampaign() {
  if (!state.signer) {
    await connectWallet();
  }
  if (state.factory && state.factory.runner !== state.signer) {
    state.factory = new window.ethers.Contract(state.factoryAddress, FACTORY_ABI, state.signer);
  }

  const factory = requireFactory();
  await refreshFactoryAdmin();
  if (!state.factoryAdmin || state.factoryAdmin.toLowerCase() !== state.account.toLowerCase()) {
    throw new Error("Only the factory admin can create campaigns.");
  }

  const form = readCampaignForm();
  const tx = await factory.createCampaign(
    form.charity,
    form.verifiers,
    form.amounts,
    form.purposes,
    form.challengePeriod,
    form.fundingDeadline
  );
  log(`Create campaign: ${tx.hash}`, "success");

  const receipt = await tx.wait();
  log(`Confirmed in block ${receipt.blockNumber}`, "success");

  const event = receipt.logs
    .map((entry) => {
      try {
        return factory.interface.parseLog(entry);
      } catch (_) {
        return null;
      }
    })
    .find((entry) => entry && entry.name === "CampaignCreated");

  if (event) {
    const campaignAddress = event.args.campaign;
    ui.contractAddress.value = campaignAddress;
    state.contractAddress = campaignAddress;
    localStorage.setItem("charityFlowContract", campaignAddress);
    state.contract = new window.ethers.Contract(campaignAddress, CONTRACT_ABI, state.signer);
    await refreshSummary();
    log(`Campaign ready: ${shortAddress(campaignAddress)}`, "success");
  }

  await loadCampaigns();
}

async function deactivateCampaign(campaignId) {
  if (!state.signer) {
    await connectWallet();
  }
  if (state.factory && state.factory.runner !== state.signer) {
    state.factory = new window.ethers.Contract(state.factoryAddress, FACTORY_ABI, state.signer);
  }

  const factory = requireFactory();
  await refreshFactoryAdmin();
  if (!state.factoryAdmin || state.factoryAdmin.toLowerCase() !== state.account.toLowerCase()) {
    throw new Error("Only the factory admin can deactivate campaigns.");
  }

  const reason = prompt("Enter reason for deactivation (e.g., 'Fraud detected', 'Deadline expired'):");
  if (!reason || !reason.trim()) {
    throw new Error("Deactivation reason is required.");
  }

  const tx = await factory.deactivateCampaign(campaignId, reason.trim());
  log(`Deactivating campaign #${campaignId}: ${tx.hash}`, "success");

  const receipt = await tx.wait();
  log(`Campaign #${campaignId} deactivated in block ${receipt.blockNumber}`, "success");

  await loadCampaigns();
}

async function reactivateCampaign(campaignId) {
  if (!state.signer) {
    await connectWallet();
  }
  if (state.factory && state.factory.runner !== state.signer) {
    state.factory = new window.ethers.Contract(state.factoryAddress, FACTORY_ABI, state.signer);
  }

  const factory = requireFactory();
  await refreshFactoryAdmin();
  if (!state.factoryAdmin || state.factoryAdmin.toLowerCase() !== state.account.toLowerCase()) {
    throw new Error("Only the factory admin can reactivate campaigns.");
  }

  const confirmed = confirm(`Reactivate campaign #${campaignId}?`);
  if (!confirmed) {
    return;
  }

  const tx = await factory.reactivateCampaign(campaignId);
  log(`Reactivating campaign #${campaignId}: ${tx.hash}`, "success");

  const receipt = await tx.wait();
  log(`Campaign #${campaignId} reactivated in block ${receipt.blockNumber}`, "success");

  await loadCampaigns();
}

async function sendTx(action, label) {
  if (!state.signer) {
    await connectWallet();
  }
  if (state.contract && state.contract.runner !== state.signer) {
    state.contract = new window.ethers.Contract(state.contractAddress, CONTRACT_ABI, state.signer);
  }

  const tx = await action(state.contract);
  log(`${label}: ${tx.hash}`, "success");
  const receipt = await tx.wait();
  log(`Confirmed in block ${receipt.blockNumber}`, "success");
}

function renderAccount() {
  ui.accountText.textContent = state.account ? shortAddress(state.account) : "Not connected";
  ui.networkBadge.textContent = state.chainId ? `Chain ${state.chainId}` : "Not connected";
  if (!state.account) {
    ui.walletBalanceText.textContent = "-- ETH";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bindEvents() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".tab-page").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      $(button.dataset.tab).classList.add("active");
    });
  });

  ui.connectWalletBtn.addEventListener("click", () => run(connectWallet));
  ui.loadContractBtn.addEventListener("click", () => run(loadContract));
  ui.loadFactoryBtn.addEventListener("click", () => run(loadFactory));
  ui.loadCampaignsBtn.addEventListener("click", () => run(loadCampaigns));
  ui.refreshBtn.addEventListener("click", () => run(refreshSummary));
  ui.loadMilestonesBtn.addEventListener("click", () => run(loadMilestones));
  ui.refreshCampaignsBtn.addEventListener("click", () => run(loadCampaigns));
  ui.addMilestoneRowBtn.addEventListener("click", () => addMilestoneRow());
  ui.clearLogBtn.addEventListener("click", () => {
    ui.activityLog.innerHTML = "";
  });

  ui.createCampaignForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(createCampaign);
  });

  ui.donateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(async () => {
      await sendTx(
        (contract) => contract.donate({ value: parseEth(ui.donateAmount.value) }),
        "Donate"
      );
      await refreshSummary();
    });
  });

  ui.refundForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(async () => {
      await sendTx(
        (contract) => contract.refund(),
        "Refund"
      );
      await refreshSummary();
    });
  });

  ui.submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(async () => {
      const milestoneId = readMilestoneId(ui.submitMilestoneId);
      await sendTx(
        (contract) => contract.submitMilestone(milestoneId, ui.evidenceCid.value.trim()),
        "Submit milestone"
      );
      await loadMilestones();
    });
  });

  ui.resubmitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(async () => {
      const milestoneId = readMilestoneId(ui.resubmitMilestoneId);
      await sendTx(
        (contract) => contract.resubmitMilestone(milestoneId, ui.resubmitEvidenceCid.value.trim()),
        "Resubmit milestone"
      );
      await loadMilestones();
    });
  });

  ui.claimForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(async () => {
      const milestoneId = readMilestoneId(ui.claimMilestoneId);
      await sendTx(
        (contract) => contract.claimMilestone(milestoneId),
        "Claim milestone"
      );
      await loadMilestones();
    });
  });

  ui.rejectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(async () => {
      const milestoneId = readMilestoneId(ui.rejectMilestoneId);
      await sendTx(
        (contract) => contract.reject(milestoneId, ui.rejectReason.value.trim()),
        "Reject"
      );
      await loadMilestones();
    });
  });

  ui.resolveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(async () => {
      const milestoneId = readMilestoneId(ui.resolveMilestoneId);
      await sendTx(
        (contract) => contract.voteResolve(milestoneId),
        "Vote resolve"
      );
      await loadMilestones();
    });
  });

  ui.releaseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(async () => {
      const milestoneId = readMilestoneId(ui.releaseMilestoneId);
      await sendTx(
        (contract) => contract.release(milestoneId),
        "Release"
      );
      await loadMilestones();
    });
  });

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", async (accounts) => {
      state.account = accounts[0] || "";
      state.signer = state.account && state.provider ? await state.provider.getSigner() : null;
      renderAccount();
      if (state.contractAddress && state.signer) {
        state.contract = new window.ethers.Contract(state.contractAddress, CONTRACT_ABI, state.signer);
        run(refreshSummary);
      }
      if (state.factoryAddress && state.signer) {
        state.factory = new window.ethers.Contract(state.factoryAddress, FACTORY_ABI, state.signer);
        run(async () => {
          await refreshFactoryAdmin();
          await loadCampaigns();
        });
      }
    });

    window.ethereum.on("chainChanged", (chainId) => {
      state.chainId = BigInt(chainId).toString();
      state.provider = null;
      state.signer = null;
      state.contract = null;
      state.factory = null;
      renderAccount();
      log("Network changed. Please reconnect and reload the contract.");
    });
  }
}

async function run(task) {
  try {
    setBusy(true);
    await task();
  } catch (error) {
    log(error.shortMessage || error.reason || error.message || String(error), "error");
  } finally {
    setBusy(false);
  }
}

function setBusy(isBusy) {
  document.querySelectorAll("button").forEach((button) => {
    button.disabled = isBusy;
    if (isBusy) {
      button.style.cursor = 'wait';
      button.style.opacity = '0.6';
    } else {
      button.style.cursor = '';
      button.style.opacity = '';
    }
  });
  if (!isBusy && state.factoryAdmin && state.account) {
    const isAdmin = state.factoryAdmin.toLowerCase() === state.account.toLowerCase();
    ui.createCampaignForm.querySelector('button[type="submit"]').disabled = !isAdmin;
  }
}

function init() {
  ui.contractAddress.value = state.contractAddress;
  ui.factoryAddress.value = state.factoryAddress;
  addMilestoneRow("0.01", "Mua nhu yeu pham dot 1");
  addMilestoneRow("0.01", "Ho tro y te dot 2");
  bindEvents();
  renderAccount();
  if (!window.ethereum) {
    log("MetaMask was not detected. The interface can be viewed, but transactions require a wallet.", "error");
  } else {
    log("Frontend ready.");
  }
}

init();
