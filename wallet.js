let currentWallet = null;

/* =========================
   SUPABASE CLIENT (GLOBAL)
========================= */

const supabase = window.supabase
  ? window.supabase.createClient(
      "https://uyuokduxqjghmqypheyi.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dW9rZHV4cWpnaG1xeXBoZXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDgwMDAsImV4cCI6MjA5NjE4NDAwMH0.1RIJxhyo3Nrjn52qtSP3WTJTDqFT9UayRmaBSUwkZVw"
    )
  : null;

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

    /* NEW: ensure user profile exists */
    if (supabase) {
      await ensureProfile(currentWallet);
    }

    alert("Wallet Connected: " + currentWallet);

    updateWalletUI();

  } catch (err) {
    console.error(err);
    alert("Wallet connection failed");
  }
}

/* =========================
   ENSURE PROFILE EXISTS (NEW CORE FEATURE)
========================= */

async function ensureProfile(wallet) {

  try {

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("wallet", wallet)
      .maybeSingle();

    if (error) {
      console.log("Profile check error:", error.message);
      return;
    }

    if (!data) {

      await supabase
        .from("profiles")
        .insert([
          {
            wallet: wallet,
            username: "User_" + wallet.slice(0, 6),
            bio: "",
            avatar: "",
            reputation: 50,
            created_at: new Date().toISOString()
          }
        ]);

      console.log("Profile created for:", wallet);
    }

  } catch (err) {
    console.log("ensureProfile failed:", err.message);
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
   AUTO RECONNECT ON LOAD
========================= */

window.addEventListener("load", async () => {

  updateWalletUI();

  /* optional auto-detect existing MetaMask session */
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts"
      });

      if (accounts && accounts.length > 0) {
        currentWallet = accounts[0];
        localStorage.setItem("walletAddress", currentWallet);
        updateWalletUI();
      }

    } catch (err) {
      console.log("Auto wallet detect failed:", err.message);
    }
  }
});