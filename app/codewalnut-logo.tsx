// Real logo asset (public/codewalnut-logo.png — cropped from the actual
// brand mark the user provided, tagline/border removed). Its ink color is
// near-black (rgb(16,16,26)), designed for a light surface, so it's shown
// on a small white badge rather than directly against our dark canvas
// (which would otherwise read as black-on-black) — preserves the real
// brand colors instead of recoloring them for the dark theme.
export function CodewalnutLogo({
  className = "",
  height = 18,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-white px-2 py-1 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/codewalnut-logo.png"
        alt="CodeWalnut"
        style={{ height, width: "auto", display: "block" }}
      />
    </span>
  );
}
