import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeContent = ({
  content,
  role,
  isPending,
}: {
  content: string;
  role: string;
  isPending: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containsCodeBlock = /```[\s\S]*?```/.test(content);

  return (
    <div className="prose max-w-3xl">
      {role === "assistant" && containsCodeBlock && (
        <button
          onClick={handleCopy}
          className="mb-2 px-3 py-1 rounded bg-base-200 hover:bg-base-300 transition-all"
        >
          {copied ? "Copied!" : isPending ? "Copying..." : "Copy"}
        </button>
      )}

      <ReactMarkdown
        components={{
          code({
            node,
            inline,
            className,
            children,
            ...props
          }: {
            node?: any;
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
            [key: string]: any;
          }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                className="rounded-lg my-4"
                wrapLines={true}
                showLineNumbers={true}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-gray-100 rounded px-1 py-0.5 text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default CodeContent;
