import { describe, it, expect } from "vitest";
import { companyOverview } from "@/lib/company-stats";

const competencies = [
  { number: 1, title: "Toolchain Setup", exerciseIds: [1, 2] },
  { number: 2, title: "Spec Framing", exerciseIds: [3, 4] },
];

describe("companyOverview", () => {
  it("counts a competency's slots as exerciseCount * learnerCount, not just exerciseCount", () => {
    const result = companyOverview(2, [], competencies);
    expect(result.competencyProgress).toEqual([
      { number: 1, title: "Toolchain Setup", passed: 0, total: 4 },
      { number: 2, title: "Spec Framing", passed: 0, total: 4 },
    ]);
  });

  it("computes overall pct across every learner's slots", () => {
    const result = companyOverview(2, [
      { exerciseId: 1, status: "passed" },
      { exerciseId: 3, status: "passed" },
    ], competencies);
    // 2 passed out of 4 exercises * 2 learners = 8 slots
    expect(result.overallPct).toBe(25);
  });

  it("attributes passed submissions to the right competency", () => {
    const result = companyOverview(1, [
      { exerciseId: 1, status: "passed" },
      { exerciseId: 2, status: "in_progress" },
      { exerciseId: 3, status: "passed" },
    ], competencies);
    const byNumber = new Map(result.competencyProgress.map((c) => [c.number, c.passed]));
    expect(byNumber.get(1)).toBe(1);
    expect(byNumber.get(2)).toBe(1);
  });

  it("handles zero learners without dividing by zero", () => {
    const result = companyOverview(0, [], competencies);
    expect(result.overallPct).toBe(0);
    expect(result.counts.not_started).toBe(0);
  });

  it("rolls unaccounted-for slots into not_started via statusBreakdown", () => {
    const result = companyOverview(2, [{ exerciseId: 1, status: "passed" }], competencies);
    // 8 total slots, 1 explicit submission -> 7 not_started
    expect(result.counts.not_started).toBe(7);
    expect(result.counts.passed).toBe(1);
  });
});
