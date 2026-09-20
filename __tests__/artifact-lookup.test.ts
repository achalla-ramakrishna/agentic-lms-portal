import { describe, it, expect } from "vitest";
import { resolveArtifactTag } from "@/lib/artifact-lookup";
import type { ToolkitDoc } from "@/lib/toolkit-doc-links";

describe("resolveArtifactTag", () => {
  it("finds a real doc match by basename even when the tag has a path prefix", () => {
    const docs: ToolkitDoc[] = [
      { id: 1, filename: "docs/guardrail-contract.md", title: "Guardrail Contract", content: "..." },
    ];
    const resolution = resolveArtifactTag("guardrail-contract.md", docs);
    expect(resolution.matches).toHaveLength(1);
    expect(resolution.clickable).toBe(true);
  });

  it("falls back to a reference template by basename for a path-prefixed tag", () => {
    const resolution = resolveArtifactTag("specs/spec.md", []);
    expect(resolution.matches).toHaveLength(0);
    expect(resolution.template).toBeDefined();
    expect(resolution.clickable).toBe(true);
  });

  it("falls back to the glossary for a known evidence-protocol artifact", () => {
    const resolution = resolveArtifactTag("evidence/before.md", []);
    expect(resolution.template).toBeUndefined();
    expect(resolution.glossary).toBeDefined();
    expect(resolution.clickable).toBe(true);
  });

  it("is not clickable for an exercise-specific artifact with no real match, template, or glossary entry", () => {
    const resolution = resolveArtifactTag("graphify-out/graph.json", []);
    expect(resolution.clickable).toBe(false);
  });

  it("is not clickable for an input artifact that's just a project folder name", () => {
    const resolution = resolveArtifactTag("agent-onboarding-app", []);
    expect(resolution.clickable).toBe(false);
  });

  it("prefers a real match over a template or glossary entry when both exist", () => {
    const docs: ToolkitDoc[] = [
      { id: 1, filename: "docs/spec.md", title: "Spec", content: "real spec" },
    ];
    const resolution = resolveArtifactTag("spec.md", docs);
    expect(resolution.matches).toHaveLength(1);
    expect(resolution.template).toBeUndefined();
    expect(resolution.glossary).toBeUndefined();
  });
});
