/* =====================================================
   TRUSTLAUNCH SMART CONTRACT LAYER
   (Factory deployment + future-ready Web3 engine)
===================================================== */

/* =========================
   CONFIG
========================= */

const FACTORY_ADDRESS = "YOUR_FACTORY_ADDRESS_HERE";

/**
 * Minimal ABI for TrustLaunchFactory
 * (expand later if your contract grows)
 */
const FACTORY_ABI = [
  "function createProject(string name, string symbol, uint256 supply, address creator) returns (address)",
  "event ProjectCreated(address indexed projectAddress, address indexed creator)"
];

/* =========================
   PROVIDER / SIGNER STATE
========================= */

let provider;
let signer;
let factoryContract;

/* =========================
   INIT WEB3 CONNECTION
========================= */

async function initWeb3() {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected");
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();

  factoryContract = new ethers.Contract(
    FACTORY_ADDRESS,
    FACTORY_ABI,
    signer
  );

  return factoryContract;
}

/* =========================
   WALLET CONNECTION HELPERS
========================= */

async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    const wallet = accounts[0];

    localStorage.setItem("walletAddress", wallet);

    const el = document.getElementById("walletDisplay");
    if (el) {
      el.textContent =
        wallet.slice(0, 6) + "..." + wallet.slice(-4);
    }

    return wallet;

  } catch (err) {
    console.error(err);
    alert("Wallet connection failed");
  }
}

/* =========================
   DEPLOY PROJECT ON CHAIN
========================= */

async function deployProject(project) {
  try {
    if (!factoryContract) {
      await initWeb3();
    }

    if (!project) {
      throw new Error("Invalid project data");
    }

    const tx = await factoryContract.createProject(
      project.token_name,
      project.token_symbol,
      project.total_supply,
      project.creator_wallet
    );

    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();

    console.log("Transaction confirmed:", receipt.hash);

    return receipt;

  } catch (err) {
    console.error("Deploy failed:", err);
    throw err;
  }
}

/* =========================
   GET DEPLOYED EVENTS (OPTIONAL)
========================= */

async function getProjectEvents() {
  if (!factoryContract) {
    await initWeb3();
  }

  const filter = factoryContract.filters.ProjectCreated();

  const events = await factoryContract.queryFilter(filter);

  return events.map(e => ({
    projectAddress: e.args.projectAddress,
    creator: e.args.creator
  }));
}

/* =========================
   FUTURE HELPERS (RESERVED)
========================= */

/**
 * Will be used later for:
 * - verification badges
 * - project reputation
 * - on-chain analytics
 */
async function getProjectMetadata(address) {
  // reserved for future upgrade
  return {
    address,
    status: "active"
  };
}

/* =========================
   GLOBAL EXPORTS
========================= */

window.TrustLaunchChain = {
  connectWallet,
  initWeb3,
  deployProject,
  getProjectEvents,
  getProjectMetadata
};