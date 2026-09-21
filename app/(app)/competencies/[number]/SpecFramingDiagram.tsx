// Competency 02's own concept diagram from the real guidebook booklet
// (agentic-engg.-booklet-v2.pdf, page 7) — a vague ticket produces several
// confident-but-wrong guesses, while a spec written as a testable contract
// converges on one verified result. Hardcoded to competency 2's real
// content, same pilot approach as AgentCoreDiagram
// (docs/features/0008-booklet-learn-refresh.md): not data-driven, since
// each competency's diagram is structurally bespoke. The booklet renders
// this as radial dotted lines fanning out to scattered X marks; here it's
// built from the app's existing tag/card tokens instead of custom SVG line
// art, consistent with AgentCoreDiagram's Connector approach.
export function SpecFramingDiagram() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-danger-fg/50 bg-danger-fg/10 p-5">
          <span className="text-xs font-bold uppercase tracking-wide text-danger-fg">
            Vague Request
          </span>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="rounded-lg border border-danger-fg/50 bg-canvas px-3 py-1.5 text-center">
              <span className="block font-mono text-xs font-semibold text-danger-fg">
                TICKET
              </span>
              <span className="block text-[10px] text-danger-fg/80">vague</span>
            </span>
            <span className="text-lg text-danger-fg/60" aria-hidden="true">
              ⇢
            </span>
            <span className="flex flex-wrap items-center justify-center gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-danger-fg/50 bg-canvas text-xs font-bold text-danger-fg"
                  aria-hidden="true"
                >
                  ✗
                </span>
              ))}
            </span>
          </div>
          <p className="mt-4 text-xs text-danger-fg/90">
            Six confident guesses, <strong>six wrong builds</strong> — you
            catch them in review, not before.
          </p>
        </div>

        <div className="rounded-xl border-2 border-success-fg/50 bg-success-fg/10 p-5">
          <span className="text-xs font-bold uppercase tracking-wide text-success-fg">
            A Contract It Can Test
          </span>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="rounded-lg border border-success-fg/50 bg-canvas px-3 py-1.5 text-center">
              <span className="block font-mono text-xs font-semibold text-success-fg">
                SPEC.md
              </span>
              <span className="block text-[10px] text-success-fg/80">
                testable
              </span>
            </span>
            <span className="h-px w-8 bg-success-fg/50" aria-hidden="true" />
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-success-fg bg-canvas text-base font-bold text-success-fg">
              ✓
            </span>
          </div>
          <p className="mt-4 text-xs text-success-fg/90">
            Acceptance criteria the agent verifies —{" "}
            <strong>the first diff matches intent</strong>.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-line bg-canvas-inset p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-fg-muted">
            A Spec Spells Out
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              "actor + goal",
              "state change",
              "examples",
              "acceptance criteria",
              "boundaries & failure states",
              "\"not in scope\"",
              "checks that prove it",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-success-fg/40 bg-success-fg/10 px-2.5 py-1 text-xs text-success-fg"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
