// Thin typed wrappers around the JSON-encoded columns in prisma/schema.prisma
// (SQLite has no native array/JSON type worth using here — see
// docs/adr/0001-stack-choice.md).
import type { Competency, Exercise, ExerciseProject } from "@prisma/client";

export type EvidenceChecklistItem = { label: string };

export function masteryBullets(c: Pick<Competency, "masteryBullets">): string[] {
  return JSON.parse(c.masteryBullets);
}

export function toolkitTags(c: Pick<Competency, "toolkitTags">): string[] {
  return JSON.parse(c.toolkitTags);
}

export function howToSteps(e: Pick<Exercise, "howToSteps">): string[] {
  return JSON.parse(e.howToSteps);
}

export function evidenceChecklist(
  e: Pick<Exercise, "evidenceChecklist">,
): EvidenceChecklistItem[] {
  return JSON.parse(e.evidenceChecklist);
}

export function completionCriteria(
  e: Pick<Exercise, "completionCriteria">,
): string[] {
  return JSON.parse(e.completionCriteria);
}

export type ExerciseWithProjects = Exercise & { projects: ExerciseProject[] };
