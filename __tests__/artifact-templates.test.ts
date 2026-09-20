import { describe, it, expect } from "vitest";
import { ARTIFACT_TEMPLATES, artifactTemplateEntry } from "@/lib/artifact-templates";
import seedData from "@/content/seed.json";

describe("artifactTemplateEntry", () => {
  it("is case-insensitive and trims whitespace", () => {
    expect(artifactTemplateEntry("spec.md")).toBeDefined();
    expect(artifactTemplateEntry("SPEC.MD")).toBeDefined();
    expect(artifactTemplateEntry("  spec.md  ")).toBeDefined();
  });

  it("returns undefined for a tag with no template", () => {
    expect(artifactTemplateEntry("Trace Viewer")).toBeUndefined();
  });

  it("every defined template key matches a real toolkit tag used somewhere in the seed data", () => {
    const tags = new Set<string>();
    for (const c of seedData.competencies) {
      for (const t of c.toolkitTags) tags.add(t.toLowerCase().trim());
    }
    const deadKeys = Object.keys(ARTIFACT_TEMPLATES).filter((k) => !tags.has(k));
    expect(deadKeys).toEqual([]);
  });

  it("every template entry has an intro and at least one non-trivial doc", () => {
    for (const [tag, entry] of Object.entries(ARTIFACT_TEMPLATES)) {
      expect(entry.intro.length, `intro for "${tag}" is too short`).toBeGreaterThan(10);
      expect(entry.docs.length, `"${tag}" has no docs`).toBeGreaterThan(0);
      for (const doc of entry.docs) {
        expect(doc.content.length, `"${tag}" doc "${doc.title}" is too short`).toBeGreaterThan(20);
      }
    }
  });

  it("spec.md gives both a blank template and a worked example", () => {
    const entry = artifactTemplateEntry("spec.md")!;
    expect(entry.docs.length).toBe(2);
    expect(entry.docs[0].content).toContain("<feature name>");
    expect(entry.docs[1].content).not.toContain("<feature name>");
  });
});
