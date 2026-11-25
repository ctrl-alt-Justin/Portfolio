"use client";

import { CaseStudyEntry } from "@/components/WorkShowcase";
import type { ProjectBuild } from "@/data/disciplines";

interface DisciplineCardProps {
  build: ProjectBuild;
  onExpandMedia: (build: ProjectBuild, index: number) => void;
  onClickSound?: () => void;
  onHoverTick?: () => void;
}

export function DisciplineCard({
  build,
  onExpandMedia,
  onClickSound,
  onHoverTick,
}: DisciplineCardProps) {
  return (
    <CaseStudyEntry
      build={build}
      indexLabel={build.buildLabel}
      onExpandMedia={onExpandMedia}
      onClickSound={onClickSound}
      onHoverTick={onHoverTick}
      headingLevel="h2"
    />
  );
}
