// Short, accurate "what is this and why it matters" explanations for every
// toolkit tag that appears anywhere in content/seed.json (50 unique tags,
// verified against the guidebook — see the full list check in
// scripts/generate-seed.mjs's history). This is general reference
// knowledge about real, established agentic-engineering tools and
// conventions — not a claim that a specific file from this exercise's
// repo backs it (that's lib/toolkit-doc-links.ts's job, for the handful
// of tags where a real file actually exists). Keyed lowercase; look up
// with `.toLowerCase().trim()`.
export const ARTIFACT_GLOSSARY: Record<string, string> = {
  "agents.md": "A plain-Markdown file at the repo root that coding agents read at the start of every session — conventions, commands, and guardrails a human wouldn't need repeated but an agent starting cold does.",
  "claude.md": "Claude Code's project-level instruction file — the same idea as AGENTS.md, read automatically at the start of a session in this repo.",
  "pretooluse hooks": "A hook that runs before an agent executes a tool call, so a script can inspect, log, or block the action before it happens — the enforcement point for guardrails.",
  "stop/pretooluse hooks": "Two hook types together: PreToolUse runs before a tool call (block or approve it), Stop runs when the agent tries to end its turn (catch incomplete work before it's declared done).",
  sandboxing: "Running an agent's commands in an isolated environment (container, VM, restricted filesystem) so a destructive or unexpected action can't reach real infrastructure or data.",
  "secret scanning": "Automated detection of credentials, API keys, and tokens in code or diffs before they're committed or merged — a guardrail against agents accidentally leaking secrets.",
  "clis/mcp": "Command-line tools and Model Context Protocol servers — the two main ways an agent gets structured access to external systems (a database, an API, a ticketing system) beyond plain file edits.",
  "/plan": "A slash command that asks the agent to propose an approach and stop for approval before writing any code — separating \"what to do\" from \"doing it.\"",
  "spec.md": "A written specification file capturing requirements and acceptance criteria before implementation starts, so both the human and the agent are building toward the same, testable definition of done.",
  "superpowers skill": "A packaged skill that walks an agent through interviewing a vague ticket — surfacing assumptions and drafting clarifying product questions before any spec gets written.",
  "spec-kit skill": "A packaged skill that turns clarified requirements into a structured spec.md (actor, state change, examples, acceptance criteria, non-goals) instead of an ad-hoc write-up.",
  "acceptance criteria": "The specific, checkable conditions that decide whether a requirement is actually satisfied — the difference between \"looks done\" and \"is done.\"",
  "given/when/then": "A structured format for writing a behavior scenario (its starting state, the action taken, the expected result) so acceptance criteria are unambiguous and testable.",
  ears: "Easy Approach to Requirements Syntax — a constrained sentence template (\"While <state>, when <trigger>, the system shall <response>\") that makes requirements precise enough for an agent to implement without guessing.",
  "repo-maps": "A generated overview of a codebase's structure and key files, given to an agent as compact context instead of the whole repo — much cheaper than reading everything.",
  adrs: "Architecture Decision Records — short documents that record a significant technical decision, the alternatives considered, and why this one was chosen, so the reasoning survives past the original conversation.",
  "adr / madr": "ADR (Architecture Decision Record) in the MADR (Markdown ADR) template format — a standardized structure for writing decision records.",
  "backlog.md": "A file listing planned work items outside the current task — captured so a good idea or known gap isn't lost, without derailing the spec in front of you.",
  "architecture.md": "A file describing a system's high-level structure and data flow — the map an agent (or new engineer) reads before making a change that crosses multiple parts of the codebase.",
  "conventions.md": "A file documenting a team's specific coding conventions (naming, structure, patterns) an agent should follow but that aren't enforced by a linter.",
  skills: "Packaged, reusable instructions an agent can load for a specific job (interviewing a ticket, writing a spec, generating a diagram) instead of relying on the same ad-hoc prompt every time.",
  "flow diagrams": "A visual map of how data or control moves through a system — handed to an agent (or a new engineer) so it doesn't have to reconstruct the flow by reading every file first.",
  playwright: "A browser-automation framework used to write and run end-to-end tests that actually click through a real UI, the way a user would.",
  "testing library": "A testing utility (most often Testing Library for React) that encourages tests to query the UI the way a user perceives it — by visible text and role — rather than internal implementation details.",
  "api mocks": "Fake API responses substituted for real network calls in a test, so tests run fast and deterministically without depending on a live backend.",
  "role locators": "Finding elements in a UI test by their accessibility role (button, link, heading) rather than a CSS class or test-id — more resilient to markup changes and more accessible by construction.",
  "trace viewer": "Playwright's tool for replaying a recorded test run step-by-step with screenshots and network activity, used to debug why a test failed.",
  fixtures: "Reusable setup (a logged-in session, seeded data, a configured page object) that a test framework injects into each test, so tests stay independent without repeating boilerplate.",
  "skill.md": "The manifest file of an Agent Skill — a folder an agent can load on demand, describing when to use it, its step-by-step workflow, and the expected output.",
  ".agents/skills": "A conventional folder location for packaging Agent Skills inside a repository so they ship with the code they apply to.",
  ".claude/skills/": "Claude Code's specific folder convention for skills scoped to a project, auto-discovered without extra configuration.",
  "skill creator skill": "A meta-skill that helps author new Agent Skills — scaffolding the SKILL.md structure and prompting for the details a good skill needs.",
  "skills.sh": "A validator script bundled with a skill that checks its SKILL.md structure (front matter, required sections) before it ships, catching malformed skills before an agent tries to load one.",
  "git worktrees": "A Git feature that checks out multiple branches into separate working directories from one repository — lets multiple agents (or agent + human) work on different branches in parallel without stashing or cloning again.",
  subagents: "A separate agent session spawned to handle one bounded sub-task (e.g. a focused code review) and report back, keeping the parent session's context clean.",
  "agent teams": "Multiple agents working the same problem from different roles or on different parts of it in parallel, with a coordination point to merge their results.",
  treehouse: "A named tool referenced in this competency's guidebook for coordinating multi-agent or multi-worktree workflows.",
  "/agents": "A slash command that opens or manages subagent configuration — defining the focused roles (search, review, checks) a main session can spawn.",
  "background agents": "Agent sessions that keep running a task after you've moved on, checked periodically or notified on completion, instead of holding your attention for the whole run.",
  mermaid: "A text-based diagramming syntax (flowcharts, sequence diagrams, etc.) that renders directly from Markdown — lets an agent produce a diagram as plain text a human and a renderer both understand.",
  c4: "The C4 model — a standard set of diagram levels (Context, Container, Component, Code) for describing a software system's architecture at increasing detail.",
  "excalidraw skill": "A packaged skill for producing hand-drawn-style architecture diagrams via Excalidraw, callable by an agent instead of requiring manual diagramming.",
  "gh cli": "GitHub's official command-line tool — lets an agent open PRs, read issues, and check CI status directly from the terminal instead of the web UI.",
  "ci artifacts": "Files (logs, screenshots, coverage reports, build output) saved from a CI run so a reviewer can inspect exactly what happened without re-running it.",
  "pr template": "A checklist embedded in a repository that pre-fills every new pull request, prompting the author (human or agent) for the evidence a reviewer expects.",
  "coverage report": "Generated output showing which lines or branches of code were actually exercised by the test suite — evidence for whether a change is genuinely tested.",
  "/review": "A slash command that triggers an agent-driven code review pass over a diff or PR.",
  mergemitra: "A named tool referenced in this competency's guidebook for merge and PR review workflows.",
  "superpowers skills": "A named skill collection referenced in this competency's guidebook.",
  "/compact": "A command that summarizes and shrinks an agent's conversation history to free up context window space without losing the important decisions made so far.",
  "/usage": "A command that reports how much of the context window or token budget has been consumed in the current session.",
  graphify: "A named tool referenced in this competency's guidebook for turning session or usage data into visual reports.",
  "hand-off skill": "A packaged skill for producing a structured session-handover document — what was done, what's left, and open questions — for a fresh agent or teammate to pick up cleanly.",
  "behavior spec": "A specification written in terms of observable system behavior (inputs and expected outputs) rather than implementation, so it stays valid even if the code underneath changes.",
  "characterization tests": "Tests written against existing, undocumented behavior to lock in what a legacy system currently does before refactoring it — a safety net when there's no spec to test against.",
  "feature flags": "A configuration switch that turns a feature on or off without a new deploy, letting a risky change roll out gradually or roll back instantly.",
  "strangler pattern": "A migration strategy that routes traffic to a new implementation incrementally, piece by piece, while the old system keeps running underneath, until it can be fully retired.",
  "session logs": "The recorded transcript of an agent session — every prompt, tool call, and result — used afterward to review what the agent actually did.",
  agenttrace: "A named tool referenced in this competency's guidebook for capturing and analyzing agent session traces.",

  // The recurring before/after evidence protocol: nearly every exercise
  // in this curriculum (29-35 of 35, per content/seed.json's evidence
  // checklists) asks for this same five-file pattern — run once without
  // the change, capture it as "before", run again with it, capture
  // "after", then write up what the comparison shows. Real, established
  // structure of this exercise set, not invented per-exercise.
  "evidence/before.md": "The write-up of the first, unmodified run — what you gave the agent, what it produced, and what was wrong with it. The baseline every later improvement is measured against.",
  "evidence/after.md": "The write-up of the second run, made after your change (a new AGENTS.md, a guardrail, a skill, a fix) — what the agent produced this time, under the same conditions as the \"before\" run.",
  "evidence/before.patch": "The actual code diff produced by the first, unmodified run — the raw evidence behind evidence/before.md's write-up, not just a description of it.",
  "evidence/after.patch": "The actual code diff produced by the second run, after your change — the raw evidence behind evidence/after.md's write-up.",
  "evidence/comparison.md": "The write-up connecting the before and after runs — which specific problems improved, which didn't, and why, tying the comparison back to what you actually changed.",
};

export function artifactGlossaryEntry(tag: string): string | undefined {
  return ARTIFACT_GLOSSARY[tag.toLowerCase().trim()];
}
