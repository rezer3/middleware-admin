import React, { useEffect, useMemo, useState } from "react";
import { listFunnels, listRoutes, listDestinations } from "../lib/api.js";

export default function Routing() {
  const [funnels, setFunnels] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [routes, setRoutes] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const destById = useMemo(() => {
    const m = new Map();
    for (const d of destinations) m.set(d.id, d);
    return m;
  }, [destinations]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const [f, d] = await Promise.all([listFunnels(), listDestinations()]);
        const fList = (f?.results || []);
        setFunnels(fList);
        setDestinations(d?.results || []);
        const first = fList[0]?.key || "";
        setSelectedKey(first);
      } catch (e) {
        setErr(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedKey) { setRoutes([]); return; }
    (async () => {
      try {
        setErr("");
        const r = await listRoutes(selectedKey);
        setRoutes(r?.results || []);
      } catch (e) {
        setErr(e?.message || String(e));
      }
    })();
  }, [selectedKey]);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, padding: 16 }}>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", fontWeight: 800 }}>Funnels</div>
        <div>
          {funnels.map(f => (
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
                cursor: "pointer"
              }}
            >
              <div style={{ fontWeight: 800 }}>{f.name || f.key}</div>
              <div style={{ fontSize: 12, opacity: 0.65 }}>{f.key}</div>
            </button>
          ))}
          {!funnels.length && <div style={{ padding: 12, opacity: 0.7 }}>No funnels yet.</div>}
        </div>
      </div>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", fontWeight: 800 }}>
          Routes for: <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{selectedKey || "—"}</span>
        </div>

        {err && <div style={{ padding: 12, color: "#b91c1c", borderBottom: "1px solid #fee2e2" }}>{err}</div>}

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
                </tr>
              </thead>
              <tbody>
                {routes.map(r => {
                  const d = destById.get(r.destination_id);
                  return (
                    <tr key={r.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 6px" }}>{r.is_enabled ? "Yes" : "No"}</td>
                      <td style={{ padding: "10px 6px" }}>{r.priority}</td>
                      <td style={{ padding: "10px 6px" }}>{d?.name || r.destination_name || r.destination_id}</td>
                      <td style={{ padding: "10px 6px" }}>{d?.destination_type || r.destination_type || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ padding: 12, borderTop: "1px solid #e5e7eb", fontSize: 12, opacity: 0.7 }}>
          Read-only v1. Next step: add “Add Funnel” + “Add Recipient” + toggles.
        </div>
      </div>
    </div>
  );
}