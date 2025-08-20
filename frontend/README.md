# Documentation Portal

A React application for managing and displaying documentation with table of contents, navigation, and copyable code blocks.

Important: This app uses mock data for demonstration. All document management is handled in src/mocks/mock.js.

## How to add a new topic

Follow these steps to add a new document to the portal:

1) Open file: src/mocks/mock.js
2) Locate the docsSeed array
3) Append a new object with these fields:
   - id: string (kebab-case route segment)
   - title: string (display title)
   - section: string (grouping in the left Contents panel)
   - order: number (lower shows earlier within the same section)
   - summary: string (short description used under the H1)
   - body: () => JSX element (the document content)
4) Save. The app hot-reloads. The TOC and Prev/Next update automatically.

Example:

```js
// src/mocks/mock.js
const docsSeed = [
  // ...existing docs
  {
    id: "my-new-page",
    title: "My New Page",
    section: "Guides",
    order: 3,
    summary: "Short helpful description.",
    body: () => (
      <div className="prose prose-invert max-w-none">
        <h1>My New Page</h1>
        <p>Write your documentation here.</p>
        <pre className="bg-neutral-900 p-4 rounded-md overflow-auto"><code>{`yarn start`}</code></pre>
      </div>
    ),
  },
];
```

Conventions:
- id should be unique and URL-safe (kebab-case recommended)
- section is used for grouping headers in the TOC (e.g., Getting Started, Guides, Operations)
- order sorts within a section. If omitted, alphabetical title tiebreaker applies

After saving:
- The new entry appears in the left Contents list under its section
- Keyboard navigation ←/→ and sticky Prev/Next show correct neighbor titles

## Where to change header links and logo

- File: src/mocks/mock.js
- Object: headerConfig
- Update logo path or the six links on the right of the header



## Keyboard & A11y

- Navigate documents with ← / → (or [ / ])
- Active TOC item is highlighted and uses aria-current="page"
- Skip link available to jump to main content

## Environment

- REACT_APP_BACKEND_URL is reserved for future backend integration. Do not hardcode URLs; always use the env var.
- Backend routes must be prefixed with /api (per ingress rules) when we integrate.

## Future Enhancements

- Replace mock data with a real backend registry
- Add authentication and user management
- Implement real-time collaboration features


## Troubleshooting

- If TOC or navigation looks wrong, confirm the new doc object was appended correctly and the id is unique
- Check the browser console for errors

## Scripts (via CRA/Craco)

- yarn start: run dev server on http://localhost:3000
- yarn build: production build
- yarn test: run tests if present