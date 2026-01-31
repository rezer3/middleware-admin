//filepath: /Users/ramonrootharam/middlewareui/middleware-admin/src/lib/api.js

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8787";

function getToken() {
  return localStorage.getItem("ADMIN_API_TOKEN") || "";
}

async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
   headers: {
  ...(options.headers || {}),
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  "content-type": "application/json",
},
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json();
}

/* ---------------- LEADS ---------------- */

export function listLeads({ limit = 20, offset = 0 } = {}) {
  return apiFetch(`/admin/leads?limit=${limit}&offset=${offset}`);
}

export function getLead(id) {
  return apiFetch(`/admin/leads/${id}`);
}

/* ------------- DESTINATIONS ------------- */

export function listDestinations() {
  return apiFetch(`/admin/destinations`);
}

export function updateDestination(id, body) {
  return apiFetch(`/admin/destinations/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function sendTestToDestination(id) {
  return apiFetch(`/admin/destinations/${id}/test`, {
    method: "POST",
  });
}
// Funnels
export function listFunnels() {
  return apiFetch("/admin/funnels");
}

export async function listProviderKeys() {
  return await apiFetch("/admin/provider-keys", { method: "GET" });
}

export async function upsertProviderKey(provider, api_key) {
  return await apiFetch(`/admin/provider-keys/${encodeURIComponent(provider)}`, {
    method: "PUT",
    body: JSON.stringify({ api_key }),
  });
}

export function upsertFunnel(key, body) {
  // if key is provided: PUT /admin/funnels/:key, else POST /admin/funnels
  if (key) return apiFetch(`/admin/funnels/${encodeURIComponent(key)}`, { method: "PUT", body: JSON.stringify(body) });
  return apiFetch("/admin/funnels", { method: "POST", body: JSON.stringify(body) });
}

export function deleteFunnel(key) {
  return apiFetch(`/admin/funnels/${encodeURIComponent(key)}`, { method: "DELETE" });
}

// Routes
export function listRoutes(funnelKey) {
  const qs = funnelKey ? `?funnel_key=${encodeURIComponent(funnelKey)}` : "";
  return apiFetch(`/admin/routes${qs}`);
}

export function createRoute(body) {
  return apiFetch("/admin/routes", { method: "POST", body: JSON.stringify(body) });
}

export function updateRoute(id, body) {
  return apiFetch(`/admin/routes/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) });
}

export function deleteRoute(id) {
  return apiFetch(`/admin/routes/${encodeURIComponent(id)}`, { method: "DELETE" });
}