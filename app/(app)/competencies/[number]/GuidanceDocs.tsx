"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type GuidanceDoc = {
  id: number | string;
  filename: string;
  title: string;
  content: string;
};

// Real, already-written docs pulled verbatim from the exercise's own
// docs/ folder (see lib/competency-artifacts and scripts/generate-seed.mjs's
// readGuidanceDocs) — not authored by the portal. Rendered as markdown
// (tables, headings) since several of these are literally fill-in-the-blank
// evidence templates with real tables the learner needs to read as tables.
export function GuidanceDocs({ docs }: { docs: GuidanceDoc[] }) {
  const [openId, setOpenId] = useState<number | string | null>(docs[0]?.id ?? null);

  if (docs.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {docs.map((doc) => (
        <GuidanceDocItem
          key={doc.id}
          doc={doc}
          open={openId === doc.id}
          onToggle={() => setOpenId(openId === doc.id ? null : doc.id)}
        />
      ))}
    </div>
  );
}

function GuidanceDocItem({
  doc,
  open,
  onToggle,
}: {
  doc: GuidanceDoc;
  open: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(doc.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the
      // content is still fully visible/selectable, so this is a nice-to-
      // have, not a hard requirement.
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="flex w-full items-center justify-between gap-3 bg-canvas-inset px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="text-fg-subtle" aria-hidden="true">
            {open ? "▾" : "▸"}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-fg">{doc.title}</span>
            <code className="text-xs text-fg-subtle">{doc.filename}</code>
          </span>
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-md border border-line px-2 py-1 text-xs font-medium text-fg-muted hover:bg-white/5"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {open && (
        <div className="markdown-body border-t border-line bg-canvas-subtle px-4 py-4 text-sm text-fg">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
