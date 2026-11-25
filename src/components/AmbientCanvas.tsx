export function AmbientCanvas() {
  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(65% 42% at 50% 0%, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 z-50 pointer-events-none opacity-[0.03]"
      >
        <svg className="h-full w-full" aria-hidden="true">
          <filter id="carbon-film-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#carbon-film-grain)"
          />
        </svg>
      </div>
    </>
  );
}
