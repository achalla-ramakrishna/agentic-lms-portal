import { competencyStyle } from "@/lib/competency-style";

// Competency 01's own concept diagram from the real guidebook booklet
// (agentic-engg.-booklet-v2.pdf, page 4) — Rules and Guardrails feed the
// agent's one-time setup, Least Privilege scopes what it can reach, and
// secrets stay outside all of it behind a deny rule. Hardcoded to
// competency 1 for this pilot (docs/features/0008-booklet-learn-refresh.md)
// rather than data-driven, since only this competency's content has been
// verified against the real source so far. Uses this app's own
// per-competency palette and card system instead of the booklet's literal
// colors, for consistency with every other diagram in the app.
export function AgentCoreDiagram({ competencyNumber }: { competencyNumber: number }) {
  const palette = competencyStyle(competencyNumber);

  return (
    <div>
      <h3 className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-fg-muted">
        The Agent Core Setup
      </h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <DiagramCard
          label="Rules"
          heading="House rules & conventions"
          tags={["AGENTS.md", "CLAUDE.md", "conventions"]}
          accent={palette.border}
        />
        <DiagramCard
          label="Guardrails"
          heading="Gated, not wide open"
          tags={["safe-automode", "deny rules", "PreToolUse Hooks"]}
          accent={palette.border}
        />

        <div className="flex justify-center sm:col-span-2">
          <div
            className="flex flex-col items-center gap-1.5 rounded-2xl px-12 py-7 text-center text-white shadow-lg"
            style={{ backgroundColor: palette.border }}
          >
            <span className="text-3xl" aria-hidden="true">
              🛡️
            </span>
            <span className="text-lg font-bold">Agent core</span>
            <span className="text-xs opacity-90">one setup, every session</span>
          </div>
        </div>

        <DiagramCard
          label="Least Privilege"
          heading="Only the CLIs/MCPs it needs"
          tags={["github", "gcp", "docs", "playwright"]}
          accent={palette.border}
        />

        <div className="rounded-xl border border-danger-fg/40 bg-danger-subtle p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-danger-fg">
              Secrets · .env
            </span>
            <span className="shrink-0 rounded bg-danger-fg px-1.5 py-0.5 text-[10px] font-bold text-white">
              DENY
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-danger-fg">
            Blocked by a deny rule
          </p>
          <p className="text-xs text-danger-fg/80">
            The agent can never read them
          </p>
        </div>
      </div>
    </div>
  );
}

function DiagramCard({
  label,
  heading,
  tags,
  accent,
}: {
  label: string;
  heading: string;
  tags: string[];
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-canvas-subtle p-4">
      <span
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: accent }}
      >
        {label}
      </span>
      <p className="mt-1 text-sm font-semibold text-fg">{heading}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-line px-2 py-0.5 font-mono text-xs text-fg-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
