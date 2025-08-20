import React from 'react';
import { CodeBlock, CommandBlock } from '../ui/copyable-blocks';

const GettingStarted = () => {
  return (
    <div className="prose prose-invert max-w-none space-y-6">
      <h1>Getting Started</h1>
      <p>
        Learn how to add new documents to the system by creating components
        in the documents folder.
      </p>
      
      <h2>How to Add New Documents</h2>
      <ol>
        <li>Create a new component file in <code>src/components/documents/</code></li>
        <li>Export it from <code>src/components/documents/index.js</code></li>
        <li>Import it in <code>src/mocks/mock.js</code></li>
        <li>Add a new entry to the <code>docsSeed</code> array</li>
      </ol>

      <h2>Benefits</h2>
      <ul>
        <li><strong>Modularity:</strong> Each document is a separate component</li>
        <li><strong>Maintainability:</strong> Easy to edit individual documents</li>
        <li><strong>Reusability:</strong> Components can be imported elsewhere</li>
        <li><strong>Testing:</strong> Each document can be tested independently</li>
        <li><strong>Version Control:</strong> Better diff tracking</li>
      </ul>

      <h2>Code Structure</h2>
      <CodeBlock>
{`import React from 'react';

const NewTopic = () => {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>New Topic</h1>
      <p>Content here...</p>
    </div>
  );
};

export default NewTopic;

export { default as NewTopic } from './NewTopic';

import { NewTopic } from "../components/documents";

{
  id: "new-topic",
  title: "New Topic",
  section: "Section Name",
  order: 1,
  summary: "Description",
  body: () => <NewTopic />,
}`}
      </CodeBlock>

      <h2>Development Commands</h2>
      <p className="mb-4">Useful commands for development:</p>
      <CommandBlock>
{`# Create new document component
touch src/components/documents/NewTopic.jsx

# Start development server
npm start

# Build for production
npm run build`}
      </CommandBlock>

      <h2>Using Copyable Blocks</h2>
      <p className="mb-4">Use copyable blocks in your documents:</p>
      <CodeBlock>
{`import { CodeBlock, CommandBlock } from '../ui/copyable-blocks';

<CodeBlock>
{\`code content\`}
</CodeBlock>

<CommandBlock>
{\`command content\`}
</CommandBlock>`}
      </CodeBlock>
    </div>
  );
};

export default GettingStarted;
