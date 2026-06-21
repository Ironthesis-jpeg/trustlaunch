/* =====================================================
   TRUSTLAUNCH SUPABASE LAYER
   (Single source of truth for all DB operations)
===================================================== */

/* =========================
   CONFIG
========================= */

const SUPABASE_URL = "https://uyuokduxqjghmqypheyi.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dW9rZHV4cWpnaG1xeXBoZXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDgwMDAsImV4cCI6MjA5NjE4NDAwMH0.1RIJxhyo3Nrjn52qtSP3WTJTDqFT9UayRmaBSUwkZVw";

/* =========================
   INIT SAFELY
========================= */

let supabaseClient = null;

function initSupabase() {
  if (!window.supabase) {
    console.error("Supabase library not loaded");
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
  }

  return supabaseClient;
}

/* =========================
   CORE API FUNCTIONS
========================= */

/**
 * Save a new project (main launch flow)
 */
async function createProject(project) {
  const client = initSupabase();

  if (!client) throw new Error("Supabase not initialized");

  const { data, error } = await client
    .from("projects")
    .insert([
      {
        ...project,
        created_at: project.created_at || new Date().toISOString(),
        views: project.views || 0,
        likes: project.likes || 0,
        trending_score: project.trending_score || 0
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get all projects (Explore page)
 */
async function getProjects(limit = 50) {
  const client = initSupabase();

  const { data, error } = await client
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data;
}

/**
 * Get trending projects
 */
async function getTrendingProjects(limit = 10) {
  const client = initSupabase();

  const { data, error } = await client
    .from("projects")
    .select("*")
    .order("trending_score", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data;
}

/**
 * Update project stats (views, likes, etc.)
 */
async function updateProject(id, updates) {
  const client = initSupabase();

  const { data, error } = await client
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/* =========================
   ANALYTICS HELPERS
========================= */

/**
 * Increment views safely
 */
async function incrementViews(projectId, currentViews = 0) {
  return updateProject(projectId, {
    views: currentViews + 1
  });
}

/**
 * Increment likes safely
 */
async function incrementLikes(projectId, currentLikes = 0) {
  return updateProject(projectId, {
    likes: currentLikes + 1
  });
}

/* =========================
   TRENDING SCORE ENGINE (BASIC)
   - upgrade later with ML/AI logic
========================= */

function calculateTrendingScore(project) {
  let score = 0;

  score += (project.views || 0) * 1;
  score += (project.likes || 0) * 5;
  score += (project.trust_score || 0) * 2;

  // recency boost
  const age = Date.now() - new Date(project.created_at).getTime();
  const hours = age / (1000 * 60 * 60);

  if (hours < 24) score += 50;
  else if (hours < 72) score += 20;

  return Math.floor(score);
}

/**
 * Recalculate trending score and update DB
 */
async function refreshTrendingScore(project) {
  const score = calculateTrendingScore(project);

  return updateProject(project.id, {
    trending_score: score
  });
}

/* =========================
   GLOBAL EXPORTS
========================= */

window.TrustLaunchDB = {
  initSupabase,
  createProject,
  getProjects,
  getTrendingProjects,
  updateProject,
  incrementViews,
  incrementLikes,
  calculateTrendingScore,
  refreshTrendingScore
};