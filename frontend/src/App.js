import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import TOC from "./components/TOC";
import DocRenderer from "./components/DocRenderer";
import { getAllDocs } from "./mocks/mock";
import useLocalStorage from "./hooks/use-local-storage";
import { STORAGE_KEYS } from "./constants";

const useTocState = () => {
  const [tocCollapsed, setTocCollapsed] = useLocalStorage(
    `${STORAGE_KEYS.TOC_PREFERENCES}.collapsed`, 
    false
  );

  return { tocCollapsed, setTocCollapsed };
};

const AppShell = () => {
  const docs = React.useMemo(() => getAllDocs(), []);
  const firstDocId = docs[0]?.id || "introduction";
  const { tocCollapsed, setTocCollapsed } = useTocState();

  return (
    <Layout>
      <TOC collapsed={tocCollapsed} setCollapsed={setTocCollapsed}>
        <Routes>
          <Route path="/docs/:id" element={<DocRenderer />} />
          <Route 
            path="/" 
            element={<Navigate to={`/docs/${firstDocId}`} replace />} 
          />
          <Route 
            path="*" 
            element={<Navigate to={`/docs/${firstDocId}`} replace />} 
          />
        </Routes>
      </TOC>
    </Layout>
  );
};

const App = () => (
  <div className="App">
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  </div>
);

export default App;