import { describe, it, expect } from "vitest";
import {
  extractArtifactNames,
  competencyArtifacts,
} from "@/lib/competency-artifacts";

describe("extractArtifactNames", () => {
  it("extracts every backtick-quoted name from a bulleted item", () => {
    expect(
      extractArtifactNames(
        "`evidence/before.md` and `evidence/before.patch`.",
      ),
    ).toEqual(["evidence/before.md", "evidence/before.patch"]);
  });

  it("extracts backtick names even from a prose-paragraph item (no bullets)", () => {
    const prose =
      "Submit `evidence/handover.md`, `evidence/handover-audit.md` and " +
      "`evidence/before.md`. Include the skill-use record.";
    expect(extractArtifactNames(prose)).toEqual([
      "evidence/handover.md",
      "evidence/handover-audit.md",
      "evidence/before.md",
    ]);
  });

  it("returns nothing for a plain-prose item with no backticks", () => {
    expect(
      extractArtifactNames(
        "A focused pull request containing only the exercise changes.",
      ),
    ).toEqual([]);
  });
});

describe("competencyArtifacts", () => {
  const exercises = [
    {
      evidenceChecklist: JSON.stringify([
        { label: "`evidence/before.md` and `evidence/before.patch`." },
        { label: "A focused pull request." },
      ]),
      projects: [{ displayName: "agent-onboarding-app" }],
    },
    {
      evidenceChecklist: JSON.stringify([
        { label: "`evidence/before.md` and `evidence/after.md`." },
      ]),
      projects: [{ displayName: "yolo-agent-app" }],
    },
  ];

  it("dedupes inputs and outputs across exercises", () => {
    const result = competencyArtifacts(exercises);
    expect(result.inputs.sort()).toEqual([
      "agent-onboarding-app",
      "yolo-agent-app",
    ]);
    // evidence/before.md appears in both exercises but should only count once
    expect(result.outputs.sort()).toEqual([
      "evidence/after.md",
      "evidence/before.md",
      "evidence/before.patch",
    ]);
  });

  it("caps displayed outputs and reports the truncated count", () => {
    const manyOutputs = Array.from({ length: 10 }, (_, i) => ({
      evidenceChecklist: JSON.stringify([{ label: `\`file-${i}.md\`` }]),
      projects: [],
    }));
    const result = competencyArtifacts(manyOutputs);
    expect(result.outputs).toHaveLength(6);
    expect(result.outputsTruncatedCount).toBe(4);
  });

  it("returns empty arrays for no exercises", () => {
    expect(competencyArtifacts([])).toEqual({
      inputs: [],
      outputs: [],
      outputsTruncatedCount: 0,
    });
  });
});
