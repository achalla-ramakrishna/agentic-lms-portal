import { describe, it, expect } from "vitest";
import { statusBreakdown, progressMessage, daysSince } from "@/lib/dashboard-stats";

describe("statusBreakdown", () => {
  it("counts exercises with no submission row as not_started", () => {
    const counts = statusBreakdown([{ status: "passed" }], 3);
    expect(counts).toEqual({
      not_started: 2,
      in_progress: 0,
      submitted: 0,
      needs_rework: 0,
      passed: 1,
    });
  });

  it("adds an explicit not_started row to the missing-row count rather than overwriting it", () => {
    const counts = statusBreakdown(
      [{ status: "not_started" }, { status: "passed" }],
      3,
    );
    expect(counts.not_started).toBe(2); // 1 explicit row + 1 exercise with no row
    expect(counts.passed).toBe(1);
  });

  it("handles every exercise having a row", () => {
    const counts = statusBreakdown(
      [
        { status: "passed" },
        { status: "in_progress" },
        { status: "needs_rework" },
      ],
      3,
    );
    expect(counts.not_started).toBe(0);
  });

  it("handles zero exercises", () => {
    expect(statusBreakdown([], 0).not_started).toBe(0);
  });
});

describe("progressMessage", () => {
  it("returns a distinct message per band", () => {
    const messages = [0, 10, 25, 50, 75, 100].map(progressMessage);
    expect(new Set(messages).size).toBe(messages.length);
  });

  it("is monotonically more complete-sounding as pct rises (spot checks)", () => {
    expect(progressMessage(0)).toMatch(/starts here/i);
    expect(progressMessage(100)).toMatch(/mastered/i);
  });
});

describe("daysSince", () => {
  it("computes whole days elapsed", () => {
    const start = new Date("2026-09-01T00:00:00Z");
    const now = new Date("2026-09-04T12:00:00Z");
    expect(daysSince(start, now)).toBe(3);
  });

  it("never returns negative (clock skew clamps to 0)", () => {
    const start = new Date("2026-09-05T00:00:00Z");
    const now = new Date("2026-09-01T00:00:00Z");
    expect(daysSince(start, now)).toBe(0);
  });

  it("returns 0 for the same day", () => {
    const t = new Date("2026-09-01T08:00:00Z");
    expect(daysSince(t, t)).toBe(0);
  });
});
