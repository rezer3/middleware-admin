import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLead } from "../lib/api";

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [rawPayload, setRawPayload] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await getLead(id);
      setLead(res.lead || null);
      setRawPayload(res.raw_payload || null);
    } catch (e) {
      setError(e.message || "Failed to load lead");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  if (loading) return <div>Loading…</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!lead) return null;

  return (
    <div>
      <nav style={{ marginBottom: 20 }}>
        <Link to="/leads">← Back to Leads</Link>
      </nav>

      <h1>Lead Detail</h1>

      <table border="1" cellPadding="6">
        <tbody>
          <tr>
            <td>ID</td>
            <td>{lead.id}</td>
          </tr>
          <tr>
            <td>Name</td>
            <td>{lead.name || "-"}</td>
          </tr>
          <tr>
            <td>Email</td>
            <td>{lead.email || "-"}</td>
          </tr>
          <tr>
            <td>Phone</td>
            <td>{lead.phone || "-"}</td>
          </tr>
          <tr>
            <td>Funnel</td>
            <td>{lead.funnel || "-"}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td>{lead.overall_status || lead.status || "-"}</td>
          </tr>
          <tr>
            <td>Received</td>
            <td>{new Date(lead.received_at).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ marginTop: 20 }}>Raw Payload</h3>
<pre>{JSON.stringify(rawPayload || {}, null, 2)}</pre>
    </div>
  );
}