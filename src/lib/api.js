const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8787";

function getToken() {
  return localStorage.getItem("ADMIN_API_TOKEN") || "";
}

async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
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