import React, { useEffect, useMemo, useState } from "react";
import {
  listFunnels,
  listRoutes,
  listDestinations,
  createRoute,
  updateRoute,
  deleteRoute,
} from "../lib/api.js";

export default function Routing() {
  const [funnels, setFunnels] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [routes, setRoutes] = useState([]);
  const [destinations, setDestinations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Add Route form
  const [newDestId, setNewDestId] = useState("");
  const [newPriority, setNewPriority] = useState(100);
  const [newEnabled, setNewEnabled] = useState(true);

  const destById = useMemo(() => {
    const m = new Map();
    for (const d of destinations) m.set(d.id, d);
    return m;
  }, [destinations]);

  async function refreshFunnelsAndDestinations() {
    const [f, d] = await Promise.all([listFunnels(), listDestinations()]);
    const fList = f?.results || [];
    setFunnels(fList);
    setDestinations(d?.results || []);
    if (!selectedKey) setSelectedKey(fList[0]?.key || "");
  }

  async function refreshRoutes(funnelKey) {
    if (!funnelKey) { setRoutes([]); return; }
    const r = await listRoutes(funnelKey);
    setRoutes(r?.results || []);
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        await refreshFunnelsAndDestinations();
      } catch (e) {
        setErr(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        await refreshRoutes(selectedKey);
      } catch (e) {
        setErr(e?.message || String(e));
      }
    })();
  }, [selectedKey]);

  async function onAddRoute() {
    if (!selectedKey) { setErr("Select a funnel first."); return; }
    if (!newDestId) { setErr("Select a destination."); return; }

    try {
      setBusy(true);
      setErr("");
      await createRoute({
        funnel_key: selectedKey,
        destination_id: newDestId,
        priority: Number(newPriority) || 100,
        is_enabled: !!newEnabled,
      });
      await refreshRoutes(selectedKey);
      // keep destination selection; reset priority/enabled to defaults if you want:
      // setNewPriority(100); setNewEnabled(true);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onToggleRoute(r) {
    try {
      setBusy(true);
      setErr("");
      await updateRoute(r.id, {
        funnel_key: r.funnel_key,
        destination_id: r.destination_id,
        priority: r.priority,
        is_enabled: !r.is_enabled,
      });
      await refreshRoutes(selectedKey);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteRoute(r) {
    try {
      setBusy(true);
      setErr("");
      await deleteRoute(r.id);
      await refreshRoutes(selectedKey);
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, padding: 16 }}>
      {/* Left: Funnels */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", fontWeight: 800 }}>
          Funnels
        </div>

        <div>
          {funnels.map((f) => (
            <button
              key={f.key}
              onClick={() => setSelectedKey(f.key)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                border: "none",
                borderBottom: "1px solid #f1f5f9",
                background: selectedKey === f.key ? "#f8fafc" : "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{f.name || f.key}</span>
                <span style={{
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid #e5e7eb",
                  opacity: 0.8
                }}>
                  {f.is_enabled ? "enabled" : "disabled"}
                </span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.65, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {f.key}
              </div>
            </button>
          ))}
          {!funnels.length && <div style={{ padding: 12, opacity: 0.7 }}>No funnels yet.</div>}
        </div>
      </div>

      {/* Right: Routes */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", fontWeight: 800 }}>
          Routes for:{" "}
          <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {selectedKey || "—"}
          </span>
        </div>

        {err && (
          <div style={{ padding: 12, color: "#b91c1c", borderBottom: "1px solid #fee2e2" }}>
            {err}
          </div>
        )}

        {/* Add Route */}
        <div style={{ padding: 12, borderBottom: "1px solid #f1f5f9", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Destination</div>
            <select
              value={newDestId}
              onChange={(e) => setNewDestId(e.target.value)}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb", minWidth: 260 }}
              disabled={busy}
            >
              <option value="">Select destination…</option>
              {destinations
                .filter((d) => d.is_enabled)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.destination_type})
                  </option>
                ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Priority</div>
            <input
              type="number"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb", width: 120 }}
              disabled={busy}
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18 }}>
            <input
              type="checkbox"
              checked={newEnabled}
              onChange={(e) => setNewEnabled(e.target.checked)}
              disabled={busy}
            />
            Enabled
          </label>

          <button
            onClick={onAddRoute}
            disabled={busy || !selectedKey}
            style={{
              marginTop: 18,
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: busy ? "#f8fafc" : "#fff",
              cursor: busy ? "not-allowed" : "pointer",
              fontWeight: 800,
            }}
          >
            {busy ? "Working…" : "Add Route"}
          </button>

          <button
            onClick={async () => {
              try {
                setBusy(true);
                setErr("");
                await refreshFunnelsAndDestinations();
                await refreshRoutes(selectedKey);
              } catch (e) {
                setErr(e?.message || String(e));
              } finally {
                setBusy(false);
              }
            }}
            disabled={busy}
            style={{
              marginTop: 18,
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: busy ? "#f8fafc" : "#fff",
              cursor: busy ? "not-allowed" : "pointer",
              fontWeight: 800,
              opacity: 0.85
            }}
          >
            Refresh
          </button>
        </div>

        {/* Routes table */}
        <div style={{ padding: 12 }}>
          {routes.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No routes mapped to this funnel yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 12, opacity: 0.7 }}>
                  <th style={{ padding: "8px 6px" }}>Enabled</th>
                  <th style={{ padding: "8px 6px" }}>Priority</th>
                  <th style={{ padding: "8px 6px" }}>Destination</th>
                  <th style={{ padding: "8px 6px" }}>Type</th>
                  <th style={{ padding: "8px 6px" }}></th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => {
                  const d = destById.get(r.destination_id);
                  return (
                    <tr key={r.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 6px" }}>
                        <button
                          onClick={() => onToggleRoute(r)}
                          disabled={busy}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: "1px solid #e5e7eb",
                            background: "#fff",
                            cursor: busy ? "not-allowed" : "pointer",
                            fontWeight: 800,
                          }}
                          title="Toggle enabled"
                        >
                          {r.is_enabled ? "Yes" : "No"}
                        </button>
                      </td>
                      <td style={{ padding: "10px 6px" }}>{r.priority}</td>
                      <td style={{ padding: "10px 6px" }}>
                        {d?.name || r.destination_name || r.destination_id}
                        <div style={{ fontSize: 12, opacity: 0.65, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                          {r.destination_id}
                        </div>
                      </td>
                      <td style={{ padding: "10px 6px" }}>
                        {d?.destination_type || r.destination_type || "—"}
                      </td>
                      <td style={{ padding: "10px 6px", textAlign: "right" }}>
                        <button
                          onClick={() => onDeleteRoute(r)}
                          disabled={busy}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 10,
                            border: "1px solid #fecaca",
                            background: "#fff",
                            cursor: busy ? "not-allowed" : "pointer",
                            fontWeight: 800,
                            color: "#b91c1c",
                          }}
                          title="Delete route"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ padding: 12, borderTop: "1px solid #e5e7eb", fontSize: 12, opacity: 0.7 }}>
          v1: add route, toggle enabled, delete route. Next: funnel create/disable + per-funnel recipients.
        </div>
      </div>
    </div>
  );
}