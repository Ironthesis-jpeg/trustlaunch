/* =========================
   TRUSTLAUNCH WALLET CONNECT
========================= */

let currentWallet = null;

/* Detect Ethereum provider */
function getProvider() {
  if (window.ethereum) return window.ethereum;
  return null;
}

/* =========================
   CONNECT WALLET (MetaMask etc.)
========================= */

async function connectWallet() {
  try {

    const provider = getProvider();

    if (!provider) {
      alert("No wallet found. Install MetaMask or use WalletConnect compatible wallet.");
      return;
    }

    // Request accounts
    const accounts = await provider.request({
      method: "eth_requestAccounts"
    });

    currentWallet = accounts[0];

    document.getElementById("walletAddress").textContent = currentWallet;

    localStorage.setItem("walletAddress", currentWallet);

    await signLoginMessage();

  } catch (err) {
    console.error(err);
    alert("Wallet connection failed");
  }
}

/* =========================
   SIGN LOGIN MESSAGE (AUTH)
========================= */

async function signLoginMessage() {
  try {

    const provider = getProvider();

    const message = `
TrustLaunch Login Verification

Wallet: ${currentWallet}
Time: ${new Date().toISOString()}
    `;

    const signature = await provider.request({
      method: "personal_sign",
      params: [message, currentWallet]
    });

    localStorage.setItem("walletSignature", signature);
    localStorage.setItem("walletLoggedIn", "true");

    document.getElementById("status").textContent =
      "Wallet connected & verified ✅";

  } catch (err) {
    console.error(err);
    alert("Signature rejected. Login cancelled.");
  }
}

/* =========================
   DISCONNECT WALLET
========================= */

function disconnectWallet() {
  localStorage.removeItem("walletAddress");
  localStorage.removeItem("walletSignature");
  localStorage.removeItem("walletLoggedIn");

  currentWallet = null;

  document.getElementById("walletAddress").textContent = "Not Connected";
  document.getElementById("status").textContent = "Disconnected";
}

/* =========================
   AUTO LOAD SESSION
========================= */

function loadWalletSession() {
  const saved = localStorage.getItem("walletAddress");

  if (saved) {
    currentWallet = saved;
    const el = document.getElementById("walletAddress");
    if (el) el.textContent = saved;
  }
}

window.addEventListener("load", loadWalletSession);