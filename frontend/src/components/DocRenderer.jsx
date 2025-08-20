import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { getAllDocs, getNeighbors, loadDocById, prefetchById, getCachedComponent } from "../mocks/mock";

export default function DocRenderer({ onAskAssistant }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const docs = useMemo(() => getAllDocs(), []);
  const [Comp, setComp] = useState(() => getCachedComponent(id));
  const [loading, setLoading] = useState(!Comp);
  const h1Ref = useRef(null);

  // Redirect to first doc if route not found
  useEffect(() => {
    const exists = docs.some((d) => d.id === id);
    if (!exists && docs.length) {
      navigate(`/docs/${docs[0].id}`, { replace: true });
    }
  }, [docs, id, navigate]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadDocById(id)
      .then((C) => {
        if (!alive) return;
        setComp(() => C);
        setLoading(false);
        // Prefetch neighbors for snappy next/prev
        prefetchById(id);
        const neighbors = getNeighbors(id);
        if (neighbors.next) prefetchById(neighbors.next.id);
        if (neighbors.prev) prefetchById(neighbors.prev.id);
      })
      .catch(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    // Focus heading on route change
    if (h1Ref.current) h1Ref.current.focus();
    // Keyboard navigation
    const handler = (e) => {
      const neighbors = getNeighbors(id);
      if (e.key === "ArrowRight" || e.key === "]") {
        if (neighbors.next) navigate(`/docs/${neighbors.next.id}`);
      } else if (e.key === "ArrowLeft" || e.key === "[") {
        if (neighbors.prev) navigate(`/docs/${neighbors.prev.id}`);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [id, navigate]);

  const neighbors = getNeighbors(id);
  const currentMeta = docs.find((d) => d.id === id) || docs[0];

  return (
    <div className="px-2 md:px-6 lg:px-10">
      <div className="mx-auto" style={{ maxWidth: "72ch" }}>
        <div className="mb-6 pt-6">
          <h1 ref={h1Ref} tabIndex={-1} className="text-2xl font-semibold tracking-tight outline-none">
            {currentMeta?.title || "Document"}
          </h1>
          <p className="text-muted-foreground text-sm">{currentMeta?.summary}</p>
        </div>
        <Separator />
        <div className="py-6 min-h-[50vh]">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : Comp ? (
            <Comp />
          ) : (
            <p>Document not found.</p>
          )}
        </div>
        <div className="sticky bottom-0 bg-background/80 backdrop-blur border-t border-border py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              {neighbors.prev && (
                <Button variant="secondary" onClick={() => navigate(`/docs/${neighbors.prev.id}`)} aria-label={`Previous: ${neighbors.prev.title}`}>
                  ← Prev: {neighbors.prev.title}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => onAskAssistant(currentMeta)}>
                Ask assistant about this page
              </Button>
              {neighbors.next && (
                <Button onClick={() => navigate(`/docs/${neighbors.next.id}`)} aria-label={`Next: ${neighbors.next.title}`}>
                  Next: {neighbors.next.title} →
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}