import { describe, it, expect } from "vitest";
import { aggregateRoster } from "@/lib/roster";

const competencies = [
  { number: 1, exerciseCount: 2 },
  { number: 2, exerciseCount: 3 },
];

const learners = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

describe("aggregateRoster", () => {
  it("computes passed/total per competency and overall for each learner", () => {
    const submissions = [
      { userId: 1, competencyNumber: 1, status: "passed" as const, submittedAt: new Date("2026-01-01"), startedAt: new Date("2025-12-31") },
      { userId: 1, competencyNumber: 1, status: "passed" as const, submittedAt: new Date("2026-01-02"), startedAt: null },
      { userId: 1, competencyNumber: 2, status: "in_progress" as const, submittedAt: null, startedAt: new Date("2026-01-03") },
      { userId: 2, competencyNumber: 2, status: "submitted" as const, submittedAt: new Date("2026-01-04"), startedAt: null },
    ];

    const rows = aggregateRoster(learners, competencies, submissions);

    const alice = rows.find((r) => r.userId === 1)!;
    expect(alice.perCompetency.get(1)).toEqual({ passed: 2, total: 2 });
    expect(alice.perCompetency.get(2)).toEqual({ passed: 0, total: 3 });
    expect(alice.passedCount).toBe(2);
    expect(alice.totalExercises).toBe(5); // 2 + 3 across both competencies
    expect(alice.pendingCount).toBe(0);
    // Jan 3 (competency 2's startedAt) is later than Jan 2 (competency
    // 1's second submittedAt) — lastActivity is the max across everything.
    expect(alice.lastActivity).toEqual(new Date("2026-01-03"));

    const bob = rows.find((r) => r.userId === 2)!;
    expect(bob.passedCount).toBe(0);
    expect(bob.pendingCount).toBe(1);
  });

  it("sorts rows with the most pending submissions first (Flow B step 1)", () => {
    const submissions = [
      { userId: 1, competencyNumber: 1, status: "in_progress" as const, submittedAt: null, startedAt: new Date() },
      { userId: 2, competencyNumber: 1, status: "submitted" as const, submittedAt: new Date(), startedAt: null },
    ];
    const rows = aggregateRoster(learners, competencies, submissions);
    expect(rows[0].userId).toBe(2); // Bob has a pending submission, Alice doesn't
  });

  it("gives a learner with no submissions at all a zeroed-out row, not a crash", () => {
    const rows = aggregateRoster(learners, competencies, []);
    for (const row of rows) {
      expect(row.passedCount).toBe(0);
      expect(row.pendingCount).toBe(0);
      expect(row.lastActivity).toBeNull();
      expect(row.perCompetency.get(1)).toEqual({ passed: 0, total: 2 });
    }
  });

  it("returns an empty array when there are no learners", () => {
    expect(aggregateRoster([], competencies, [])).toEqual([]);
  });
});
