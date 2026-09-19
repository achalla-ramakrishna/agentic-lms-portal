import { describe, it, expect } from "vitest";
import { aggregateTemplateCoverage } from "@/lib/template-coverage";

describe("aggregateTemplateCoverage", () => {
  it("counts exercises-with-docs and total docs per competency", () => {
    const rows = aggregateTemplateCoverage([
      {
        number: 1,
        title: "Toolchain Setup",
        exercises: [{ docCount: 1 }, { docCount: 2 }],
      },
      {
        number: 4,
        title: "Test Automation",
        exercises: [{ docCount: 0 }, { docCount: 0 }, { docCount: 0 }],
      },
    ]);

    expect(rows[0]).toEqual({
      number: 1,
      title: "Toolchain Setup",
      exerciseCount: 2,
      exercisesWithDocs: 2,
      totalDocs: 3,
    });
    expect(rows[1]).toEqual({
      number: 4,
      title: "Test Automation",
      exerciseCount: 3,
      exercisesWithDocs: 0,
      totalDocs: 0,
    });
  });

  it("handles a competency with no exercises without crashing", () => {
    const rows = aggregateTemplateCoverage([
      { number: 1, title: "Empty", exercises: [] },
    ]);
    expect(rows[0]).toEqual({
      number: 1,
      title: "Empty",
      exerciseCount: 0,
      exercisesWithDocs: 0,
      totalDocs: 0,
    });
  });

  it("returns an empty array for no competencies", () => {
    expect(aggregateTemplateCoverage([])).toEqual([]);
  });
});
