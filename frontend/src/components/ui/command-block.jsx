import React from "react";
import CopyButton from "./copy-button";
import { Terminal } from "lucide-react";

const useTextContent = (children) => {
  return React.useMemo(() => {
    const getTextContent = (element) => {
      if (typeof element === 'string') return element;
      if (React.isValidElement(element) && element.props.children) {
        return getTextContent(element.props.children);
      }
      if (Array.isArray(element)) {
        return element.map(getTextContent).join('');
      }
      return '';
    };

    return getTextContent(children);
  }, [children]);
};

const CommandHeader = React.memo(() => (
  <div className="flex items-center gap-2 mb-3">
    <Terminal className="h-4 w-4 text-blue-400" />
    <span className="text-sm font-medium text-neutral-300">Command</span>
  </div>
));

const CommandBlock = ({ children, className = "", ...props }) => {
  const content = useTextContent(children);

  return (
    <div className={`relative group my-6 ${className}`}>
      <div className="bg-neutral-800 border border-neutral-600 rounded-lg p-4 shadow-lg">
        <CommandHeader />
        <pre 
          className="bg-neutral-900 border border-neutral-700 rounded-md p-3 overflow-auto text-green-400 font-mono text-sm leading-relaxed"
          {...props}
        >
          <code className="text-green-400">
            {children}
          </code>
        </pre>
      </div>
      <CopyButton content={content} />
    </div>
  );
};

export default CommandBlock;
