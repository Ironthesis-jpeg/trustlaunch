/* =====================================================
   TRUSTLAUNCH CORE ENGINE
   (Scalable, no-rewrite architecture)
===================================================== */

/* =========================
   WALLET
========================= */

function getWallet() {
  return localStorage.getItem("walletAddress");
}

/* Optional UI sync */
function updateWalletUI() {
  const el = document.getElementById("walletDisplay");
  if (!el) return;

  const wallet = getWallet();
  el.textContent = wallet
    ? wallet.slice(0, 6) + "..." + wallet.slice(-4)
    : "Not Connected";
}

/* =========================
   TRUST SCORE ENGINE
   (future-proof scoring system)
========================= */

function calculateTrustScore(project) {
  let score = 50;

  // Fee system
  if (project.creator_fee == 0) score += 20;
  else if (project.creator_fee == 1) score += 15;
  else if (project.creator_fee == 2) score += 10;

  // Launch type weighting
  if (project.launch_type === "Safe") score += 15;
  else if (project.launch_type === "Pro") score += 10;

  // Completeness signals
  if (project.website) score += 5;
  if (project.twitter) score += 5;
  if (project.logo) score += 5;

  // Scarcity signal
  if (project.total_supply && project.total_supply < 1000000) {
    score += 10;
  }

  return Math.min(score, 100);
}

/* =========================
   PROJECT BUILDER (SOURCE OF TRUTH)
========================= */

function buildProjectFromForm() {
  const wallet = getWallet();

  if (!wallet) {
    alert("Connect wallet first");
    return null;
  }

  const project = {
    token_name: document.getElementById("tokenName").value.trim(),
    token_symbol: document.getElementById("tokenSymbol").value.trim().toUpperCase(),
    description: document.getElementById("projectDescription").value,
    website: document.getElementById("projectWebsite").value,
    twitter: document.getElementById("projectTwitter").value,
    logo: document.getElementById("projectLogo").value,
    category: document.getElementById("projectCategory").value,
    launch_type: document.getElementById("launchType").value,
    total_supply: Number(document.getElementById("totalSupply").value),
    creator_fee: Number(document.getElementById("creatorFee").value),
    creator_wallet: wallet,

    views: 0,
    likes: 0,
    trending_score: 0,
    created_at: new Date().toISOString()
  };

  project.trust_score = calculateTrustScore(project);

  return project;
}

/* =========================
   DRAFT STORAGE SYSTEM
========================= */

function saveDraft(project) {
  sessionStorage.setItem("pendingProject", JSON.stringify(project));
}

function loadDraft() {
  const data = sessionStorage.getItem("pendingProject");
  return data ? JSON.parse(data) : null;
}

function clearDraft() {
  sessionStorage.removeItem("pendingProject");
}

/* =========================
   INIT FORM HANDLER (GLOBAL SAFE)
========================= */

function initLaunchForm() {
  const form = document.getElementById("launchForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const project = buildProjectFromForm();
    if (!project) return;

    saveDraft(project);

    window.location.href = "review.html";
  });
}

/* =========================
   INIT SYSTEM
========================= */

document.addEventListener("DOMContentLoaded", () => {
  updateWalletUI();
  initLaunchForm();
});