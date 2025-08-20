import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../components/ui/resizable";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getGroupedBySection } from "../mocks/mock";
import useLocalStorage from "../hooks/use-local-storage";
import { STORAGE_KEYS, DEFAULT_VALUES } from "../constants";
import { resetPanelSettings, getStorageItem, removeStorageItem } from "../utils";

const usePanelState = () => {
  const [panelWidth, setPanelWidth] = useLocalStorage(
    `${STORAGE_KEYS.TOC_PREFERENCES}.panelWidth`, 
    DEFAULT_VALUES.PANEL_WIDTH
  );

  // Migration: Convert old pixel values to percentage
  React.useEffect(() => {
    const storedValue = getStorageItem(STORAGE_KEYS.TOC_PREFERENCES);
    if (storedValue) {
      // If the stored value is greater than 100, it's likely the old pixel value
      // Or if it's the old 30% value, or the old 12% value, update to new 15%
      if (storedValue.panelWidth && (storedValue.panelWidth > 100 || storedValue.panelWidth === 30 || storedValue.panelWidth === 12)) {
        // Convert old pixel value or old percentage to new smaller percentage
        setPanelWidth(DEFAULT_VALUES.PANEL_WIDTH);
        // Clear the old value to force migration
        removeStorageItem(STORAGE_KEYS.TOC_PREFERENCES);
      }
    }
  }, [setPanelWidth]);

  return { panelWidth, setPanelWidth };
};

const useFilteredDocs = (query) => {
  const grouped = React.useMemo(() => getGroupedBySection(), []);
  const sections = React.useMemo(() => Object.keys(grouped), [grouped]);

  return React.useMemo(() => {
    if (!query) return grouped;
    
    const q = query.toLowerCase();
    const filtered = {};
    
    for (const section of sections) {
      const items = grouped[section].filter((doc) => 
        doc.title.toLowerCase().includes(q)
      );
      if (items.length) filtered[section] = items;
    }
    
    return filtered;
  }, [grouped, query, sections]);
};

const NavigationLink = React.memo(({ doc, isActive }) => (
  <NavLink
    to={`/docs/${doc.id}`}
    className={({ isActive: linkActive }) =>
      `block px-3 py-2 rounded hover:bg-accent focus:bg-accent outline-none transition-all duration-200 hover:translate-x-1 hover:shadow-sm relative group ${linkActive ? "bg-accent" : ""}`
    }
    aria-current={isActive ? "page" : undefined}
  >
    {doc.title}
    <span 
      className={`absolute bottom-1 left-3 w-0 h-0.5 bg-blue-400 group-hover:w-[calc(100%-1.5rem)] transition-all duration-300 ease-out ${isActive ? "w-[calc(100%-1.5rem)]" : ""}`}
    />
  </NavLink>
));

const SectionHeader = React.memo(({ title }) => (
  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-1 px-2">
    {title}
  </h3>
));

const CollapseButton = React.memo(({ onClick }) => (
  <Button 
    size="sm" 
    variant="ghost" 
    onClick={onClick}
    className="absolute right-0 top-2 p-1 h-6 w-6 transition-all duration-200 hover:scale-110 hover:bg-accent z-10"
    aria-label="Collapse sidebar"
  >
    <ChevronLeft className="h-3 w-3 transition-transform duration-200" />
  </Button>
));

const ExpandButton = React.memo(({ onClick }) => (
  <Button
    size="sm"
    variant="ghost"
    onClick={onClick}
    className="absolute left-4 top-2 p-1 h-6 w-6 z-10 hover:bg-accent transition-all duration-200 hover:scale-110"
    aria-label="Expand sidebar"
  >
    <ChevronRight className="h-3 w-3 transition-transform duration-200" />
  </Button>
));

const TOC = ({ collapsed, setCollapsed, children }) => {
  const { panelWidth, setPanelWidth } = usePanelState();
  const [query, setQuery] = React.useState("");
  const location = useLocation();
  const filtered = useFilteredDocs(query);

  // Add global reset function for debugging
  React.useEffect(() => {
    window.resetPanelSettings = () => {
      console.log('Manually resetting panel settings to 15%');
      resetPanelSettings();
      setPanelWidth(DEFAULT_VALUES.PANEL_WIDTH);
    };
    
    return () => {
      delete window.resetPanelSettings;
    };
  }, [setPanelWidth]);

  const handlePanelResize = React.useCallback((width) => {
    setPanelWidth(width);
  }, [setPanelWidth]);

  const handleCollapse = React.useCallback(() => {
    setCollapsed(true);
  }, [setCollapsed]);

  const handleExpand = React.useCallback(() => {
    setCollapsed(false);
  }, [setCollapsed]);

  const handleQueryChange = React.useCallback((e) => {
    setQuery(e.target.value);
  }, []);

  return (
    <ResizablePanelGroup direction="horizontal" className="w-full min-h-screen">
      {!collapsed && (
        <ResizablePanel 
          defaultSize={panelWidth} 
          minSize={DEFAULT_VALUES.MIN_PANEL_SIZE} 
          maxSize={DEFAULT_VALUES.MAX_PANEL_SIZE} 
          onResize={handlePanelResize}
        >
          <div className="h-[calc(100vh-64px)] sticky top-16 overflow-auto px-4 border-r border-border bg-muted/20 shadow-sm relative w-full">
            <div className="flex items-center py-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Contents
              </h2>
            </div>
            
            <Input 
              value={query} 
              onChange={handleQueryChange} 
              placeholder="Search..." 
              className="mb-4" 
            />
            
            <nav aria-label="Table of contents" className="space-y-4">
              {Object.entries(filtered).map(([section, docs]) => (
                <section key={section}>
                  <SectionHeader title={section} />
                  <ul className="space-y-1">
                    {docs.map((doc) => (
                      <li key={doc.id}>
                        <NavigationLink 
                          doc={doc} 
                          isActive={location.pathname === `/docs/${doc.id}`}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </nav>
            
            <CollapseButton onClick={handleCollapse} />
          </div>
        </ResizablePanel>
      )}
      
      {!collapsed && (
        <ResizableHandle withHandle className="bg-border hover:bg-border/80 transition-colors" />
      )}
      
      <ResizablePanel defaultSize={collapsed ? 100 : 100 - panelWidth}>
        <div className="relative w-full bg-background">
          {collapsed && <ExpandButton onClick={handleExpand} />}
          {children}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default TOC;