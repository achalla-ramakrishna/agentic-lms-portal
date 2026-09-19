// A small recreation of the CodeWalnut wordmark (the split-circle "o") —
// no source asset file was available, only a reference screenshot, so
// this is redrawn as inline SVG/text rather than an image asset.
export function CodewalnutLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-[2px] text-base font-extrabold tracking-tight ${className}`}
    >
      c
      <svg
        width="15"
        height="15"
        viewBox="0 0 20 20"
        className="inline-block"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="9" fill="#F5E9DA" />
        <path d="M10 1 A9 9 0 0 0 10 19 Z" fill="#8B3FE0" />
        <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeOpacity="0.15" />
      </svg>
      de&thinsp;walnut
    </span>
  );
}
