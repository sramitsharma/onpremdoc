import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../components/ui/resizable";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { getGroupedBySection } from "../mocks/mock";

const STORAGE_KEY = "toc_prefs_v1";

export default function TOC({ collapsed, setCollapsed, children }) {
  const [panelWidth, setPanelWidth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw).panelWidth ?? 280 : 280;
    } catch {
      return 280;
    }
  });
  const [query, setQuery] = useState("");
  const location = useLocation();
  const grouped = useMemo(() => getGroupedBySection(), []);
  const sections = Object.keys(grouped);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ panelWidth, collapsed })
    );
  }, [panelWidth, collapsed]);

  const filtered = useMemo(() => {
    if (!query) return grouped;
    const q = query.toLowerCase();
    const out = {};
    for (const sec of sections) {
      const items = grouped[sec].filter((d) => d.title.toLowerCase().includes(q));
      if (items.length) out[sec] = items;
    }
    return out;
  }, [grouped, query, sections]);

  return (
    <ResizablePanelGroup direction="horizontal" className="w-full">
      {!collapsed && (
        <ResizablePanel defaultSize={panelWidth} minSize={16} maxSize={40} onResize={(w) => setPanelWidth(w)}>
          <div className="h-[calc(100vh-56px)] sticky top-14 overflow-auto pr-3">
            <div className="flex items-center justify-between py-3">
              <h2 className="text-sm font-medium text-muted-foreground">Contents</h2>
              <Button size="sm" variant="ghost" onClick={() => setCollapsed(true)}>Collapse</Button>
            </div>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="mb-3" />
            <nav aria-label="Table of contents" className="space-y-4">
              {Object.keys(filtered).map((sec) => (
                <section key={sec}>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{sec}</h3>
                  <ul className="space-y-1">
                    {filtered[sec].map((d) => (
                      <li key={d.id}>
                        <NavLink
                          to={`/docs/${d.id}`}
                          className={({ isActive }) =>
                            `block px-2 py-1 rounded hover:bg-accent focus:bg-accent outline-none ${isActive ? "bg-accent" : ""}`
                          }
                          aria-current={location.pathname === `/docs/${d.id}` ? "page" : undefined}
                        >
                          {d.title}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </nav>
          </div>
        </ResizablePanel>
      )}
      {!collapsed && <ResizableHandle withHandle />}
      <ResizablePanel>
        <div className="relative">{children}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}