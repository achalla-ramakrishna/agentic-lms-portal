import { describe, it, expect } from "vitest";
import { isValidAccentColor, isValidLogoUrl } from "@/lib/company-branding";

describe("isValidAccentColor", () => {
  it("accepts a 6-digit hex color", () => {
    expect(isValidAccentColor("#3fb950")).toBe(true);
  });

  it("accepts an empty string (clears the field)", () => {
    expect(isValidAccentColor("")).toBe(true);
  });

  it("rejects a 3-digit shorthand hex", () => {
    expect(isValidAccentColor("#3f5")).toBe(false);
  });

  it("rejects a named color", () => {
    expect(isValidAccentColor("green")).toBe(false);
  });

  it("rejects a hex missing the #", () => {
    expect(isValidAccentColor("3fb950")).toBe(false);
  });
});

describe("isValidLogoUrl", () => {
  it("accepts an https URL", () => {
    expect(isValidLogoUrl("https://acme.example.com/logo.png")).toBe(true);
  });

  it("accepts an empty string (clears the field)", () => {
    expect(isValidLogoUrl("")).toBe(true);
  });

  it("rejects a javascript: URL", () => {
    expect(isValidLogoUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects a non-URL string", () => {
    expect(isValidLogoUrl("not a url")).toBe(false);
  });
});
