// Competency 07's own concept diagram from the real guidebook booklet
// (agentic-engg.-booklet-v2.pdf, page 18) — the same feature captured two
// ways: an ADR (the why) and a sequence diagram (the behavior). The
// booklet renders the sequence as a real UML lifeline diagram with
// crossing arrows; here it's a plain ordered message list grouped by
// actor instead of fragile positioned-arrow SVG, same "no line art"
// approach as every other diagram in this app.
const MESSAGES: { from: string; to: string; label: string; highlight?: boolean }[] = [
  { from: "Client", to: "Orders API", label: "POST /checkout" },
  { from: "Orders API", to: "Orders API", label: "create order · pending", highlight: true },
  { from: "Orders API", to: "Stripe", label: "create PaymentIntent" },
  { from: "Stripe", to: "Orders API", label: "client_secret" },
  { from: "Orders API", to: "Client", label: "200 · client_secret" },
  { from: "Client", to: "Stripe", label: "confirmPayment 3DS" },
  { from: "Stripe", to: "Orders API", label: "async · webhook = source of truth", highlight: true },
  { from: "Stripe", to: "Orders API", label: "payment_intent.succeeded" },
  { from: "Orders API", to: "Orders API", label: "mark order paid ✓", highlight: true },
  { from: "Orders API", to: "Client", label: "email receipt" },
];

const ACTOR_COLOR: Record<string, string> = {
  Client: "text-accent",
  "Orders API": "text-success-fg",
  Stripe: "text-done-fg",
};

export function AdrSequenceDiagram() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-canvas-subtle p-4">
          <p className="font-mono text-xs text-fg-muted">docs/adr/0012-async-payment.md</p>
          <p className="mt-1 text-sm font-bold text-fg">Architecture Decision Record · 012</p>
          <span className="mt-2 inline-block rounded-full border border-success-fg/40 bg-success-fg/10 px-2 py-0.5 text-[10px] font-semibold text-success-fg">
            Accepted · supersedes ADR-009
          </span>

          <div className="mt-3 space-y-2.5 text-xs">
            <div>
              <p className="font-semibold uppercase tracking-wide text-fg-muted">Context</p>
              <p className="mt-0.5 text-fg">
                Checkout must not block on Stripe; the call is slow and can time out.
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wide text-fg-muted">Decision</p>
              <p className="mt-0.5 text-fg">
                Create a pending order, return the client_secret, then confirm from
                the payment_intent.succeeded webhook.
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wide text-fg-muted">
                Alternatives
              </p>
              <p className="mt-0.5 text-fg">
                Sync charge + poll → rejected: holds the request open, doubles
                latency.
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wide text-fg-muted">
                Consequences
              </p>
              <p className="mt-0.5 text-fg">
                pending → paid state machine; webhook must be idempotent + signed.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-canvas-subtle p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-fg-muted">diagrams/checkout.sequence.mmd</p>
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
        same feature, two views · the ADR is the why, the sequence is the behavior
      </p>
    </div>
  );
}
