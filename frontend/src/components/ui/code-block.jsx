import React from "react";
import CopyButton from "./copy-button";

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

const CodeBlock = ({ children, className = "", language = "text", ...props }) => {
  const content = useTextContent(children);

  return (
    <div className={`relative group my-6 ${className}`}>
      <pre 
        className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 overflow-auto text-neutral-100 font-mono text-sm leading-relaxed shadow-lg"
        {...props}
      >
        <code className="text-neutral-100">
          {children}
        </code>
      </pre>
      <CopyButton content={content} />
    </div>
  );
};

export default CodeBlock;
