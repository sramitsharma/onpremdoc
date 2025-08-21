import React from 'react';
import { CodeBlock, CommandBlock } from '../ui/copyable-blocks';

const Installation = () => {
  return (
    <div className="prose prose-invert max-w-none space-y-6">
      <h1>Installation</h1>
      <ol>
        <li>Clone the repository</li>
        <li>Install dependencies</li>
        <li>Start the dev server</li>
      </ol>
      
      <h2>Basic Installation</h2>
      <CommandBlock>
{`yarn install
yarn start`}
      </CommandBlock>
      
      <h2>Alternative Methods</h2>
      <h3>Using npm</h3>
      <CommandBlock>
{`npm install
npm start`}
      </CommandBlock>
      
      <h3>Using Docker</h3>
      <CommandBlock>
{`docker build -t docs-portal .
docker run -p 3000:3000 docs-portal`}
      </CommandBlock>
      
      <h2>Configuration Example</h2>
      <p className="mb-4">Here's an example configuration file:</p>
      <CodeBlock>
{`export const config = {
  title: "Documentation Portal",
  theme: "dark",
  features: {
    search: true,
    toc: true,
    copyButtons: true
  }
}`}
      </CodeBlock>
    </div>
  );
};

export default Installation;
