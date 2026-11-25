"use client";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { useState } from "react";
import { MediaSurface } from "@/components/MediaSurface";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const totalMedia = build.media.length;
  const safeIndex = activeIndex < totalMedia ? activeIndex : 0;
  const currentSrc = build.media[safeIndex];
  const hasGallery = totalMedia > 1;

  const formattedCurrent = String(safeIndex + 1).padStart(2, "0");
  const formattedTotal = String(totalMedia).padStart(2, "0");

  const handleStep = (delta: number) => {
    onClickSound?.();
    setActiveIndex((prev) => (prev + delta + totalMedia) % totalMedia);
  };

  return (
    <article
      data-build-card
      id={build.id}
      tabIndex={-1}
      className="portfolio-project"
    >
      <header className="mb-5 sm:mb-7">
        <p className="mb-2 font-mono text-xs leading-relaxed text-zinc-400">
          {build.category}
        </p>
        <h2 className="text-2xl font-medium leading-tight tracking-[-0.025em] sm:text-3xl xl:text-4xl">
          {build.title}
        </h2>
      </header>

      {currentSrc && (
        <div className="group/media relative mb-7 aspect-video w-full overflow-hidden">
          <button
            type="button"
            onClick={() => onExpandMedia(build, safeIndex)}
            onMouseEnter={onHoverTick}
            aria-label={`Expand ${build.title} media frame ${safeIndex + 1}`}
            className="block h-full w-full text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/40"
          >
            <div className="h-full w-full transition-transform duration-500 ease-out group-hover/media:scale-[1.03]">
              <MediaSurface
                src={currentSrc}
                alt={`${build.title} — preview ${safeIndex + 1}`}
                gradient={build.mediaGradient}
                label={`${build.buildLabel} // ${formattedCurrent} OF ${formattedTotal}`}
              />
            </div>
          </button>

          {/* Top-left monospace pagination pill */}
          <span className="pointer-events-none absolute top-3.5 left-3.5 border border-white/[0.12] bg-black/65 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-200 backdrop-blur-md">
            {formattedCurrent} / {formattedTotal}
          </span>

          {/* Quick-cycle arrows when build has multiple screenshots/videos */}
          {hasGallery && (
            <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleStep(-1)}
                onMouseEnter={onHoverTick}
                aria-label={`Previous media for ${build.title}`}
                className="inline-flex h-7 w-7 items-center justify-center border border-white/[0.14] bg-black/65 text-zinc-300 backdrop-blur-md transition-colors duration-200 hover:border-white/35 hover:bg-black/85 hover:text-white cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              >
                <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleStep(1)}
                onMouseEnter={onHoverTick}
                aria-label={`Next media for ${build.title}`}
                className="inline-flex h-7 w-7 items-center justify-center border border-white/[0.14] bg-black/65 text-zinc-300 backdrop-blur-md transition-colors duration-200 hover:border-white/35 hover:bg-black/85 hover:text-white cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              >
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Bottom-right Click to Expand badge */}
          <span className="pointer-events-none absolute right-3.5 bottom-3.5 inline-flex items-center gap-1.5 border border-white/[0.14] bg-black/65 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-200 backdrop-blur-md transition-colors duration-200 group-hover/media:border-white/35 group-hover/media:bg-black/80 group-hover/media:text-white">
            <Maximize2 aria-hidden="true" className="h-3 w-3" />
            <span>Click to Expand</span>
          </span>
        </div>
      )}

      <div className="portfolio-project-copy">
        <p className="max-w-[58ch] text-base leading-relaxed text-zinc-300">
          {build.description}
        </p>

        <ul className="ml-4 max-w-[60ch] list-disc space-y-2.5 text-sm leading-relaxed text-zinc-400 marker:text-zinc-500">
          {build.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <footer className="mt-6 flex flex-wrap items-start justify-between gap-4 font-mono text-xs leading-relaxed text-zinc-400">
        <div>
          <p>{build.roleTags.join(" / ")}</p>
          <p className="mt-1">{build.stack.join(" / ")}</p>
        </div>

        {build.liveUrl ? (
          <a
            href={build.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onClickSound?.()}
            onMouseEnter={onHoverTick}
            className="inline-flex items-center gap-2 text-zinc-200 underline decoration-zinc-600 underline-offset-4 hover:text-white focus-visible:outline-1 focus-visible:outline-offset-4"
          >
            <span>Open live project</span>
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
        ) : build.privateBadge && <p>{currentSrc ? build.privateBadge : "Private system"}</p>}
      </footer>
    </article>
  );
}
