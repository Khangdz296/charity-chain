const CONTRACT_ABI = [
  "function charity() view returns (address)",
  "function fundingGoal() view returns (uint256)",
  "function totalDonated() view returns (uint256)",
  "function milestoneCount() view returns (uint256)",
  "function isVerifier(address) view returns (bool)",
  "function getMilestone(uint256) view returns (uint256 amount,string purpose,string evidenceCID,uint256 submittedAt,uint8 rejectCount,uint8 resolveVoteCount,uint8 state)",
  "function donate() payable",
  "function submitMilestone(uint256 milestoneId,string evidenceCID)",
  "function reject(uint256 milestoneId,string reason)",
  "function voteResolve(uint256 milestoneId)",
  "function release(uint256 milestoneId)",
  "event DonationReceived(address indexed donor,uint256 amount)",
  "event MilestoneSubmitted(uint256 indexed milestoneId,string evidenceCID)",
  "event MilestoneRejected(uint256 indexed milestoneId,address indexed verifier,string reason)",
  "event DisputeResolved(uint256 indexed milestoneId)",
  "event MilestoneReleased(uint256 indexed milestoneId,address indexed charity,uint256 amount)"
];

const STATE_NAMES = ["Planned", "Submitted", "Disputed", "Approved", "Released"];

const state = {
  account: "",
  chainId: "",
  provider: null,
  signer: null,
  contract: null,
  contractAddress: localStorage.getItem("charityFlowContract") || "",
  milestoneCount: 0
};

const $ = (id) => document.getElementById(id);

const ui = {
  networkBadge: $("networkBadge"),
  connectWalletBtn: $("connectWalletBtn"),
  contractAddress: $("contractAddress"),
  loadContractBtn: $("loadContractBtn"),
  refreshBtn: $("refreshBtn"),
  contractShort: $("contractShort"),
  fundingGoal: $("fundingGoal"),
  totalDonated: $("totalDonated"),
  milestoneCount: $("milestoneCount"),
  accountText: $("accountText"),
  charityText: $("charityText"),
  verifierText: $("verifierText"),
  donateForm: $("donateForm"),
  donateAmount: $("donateAmount"),
  submitForm: $("submitForm"),
  submitMilestoneId: $("submitMilestoneId"),
  evidenceCid: $("evidenceCid"),
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

function log(message, kind = "info") {
  const item = document.createElement("li");
  item.className = kind;
  item.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
  ui.activityLog.prepend(item);
}

function hasEthers() {
  return typeof window.ethers !== "undefined";
}

function requireWallet() {
  if (!window.ethereum) {
    throw new Error("Chua co MetaMask hoac vi EVM trong trinh duyet.");
  }
  if (!hasEthers()) {
    throw new Error("Khong tai duoc ethers.js.");
  }
}

function requireContract() {
  if (!state.contract) {
    throw new Error("Nhap dia chi contract va bam Tai contract truoc.");
  }
  return state.contract;
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
    throw new Error("So ETH khong hop le.");
  }
  return window.ethers.parseEther(text);
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

  renderAccount();
  log(`Da ket noi ${shortAddress(state.account)}`, "success");
}

async function loadContract() {
  requireWallet();
  const address = ui.contractAddress.value.trim();
  if (!isAddress(address)) {
    throw new Error("Dia chi contract khong hop le.");
  }

  state.contractAddress = address;
  localStorage.setItem("charityFlowContract", address);

  if (!state.provider) {
    state.provider = new window.ethers.BrowserProvider(window.ethereum);
  }

  const runner = state.signer || state.provider;
  state.contract = new window.ethers.Contract(address, CONTRACT_ABI, runner);

  await refreshSummary();
  log("Da tai thong tin contract.", "success");
}

