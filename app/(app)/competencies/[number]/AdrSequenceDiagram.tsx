// Competency 07's own concept diagram. Was a fabricated Stripe/checkout
// example lifted from the guidebook booklet (agentic-engg.-booklet-v2.pdf,
// page 18) — accurate to nothing in this codebase. Its first replacement
// (this session) grounded the content in a real bug fix — this app's own
// docs/features/0020-branded-login-company-restriction.md and lib/auth.ts's
// authorize() — but kept the same two-text-panel layout as the original,
// which a 3-second glance reads as prose, not a diagram: no shape, no
// arrows, nothing to look AT before reading. This pass keeps the exact
// same real content and fixes that: one real inline-SVG flow diagram
// (boxes + labeled arrows, this app's own GitHub-dark palette from
// tailwind.config.ts, not a new one) that shows the actual branch — two
// companies, one shared check, two different outcomes — readable at a
// glance, with the "why" as a short caption underneath rather than a
// second wall of text to read before the picture makes sense.
const COLOR = {
  accent: "#58a6ff",
  done: "#a371f7",
  success: "#3fb950",
  danger: "#f85149",
  line: "#30363d",
  fgMuted: "#8b949e",
};

export function AdrSequenceDiagram() {
  return (
    <div>
      <figure className="rounded-xl border border-line bg-canvas-subtle p-4">
        <svg
          viewBox="0 0 760 300"
          role="img"
          aria-label="A CodeWalnut user and an Acme Robotics user both attempt to log in on Acme's branded page, and both requests reach the same authorize() function. It checks whether the user's own company matches the page's company: the CodeWalnut user is rejected with a generic incorrect-password error, while the Acme user's request succeeds and receives a session JWT carrying their roles."
          className="w-full"
        >
          <defs>
            <marker id="c7-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={COLOR.fgMuted} />
            </marker>
            <marker id="c7-arrow-danger" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={COLOR.danger} />
            </marker>
            <marker id="c7-arrow-success" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={COLOR.success} />
            </marker>
          </defs>

          {/* entry boxes */}
          <rect x="20" y="16" width="260" height="56" rx="10" fill="none" stroke={COLOR.accent} strokeWidth="1.5" />
          <text x="150" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="#e6edf3">CodeWalnut user</text>
          <text x="150" y="58" textAnchor="middle" fontSize="10.5" fill={COLOR.fgMuted}>POST /login/acme-robotics</text>

          <rect x="480" y="16" width="260" height="56" rx="10" fill="none" stroke={COLOR.done} strokeWidth="1.5" />
          <text x="610" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="#e6edf3">Acme user</text>
          <text x="610" y="58" textAnchor="middle" fontSize="10.5" fill={COLOR.fgMuted}>POST /login/acme-robotics</text>

          {/* converge into authorize() */}
          <path d="M150,72 C150,100 300,108 340,122" fill="none" stroke={COLOR.accent} strokeWidth="1.5" markerEnd="url(#c7-arrow)" />
          <path d="M610,72 C610,100 460,108 420,122" fill="none" stroke={COLOR.done} strokeWidth="1.5" markerEnd="url(#c7-arrow)" />

          <rect x="240" y="124" width="280" height="64" rx="10" fill="none" stroke={COLOR.success} strokeWidth="1.75" />
          <text x="380" y="150" textAnchor="middle" fontSize="14" fontWeight="700" fill={COLOR.success}>authorize()</text>
          <text x="380" y="168" textAnchor="middle" fontSize="10.5" fill={COLOR.fgMuted}>user.companyId === page&#8217;s company?</text>

          {/* branch: reject vs success */}
          <path d="M300,188 C260,210 180,215 150,232" fill="none" stroke={COLOR.danger} strokeWidth="1.5" markerEnd="url(#c7-arrow-danger)" />
          <text x="230" y="212" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={COLOR.danger}>✗ no</text>

          <path d="M460,188 C500,210 580,215 610,232" fill="none" stroke={COLOR.success} strokeWidth="1.5" markerEnd="url(#c7-arrow-success)" />
          <text x="530" y="212" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={COLOR.success}>✓ yes</text>

          <rect x="20" y="234" width="260" height="56" rx="10" fill="rgba(248,81,73,0.08)" stroke={COLOR.danger} strokeWidth="1.5" />
          <text x="150" y="258" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={COLOR.danger}>REJECTED</text>
          <text x="150" y="276" textAnchor="middle" fontSize="10" fill={COLOR.fgMuted}>&ldquo;Incorrect email or password&rdquo;</text>

          <rect x="480" y="234" width="260" height="56" rx="10" fill="rgba(63,185,80,0.08)" stroke={COLOR.success} strokeWidth="1.5" />
          <text x="610" y="258" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={COLOR.success}>JWT session</text>
          <text x="610" y="276" textAnchor="middle" fontSize="10" fill={COLOR.fgMuted}>{"{ companyId, roles: Role[] }"}</text>
        </svg>
        <figcaption className="mt-3 text-center text-xs text-fg-muted">
          Same <code className="rounded bg-canvas px-1 py-0.5 text-fg">authorize()</code>, same branded page, two companies —
          one boundary check decides both outcomes.
        </figcaption>
      </figure>

      <div className="mt-3 rounded-xl border border-line border-l-4 border-l-success-fg bg-canvas-subtle p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-success-fg">
          The real bug this diagram documents
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-fg">
          Before this check existed, a valid CodeWalnut credential could log in on Acme&rsquo;s
          own branded page and correctly see its own CodeWalnut data — which, from the outside,
          read exactly like &ldquo;the Acme portal is leaking the wrong company&rsquo;s data.&rdquo;
          Reproduced first, then fixed with one check in{" "}
          <code className="rounded bg-canvas px-1 py-0.5 text-fg">lib/auth.ts</code> — decision
          recorded in{" "}
          <code className="rounded bg-canvas px-1 py-0.5 text-fg">
            docs/features/0020-branded-login-company-restriction.md
          </code>
          .
        </p>
      </div>
    </div>
  );
}
