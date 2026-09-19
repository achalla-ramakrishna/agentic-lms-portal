import { describe, it, expect } from "vitest";
import {
  section,
  bulletLines,
  numberedLines,
  decodePathSegment,
} from "../scripts/lib/parse-readme.mjs";

describe("section", () => {
  it("extracts the body between a heading and the next ## heading", () => {
    const md = `# Title

## Your Mission

Do the thing.

## Project

Some project.
`;
    expect(section(md, "Your Mission")).toBe("Do the thing.");
  });

  it("runs to end of string when there's no next heading and a custom terminator is passed", () => {
    const md = `## Completion Criteria

- one
- two
`;
    expect(section(md, "Completion Criteria", /^(?![\s\S])/)).toBe(
      "- one\n- two",
    );
  });

  it("returns an empty string when the heading isn't present", () => {
    expect(section("# Title\n\nno headings here", "Evidence")).toBe("");
  });
});

describe("bulletLines", () => {
  it("extracts '- ' bulleted lines", () => {
    const text = "Submit:\n\n- evidence/before.md\n- evidence/after.md";
    expect(bulletLines(text)).toEqual([
      "evidence/before.md",
      "evidence/after.md",
    ]);
  });

  it("falls back to one item per paragraph for prose sections (exercises 3.1-3.3, 7.1-7.4)", () => {
    // real shape from exercise 3.1's Evidence section — no bullets at all
    const text =
      "Submit `evidence/handover.md` and `evidence/before.md`. Include the transcript.\n\n" +
      "Follow the setup instructions and run verify:exercise before raising a PR.";
    expect(bulletLines(text)).toEqual([
      "Submit `evidence/handover.md` and `evidence/before.md`. Include the transcript.",
      "Follow the setup instructions and run verify:exercise before raising a PR.",
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(bulletLines("")).toEqual([]);
  });
});

describe("numberedLines", () => {
  it("extracts numbered steps and strips the 'N. ' prefix", () => {
    const text = "1. Create two branches.\n\n2. Start a fresh session.";
    expect(numberedLines(text)).toEqual([
      "Create two branches.",
      "Start a fresh session.",
    ]);
  });

  it("ignores non-numbered lines", () => {
    const text = "Intro paragraph.\n\n1. Step one.\n\nSome aside.";
    expect(numberedLines(text)).toEqual(["Step one."]);
  });
});

describe("decodePathSegment", () => {
  it("strips a leading './' and URL-decodes the rest", () => {
    expect(decodePathSegment("./01%20Toolchain%20Setup/README.md")).toBe(
      "01 Toolchain Setup/README.md",
    );
  });

  it("decodes '&' encoded as %26 (e.g. 'Docs & Diagrams')", () => {
    expect(decodePathSegment("./07%20Docs%20%26%20Diagrams")).toBe(
      "07 Docs & Diagrams",
    );
  });
});
