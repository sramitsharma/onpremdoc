import React from 'react';
import { CodeBlock, CommandBlock } from '../ui/copyable-blocks';
import ImageZoom from '../ui/image-zoom';

const Introduction: React.FC = () => {
  return (
    <div className="prose prose-invert max-w-none space-y-6">
      <h1>Introduction</h1>
      <p>
        Welcome to the Documentation Portal. Add documents and the
        Table of Contents updates automatically.
      </p>
      <h2>Principles</h2>
      <ul>
        <li>Simple structure, predictable navigation.</li>
        <li>Keyboard friendly and accessible.</li>
        <li>Lazy-loaded content with adjacent prefetch.</li>
      </ul>
      
      <h2>Sample Image with Zoom</h2>
      <p className="mb-4">Click on the image below to zoom in and view it in full detail:</p>
      <div className="flex justify-center my-6">
        <ImageZoom
          src="https://4.img-dpreview.com/files/p/E~C667x0S5333x4000T1200x900~articles/3925134721/0266554465.jpeg"
          alt="Sample documentation image"
          className="rounded-lg shadow-lg max-w-md"
        />
      </div>
      
      <h2>Code Examples</h2>
      <p className="mb-4">Here's an example of a code block with copy functionality:</p>
      <CodeBlock>
{`function greet(name) {
  return \`Hello \${name}!\`
}

const message = greet("World");
console.log(message);`}
      </CodeBlock>

      <h2>Command Examples</h2>
      <p className="mb-4">Here's an example of a command block with copy functionality:</p>
      <CommandBlock>
{`npm install react react-dom
npm start
npm run build`}
      </CommandBlock>

      <h2>Multiple Commands</h2>
      <p className="mb-4">You can have multiple command blocks:</p>
      <CommandBlock>
{`git clone https://github.com/example/repo.git
cd repo
npm install`}
      </CommandBlock>

      <CommandBlock>
{`docker build -t my-app .
docker run -p 3000:3000 my-app`}
      </CommandBlock>
    </div>
  );
};

export default Introduction;
