import { describe, it, expect } from "vitest";
import { ARTIFACT_GLOSSARY, artifactGlossaryEntry } from "@/lib/artifact-glossary";
import seedData from "@/content/seed.json";

describe("artifactGlossaryEntry", () => {
  it("is case-insensitive and trims whitespace", () => {
    expect(artifactGlossaryEntry("agents.md")).toBeDefined();
    expect(artifactGlossaryEntry("AGENTS.md")).toBeDefined();
    expect(artifactGlossaryEntry("  AGENTS.md  ")).toBeDefined();
    expect(artifactGlossaryEntry("agents.md")).toBe(artifactGlossaryEntry("AGENTS.md"));
  });

  it("returns undefined for a tag with no entry", () => {
    expect(artifactGlossaryEntry("not-a-real-tag")).toBeUndefined();
  });

  it("covers every unique toolkit tag actually used in the seed data", () => {
    const tags = new Set<string>();
    for (const c of seedData.competencies) {
      for (const t of c.toolkitTags) tags.add(t);
    }
    const missing = [...tags].filter((t) => !artifactGlossaryEntry(t));
    expect(missing).toEqual([]);
  });

  it("gives every entry a non-trivial description", () => {
    for (const [tag, text] of Object.entries(ARTIFACT_GLOSSARY)) {
      expect(text.length, `entry for "${tag}" is too short`).toBeGreaterThan(20);
    }
  });
});
