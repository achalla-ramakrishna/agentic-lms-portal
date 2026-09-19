// Pure string-parsing helpers for scripts/generate-seed.mjs — no fs/path,
// no CLI args, so they're directly testable (see __tests__/parse-readme.test.ts)
// against inline markdown fixtures instead of real files.

export function section(markdown, heading, nextHeadingRegex = /^## /m) {
  const startIdx = markdown.indexOf(`## ${heading}`);
  if (startIdx === -1) return "";
  const afterHeading = markdown.slice(startIdx + `## ${heading}`.length);
  const nextMatch = afterHeading.match(nextHeadingRegex);
  const body = nextMatch
    ? afterHeading.slice(0, nextMatch.index)
    : afterHeading;
  return body.trim();
}

export function bulletLines(text) {
  const bullets = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
  if (bullets.length > 0) return bullets;
  // A handful of exercises (e.g. 3.1–3.3, 7.1–7.4) state evidence/criteria
  // as prose paragraphs instead of a bulleted list. Fall back to one item
  // per paragraph rather than losing the content.
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

export function numberedLines(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^\d+\.\s/.test(l))
    .map((l) => l.replace(/^\d+\.\s/, "").trim());
}

export function decodePathSegment(s) {
  return decodeURIComponent(s.replace(/^\.\//, ""));
}

// Title for a guidance doc (an exercise's docs/*.md file, e.g.
// "evidence-template.md" or "context-sources/AGENTS.md"): prefer the
// file's own first "# Heading" (what its author called it), falling back
// to a prettified filename when the file has no top-level heading.
export function deriveDocTitle(relPath, content) {
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) return headingMatch[1].trim();

  const base = relPath.split("/").pop().replace(/\.md$/i, "");
  if (base === base.toUpperCase()) return base; // e.g. AGENTS, SKILL
  return base
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
