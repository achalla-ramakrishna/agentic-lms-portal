// Pure validation — no Prisma — so directly testable
// (__tests__/company-branding.test.ts). Both fields are optional: an
// empty string clears the field back to the default CodeWalnut look
// on the branded login page (/login/:slug), rather than being
// rejected as invalid.

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isValidAccentColor(value: string): boolean {
  return value === "" || HEX_COLOR.test(value);
}

// Deliberately narrow: http(s) only, so a company can't put a
// javascript: URL (or similar) into an <img src> that renders on our
// own login page. Not a full SSRF-safe URL validator — this only ever
// becomes an <img> src, never fetched server-side.
export function isValidLogoUrl(value: string): boolean {
  if (value === "") return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
