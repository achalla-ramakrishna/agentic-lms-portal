// A single-ratio meter (dataviz skill: "a single ratio against a limit ->
// Meter, same-ramp track") — the dashboard's one hero figure. Plain SVG,
// server-rendered (no interactivity needed): the fill is a solid hue, the
// unfilled track is the same hue at low opacity, so state reads across
// the whole ring the way a meter's same-ramp track should.
export function ProgressRing({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const radius = 64;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center">
      <svg width={160} height={160} viewBox="0 0 160 160" className="-rotate-90">
        <circle
          cx={80}
          cy={80}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-success-fg/20"
        />
        <circle
          cx={80}
          cy={80}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-success-fg transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-semibold text-fg">{clamped}%</span>
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          complete
        </span>
      </div>
    </div>
  );
}
