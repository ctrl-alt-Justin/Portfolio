"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { MediaSurface } from "@/components/MediaSurface";
import {
  DISCIPLINES,
  type Discipline,
  type ProjectBuild,
} from "@/data/disciplines";

const FEATURED_ENTRIES: { discipline: Discipline; build: ProjectBuild }[] = [
  {
    discipline: DISCIPLINES[0],
    build: DISCIPLINES[0].builds[1], // Commercial E-Commerce & Unified CRM Platform
  },
  {
    discipline: DISCIPLINES[1],
    build: DISCIPLINES[1].builds[0], // Risse — AI LMS & Socratic RAG Tutor
  },
  {
    discipline: DISCIPLINES[2],
    build: DISCIPLINES[2].builds[1], // VEX U Competition Drivetrain & Custom CAD Assemblies
  },
];

export interface CaseStudyEntryProps {
  build: ProjectBuild;
  indexLabel: string;
  onExpandMedia: (build: ProjectBuild, index: number) => void;
  onClickSound?: () => void;
  onHoverTick?: () => void;
  inspectHref?: string;
  onInspect?: () => void;
  headingLevel?: "h2" | "h3";
}

export function CaseStudyEntry({
  build,
  indexLabel,
  onExpandMedia,
  onClickSound,
  onHoverTick,
  inspectHref,
  onInspect,
  headingLevel = "h2",
}: CaseStudyEntryProps) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const totalMedia = build.media.length;
  const safeIndex = mediaIndex < totalMedia ? mediaIndex : 0;
  const currentSrc = build.media[safeIndex];
  const hasGallery = totalMedia > 1;

  const formattedCurrent = String(safeIndex + 1).padStart(2, "0");
  const formattedTotal = String(totalMedia).padStart(2, "0");
  const Heading = headingLevel;

  const handleStep = (delta: number) => {
    onClickSound?.();
    setMediaIndex((prev) => (prev + delta + totalMedia) % totalMedia);
  };

  return (
    <article
      data-build-card
      id={build.id}
      tabIndex={-1}
      className="border-b border-white/10 py-14 last:border-b-0"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column (lg:col-span-5): Editorial Details */}
        <div className="lg:col-span-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em]">
            {build.liveUrl ? (
              <span className="inline-flex items-center gap-2 text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{indexLabel} / LIVE DEPLOYMENT</span>
              </span>
            ) : (
              <span className="text-zinc-500">
                {indexLabel} / {build.privateBadge ?? "PRIVATE SYSTEM"}
              </span>
            )}
          </div>

          <Heading className="mt-2.5 text-xl md:text-2xl font-medium tracking-tight text-zinc-100 leading-snug">
            {build.title}
          </Heading>

          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            {build.description}
          </p>

          <p className="mt-4 font-mono text-xs leading-relaxed text-zinc-500">
            {build.stack.join(" · ")}
          </p>

          {(build.liveUrl || inspectHref) && (
            <div className="mt-5 flex flex-wrap items-center gap-5 font-mono text-xs">
              {build.liveUrl && (
                <a
                  href={build.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onClickSound?.()}
                  onMouseEnter={onHoverTick}
                  className="inline-flex items-center gap-1.5 text-zinc-200 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
                >
                  <span>Visit Live Site</span>
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
              )}

              {inspectHref && (
                <a
                  href={inspectHref}
                  onClick={(event) => {
                    if (
                      onInspect &&
                      event.button === 0 &&
                      !event.metaKey &&
                      !event.ctrlKey &&
                      !event.shiftKey &&
                      !event.altKey
                    ) {
                      event.preventDefault();
                      onInspect();
                      return;
                    }
                    onClickSound?.();
                  }}
                  onMouseEnter={onHoverTick}
                  className="inline-flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-zinc-100"
                >
                  <span>Inspect Discipline</span>
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right Column (lg:col-span-7): Crisp 16:10 Media Stage + External Utility Bar */}
        <div className="lg:col-span-7">
          {currentSrc && (
            <>
              <div className="aspect-[16/10] w-full overflow-hidden rounded border border-white/10 bg-[#141417]">
                <button
                  type="button"
                  onClick={() => onExpandMedia(build, safeIndex)}
                  onMouseEnter={onHoverTick}
                  aria-label={`Expand ${build.title} frame ${formattedCurrent} in cinema view`}
                  className="block h-full w-full text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/40"
                >
                  <MediaSurface
                    src={currentSrc}
                    alt={`${build.title} — frame ${safeIndex + 1}`}
                    gradient={build.mediaGradient}
                    label={`${build.buildLabel} // ${formattedCurrent} OF ${formattedTotal}`}
                  />
                </button>
              </div>

              <div className="mt-2.5 flex items-center justify-between font-mono text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  {hasGallery ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStep(-1)}
                        onMouseEnter={onHoverTick}
                        aria-label={`Previous media for ${build.title}`}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-zinc-400 transition-colors hover:text-zinc-100 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                      >
                        <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
                      </button>
                      <span className="tracking-[0.08em] text-zinc-400">
                        {formattedCurrent} / {formattedTotal}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStep(1)}
                        onMouseEnter={onHoverTick}
                        aria-label={`Next media for ${build.title}`}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-zinc-400 transition-colors hover:text-zinc-100 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                      >
                        <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="tracking-[0.08em]">
                      {formattedCurrent} / {formattedTotal}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onExpandMedia(build, safeIndex)}
                  onMouseEnter={onHoverTick}
                  className="inline-flex items-center gap-1 text-zinc-400 transition-colors hover:text-zinc-100 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                >
                  <span>Expand</span>
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

interface DetailStreamProps {
  discipline: Discipline;
  dockedHeaderRef: React.RefObject<HTMLDivElement | null>;
  drawerRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onSelectDiscipline: (slug: string) => void;
  onExpandMedia: (build: ProjectBuild, index: number) => void;
  onClickSound?: () => void;
  onHoverTick?: () => void;
}

export function DetailStream({
  discipline,
  dockedHeaderRef,
  drawerRef,
  onBack,
  onSelectDiscipline,
  onExpandMedia,
  onClickSound,
  onHoverTick,
}: DetailStreamProps) {
  return (
    <section
      aria-labelledby="discipline-title"
      className="mx-auto w-full max-w-6xl px-6 md:px-12 pt-24 md:pt-28 pb-24"
    >
      {/* Top Discipline Bar: Back + Docked GSAP Flip Title (Left) & 01 · 02 · 03 · 04 Switcher (Right) */}
      <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            type="button"
            onClick={() => {
              onClickSound?.();
              onBack();
            }}
            onMouseEnter={onHoverTick}
            className="group mb-5 inline-flex items-center gap-2 font-mono text-xs tracking-[0.06em] text-zinc-400 transition-colors hover:text-white cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-white"
            />
            <span>All Disciplines</span>
          </button>

          <div
            ref={dockedHeaderRef}
            data-flip-id={`discipline-header-${discipline.slug}`}
            className="flex items-baseline gap-4"
          >
            <span className="shrink-0 font-mono text-xs md:text-sm tracking-[0.12em] text-zinc-500">
              {discipline.index} /
            </span>
            <h1
              id="discipline-title"
              className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-[-0.03em] text-[#F4F4F6] leading-tight"
            >
              {discipline.title}
            </h1>
          </div>
        </div>

        {/* Quick Discipline Switcher (01 · 02 · 03 · 04) */}
        <nav
          aria-label="Switch discipline"
          className="flex items-center gap-2.5 font-mono text-xs"
        >
          {DISCIPLINES.map((item, idx) => {
            const isCurrent = item.slug === discipline.slug;
            return (
              <div key={item.slug} className="flex items-center gap-2.5">
                {idx > 0 && (
                  <span aria-hidden="true" className="text-zinc-700">
                    ·
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!isCurrent) onSelectDiscipline(item.slug);
                  }}
                  onMouseEnter={onHoverTick}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`py-1 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${
                    isCurrent
                      ? "text-[#F4F4F6] underline decoration-white/40 underline-offset-4"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {item.index}
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Editorial Case-Study Stream (Clip-path Reveal Container) */}
      <div ref={drawerRef} className="pt-10 md:pt-12">
        <p className="mb-6 max-w-2xl text-sm md:text-base leading-relaxed text-zinc-400">
          {discipline.summary}
        </p>

        <div>
          {discipline.builds.map((build, idx) => (
            <CaseStudyEntry
              key={build.id}
              build={build}
              indexLabel={String(idx + 1).padStart(2, "0")}
              onExpandMedia={onExpandMedia}
              onClickSound={onClickSound}
              onHoverTick={onHoverTick}
              headingLevel="h2"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface WorkShowcaseProps {
  onBrowse: () => void;
  onInspectDiscipline?: (slug: string) => void;
  onSelect: () => void;
  onHoverTick?: () => void;
  onExpandMedia: (build: ProjectBuild, index: number) => void;
}

export function WorkShowcase({
  onBrowse,
  onInspectDiscipline,
  onSelect,
  onHoverTick,
  onExpandMedia,
}: WorkShowcaseProps) {
  return (
    <section
      id="work"
      tabIndex={-1}
      aria-labelledby="work-heading"
      className="scroll-mt-20 py-16"
    >
      <div className="mx-auto w-full max-w-6xl px-6 md:px-12">
        {/* Section Header Bar */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Selected Works
            </span>
            <h2
              id="work-heading"
              className="text-xl sm:text-2xl font-medium tracking-[-0.025em] text-zinc-100"
            >
              Featured Engineering Builds
            </h2>
          </div>

          <button
            type="button"
            onClick={onBrowse}
            onMouseEnter={onHoverTick}
            className="group inline-flex items-center gap-2 font-mono text-xs text-zinc-300 transition-colors hover:text-white cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
          >
            <span>All 4 Disciplines</span>
            <ArrowRight
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </button>
        </div>

        {/* Proportional 12-Column Case-Study Rows */}
        <div>
          {FEATURED_ENTRIES.map(({ discipline, build }, idx) => (
            <CaseStudyEntry
              key={build.id}
              build={build}
              indexLabel={String(idx + 1).padStart(2, "0")}
              onExpandMedia={onExpandMedia}
              onClickSound={onSelect}
              onHoverTick={onHoverTick}
              inspectHref={`?view=disciplines&discipline=${discipline.slug}`}
              onInspect={
                onInspectDiscipline
                  ? () => onInspectDiscipline(discipline.slug)
                  : undefined
              }
              headingLevel="h3"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
