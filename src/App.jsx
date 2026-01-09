import { Routes, Route, Link, Navigate } from "react-router-dom";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Destinations from "./pages/Destinations";

export default function App() {
  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ marginBottom: 16 }}>
        <Link to="/leads">Leads</Link>{" | "}
        <Link to="/destinations">Destinations</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/leads" />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
        <Route path="/destinations" element={<Destinations />} />
      </Routes>
    </div>
  );
}