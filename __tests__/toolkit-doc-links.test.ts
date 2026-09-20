import { describe, it, expect } from "vitest";
import { matchToolkitTagDocs } from "@/lib/toolkit-doc-links";

const docs = [
  { id: 1, filename: "evidence-template.md", title: "Evidence Template", content: "..." },
  { id: 2, filename: ".agents/skills/release-notes/SKILL.md", title: "Release Notes Skill", content: "..." },
  { id: 3, filename: "skills/incident-summary/SKILL.md", title: "Incident Summary Skill", content: "..." },
];

describe("matchToolkitTagDocs", () => {
  it("matches by exact basename, case-insensitively, regardless of folder", () => {
    const matches = matchToolkitTagDocs("SKILL.md", docs);
    expect(matches.map((d) => d.id)).toEqual([2, 3]);
  });

  it("does not match a tag with no real file behind it", () => {
    expect(matchToolkitTagDocs("AGENTS.md", docs)).toEqual([]);
  });

  it("does not partially match a different filename", () => {
    expect(matchToolkitTagDocs("template.md", docs)).toEqual([]);
  });

  it("returns an empty array when there are no docs", () => {
    expect(matchToolkitTagDocs("SKILL.md", [])).toEqual([]);
  });
});
