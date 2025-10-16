// src/api.ts
let authToken: string | null = null;

const API_BASE = "http://localhost:6767/api";

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    if (authToken) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText}\n${text}`);
    }

    if (response.status === 204) return null; // No content
    return response.json();
  }

  // ---------------- Auth ----------------
  export async function login(username: string, password: string) {
    const data = await request("/Auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    authToken = data.token; // Save JWT
    return data;
  }

  export async function register(username: string, password: string) {
    return request("/Auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  export async function logout(playerId: string) {
    const result = await request("/Auth/logout", {
      method: "POST",
      body: JSON.stringify({ playerId }),
    });
    authToken = null;
    return result;
  }

  // ---------------- Mining ----------------
  export async function startMining() {
    return request("/Mining/start", { method: "POST" });
  }

  export async function stopMining() {
    return request("/Mining/stop", { method: "POST" });
  }

  export async function claimMining() {
    return request("/Mining/claim", { method: "POST" });
  }

  export async function miningStatus() {
    return request("/Mining/status");
  }

  export async function miningHistory(limit = 10) {
    return request(`/Mining/history?limit=${limit}`);
  }

  export async function miningStats() {
    return request("/Mining/stats");
  }

  // ---------------- Player ----------------
  export async function getPlayer() {
    return request("/Player");
  }

  export async function getPlayerByUsername(username: string) {
    return request(`/Player/${username}`);
  }

  export async function getPlayerById(playerId: string) {
    return request(`/Player/id/${playerId}`);
  }

  export async function getOnlinePlayers() {
    return request("/Player/online");
  }

  export async function scanPlayers() {
    return request("/Player/scan");
  }

  // ---------------- Utility ----------------
  export function clearAuthToken() {
    authToken = null;
  }
  