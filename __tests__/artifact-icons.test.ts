import { describe, it, expect } from "vitest";
import { artifactCategory } from "@/lib/artifact-icons";

describe("artifactCategory", () => {
  it("classifies plain doc/config files", () => {
    expect(artifactCategory("AGENTS.md")).toBe("doc");
    expect(artifactCategory("CLAUDE.md")).toBe("doc");
    expect(artifactCategory("conventions.md")).toBe("doc");
  });

  it("classifies every slash command the same way regardless of purpose", () => {
    expect(artifactCategory("/plan")).toBe("command");
    expect(artifactCategory("/review")).toBe("command"); // not "review", despite the name
    expect(artifactCategory("/compact")).toBe("command");
    expect(artifactCategory("/usage")).toBe("command");
  });

  it("classifies guardrail/safety mechanisms consistently", () => {
    expect(artifactCategory("PreToolUse hooks")).toBe("guardrail");
    expect(artifactCategory("Stop/PreToolUse hooks")).toBe("guardrail");
    expect(artifactCategory("sandboxing")).toBe("guardrail");
    expect(artifactCategory("secret scanning")).toBe("guardrail");
    expect(artifactCategory("feature flags")).toBe("guardrail");
    expect(artifactCategory("Strangler Pattern")).toBe("guardrail");
  });

  it("resolves the excalidraw-skill collision to diagram, not skill", () => {
    expect(artifactCategory("excalidraw skill")).toBe("diagram");
    expect(artifactCategory("Mermaid")).toBe("diagram");
    expect(artifactCategory("C4")).toBe("diagram");
    expect(artifactCategory("ADR / MADR")).toBe("diagram");
    expect(artifactCategory("repo-maps")).toBe("diagram");
  });

  it("classifies packaged-skill artifacts", () => {
    expect(artifactCategory("SKILL.md")).toBe("skill");
    expect(artifactCategory(".agents/skills")).toBe("skill");
    expect(artifactCategory("Skill Creator Skill")).toBe("skill");
    expect(artifactCategory("SuperPowers Skills")).toBe("skill");
    expect(artifactCategory("Hand-off Skill")).toBe("skill");
  });

  it("classifies CLI tools", () => {
    expect(artifactCategory("CLIs/MCP")).toBe("cli");
    expect(artifactCategory("gh CLI")).toBe("cli");
  });

  it("distinguishes trace-viewer (test) from agenttrace/session logs (metric)", () => {
    expect(artifactCategory("Trace Viewer")).toBe("test");
    expect(artifactCategory("agenttrace")).toBe("metric");
    expect(artifactCategory("session logs")).toBe("metric");
    expect(artifactCategory("Graphify")).toBe("metric");
  });

  it("classifies testing tools/techniques", () => {
    expect(artifactCategory("Playwright")).toBe("test");
    expect(artifactCategory("Testing Library")).toBe("test");
    expect(artifactCategory("API Mocks")).toBe("test");
    expect(artifactCategory("Role Locators")).toBe("test");
    expect(artifactCategory("characterization tests")).toBe("test");
    expect(artifactCategory("npm run verify:exercise")).toBe("test");
  });

  it("classifies review/evidence artifacts", () => {
    expect(artifactCategory("PR template")).toBe("review");
    expect(artifactCategory("CI artifacts")).toBe("review");
    expect(artifactCategory("Coverage Report")).toBe("review");
    expect(artifactCategory("MergeMitra")).toBe("review");
  });

  it("classifies spec/requirements artifacts, including spec.md over the .md fallback", () => {
    expect(artifactCategory("spec.md")).toBe("spec");
    expect(artifactCategory("acceptance criteria")).toBe("spec");
    expect(artifactCategory("Given/When/Then")).toBe("spec");
    expect(artifactCategory("EARS")).toBe("spec");
    expect(artifactCategory("behavior spec")).toBe("spec");
  });

  it("classifies multi-agent/worktree concepts", () => {
    expect(artifactCategory("git worktrees")).toBe("agent");
    expect(artifactCategory("subagents")).toBe("agent");
    expect(artifactCategory("agent teams")).toBe("agent");
    expect(artifactCategory("Treehouse")).toBe("agent");
  });

  it("is case-insensitive", () => {
    expect(artifactCategory("agents.md")).toBe("doc");
    expect(artifactCategory("PLAYWRIGHT")).toBe("test");
  });
});
