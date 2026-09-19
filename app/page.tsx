const COMPETENCIES = [
  "Toolchain Setup",
  "Spec Framing",
  "Context Engineering",
  "Test Automation",
  "Skill Packaging",
  "Multi-Agent Workflows",
  "Docs & Diagrams",
  "Evidence-led PRs",
  "Code Review",
  "Token Economics",
  "Agentic Refactoring",
  "Agentic Retrospective",
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-10 px-6 py-16 text-center">
      <header className="flex w-full items-center justify-between">
        <span className="text-sm font-semibold tracking-wide">
          Agentic Engineering
        </span>
        <a
          href="/login"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
        >
          Log in
        </a>
      </header>

      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Master agentic engineering.
        </h1>
        <p className="text-neutral-600">
          12 competencies. 35 evidence-graded exercises. Real starter apps.
        </p>
      </div>

      <a
        href="/login"
        className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Log in to start
      </a>

      <section className="w-full">
        <h2 className="mb-4 text-left text-sm font-semibold text-neutral-500">
          What you&apos;ll learn
        </h2>
        <ol className="grid grid-cols-1 gap-2 text-left sm:grid-cols-2 md:grid-cols-3">
          {COMPETENCIES.map((title, i) => (
            <li
              key={title}
              className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
            >
              <span className="text-neutral-400">
                {String(i + 1).padStart(2, "0")}
              </span>{" "}
              {title}
            </li>
          ))}
        </ol>
      </section>

      <p className="text-sm italic text-neutral-500">
        &ldquo;Agents replace typing, not thinking.&rdquo; — from the
        guidebook
      </p>
    </main>
  );
}
