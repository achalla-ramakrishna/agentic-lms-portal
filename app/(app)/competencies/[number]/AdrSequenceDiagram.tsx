// Competency 07's own concept diagram. Was a fabricated Stripe/checkout
// example lifted from the guidebook booklet (agentic-engg.-booklet-v2.pdf,
// page 18) — accurate to nothing in this codebase, exactly the "generic
// example with no real names" a good docs-and-diagrams prompt tells you to
// avoid. Replaced with this app's own real decision and its own real
// sequence: docs/features/0020-branded-login-company-restriction.md (the
// "why") and lib/auth.ts's authorize() (the "behavior") — the fix for a
// real bug a user reported live against this app ("acme learning portal
// should give acme data only and not codewalnut"). Same "plain message
// list grouped by actor" idiom as every other diagram in this app — no
// positioned-arrow SVG — just with real files, real functions, and a real
// bug instead of an invented one.
const MESSAGES: { from: string; to: string; label: string; highlight?: boolean }[] = [
  { from: "CodeWalnut user", to: "authorize()", label: "POST /login/acme-robotics" },
  {
    from: "authorize()",
    to: "authorize()",
    label: "user.companyId !== \"acme-robotics\".id",
    highlight: true,
  },
  { from: "authorize()", to: "CodeWalnut user", label: "null · \"Incorrect email or password\"" },
  { from: "Acme user", to: "authorize()", label: "POST /login/acme-robotics" },
  {
    from: "authorize()",
    to: "authorize()",
    label: "user.companyId === \"acme-robotics\".id ✓",
    highlight: true,
  },
  { from: "authorize()", to: "Acme user", label: "JWT · { companyId, roles: Role[] }" },
];

const ACTOR_COLOR: Record<string, string> = {
  "CodeWalnut user": "text-accent",
  "Acme user": "text-done-fg",
  "authorize()": "text-success-fg",
};

export function AdrSequenceDiagram() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-canvas-subtle p-4">
          <p className="font-mono text-xs text-fg-muted">
            docs/features/0020-branded-login-company-restriction.md
          </p>
          <p className="mt-1 text-sm font-bold text-fg">Feature spec · decision capture</p>
          <span className="mt-2 inline-block rounded-full border border-success-fg/40 bg-success-fg/10 px-2 py-0.5 text-[10px] font-semibold text-success-fg">
            Shipped · this app, this session
          </span>

          <div className="mt-3 space-y-2.5 text-xs">
            <div>
              <p className="font-semibold uppercase tracking-wide text-fg-muted">Context</p>
              <p className="mt-0.5 text-fg">
                A branded /login/:slug page never checked *who* could log in there — any
                company&rsquo;s valid credential worked, and correctly showed that user&rsquo;s
                own data, which read from the outside like &ldquo;the wrong company&rsquo;s
                data is leaking.&rdquo;
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wide text-fg-muted">Decision</p>
              <p className="mt-0.5 text-fg">
                One check inside authorize(): reject if the user&rsquo;s companyId
                doesn&rsquo;t match the branded page&rsquo;s company.
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wide text-fg-muted">
                Alternatives
              </p>
              <p className="mt-0.5 text-fg">
                Show a distinguishing error → rejected: it would leak which company an
                email address actually belongs to.
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wide text-fg-muted">
                Consequences
              </p>
              <p className="mt-0.5 text-fg">
                Same generic &ldquo;incorrect email or password&rdquo; either way; one
                shared check now guards every branded page, present and future.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-canvas-subtle p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-fg-muted">lib/auth.ts · authorize()</p>
            <span className="text-[10px] text-fg-subtle">verified vs code</span>
          </div>
          <div className="mt-3 flex gap-4 text-xs font-semibold">
            {Object.entries(ACTOR_COLOR).map(([actor, color]) => (
              <span key={actor} className={color}>
                {actor}
              </span>
            ))}
          </div>
          <ul className="mt-2 space-y-1.5">
            {MESSAGES.map((m, i) =>
              m.highlight ? (
                <li
                  key={i}
                  className="rounded border border-attention-fg/40 bg-attention-fg/10 px-2 py-1 text-[11px] font-semibold text-attention-fg"
                >
                  {m.label}
                </li>
              ) : (
                <li key={i} className="text-[11px] text-fg">
                  <span className={ACTOR_COLOR[m.from]}>{m.from}</span>
                  <span className="text-fg-subtle"> → </span>
                  <span className={ACTOR_COLOR[m.to]}>{m.to}</span>
                  <span className="text-fg-subtle">: </span>
                  {m.label}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-success-fg">
        same authorize() call, two companies · one boundary check decides both
      </p>
    </div>
  );
}
