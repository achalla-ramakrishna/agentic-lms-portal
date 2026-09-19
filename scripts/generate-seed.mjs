#!/usr/bin/env node
// Generates content/seed.json from two external, non-vendored sources:
//
//   --exercise-set <path>   a local checkout of the
//                           agentic-engineering-full-exercises-set repo
//                           (root README.md index table, each exercise's
//                           own README.md, and each exercise's real
//                           docs/*.md guidance files — evidence-template.md,
//                           *-contract.md, AGENTS.md, etc.)
//   --guidebook-html <path> a folder of the guidebook's Competency-XX.html
//                           pages (The Shift / mastery / common mistake /
//                           toolkit tags). Optional: if omitted, the
//                           existing content/seed.json's `competencies`
//                           are carried over unchanged — useful when only
//                           the exercise-set source has changed.
//
// Neither source is committed to this repo (see docs/SPEC.md §3) — this
// script is the seam a human re-runs when either source changes. Its
// output, content/seed.json, is what prisma/seed.ts actually reads.
//
// Idempotent by construction: re-running with updated sources just
// regenerates the same file; prisma/seed.ts upserts by slug/number.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, posix } from "node:path";
import { fileURLToPath } from "node:url";
import {
  section,
  bulletLines,
  numberedLines,
  decodePathSegment,
  deriveDocTitle,
} from "./lib/parse-readme.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "content", "seed.json");

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : process.argv[i + 1];
}

const exerciseSetPath = argValue("--exercise-set");
const guidebookHtmlPath = argValue("--guidebook-html");

if (!exerciseSetPath) {
  console.error(
    "Usage: node scripts/generate-seed.mjs --exercise-set <path> [--guidebook-html <path>]",
  );
  process.exit(1);
}

// ---------- 0. read each exercise's real docs/*.md guidance files ----------
//
// Every exercise ships real, already-written guidance for its own
// deliverables — most consistently a docs/evidence-template.md (the exact
// before/after/comparison structure its verifier expects), plus files like
// guardrail-contract.md, specification-contract.md, finding-contract.md, or
// a real AGENTS.md/SKILL.md example. We surface these verbatim rather than
// authoring our own generic templates. Reads any .md file directly under
// docs/ and one level of subfolders (e.g. docs/context-sources/AGENTS.md),
// skipping README.md — so new doc files an exercise author adds later are
// picked up automatically without a code change here.
function readGuidanceDocs(exerciseDir) {
  const docsDir = join(exerciseDir, "docs");
  let entries;
  try {
    entries = readdirSync(docsDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const mdFiles = []; // { relPath }
  for (const entry of entries) {
    if (entry.isFile() && /\.md$/i.test(entry.name)) {
      if (entry.name.toLowerCase() === "readme.md") continue;
      mdFiles.push(entry.name);
    } else if (entry.isDirectory()) {
      const subDir = join(docsDir, entry.name);
      for (const subEntry of readdirSync(subDir)) {
        if (!/\.md$/i.test(subEntry)) continue;
        if (subEntry.toLowerCase() === "readme.md") continue;
        mdFiles.push(posix.join(entry.name, subEntry));
      }
    }
  }

  return mdFiles
    .map((relPath) => {
      const content = readFileSync(join(docsDir, relPath), "utf8").trim();
      return { filename: relPath, title: deriveDocTitle(relPath, content), content };
    })
    .sort((a, b) => {
      // evidence-template.md first (the one every exercise has, most
      // directly tied to the required evidence artifacts), then A-Z.
      const aFirst = a.filename.toLowerCase() === "evidence-template.md";
      const bFirst = b.filename.toLowerCase() === "evidence-template.md";
      if (aFirst !== bFirst) return aFirst ? -1 : 1;
      return a.filename.localeCompare(b.filename);
    });
}

// ---------- 1. parse root README.md index table ----------

const rootReadme = readFileSync(join(exerciseSetPath, "README.md"), "utf8");
const tableRowRe =
  /^\|\s*(\d+)\.\s*[^|]+?\s*\|\s*(\d+)\s*\|\s*\[[^\]]+\]\(([^)]+)\)\s*\|\s*(.+?)\s*\|$/gm;

const exerciseIndex = []; // { competencyNumber, exerciseNumber, readmeRelPath, projects: [{displayName, repoPath, isPrimary}] }

for (const match of rootReadme.matchAll(tableRowRe)) {
  const [, competencyNumber, exerciseNumber, readmeLink, projectCell] = match;
  const readmeRelPath = decodePathSegment(readmeLink);
  const projectLinkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  const projects = [...projectCell.matchAll(projectLinkRe)].map(
    ([, displayName, path], i) => ({
      displayName,
      repoPath: decodePathSegment(path),
      isPrimary: i === 0,
    }),
  );
  exerciseIndex.push({
    competencyNumber: Number(competencyNumber),
    exerciseNumber: Number(exerciseNumber),
    readmeRelPath,
    projects,
  });
}

if (exerciseIndex.length !== 35) {
  console.error(
    `Expected 35 exercises from the index table, found ${exerciseIndex.length}. Aborting — check the root README's table format.`,
  );
  process.exit(1);
}

// ---------- 2. parse each exercise README.md ----------

