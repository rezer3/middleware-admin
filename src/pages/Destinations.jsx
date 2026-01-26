import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listDestinations,
  updateDestination,
  sendTestToDestination,
} from "../lib/api";
const DESTINATION_TYPES = [
  { value: "webhook", label: "Webhook" },
  { value: "hubspot_contacts", label: "HubSpot Contacts" },
  { value: "mailgun_email", label: "Mailgun (internal notify)" },
  { value: "sendpulse_client_email", label: "SendPulse (client email)" }
];
export default function Destinations() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [type, setType] = useState("");
  const [config, setConfig] = useState("");
  const [enabled, setEnabled] = useState(false);

  async function load() {
    setError("");
    try {
      const res = await listDestinations();
// inside load()

const rows = res.results || res.destinations || [];
const normalized = rows.map((d) => ({
  ...d,
  // Worker returns destination_type + is_enabled
  type: d.destination_type ?? d.type ?? "",
  enabled: Boolean((d.is_enabled ?? d.enabled) ? 1 : 0),
  config:
    typeof d.config_json === "string"
      ? JSON.parse(d.config_json || "{}")
      : (d.config || {}),
}));
setItems(normalized);
    } catch (e) {
      setError(e.message || "Failed to load destinations");
    }
  }

  useEffect(() => {
    load();
  }, []);

function startEdit(d) {
  setEditing(d.id);
  setType(d.destination_type ?? d.type ?? "");
  setConfig(JSON.stringify(d.config || {}, null, 2));
  setEnabled(Boolean((d.is_enabled ?? d.enabled) ? 1 : 0));
}

  async function save(id) {
    try {
      await updateDestination(id, {
        type,
        enabled,
        config_json: JSON.parse(config),
      });
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message || "Failed to save");
    }
  }

  async function test(id) {
    try {
      await sendTestToDestination(id);
      alert("Test sent");
    } catch (e) {
      alert(e.message || "Test failed");
    }
  }

  return (
    <div>
         <h1>Destinations</h1>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <table border="1" cellPadding="6" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Enabled</th>
            <th>Config</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id}>
             <td>{d.name || d.id}</td>
             <td>
  {editing === d.id ? (
    <select value={type} onChange={(e) => setType(e.target.value)}>
      <option value="">Select…</option>
      {DESTINATION_TYPES.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  ) : (
    d.type
  )}
</td>
              <td>{d.enabled ? "Yes" : "No"}</td>
              <td>
                {editing === d.id ? (
                  <textarea
                    rows={6}
                    cols={40}
                    value={config}
                    onChange={(e) => setConfig(e.target.value)}
                  />
                ) : (
                  <pre>{JSON.stringify(d.config || {}, null, 2)}</pre>
                )}
              </td>
              <td>
                {editing === d.id ? (
                  <>
                    <label>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                      />{" "}
                      Enabled
                    </label>
                    <br />
                    <button onClick={() => save(d.id)}>Save</button>
                    <button onClick={() => setEditing(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(d)}>Edit</button>
                    <button onClick={() => test(d.id)}>Test</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}