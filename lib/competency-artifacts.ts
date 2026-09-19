import type { Exercise, ExerciseProject } from "@prisma/client";
import { evidenceChecklist } from "./content";

// Pulls every backtick-quoted name out of an evidence-checklist label —
// e.g. "Submit `evidence/before.md` and `evidence/before.patch`." ->
// ["evidence/before.md", "evidence/before.patch"]. Deliberately strict:
// only real, explicitly-named artifacts count, never a paraphrase of
// prose that has no backticks (some exercises state evidence as a
// prose paragraph rather than a bulleted list — see
// scripts/lib/parse-readme.mjs's fallback — and guessing a short label
// for those risks misrepresenting what the README actually says).
export function extractArtifactNames(checklistLabel: string): string[] {
  return [...checklistLabel.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
}

export type ExerciseForArtifacts = Pick<Exercise, "evidenceChecklist"> & {
  projects: Pick<ExerciseProject, "displayName">[];
};

export type CompetencyArtifacts = {
  inputs: string[];
  outputs: string[];
  outputsTruncatedCount: number; // how many more exist beyond what's shown
};

const MAX_OUTPUTS_SHOWN = 6;

// Real aggregate data across a competency's exercises — the actual
// starter-app projects learners begin from (inputs) and the actual
// named evidence files each exercise's README asks for (outputs). Not
// fabricated: every value here traces back to content/seed.json.
export function competencyArtifacts(
  exercises: ExerciseForArtifacts[],
): CompetencyArtifacts {
  const inputs = new Set<string>();
  const outputs = new Set<string>();

  for (const ex of exercises) {
    for (const p of ex.projects) inputs.add(p.displayName);
    for (const item of evidenceChecklist(ex)) {
      for (const name of extractArtifactNames(item.label)) outputs.add(name);
    }
  }

  const allOutputs = [...outputs];
  return {
    inputs: [...inputs],
    outputs: allOutputs.slice(0, MAX_OUTPUTS_SHOWN),
    outputsTruncatedCount: Math.max(0, allOutputs.length - MAX_OUTPUTS_SHOWN),
  };
}
