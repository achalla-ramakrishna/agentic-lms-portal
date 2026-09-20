export type ToolkitDoc = {
  id: number;
  filename: string;
  title: string;
  content: string;
};

// A toolkit tag (e.g. "SKILL.md") is only made clickable when a real
// ingested file's basename matches it exactly, case-insensitively — no
// fuzzy/alias matching, so we never claim a tag has a real example behind
// it when it doesn't. Most tags (AGENTS.md in Toolchain Setup, PreToolUse
// hooks, Mermaid, ...) genuinely have no matching real file in this
// dataset and stay non-interactive; that's expected, not a bug.
export function matchToolkitTagDocs(
  tag: string,
  docs: ToolkitDoc[],
): ToolkitDoc[] {
  const target = tag.toLowerCase();
  return docs.filter((d) => d.filename.split("/").pop()?.toLowerCase() === target);
}
