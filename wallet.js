let provider;
let signer;
let userAddress;

// ---------------------------
// CONNECT WALLET
// ---------------------------
async function connectWallet() {
  try {
    const WalletConnectProvider =
      window.WalletConnectProvider.default;

    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            1: "https://mainnet.infura.io/v3/",
            8453: "https://mainnet.base.org",
            56: "https://bsc-dataseed.binance.org",
            137: "https://polygon-rpc.com"
          }
        }
      }
    };

    const web3Modal = new window.Web3Modal.default({
      cacheProvider: false,
      providerOptions
    });

    const externalProvider = await web3Modal.connect();

    provider = new ethers.providers.Web3Provider(externalProvider);
    signer = provider.getSigner();

    userAddress = await signer.getAddress();
    const network = await provider.getNetwork();

    // SAVE WALLET
    localStorage.setItem("walletAddress", userAddress);
    localStorage.setItem("chainId", network.chainId);

    alert("Wallet Connected:\n" + userAddress);

    updateWalletUI();

    return userAddress;
  } catch (err) {
    console.error(err);
    alert("Wallet connection failed");
  }
}

// ---------------------------
// DISCONNECT WALLET
// ---------------------------
function disconnectWallet() {
  localStorage.removeItem("walletAddress");
  localStorage.removeItem("chainId");

  userAddress = null;

  updateWalletUI();
}

// ---------------------------
// GET WALLET
// ---------------------------
function getWallet() {
  return localStorage.getItem("walletAddress");
}

// ---------------------------
// UI UPDATE
// ---------------------------
function updateWalletUI() {
  const el = document.getElementById("walletAddress");

  if (!el) return;

  const wallet = getWallet();

  el.innerText = wallet
    ? wallet.slice(0, 6) + "..." + wallet.slice(-4)
    : "Not Connected";
}

// ---------------------------
// AUTO INIT
// ---------------------------
window.addEventListener("load", () => {
  updateWalletUI();
});