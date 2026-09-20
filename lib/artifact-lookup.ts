import { matchToolkitTagDocs, type ToolkitDoc } from "./toolkit-doc-links";
import { artifactTemplateEntry, type ArtifactTemplateEntry } from "./artifact-templates";
import { artifactGlossaryEntry } from "./artifact-glossary";

export type ArtifactResolution = {
  matches: ToolkitDoc[];
  template: ArtifactTemplateEntry | undefined;
  glossary: string | undefined;
  clickable: boolean;
};

// The same three-tier lookup ToolkitHub uses for a competency's toolkit
// tags (real file > reference template > glossary), generalized so any
// artifact name can be resolved the same honest way — including ones
// with a path prefix (e.g. "specs/spec.md", "evidence/before.md"), which
// toolkit tags never have but exercise output artifacts often do. Real
// file matching and the template/glossary lookups all try the full name
// first, then fall back to its basename, so "specs/spec.md" still finds
// the same "spec.md" template a bare tag would.
export function resolveArtifactTag(tag: string, docs: ToolkitDoc[]): ArtifactResolution {
  const basename = tag.split("/").pop() || tag;

  const matches = matchToolkitTagDocs(tag, docs).length
    ? matchToolkitTagDocs(tag, docs)
    : matchToolkitTagDocs(basename, docs);
  const hasMatch = matches.length > 0;

  const template = hasMatch
    ? undefined
    : artifactTemplateEntry(tag) ?? artifactTemplateEntry(basename);

  const glossary =
    hasMatch || template
      ? undefined
      : artifactGlossaryEntry(tag) ?? artifactGlossaryEntry(basename);

  return { matches, template, glossary, clickable: hasMatch || !!template || !!glossary };
}
