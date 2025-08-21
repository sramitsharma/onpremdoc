import React from "react";
import { Copy, Check } from "lucide-react";
import { ANIMATION_DURATIONS } from "../../constants";

interface CopyButtonProps {
  content: string;
  className?: string;
}

const useCopyToClipboard = () => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = React.useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), ANIMATION_DURATIONS.COPY_FEEDBACK);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  }, []);

  return { copied, copyToClipboard };
};

const CopyButton: React.FC<CopyButtonProps> = ({ content, className = "" }) => {
  const { copied, copyToClipboard } = useCopyToClipboard();

  const handleClick = React.useCallback(() => {
    copyToClipboard(content);
  }, [copyToClipboard, content]);

  return (
    <button
      onClick={handleClick}
      className={`absolute top-2 right-2 p-2 rounded-md bg-neutral-800/80 hover:bg-neutral-700/80 transition-all duration-200 opacity-0 group-hover:opacity-100 ${className}`}
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-400" />
      ) : (
        <Copy className="h-4 w-4 text-neutral-300" />
      )}
    </button>
  );
};

export default CopyButton;
