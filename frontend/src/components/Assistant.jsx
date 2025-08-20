import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { assistantAsk, assistantConfig } from "../mocks/mock";

const STORE_KEY = "assistant_state_v1";

export default function Assistant({ open, onClose, contextDoc }) {
  const [position, setPosition] = useState(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw).position ?? { x: 40, y: 80 } : { x: 40, y: 80 };
    } catch {
      return { x: 40, y: 80 };
    }
  });
  const [size, setSize] = useState(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw).size ?? { w: 420, h: 420 } : { w: 420, h: 420 };
    } catch {
      return { w: 420, h: 420 };
    }
  });
  const [minimized, setMinimized] = useState(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw).minimized ?? false : false;
    } catch { return false; }
  });
  const [consent, setConsent] = useState(() => true);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const panelRef = useRef(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const resizeRef = useRef({ resizing: false, startX: 0, startY: 0, originW: 0, originH: 0 });

  useEffect(() => {
    if (!open) return;
    const onMove = (e) => {
      if (dragRef.current.dragging) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPosition({ x: Math.max(8, dragRef.current.originX + dx), y: Math.max(56, dragRef.current.originY + dy) });
      }
      if (resizeRef.current.resizing) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        setSize({ w: Math.min(Math.max(320, resizeRef.current.originW + dx), 800), h: Math.min(Math.max(280, resizeRef.current.originH + dy), 800) });
      }
    };
    const onUp = () => {
      dragRef.current.dragging = false;
      resizeRef.current.resizing = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [open]);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ position, size, minimized }));
  }, [position, size, minimized]);

  const snippet = useMemo(() => {
    if (!contextDoc || !consent) return undefined;
    const title = contextDoc.title;
    const summary = contextDoc.summary || "";
    const text = (title + ": " + summary).slice(0, assistantConfig.maxSnippetLen);
    return { title, snippet: text };
  }, [contextDoc, consent]);

  async function handleAsk() {
    const ctx = snippet ? { title: snippet.title, text: snippet.snippet } : undefined;
    const userMsg = { role: "user", content: prompt || "Explain this page" };
    setMessages((m) => [...m, userMsg, { role: "assistant", content: "" }]);
    setPrompt("");
    try {
      const stream = await assistantAsk({ prompt, context: contextDoc });
      for await (const ch of stream) {
        setMessages((m) => {
          const last = m[m.length - 1];
          const rest = m.slice(0, -1);
          return [...rest, { ...last, content: last.content + ch }];
        });
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "system", content: "Assistant failed to respond." }]);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-50 shadow-lg border border-border rounded-md bg-card text-card-foreground"
      style={{ left: position.x, top: position.y, width: size.w, height: minimized ? undefined : size.h }}
      role="dialog"
      aria-label="Assistant"
    >
      <div
        className="cursor-move select-none px-3 py-2 flex items-center justify-between border-b border-border bg-background/70 backdrop-blur"
        onMouseDown={(e) => {
          dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, originX: position.x, originY: position.y };
        }}
      >
        <div className="text-sm font-medium">
          {assistantConfig.personaTitle}
          <span className="ml-2 text-xs text-muted-foreground">(drag me)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setMinimized((v) => !v)}>{minimized ? "Expand" : "Minimize"}</Button>
          <Button size="sm" variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>

      {!minimized && (
        <div className="flex flex-col h-[calc(100%-40px)]">
          <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground border-b border-border">
            <div>Context sharing: {consent ? "On" : "Off"}</div>
            <Button size="sm" variant="ghost" onClick={() => { setConsent((c) => !c); }}>
              {consent ? "Disable" : "Enable"}
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ask me anything about the current page.</p>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div className={"inline-block px-3 py-2 rounded-md " + (m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>{m.content}</div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <Textarea rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask in-character…" className="flex-1" />
              <Button onClick={handleAsk} disabled={!prompt.trim()}>Send</Button>
            </div>
          </div>
        </div>
      )}

      {/* Resize handle */}
      <div
        onMouseDown={(e) => {
          resizeRef.current = { resizing: true, startX: e.clientX, startY: e.clientY, originW: size.w, originH: size.h };
        }}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        aria-hidden
      />
    </div>
  );
}