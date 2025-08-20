import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Layout from "./components/Layout";
import TOC from "./components/TOC";
import DocRenderer from "./components/DocRenderer";
import Assistant from "./components/Assistant";
import { getAllDocs } from "./mocks/mock";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // do not hardcode
const API = BACKEND_URL ? `${BACKEND_URL}/api` : null;

function AppShell() {
  const docs = useMemo(() => getAllDocs(), []);
  const firstDocId = docs[0]?.id || "introduction";
  const [tocCollapsed, setTocCollapsed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("toc_prefs_v1")).collapsed ?? false; } catch { return false; }
  });
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [contextDoc, setContextDoc] = useState(null);

  useEffect(() => {
    // Smoke test to backend hello route if configured
    async function ping() {
      if (!API) return;
      try {
        const response = await axios.get(`${API}/`);
        console.log(response.data.message);
      } catch (e) {
        console.warn("Backend not reachable yet (expected in mock phase)");
      }
    }
    ping();
  }, []);

  return (
    <Layout onToggleAssistant={() => setAssistantOpen(true)}>
      <TOC collapsed={tocCollapsed} setCollapsed={setTocCollapsed}>
        <Routes>
          <Route path="/docs/:id" element={<DocRenderer onAskAssistant={(meta) => { setContextDoc(meta); setAssistantOpen(true); }} />} />
          <Route path="/" element={<Navigate to={`/docs/${firstDocId}`} replace />} />
          <Route path="*" element={<Navigate to={`/docs/${firstDocId}`} replace />} />
        </Routes>
      </TOC>
      <Assistant open={assistantOpen} onClose={() => setAssistantOpen(false)} contextDoc={contextDoc} />
    </Layout>
  );
}

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </div>
  );
}