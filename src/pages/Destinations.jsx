import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listDestinations,
  updateDestination,
  sendTestToDestination,
} from "../lib/api";

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
const rows = res.results || res.destinations || [];
 const normalized = rows.map((d) => ({
  ...d,
  enabled: !!d.enabled,
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
    setType(d.type || "");
    setConfig(JSON.stringify(d.config || {}, null, 2));
    setEnabled(!!d.enabled);
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
              <td>{d.id}</td>
              <td>{d.type}</td>
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