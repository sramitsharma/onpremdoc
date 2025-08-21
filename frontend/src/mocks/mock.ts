import React from "react";
import {
  Introduction,
  Installation,
  Configuration,
  Deployment,
  Troubleshooting,
  GettingStarted,
  Prerequite
} from "../components/documents";
import { DEFAULT_VALUES } from "../constants";

interface Logo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface Link {
  label: string;
  href: string;
}

interface HeaderConfig {
  logo: Logo;
  links: Link[];
}

interface Doc {
  id: string;
  title: string;
  section: string;
  order: number;
  summary: string;
  body: () => React.ReactElement;
}

interface DocMeta {
  id: string;
  title: string;
  summary: string;
  section: string;
  order: number;
}

interface Neighbor {
  id: string;
  title: string;
}

interface Neighbors {
  prev: Neighbor | null;
  next: Neighbor | null;
}

export const headerConfig: HeaderConfig = {
  logo: {
    src: "/logo192.png",
    alt: "Docs Portal",
    width: 28,
    height: 28,
  },
  links: [
    { label: "Repository", href: "https://example.com/repo" },
    { label: "Nexus", href: "https://example.com/nexus" },
    { label: "Cluster", href: "https://example.com/cluster" },
    { label: "Permission", href: "https://example.com/permission" },
    { label: "Announcement", href: "https://example.com/announcement" },
  ],
};

const DOCUMENT_COMPONENTS: Record<string, React.ComponentType> = {
  introduction: Introduction,
  installation: Installation,
  configuration: Configuration,
  deployment: Deployment,
  troubleshooting: Troubleshooting,
  "getting-started": GettingStarted,
  prerequite: Prerequite,
};

const docsSeed: Doc[] = [
  {
    id: "introduction",
    title: "Introduction",
    section: "Getting Started",
    order: 1,
    summary: "Overview of the documentation portal and conventions.",
    body: () => React.createElement(Introduction),
  },
  {
    id: "installation",
    title: "Installation",
    section: "Getting Started",
    order: 4,
    summary: "Install and bootstrap the portal.",
    body: () => React.createElement(Installation),
  },
  {
    id: "prerequite",
    title: "Prerequite",
    section: "Getting Started",
    order: 4,
    summary: "Prerequite for local setup",
    body: () => React.createElement(Prerequite),
  },
  {
    id: "configuration",
    title: "Configuration",
    section: "Guides",
    order: 3,
    summary: "Environment, theming, and runtime options.",
    body: () => React.createElement(Configuration),
  },
  {
    id: "deployment",
    title: "Deployment",
    section: "Operations",
    order: 2,
    summary: "On-prem deployment flows.",
    body: () => React.createElement(Deployment),
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    section: "Operations",
    order: 1,
    summary: "Common issues and fixes.",
    body: () => React.createElement(Troubleshooting),
  },
  {
    id: "getting-started",
    title: "Getting Started",
    section: "Getting Started",
    order: 0,
    summary: "Learn how to add new documents to the system.",
    body: () => React.createElement(GettingStarted),
  },
];

const sortDocs = (docs: Doc[]): Doc[] => {
  return [...docs].sort((a, b) => {
    if (a.section === b.section) {
      if ((a.order ?? 0) === (b.order ?? 0)) {
        return a.title.localeCompare(b.title);
      }
      return (a.order ?? 0) - (b.order ?? 0);
    }
    return a.section.localeCompare(b.section);
  });
};

const orderedDocs = sortDocs(docsSeed);
const idToIndex = new Map(orderedDocs.map((doc, index) => [doc.id, index]));

export function getAllDocs(): DocMeta[] {
  return orderedDocs.map(({ body, ...rest }) => rest);
}

export function getGroupedBySection(): Record<string, DocMeta[]> {
  const grouped: Record<string, DocMeta[]> = {};
  
  orderedDocs.forEach((doc) => {
    if (!grouped[doc.section]) {
      grouped[doc.section] = [];
    }
    grouped[doc.section].push({ 
      id: doc.id, 
      title: doc.title, 
      summary: doc.summary, 
      section: doc.section, 
      order: doc.order 
    });
  });
  
  return grouped;
}

export function getNeighbors(id: string): Neighbors {
  const index = idToIndex.get(id);
  if (index === undefined) return { prev: null, next: null };
  
  const prev = index > 0 ? orderedDocs[index - 1] : null;
  const next = index < orderedDocs.length - 1 ? orderedDocs[index + 1] : null;
  
  return {
    prev: prev ? { id: prev.id, title: prev.title } : null,
    next: next ? { id: next.id, title: next.title } : null,
  };
}

export function loadDocById(id: string): Promise<React.ComponentType> {
  return new Promise((resolve, reject) => {
    const index = idToIndex.get(id);
    if (index === undefined) {
      return reject(new Error("Document not found"));
    }
    
    setTimeout(() => {
      const DocBody = orderedDocs[index].body;
      resolve(DocBody);
    }, DEFAULT_VALUES.LOADING_DELAY);
  });
}

const componentCache = new Map<string, React.ComponentType>();

export function prefetchById(id: string): void {
  const index = idToIndex.get(id);
  if (index === undefined) return;
  
  const candidates = [
    id,
    index > 0 ? orderedDocs[index - 1].id : null,
    index < orderedDocs.length - 1 ? orderedDocs[index + 1].id : null,
  ].filter(Boolean) as string[];
  
  candidates.forEach((candidateId) => {
    if (componentCache.has(candidateId)) return;
    
    loadDocById(candidateId)
      .then((Component) => componentCache.set(candidateId, Component))
      .catch(() => {});
  });
}

export function getCachedComponent(id: string): React.ComponentType | null {
  return componentCache.get(id) || null;
}
