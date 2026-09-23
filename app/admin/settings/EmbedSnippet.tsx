"use client";

import { useState } from "react";

// Copy-to-clipboard pattern matches GuidanceDocs.tsx's CopyButton — same
// discipline, clipboard failure just means "still fully selectable,"
// not a hard error.
export function EmbedSnippet({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op — snippet is still visible/selectable below
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="flex items-center justify-between gap-3 bg-canvas-inset px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Embed snippet
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-md border border-line px-2 py-1 text-xs font-medium text-fg-muted hover:bg-white/5"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-canvas-subtle px-4 py-3 text-xs text-fg">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
