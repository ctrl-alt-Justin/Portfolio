"use client";

import { useState } from "react";
import { isVideoMedia } from "@/data/disciplines";

interface MediaSurfaceProps {
  src: string;
  alt: string;
  gradient: string;
  label?: string;
  compact?: boolean;
  showControlsWhenLoaded?: boolean;
  className?: string;
}

export function MediaSurface({
  src,
  alt,
  gradient,
  label,
  compact = false,
  showControlsWhenLoaded = false,
  className = "",
}: MediaSurfaceProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const isLoaded = loadedSrc === src;
  const hasFailed = failedSrc === src;
  const isVideo = isVideoMedia(src);

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#141417] ${className}`}
      style={{ backgroundImage: gradient }}
    >
      {/* Subtle architectural blueprint grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: compact ? "22px 22px" : "36px 36px",
        }}
      />

      {/* Corner registration crosshairs */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-3 left-3 h-2.5 w-2.5 border-t border-l border-white/20"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 right-3 h-2.5 w-2.5 border-r border-b border-white/20"
      />

      {/* Clean missing-asset fallback slate */}
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 text-center"
        >
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-300/90">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400/80" />
            {hasFailed ? "Preview unavailable" : label ?? "Loading preview"}
          </span>
        </div>
      )}

      {/* Real video or image asset (seamlessly fades in once placed in public/media/) */}
      {!hasFailed && isVideo && (
        <video
          key={src}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          controls={showControlsWhenLoaded && isLoaded}
          preload="metadata"
          onCanPlay={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
          className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {!hasFailed && !isVideo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={alt}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
          className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Subtle cinema vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15"
      />
    </div>
  );
}
