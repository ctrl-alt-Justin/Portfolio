"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MediaSurface } from "@/components/MediaSurface";
import type { ProjectBuild } from "@/data/disciplines";
import { gsap } from "@/lib/gsap";

interface CinemaLightboxProps {
  build: ProjectBuild;
  initialIndex: number;
  disciplineIndex: string;
  onClose: () => void;
  onClickSound?: () => void;
  onHoverTick?: () => void;
}

export function CinemaLightbox({
  build,
  initialIndex,
  disciplineIndex,
  onClose,
  onClickSound,
  onHoverTick,
}: CinemaLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const totalMedia = build.media.length;
  const safeIndex = activeIndex < totalMedia ? activeIndex : 0;
  const currentSrc = build.media[safeIndex];
  const hasGallery = totalMedia > 1;

  const formattedCurrent = String(safeIndex + 1).padStart(2, "0");
  const formattedTotal = String(totalMedia).padStart(2, "0");

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.28, ease: "power2.out" }
      );
      gsap.fromTo(
        dialogRef.current,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.36, ease: "expo.out" }
      );
    });

    return () => ctx.revert();
  }, [build.id]);

  // ArrowLeft / ArrowRight navigation inside lightbox
  useEffect(() => {
    if (!hasGallery) return;

    const handleArrows = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onClickSound?.();
        setActiveIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onClickSound?.();
        setActiveIndex((prev) => (prev + 1) % totalMedia);
      }
    };

    window.addEventListener("keydown", handleArrows);
    return () => window.removeEventListener("keydown", handleArrows);
  }, [hasGallery, onClickSound, totalMedia]);

  const handleStep = (delta: number) => {
    onClickSound?.();
    setActiveIndex((prev) => (prev + delta + totalMedia) % totalMedia);
  };

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${build.title} cinema preview`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 md:p-12 backdrop-blur-xl"
    >
      <div
        ref={dialogRef}
        className="relative max-h-[92vh] w-full max-w-[1280px] overflow-y-auto rounded-sm border border-white/[0.12] bg-[#0E0E10]/95 shadow-[0_32px_90px_rgba(0,0,0,0.85)]"
      >
        {/* Top Modal Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4 md:px-7">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#71717A]">
            <span className="text-zinc-300">
              {disciplineIndex} / {build.buildLabel}
            </span>
            <span className="text-white/20">·</span>
            <span>
              FRAME {formattedCurrent} / {formattedTotal}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {build.liveUrl ? (
              <a
                href={build.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onClickSound?.()}
                onMouseEnter={onHoverTick}
                className="inline-flex items-center gap-2 border border-white/[0.16] bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] tracking-[0.04em] text-zinc-100 transition-colors duration-200 hover:border-white/40 hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              >
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/75 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span>Visit Live Site</span>
                <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span className="border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#71717A]">
                {build.privateBadge ?? "Private / NDA Build"}
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              onMouseEnter={onHoverTick}
              aria-label="Close cinema lightbox"
              className="inline-flex items-center gap-2 border border-white/[0.1] bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-zinc-300 transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.06] hover:text-white cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              <span>Esc</span>
              <X aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Cinema Split Body: Large Media Viewport + Filmstrip + Architecture Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="flex flex-col border-b border-white/[0.08] bg-black lg:border-r lg:border-b-0">
            <div className="relative aspect-video w-full">
              <MediaSurface
                src={currentSrc}
                alt={`${build.title} — full view ${safeIndex + 1}`}
                gradient={build.mediaGradient}
                label={`${build.buildLabel} // ${formattedCurrent} OF ${formattedTotal}`}
                showControlsWhenLoaded
              />

              {hasGallery && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStep(-1)}
                    onMouseEnter={onHoverTick}
                    aria-label="Previous image"
                    className="absolute top-1/2 left-4 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center border border-white/[0.16] bg-black/70 text-zinc-200 backdrop-blur-md transition-colors duration-200 hover:border-white/40 hover:bg-black/90 hover:text-white cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                  >
                    <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStep(1)}
                    onMouseEnter={onHoverTick}
                    aria-label="Next image"
                    className="absolute top-1/2 right-4 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center border border-white/[0.16] bg-black/70 text-zinc-200 backdrop-blur-md transition-colors duration-200 hover:border-white/40 hover:bg-black/90 hover:text-white cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                  >
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Thumbnail Filmstrip Switcher (multi-image projects) */}
            {hasGallery && (
              <div className="flex items-center gap-3 overflow-x-auto border-t border-white/[0.08] bg-[#0A0A0C] px-5 py-3.5 md:px-7">
                {build.media.map((src, idx) => {
                  const isActive = idx === safeIndex;
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => {
                        if (idx !== safeIndex) {
                          onClickSound?.();
                          setActiveIndex(idx);
                        }
                      }}
                      onMouseEnter={onHoverTick}
                      aria-label={`View frame ${idx + 1} of ${totalMedia}`}
                      aria-pressed={isActive}
                      className={`relative aspect-video w-24 shrink-0 overflow-hidden rounded-sm border transition-all duration-200 sm:w-28 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50 ${
                        isActive
                          ? "border-white/75 opacity-100"
                          : "border-white/[0.1] opacity-55 hover:border-white/35 hover:opacity-90"
                      }`}
                    >
                      <MediaSurface
                        src={src}
                        alt={`${build.title} thumbnail ${idx + 1}`}
                        gradient={build.mediaGradient}
                        compact
                      />
                      <span className="pointer-events-none absolute right-1.5 bottom-1 bg-black/75 px-1 font-mono text-[9px] text-zinc-300">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500 md:px-7">
              <span>{currentSrc}</span>
              <span>{hasGallery ? "← / → TO CYCLE" : "SINGLE FRAME"}</span>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 md:p-8">
            <div>
              <div className="flex flex-wrap gap-1.5">
                {build.roleTags.map((role) => (
                  <span
                    key={role}
                    className="border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#71717A]"
                  >
                    {role}
                  </span>
                ))}
              </div>

              <h2 className="mt-4 text-2xl font-medium tracking-[-0.03em] text-[#F4F4F6] leading-tight">
                {build.title}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {build.description}
              </p>

              <div className="mt-6 border-t border-white/[0.08] pt-5">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#71717A]">
                  Architecture Highlights
                </div>
                <ul className="space-y-3">
                  {build.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-[13px] leading-relaxed text-zinc-300"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[2px] shrink-0 font-mono text-[11px] text-[#71717A]"
                      >
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 border-t border-white/[0.08] pt-4">
              <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#71717A]">
                Stack
              </div>
              <div className="flex flex-wrap gap-2">
                {build.stack.map((tech) => (
                  <span
                    key={tech}
                    className="border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 font-mono text-[11px] text-zinc-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
