import { describe, it, expect } from "vitest";
import {
  canStart,
  canSubmitEvidence,
  canDecide,
  isValidDecision,
} from "@/lib/status";

describe("canStart", () => {
  it("only allows starting from not_started", () => {
    expect(canStart("not_started")).toBe(true);
    expect(canStart("in_progress")).toBe(false);
    expect(canStart("submitted")).toBe(false);
    expect(canStart("needs_rework")).toBe(false);
    expect(canStart("passed")).toBe(false);
  });
});

describe("canSubmitEvidence", () => {
  it("allows submitting evidence while in progress or needing rework", () => {
    expect(canSubmitEvidence("in_progress")).toBe(true);
    expect(canSubmitEvidence("needs_rework")).toBe(true);
  });

  it("blocks submitting evidence once submitted or passed", () => {
    expect(canSubmitEvidence("submitted")).toBe(false);
    expect(canSubmitEvidence("passed")).toBe(false);
    expect(canSubmitEvidence("not_started")).toBe(false);
  });
});

describe("canDecide", () => {
  it("only allows a facilitator decision on a submitted submission", () => {
    expect(canDecide("submitted")).toBe(true);
    expect(canDecide("in_progress")).toBe(false);
    expect(canDecide("passed")).toBe(false);
    expect(canDecide("needs_rework")).toBe(false);
    expect(canDecide("not_started")).toBe(false);
  });
});

describe("isValidDecision", () => {
  it("accepts only the two real decision values", () => {
    expect(isValidDecision("passed")).toBe(true);
    expect(isValidDecision("needs_rework")).toBe(true);
    expect(isValidDecision("submitted")).toBe(false);
    expect(isValidDecision(null)).toBe(false);
    expect(isValidDecision(undefined)).toBe(false);
    expect(isValidDecision("")).toBe(false);
  });
});
