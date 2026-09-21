import { AgentCoreDiagram } from "./AgentCoreDiagram";
import { SpecFramingDiagram } from "./SpecFramingDiagram";
import { ContextLayerDiagram } from "./ContextLayerDiagram";
import { TestPyramidDiagram } from "./TestPyramidDiagram";
import { SkillPackageDiagram } from "./SkillPackageDiagram";
import { ParallelLanesDiagram } from "./ParallelLanesDiagram";
import { AdrSequenceDiagram } from "./AdrSequenceDiagram";
import { EvidenceLadderDiagram } from "./EvidenceLadderDiagram";

// Each competency's booklet diagram is structurally bespoke (radial setup
// diagram, two-column comparison, ...), so this dispatches to a hardcoded
// component per competency rather than trying to force one data-driven
// layout (docs/features/0008-booklet-learn-refresh.md). Competencies
// without a diagram yet render nothing — CompetencyTabs already gates this
// section on inPracticeBullets.length > 0, so "nothing" only happens for a
// not-yet-rolled-out competency that also has no In Practice bullets.
export function CompetencyDiagram({ competencyNumber }: { competencyNumber: number }) {
  switch (competencyNumber) {
    case 1:
      return <AgentCoreDiagram competencyNumber={competencyNumber} />;
    case 2:
      return <SpecFramingDiagram />;
    case 3:
      return <ContextLayerDiagram />;
    case 4:
      return <TestPyramidDiagram />;
    case 5:
      return <SkillPackageDiagram />;
    case 6:
      return <ParallelLanesDiagram />;
    case 7:
      return <AdrSequenceDiagram />;
    case 8:
      return <EvidenceLadderDiagram />;
    default:
      return null;
  }
}
