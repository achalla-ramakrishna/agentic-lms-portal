import { CodewalnutLogo } from "@/app/codewalnut-logo";
import { COMPETENCY_ICON, competencyStyle } from "@/lib/competency-style";

// Same title/subtitle text as content/seed.json (the real guidebook data)
// — kept as a static list here since the landing page is anonymous/
// pre-auth and shouldn't depend on the DB. If the seed content changes,
// re-sync this list by hand; it's cosmetic marketing copy, not the
// source of truth (docs/SPEC.md §3 owns that).
const COMPETENCIES = [
  { title: "Toolchain Setup", subtitle: "Project Rules, Hooks, Guardrails & CLI/MCP Wiring" },
  { title: "Spec Framing", subtitle: "Requirements Decomposition & Testable Spec Creation" },
  { title: "Context Engineering", subtitle: "Agent Working-Context Curation" },
  { title: "Test Automation", subtitle: "Reliable E2E Test Generation" },
  { title: "Skill Packaging", subtitle: "Workflow Packaging into Reusable Skills" },
  { title: "Multi-Agent Workflows", subtitle: "Parallel Agents on Isolated Tasks" },
  { title: "Docs & Diagrams", subtitle: "Diagrams & Arch. Decision Records" },
  { title: "Evidence-led PRs", subtitle: "PR Gate Evidence & Handoff" },
  { title: "Code Review", subtitle: "Code Quality & Risk Review for Merge Confidence" },
  { title: "Token Economics", subtitle: "Right Model & Token Cost Optimizations" },
  { title: "Agentic Refactoring", subtitle: "Test-Driven Tech-Debt Cleanup" },
  { title: "Agentic Retrospective", subtitle: "Session Review, Waste Reduction & Improvement" },
];

// Snake layout: row 1 reads 1→4 left-to-right, row 2 reads 8→5
// (continuing down from 4, then right-to-left), row 3 reads 9→12
// (continuing down from 8, then left-to-right again) — matches the
// reference numbering flow without needing fragile connector-line SVG
// paths between arbitrarily rotated, responsively-reflowing cards.
const SNAKE_ORDER = [0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11];

const ROTATIONS = ["-1.5deg", "1deg", "-0.75deg", "1.5deg"];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-14 px-6 py-16 text-center">
      <header className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <CodewalnutLogo height={24} />
          <span className="hidden text-sm font-semibold tracking-wide text-fg sm:inline">
            Agentic Engineering
          </span>
        </div>
        <a
          href="/login"
          className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-fg hover:bg-white/5"
        >
          Log in
        </a>
      </header>

      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-fg">
          Master agentic engineering.
        </h1>
        <p className="text-fg-muted">
          12 competencies. 35 evidence-graded exercises. Real starter apps.
        </p>
      </div>

      <a
        href="/login"
        className="rounded-md bg-success-emphasis px-5 py-2.5 text-sm font-medium text-white hover:bg-success-emphasis-hover"
      >
        Log in to start
      </a>

      <section className="w-full">
        <h2 className="mb-10 text-2xl font-extrabold text-fg">
          12 Competencies of <span className="text-accent">Agentic Engineers</span>
        </h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
          {SNAKE_ORDER.map((idx, position) => {
            const c = COMPETENCIES[idx];
            const number = idx + 1;
            const palette = competencyStyle(number);
            const rotation = ROTATIONS[position % ROTATIONS.length];
            return (
              <div key={idx} className="relative pt-3" style={{ transform: `rotate(${rotation})` }}>
                <span className="absolute -top-1 left-1 font-mono text-sm font-bold text-fg-subtle">
                  {String(number).padStart(2, "0")}
                </span>
                <div
                  className="relative rounded-2xl border-2 p-4 pt-7 text-left shadow-lg"
                  style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                >
                  <span
                    className="absolute -top-3 right-4 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white text-base"
                    style={{ borderColor: palette.border }}
                    aria-hidden="true"
                  >
                    {COMPETENCY_ICON[number]}
                  </span>
                  <h3 className="text-sm font-bold" style={{ color: palette.text }}>
                    {c.title}
                  </h3>
                  <p className="mt-1 text-xs leading-snug" style={{ color: palette.text }}>
                    {c.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-sm italic text-fg-muted">
        &ldquo;Agents replace typing, not thinking.&rdquo; — from the
        guidebook
      </p>

      <footer className="flex items-center gap-1.5 pb-8 text-xs text-fg-subtle">
        crafted by
        <CodewalnutLogo className="text-fg-muted" />
      </footer>
    </main>
  );
}