const exercises = exerciseIndex.map(
  ({ competencyNumber, exerciseNumber, readmeRelPath, projects }) => {
    const readmePath = join(exerciseSetPath, readmeRelPath);
    const md = readFileSync(readmePath, "utf8");

    const titleMatch = md.match(/^#\s*Exercise\s*\d+\s*:\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : "";

    const durationMatch = md.match(
      /The duration for this challenge is ([^\n]+?)\.(?:\s|$)/,
    );
    const durationLabel = durationMatch ? durationMatch[1].trim() : "";

    let missionMarkdown = section(md, "Your Mission");
    // Duration is stored separately (durationLabel) — drop the sentence
    // from the mission body so the UI isn't showing it twice.
    if (durationMatch) {
      missionMarkdown = missionMarkdown.replace(durationMatch[0], "").trim();
    }

    const howToSteps = numberedLines(section(md, "How To Go About It"));
    const evidenceChecklist = bulletLines(section(md, "Evidence")).map(
      (label) => ({ label }),
    );
    const completionCriteria = bulletLines(
      section(md, "Completion Criteria", /^(?![\s\S])/), // no next heading — runs to EOF
    );

    // slug = the exercise folder name (matches the repo, per docs/SPEC.md §6)
    const slug = posix.basename(dirname(readmeRelPath.replaceAll("\\", "/")));
    const guidanceDocs = readGuidanceDocs(dirname(readmePath));

    return {
      competencyNumber,
      number: exerciseNumber,
      slug,
      title,
      missionMarkdown,
      durationLabel,
      howToSteps,
      evidenceChecklist,
      completionCriteria,
      projects,
      guidanceDocs,
    };
  },
);

// ---------- 3. parse guidebook Competency-XX.html pages ----------
// (skipped when --guidebook-html isn't given — see usage note above)

let competencies;
if (!guidebookHtmlPath) {
  const existing = JSON.parse(readFileSync(outPath, "utf8"));
  competencies = existing.competencies;
  console.log(
    "No --guidebook-html given: carrying over the existing content/seed.json's competencies unchanged.",
  );
} else {
  competencies = parseGuidebookHtml(guidebookHtmlPath);
}

function parseGuidebookHtml(guidebookHtmlPath) {
  const TAG_STYLE =
    'background: #F6F4EE; border: 1px solid #E4E0D3; color: #5B584C;">';

  function extractAfter(html, anchor, styleAnchor) {
    const anchorIdx = html.indexOf(anchor);
    if (anchorIdx === -1) return "";
    const rest = html.slice(anchorIdx);
    const styleIdx = rest.indexOf(styleAnchor);
    if (styleIdx === -1) return "";
    const afterStyle = rest.slice(styleIdx + styleAnchor.length);
    const closeIdx = afterStyle.indexOf("<");
    return decodeHtmlEntities(afterStyle.slice(0, closeIdx).trim());
  }

  function decodeHtmlEntities(s) {
    return s
      .replaceAll("&amp;", "&")
      .replaceAll("&#10003;", "")
      .replaceAll("&#9888;", "")
      .replaceAll("&larr;", "←")
      .replaceAll("&rarr;", "→")
      .replaceAll("&mdash;", "—")
      .trim();
  }

  const competencies = [];
  for (let n = 1; n <= 12; n++) {
    const num = String(n).padStart(2, "0");
    const htmlPath = join(guidebookHtmlPath, `Competency-${num}.html`);
    const html = readFileSync(htmlPath, "utf8");

    // the anchor IS the style string itself here; re-extract directly
    const titleMatch = html.match(
      /font-size: 30px; font-weight: 600; margin-top: 10px;">(\d{2}) · ([^<]+)</,
    );
    const title = titleMatch
      ? decodeHtmlEntities(titleMatch[2])
      : `Competency ${num}`;

    const subtitleMatch = html.match(
      /font-size: 15px; color: #8A8672; margin-top: 4px;">([^<]*)</,
    );
    const subtitle = subtitleMatch ? decodeHtmlEntities(subtitleMatch[1]) : "";

    const shiftMarkdown = extractAfter(
      html,
      ">The Shift<",
      'max-width: 900px;">',
    );

    const masterySlice = html.slice(html.indexOf("What mastery looks like"));
    const masteryMatch = masterySlice.match(
      /font-size: 14px; line-height: 1\.6; color: #3A3730;">([^<]*)</,
    );
    const masteryText = masteryMatch
      ? decodeHtmlEntities(masteryMatch[1])
      : "";
    const masteryBullets = masteryText
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    const mistakeSlice = html.slice(html.indexOf("Common mistake to avoid"));
    const mistakeMatch = mistakeSlice.match(
      /font-size: 14px; line-height: 1\.6; color: #3A3730;">([^<]*)</,
    );
    const commonMistakeMarkdown = mistakeMatch
      ? decodeHtmlEntities(mistakeMatch[1])
      : "";

    const tagsSectionStart = html.indexOf("padding-top: 20px;", html.indexOf("Common mistake to avoid"));
    const tagsSectionEnd = html.indexOf("Exercises in this competency");
    const tagsSlice = html.slice(tagsSectionStart, tagsSectionEnd);
    const toolkitTags = [...tagsSlice.matchAll(new RegExp(TAG_STYLE + "([^<]+)<", "g"))].map(
      (m) => decodeHtmlEntities(m[1]),
    );

    competencies.push({
      number: n,
      title,
      subtitle,
      shiftMarkdown,
      masteryBullets,
      commonMistakeMarkdown,
      toolkitTags,
    });
  }

  return competencies;
}

// ---------- 4. write output ----------

const seed = { competencies, exercises };
writeFileSync(outPath, JSON.stringify(seed, null, 2) + "\n");

console.log(
  `Wrote ${outPath}: ${competencies.length} competencies, ${exercises.length} exercises.`,
);
