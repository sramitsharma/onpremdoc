import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { getAllDocs, getNeighbors, loadDocById, prefetchById, getCachedComponent } from "../mocks/mock";
import { KEYBOARD_KEYS, DEFAULT_VALUES } from "../constants";

interface Doc {
  id: string;
  title: string;
  summary?: string;
}

interface Neighbor {
  id: string;
  title: string;
}

interface Neighbors {
  prev?: Neighbor;
  next?: Neighbor;
}

interface NavigationButtonProps {
  neighbor: Neighbor;
  onClick: () => void;
  isPrevious: boolean;
}

interface DocumentContentProps {
  component: React.ComponentType | null;
  loading: boolean;
}

const useDocumentData = (id: string) => {
  const docs = React.useMemo(() => getAllDocs(), []);
  const [component, setComponent] = React.useState<React.ComponentType | null>(() => getCachedComponent(id));
  const [loading, setLoading] = React.useState(!component);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    loadDocById(id)
      .then((DocComponent) => {
        if (!isMounted) return;
        setComponent(() => DocComponent);
        setLoading(false);
        
        prefetchById(id);
        const neighbors = getNeighbors(id);
        if (neighbors.next) prefetchById(neighbors.next.id);
        if (neighbors.prev) prefetchById(neighbors.prev.id);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  return { docs, component, loading };
};

const useKeyboardNavigation = (id: string, navigate: (path: string) => void) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const neighbors = getNeighbors(id);
      
      if (e.key === KEYBOARD_KEYS.ARROW_RIGHT || e.key === KEYBOARD_KEYS.BRACKET_RIGHT) {
        if (neighbors.next) navigate(`/docs/${neighbors.next.id}`);
      } else if (e.key === KEYBOARD_KEYS.ARROW_LEFT || e.key === KEYBOARD_KEYS.BRACKET_LEFT) {
        if (neighbors.prev) navigate(`/docs/${neighbors.prev.id}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [id, navigate]);
};

const NavigationButton = React.memo<NavigationButtonProps>(({ neighbor, onClick, isPrevious }) => (
  <Button 
    variant={isPrevious ? "secondary" : "default"}
    onClick={onClick} 
    aria-label={`${isPrevious ? 'Previous' : 'Next'}: ${neighbor.title}`}
    className="transition-all duration-200 hover:scale-105 hover:shadow-sm"
  >
    {isPrevious ? `← Prev: ${neighbor.title}` : `Next: ${neighbor.title} →`}
  </Button>
));

const DocumentContent = React.memo<DocumentContentProps>(({ component, loading }) => {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  
  if (!component) {
    return <p>Document not found.</p>;
  }
  
  // Use React.createElement to properly render the dynamic component
  return React.createElement(component);
});

const DocRenderer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { docs, component, loading } = useDocumentData(id || "");
  const h1Ref = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (!id) return;
    const exists = docs.some((doc) => doc.id === id);
    if (!exists && docs.length) {
      navigate(`/docs/${docs[0].id}`, { replace: true });
    }
  }, [docs, id, navigate]);

  React.useEffect(() => {
    if (h1Ref.current) h1Ref.current.focus();
  }, [id]);

  useKeyboardNavigation(id || "", navigate);

  const neighbors = React.useMemo(() => getNeighbors(id || ""), [id]);
  const currentMeta = React.useMemo(() => 
    docs.find((doc) => doc.id === id) || docs[0], 
    [docs, id]
  );

  const handlePrevious = React.useCallback(() => {
    if (neighbors.prev) navigate(`/docs/${neighbors.prev.id}`);
  }, [neighbors.prev, navigate]);

  const handleNext = React.useCallback(() => {
    if (neighbors.next) navigate(`/docs/${neighbors.next.id}`);
  }, [neighbors.next, navigate]);

  return (
    <div className="px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 pt-6">
          <h1 
            ref={h1Ref} 
            tabIndex={-1} 
            className="text-2xl font-semibold tracking-tight outline-none"
          >
            {currentMeta?.title || "Document"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {currentMeta?.summary}
          </p>
        </div>
        
        <Separator />
        
        <div className="py-6 min-h-[50vh]">
          <DocumentContent component={component} loading={loading} />
        </div>
        
        <div className="sticky bottom-0 bg-background/80 backdrop-blur border-t border-border py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              {neighbors.prev && (
                <NavigationButton 
                  neighbor={neighbors.prev}
                  onClick={handlePrevious}
                  isPrevious={true}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              {neighbors.next && (
                <NavigationButton 
                  neighbor={neighbors.next}
                  onClick={handleNext}
                  isPrevious={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocRenderer;
