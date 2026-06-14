let currentWallet = null;

/* =========================
   CONNECT WALLET
========================= */

async function connectWallet() {

  if (!window.ethereum) {
    alert("No EVM wallet detected. Install MetaMask or a compatible wallet.");
    return;
  }

  try {

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    currentWallet = accounts[0];

    localStorage.setItem("walletAddress", currentWallet);

    alert("Wallet Connected: " + currentWallet);

    updateWalletUI();

  } catch (err) {
    console.error(err);
    alert("Wallet connection failed");
  }
}

/* =========================
   GET WALLET
========================= */

function getWallet() {
  return localStorage.getItem("walletAddress");
}

/* =========================
   AUTO UPDATE UI
========================= */

function updateWalletUI() {

  const el = document.getElementById("walletDisplay");

  if (el) {
    el.innerText = getWallet() || "Not Connected";
  }
}

/* =========================
   INIT ON LOAD
========================= */

window.addEventListener("load", updateWalletUI);