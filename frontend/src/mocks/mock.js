/*
  Frontend-only mock registry for the React Documentation App
  - Simulates auto-scan of docs and lazy loading
  - Provides header/links config and assistant mock adapter
  - Replace later with real registry + backend
*/
import React from "react";

// Header links and logo configuration (mock; later configurable from backend)
export const headerConfig = {
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
    { label: "Help", href: "#assistant" },
  ],
};

export const assistantConfig = {
  personaTitle: "In-Character Assistant",
  persona: `You are a helpful, slightly witty staff engineer who loves clarity and pragmatism.
  Keep answers concise, reference the current document when relevant, and provide examples.`,
  streaming: true,
  maxSnippetLen: 600,
};

// Mock docs: emulate an auto-scanned registry. In real app, we'd build this list
// from import.meta.glob or a backend-provided registry.
const docsSeed = [
  {
    id: "introduction",
    title: "Introduction",
    section: "Getting Started",
    order: 1,
    summary: "Overview of the documentation portal and conventions.",
    body: () => (
      <div className="prose prose-invert max-w-none">
        <h1>Introduction</h1>
        <p>
          Welcome to the React Documentation Portal (frontend mock). Add docs and the
          Table of Contents updates automatically when wired to a real registry.
        </p>
        <h2>Principles</h2>
        <ul>
          <li>Simple structure, predictable navigation.</li>
          <li>Keyboard friendly and accessible.</li>
          <li>Lazy-loaded content with adjacent prefetch.</li>
        </ul>
        <pre className="bg-neutral-900 p-4 rounded-md overflow-auto"><code>{`// Example code block
function greet(name) {
  return ` + "`Hello ${name}!`" + `
}`}</code></pre>
      </div>
    ),
  },
  {
    id: "installation",
    title: "Installation",
    section: "Getting Started",
    order: 2,
    summary: "Install and bootstrap the portal.",
    body: () => (
      <div className="prose prose-invert max-w-none">
        <h1>Installation</h1>
        <ol>
          <li>Clone the repository</li>
          <li>Install dependencies</li>
          <li>Start the dev server</li>
        </ol>
        <pre className="bg-neutral-900 p-4 rounded-md overflow-auto"><code>{`yarn install\nyarn start`}</code></pre>
      </div>
    ),
  },
  {
    id: "configuration",
    title: "Configuration",
    section: "Guides",
    order: 1,
    summary: "Environment, theming, and runtime options.",
    body: () => (
      <div className="prose prose-invert max-w-none">
        <h1>Configuration</h1>
        <p>
          Configure header links, logos, and assistant persona via a config source.
          This mock uses a local object; we will move it to backend later.
        </p>
        <h3>Environment</h3>
        <ul>
          <li>REACT_APP_BACKEND_URL for API routing.</li>
          <li>Feature flags via a settings endpoint (future).</li>
        </ul>
      </div>
    ),
  },
  {
    id: "deployment",
    title: "Deployment",
    section: "Operations",
    order: 1,
    summary: "On-prem deployment flows.",
    body: () => (
      <div className="prose prose-invert max-w-none">
        <h1>Deployment</h1>
        <p>
          For on-prem, ensure environment variables are set and static assets are
          served via your ingress. The backend should expose /api-prefixed routes.
        </p>
      </div>
    ),
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    section: "Operations",
    order: 2,
    summary: "Common issues and fixes.",
    body: () => (
      <div className="prose prose-invert max-w-none">
        <h1>Troubleshooting</h1>
        <p>Check browser console and supervisor logs for diagnostics.</p>
        <ul>
          <li>Frontend logs via the browser devtools.</li>
          <li>Backend logs at /var/log/supervisor/backend.*.log</li>
        </ul>
      </div>
    ),
  },
];

function sortDocs(docs) {
  // Order by section, then order, then title as tiebreaker
  return [...docs].sort((a, b) => {
    if (a.section === b.section) {
      if ((a.order ?? 0) === (b.order ?? 0)) return a.title.localeCompare(b.title);
      return (a.order ?? 0) - (b.order ?? 0);
    }
    return a.section.localeCompare(b.section);
  });
}

const orderedDocs = sortDocs(docsSeed);
const idToIndex = new Map(orderedDocs.map((d, i) => [d.id, i]));

export function getAllDocs() {
  return orderedDocs.map(({ body, ...rest }) => rest);
}

export function getGroupedBySection() {
  const grouped = {};
  orderedDocs.forEach((d) => {
    if (!grouped[d.section]) grouped[d.section] = [];
    grouped[d.section].push({ id: d.id, title: d.title, summary: d.summary, section: d.section, order: d.order });
  });
  return grouped;
}

export function getNeighbors(id) {
  const idx = idToIndex.get(id);
  if (idx === undefined) return { prev: null, next: null };
  const prev = idx > 0 ? orderedDocs[idx - 1] : null;
  const next = idx < orderedDocs.length - 1 ? orderedDocs[idx + 1] : null;
  return {
    prev: prev ? { id: prev.id, title: prev.title } : null,
    next: next ? { id: next.id, title: next.title } : null,
  };
}

// Simulate lazy component load for a doc
export function loadDocById(id) {
  return new Promise((resolve, reject) => {
    const idx = idToIndex.get(id);
    if (idx === undefined) return reject(new Error("Doc not found"));
    // Simulate latency and dynamic import
    setTimeout(() => {
      const DocBody = orderedDocs[idx].body;
      resolve(DocBody);
    }, 150);
  });
}

// Prefetch adjacent docs into a small in-memory cache
const compCache = new Map();
export function prefetchById(id) {
  const idx = idToIndex.get(id);
  if (idx === undefined) return;
  const candidates = [
    id,
    idx > 0 ? orderedDocs[idx - 1].id : null,
    idx < orderedDocs.length - 1 ? orderedDocs[idx + 1].id : null,
  ].filter(Boolean);
  candidates.forEach((cid) => {
    if (compCache.has(cid)) return;
    loadDocById(cid).then((Comp) => compCache.set(cid, Comp)).catch(() => {});
  });
}
export function getCachedComponent(id) {
  return compCache.get(id) || null;
}

// Assistant mock that streams characters for a nicer feel
export async function assistantAsk({ prompt, context }) {
  const full = `Persona: ${assistantConfig.personaTitle}\nContext: ${context?.title || "N/A"}\n\n` +
    (prompt || "Explain this page");

  // Create a stream-like iterator
  async function* stream(text) {
    for (let i = 0; i < text.length; i++) {
      yield text[i];
      await new Promise((r) => setTimeout(r, 8));
    }
  }

  const content = `Here\'s guidance based on \"${context?.title || "this page"}\":\n- Keep sections short.\n- Use clear headings.\n- Prefer examples over theory.\n\n`;
  return {
    // Fake streaming iterable
    [Symbol.asyncIterator]: () => stream(content),
    complete: async () => content,
    meta: { tokens: content.length, model: "mock-assistant" },
  };
}