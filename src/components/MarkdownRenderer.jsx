import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm"; // <-- tablo, checkbox, vs desteği
import { cn } from "@/lib/utils";

const MarkdownRenderer = ({ content, className }) => {
  if (!content) return null;

  // rehype-sanitize güvenli şema genişletiliyor (table etiketleri ekleniyor)
  const schema = {
    ...defaultSchema,
    tagNames: [
      ...(defaultSchema.tagNames || []),
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    attributes: {
      ...(defaultSchema.attributes || {}),
      table: ["className"],
      th: ["className"],
      td: ["className"],
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeSanitize, schema]]}
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-2xl font-bold my-4" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-xl font-bold my-3" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-lg font-bold my-2" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="mb-2 leading-relaxed" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-bold" {...props} />
        ),
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside my-2 space-y-1" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside my-2 space-y-1" {...props} />
        ),
        li: ({ node, ...props }) => <li className="ml-4" {...props} />,

        // TABLOLAR İÇİN GÜNCELLEME
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4 border border-border rounded-lg shadow-sm">
            <table
              className="w-full border-collapse text-sm text-left"
              {...props}
            />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-muted text-foreground" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="p-3 font-semibold border-b border-border" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="p-3 border-t border-border align-top" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;