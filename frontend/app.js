import { ethers } from "https://esm.sh/ethers@6.13.4";
import { NFT_VOTE_HUB_ABI } from "./abi.js";
import { APP_CONFIG, CONTRACT_ADDRESS } from "./config.js";

const connectBtn = document.getElementById("connectBtn");
const refreshBtn = document.getElementById("refreshBtn");
const walletAddressEl = document.getElementById("walletAddress");
const mintFeeValue = document.getElementById("mintFeeValue");
const tokenCountValue = document.getElementById("tokenCountValue");
const proposalCountValue = document.getElementById("proposalCountValue");
const proposalsList = document.getElementById("proposalsList");
const toast = document.getElementById("toast");

let provider;
let signer;
let contract;
let currentAddress = "";

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.background = isError ? "#7d1f1f" : "#1f2b24";
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2800);
}

function shortAddress(address) {
  if (!address) return "Ulanmagan";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function ensureWallet() {
  if (!window.ethereum) {
    showToast("MetaMask topilmadi", true);
    throw new Error("MetaMask not found");
  }
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();

  const network = await provider.getNetwork();
  if (Number(network.chainId) !== APP_CONFIG.CHAIN_ID) {
    showToast(`Walletni ${APP_CONFIG.CHAIN_NAME} tarmog'iga o'tkazing`, true);
    throw new Error("Wrong network");
  }

  contract = new ethers.Contract(CONTRACT_ADDRESS, NFT_VOTE_HUB_ABI, signer);
}

async function connectWallet() {
  await window.ethereum.request({ method: "eth_requestAccounts" });
  await ensureWallet();
  currentAddress = await signer.getAddress();
  walletAddressEl.textContent = shortAddress(currentAddress);
  document.getElementById("mintTo").value = currentAddress;
  showToast("Wallet muvaffaqiyatli ulandi");
  await refreshDashboard();
}

async function refreshDashboard() {
  if (!contract) return;
  const [fee, tokenCount, proposalCount] = await Promise.all([
    contract.mintFee(),
    contract.tokenCounter(),
    contract.proposalCounter()
  ]);
  mintFeeValue.textContent = `${ethers.formatEther(fee)} ETH`;
  tokenCountValue.textContent = tokenCount.toString();
  proposalCountValue.textContent = proposalCount.toString();
  await renderProposals(Number(proposalCount));
}

async function renderProposals(count) {
  proposalsList.innerHTML = "";
  if (count === 0) {
    proposalsList.innerHTML = "<p>Hozircha proposal yo'q.</p>";
    return;
  }

  for (let i = count; i >= 1; i -= 1) {
    const p = await contract.getProposal(i);
    if (!p.active && !p.executed) continue;

    const deadline = new Date(Number(p.deadline) * 1000).toLocaleString();
    const item = document.createElement("div");
    item.className = "proposal-item";
    item.innerHTML = `
      <p class="proposal-title">#${i} ${p.title}</p>
      <p class="proposal-meta">${p.description}</p>
      <p class="proposal-meta">
        Yes: <b>${p.yesVotes}</b> | No: <b>${p.noVotes}</b> | Deadline: ${deadline}
      </p>
      <p class="proposal-meta">
        Holat: ${p.active ? "Active" : "Inactive"} / ${p.executed ? "Executed" : "Pending"}
      </p>
      <div class="proposal-actions">
        <button data-action="yes" data-id="${i}">Yes vote</button>
        <button data-action="no" data-id="${i}" class="secondary">No vote</button>
        <button data-action="execute" data-id="${i}" class="danger">Execute</button>
      </div>
    `;
    proposalsList.appendChild(item);
  }
}

async function sendTx(txPromise, successText) {
  const tx = await txPromise;
  showToast("Tranzaksiya yuborildi...");
  await tx.wait();
  showToast(successText);
  await refreshDashboard();
}

document.getElementById("mintForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const to = document.getElementById("mintTo").value.trim();
    const uri = document.getElementById("mintUri").value.trim();
    const fee = await contract.mintFee();
    await sendTx(contract.mintNFT(to, uri, { value: fee }), "NFT muvaffaqiyatli mint qilindi");
  } catch (error) {
    showToast(error.shortMessage || error.message, true);
  }
});

document.getElementById("updateNftForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const tokenId = document.getElementById("updateTokenId").value;
    const uri = document.getElementById("updateUri").value.trim();
    await sendTx(contract.updateTokenURI(tokenId, uri), "Token URI yangilandi");
  } catch (error) {
    showToast(error.shortMessage || error.message, true);
  }
});

document.getElementById("burnNftForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const tokenId = document.getElementById("burnTokenId").value;
    await sendTx(contract.burnNFT(tokenId), "NFT burn qilindi");
  } catch (error) {
    showToast(error.shortMessage || error.message, true);
  }
});

document.getElementById("proposalForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const title = document.getElementById("proposalTitle").value.trim();
    const desc = document.getElementById("proposalDesc").value.trim();
    const duration = Number(document.getElementById("proposalDuration").value);
    await sendTx(contract.createProposal(title, desc, duration), "Proposal yaratildi");
  } catch (error) {
    showToast(error.shortMessage || error.message, true);
  }
});

document.getElementById("updateProposalForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const id = Number(document.getElementById("updProposalId").value);
    const title = document.getElementById("updProposalTitle").value.trim();
    const desc = document.getElementById("updProposalDesc").value.trim();
    await sendTx(contract.updateProposal(id, title, desc), "Proposal yangilandi");
  } catch (error) {
    showToast(error.shortMessage || error.message, true);
  }
});

document.getElementById("deleteProposalForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const id = Number(document.getElementById("delProposalId").value);
    await sendTx(contract.deleteProposal(id), "Proposal o'chirildi");
  } catch (error) {
    showToast(error.shortMessage || error.message, true);
  }
});

proposalsList.addEventListener("click", async (e) => {
  const button = e.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  const id = Number(button.dataset.id);
  try {
    if (action === "yes") {
      await sendTx(contract.vote(id, true), "Yes vote yuborildi");
    } else if (action === "no") {
      await sendTx(contract.vote(id, false), "No vote yuborildi");
    } else if (action === "execute") {
      await sendTx(contract.executeProposal(id), "Proposal execute qilindi");
    }
  } catch (error) {
    showToast(error.shortMessage || error.message, true);
  }
});

connectBtn.addEventListener("click", async () => {
  try {
    await connectWallet();
  } catch {
    // xatoliklar showToast orqali chiqadi
  }
});

refreshBtn.addEventListener("click", async () => {
  try {
    await refreshDashboard();
    showToast("Dashboard yangilandi");
  } catch (error) {
    showToast(error.shortMessage || error.message, true);
  }
});

if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => window.location.reload());
  window.ethereum.on("chainChanged", () => window.location.reload());
}
