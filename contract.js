/* =====================================================
   TRUSTLAUNCH SMART CONTRACT LAYER
   BASE MAINNET PRODUCTION VERSION
===================================================== */

/* =========================
   CONFIG
========================= */

const FACTORY_ADDRESS =
"0x02BB4A286c7079d4455DF9dDf28Af15E825eb018";

const CHAIN_ID = 8453;
const CHAIN_NAME = "Base Mainnet";

/* =========================
   FACTORY ABI
========================= */

const FACTORY_ABI = [

  "function createToken(string name_, string symbol_, uint256 supply_) returns (address)",

  "function getAllTokens() view returns (address[])",

  "function allTokens(uint256) view returns (address)",

  "event TokenCreated(address indexed token,address indexed creator,string name,string symbol,uint256 supply)"
];

/* =========================
   WEB3 STATE
========================= */

let provider;
let signer;
let factoryContract;

/* =========================
   ENSURE BASE NETWORK
========================= */

async function ensureBaseNetwork() {

  const chainId =
    await window.ethereum.request({
      method: "eth_chainId"
    });

  const current =
    parseInt(chainId, 16);

  if (current === CHAIN_ID) {
    return true;
  }

  throw new Error(
    "Please switch wallet to Base Mainnet"
  );
}

/* =========================
   INIT WEB3
========================= */

async function initWeb3() {

  if (!window.ethereum) {
    throw new Error(
      "MetaMask not detected"
    );
  }

  await ensureBaseNetwork();

  provider =
    new ethers.BrowserProvider(
      window.ethereum
    );

  signer =
    await provider.getSigner();

  factoryContract =
    new ethers.Contract(
      FACTORY_ADDRESS,
      FACTORY_ABI,
      signer
    );

  return factoryContract;
}

/* =========================
   CONNECT WALLET
========================= */

async function connectWallet() {

  try {

    if (!window.ethereum) {
      alert("Install MetaMask");
      return null;
    }

    const accounts =
      await window.ethereum.request({
        method: "eth_requestAccounts"
      });

    const wallet =
      accounts[0];

    localStorage.setItem(
      "walletAddress",
      wallet
    );

    const display =
      document.getElementById(
        "walletDisplay"
      );

    if (display) {

      display.textContent =
        wallet.slice(0, 6) +
        "..." +
        wallet.slice(-4);
    }

    return wallet;

  } catch (err) {

    console.error(err);

    alert(
      "Wallet connection failed"
    );

    return null;
  }
}

/* =========================
   DEPLOY TOKEN
========================= */

async function deployProject(project) {

  try {

    if (!project) {
      throw new Error(
        "Invalid project"
      );
    }

    if (!factoryContract) {
      await initWeb3();
    }

    const tx =
      await factoryContract.createToken(
        project.token_name,
        project.token_symbol,
        project.total_supply
      );

    console.log(
      "Transaction sent:",
      tx.hash
    );

    const receipt =
      await tx.wait();

    console.log(
      "Transaction confirmed:",
      receipt
    );

    let tokenAddress = "";

    for (const log of receipt.logs) {

      try {

        const parsed =
          factoryContract.interface.parseLog(log);

        if (
          parsed &&
          parsed.name === "TokenCreated"
        ) {

          tokenAddress =
            parsed.args.token;

          break;
        }

      } catch (_) {}
    }

    const deployment = {

      success: true,

      tx_hash:
        tx.hash,

      token_address:
        tokenAddress,

      creator_wallet:
        project.creator_wallet,

      factory_address:
        FACTORY_ADDRESS,

      chain_id:
        CHAIN_ID,

      chain_name:
        CHAIN_NAME,

      deployed_at:
        new Date().toISOString()
    };

    console.log(
      "Deployment Result:",
      deployment
    );

    return deployment;

  } catch (err) {

    console.error(
      "Deploy failed:",
      err
    );

    throw err;
  }
}

/* =========================
   GET ALL TOKENS
========================= */

async function getAllTokens() {

  if (!factoryContract) {
    await initWeb3();
  }

  return await factoryContract.getAllTokens();
}

/* =========================
   TOKEN EVENTS
========================= */

async function getTokenEvents() {

  if (!factoryContract) {
    await initWeb3();
  }

  const filter =
    factoryContract.filters.TokenCreated();

  const events =
    await factoryContract.queryFilter(filter);

  return events.map(event => ({

    token:
      event.args.token,

    creator:
      event.args.creator,

    name:
      event.args.name,

    symbol:
      event.args.symbol,

    supply:
      event.args.supply.toString()
  }));
}

/* =========================
   FUTURE ANALYTICS
========================= */

async function getProjectMetadata(
  tokenAddress
) {

  return {

    token_address:
      tokenAddress,

    verified:
      false,

    holders:
      0,

    market_cap:
      0,

    liquidity:
      0,

    volume:
      0,

    status:
      "active"
  };
}

/* =========================
   AUTO WALLET DISPLAY
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const wallet =
      localStorage.getItem(
        "walletAddress"
      );

    const display =
      document.getElementById(
        "walletDisplay"
      );

    if (
      wallet &&
      display
    ) {

      display.textContent =
        wallet.slice(0, 6) +
        "..." +
        wallet.slice(-4);
    }
  }
);

/* =========================
   GLOBAL EXPORTS
========================= */

window.TrustLaunchChain = {

  connectWallet,

  initWeb3,

  deployProject,

  getAllTokens,

  getTokenEvents,

  getProjectMetadata,

  FACTORY_ADDRESS,

  CHAIN_ID,

  CHAIN_NAME
};