async function refreshSummary() {
  const contract = requireContract();
  ui.contractShort.textContent = shortAddress(state.contractAddress);
  ui.contractAddress.value = state.contractAddress;

  const [charity, goal, donated, count] = await Promise.all([
    contract.charity(),
    contract.fundingGoal(),
    contract.totalDonated(),
    contract.milestoneCount()
  ]);

  state.milestoneCount = Number(count);
  ui.charityText.textContent = shortAddress(charity);
  ui.fundingGoal.textContent = `${formatEth(goal)} ETH`;
  ui.totalDonated.textContent = `${formatEth(donated)} ETH`;
  ui.milestoneCount.textContent = String(state.milestoneCount);

  if (state.account) {
    const isVerifier = await contract.isVerifier(state.account);
    ui.verifierText.textContent = isVerifier ? "Dung vai tro verifier" : "Khong phai verifier";
  }
}

async function loadMilestones() {
  await refreshSummary();
  ui.milestoneList.innerHTML = "";

  if (state.milestoneCount === 0) {
    ui.milestoneList.textContent = "Chua co milestone.";
    return;
  }

  for (let index = 0; index < state.milestoneCount; index++) {
    const milestone = await state.contract.getMilestone(index);
    ui.milestoneList.appendChild(renderMilestoneCard(index, milestone));
  }
}

function renderMilestoneCard(index, milestone) {
  const card = document.createElement("article");
  card.className = "milestone-card";

  const submittedAt = BigInt(milestone.submittedAt);
  const submitted = submittedAt > 0n
    ? new Date(Number(submittedAt) * 1000).toLocaleString()
    : "Chua submit";
  const stateId = Number(milestone.state);
  const stateName = STATE_NAMES[stateId] || "Unknown";

  card.innerHTML = `
    <header>
      <h2>Milestone #${index}</h2>
      <span class="state-pill ${stateName}">${stateName}</span>
    </header>
    <p>${escapeHtml(milestone.purpose || "--")}</p>
    <div class="milestone-meta">
      <span>${formatEth(milestone.amount)} ETH</span>
      <span>Reject: ${Number(milestone.rejectCount)}</span>
      <span>Resolve: ${Number(milestone.resolveVoteCount)}/2</span>
    </div>
    <div class="milestone-meta">
      <span>${escapeHtml(submitted)}</span>
      <span>${escapeHtml(milestone.evidenceCID || "Chua co CID")}</span>
      <span>ID: ${index}</span>
    </div>
  `;

  return card;
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
  log(`Da xac nhan block ${receipt.blockNumber}`, "success");
}

function renderAccount() {
  ui.accountText.textContent = state.account ? shortAddress(state.account) : "Chua ket noi";
  ui.networkBadge.textContent = state.chainId ? `Chain ${state.chainId}` : "Chua ket noi";
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
  ui.refreshBtn.addEventListener("click", () => run(refreshSummary));
  ui.loadMilestonesBtn.addEventListener("click", () => run(loadMilestones));
  ui.clearLogBtn.addEventListener("click", () => {
    ui.activityLog.innerHTML = "";
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

  ui.submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(async () => {
      await sendTx(
        (contract) => contract.submitMilestone(ui.submitMilestoneId.value, ui.evidenceCid.value.trim()),
        "Submit milestone"
      );
      await loadMilestones();
    });
  });

  ui.rejectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(async () => {
      await sendTx(
        (contract) => contract.reject(ui.rejectMilestoneId.value, ui.rejectReason.value.trim()),
        "Reject"
      );
      await loadMilestones();
    });
  });

  ui.resolveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(async () => {
      await sendTx(
        (contract) => contract.voteResolve(ui.resolveMilestoneId.value),
        "Vote resolve"
      );
      await loadMilestones();
    });
  });

  ui.releaseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    run(async () => {
      await sendTx(
        (contract) => contract.release(ui.releaseMilestoneId.value),
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
    });

    window.ethereum.on("chainChanged", (chainId) => {
      state.chainId = BigInt(chainId).toString();
      state.provider = null;
      state.signer = null;
      state.contract = null;
      renderAccount();
      log("Da doi network, hay ket noi lai contract.");
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
  });
}

function init() {
  ui.contractAddress.value = state.contractAddress;
  bindEvents();
  renderAccount();
  if (!window.ethereum) {
    log("Chua phat hien MetaMask. Van co the xem giao dien, nhung can vi de giao dich.", "error");
  } else {
    log("Frontend san sang.");
  }
}

init();
