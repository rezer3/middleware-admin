import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listLeads } from "../lib/api";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [token, setToken] = useState(
    localStorage.getItem("ADMIN_API_TOKEN") || ""
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await listLeads({ limit: 20, offset });
setLeads(res.results || res.leads || []);
    } catch (e) {
      setError(e.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [offset]);

  function saveToken() {
    localStorage.setItem("ADMIN_API_TOKEN", token);
    window.location.reload();
  }

  function clearToken() {
    localStorage.removeItem("ADMIN_API_TOKEN");
    window.location.reload();
  }

  return (
    <div>
 
      <h1>Leads</h1>

      <div style={{ marginBottom: 20 }}>
        <label>
          <strong>Admin Token</strong>
        </label>
        <br />
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ width: 400 }}
        />
        <button onClick={saveToken} style={{ marginLeft: 8 }}>
          Save
        </button>
        <button onClick={clearToken} style={{ marginLeft: 4 }}>
          Clear
        </button>
        <div style={{ fontSize: 12, color: "#666" }}>
          If you see 401 errors, paste the Worker ADMIN_API_TOKEN here.
        </div>
      </div>

      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      <table border="1" cellPadding="6" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Received</th>
            <th>Name</th>
            <th>Email</th>
            <th>Funnel</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 && (
            <tr>
              <td colSpan="5">No leads</td>
            </tr>
          )}
          {leads.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.received_at).toLocaleString()}</td>
              <td>
                <Link to={`/leads/${l.id}`}>
                  {l.name || "(no name)"}
                </Link>
              </td>
              <td>{l.email || "-"}</td>
              <td>{l.funnel || "-"}</td>
     <td>{l.overall_status || l.status || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 10 }}>
        <button disabled={offset === 0} onClick={() => setOffset(offset - 20)}>
          Prev
        </button>
        <button onClick={() => setOffset(offset + 20)} style={{ marginLeft: 4 }}>
          Next
        </button>
        <button onClick={load} style={{ marginLeft: 8 }}>
          Refresh
        </button>
        <span style={{ marginLeft: 10 }}>offset {offset}</span>
      </div>
    </div>
  );
}