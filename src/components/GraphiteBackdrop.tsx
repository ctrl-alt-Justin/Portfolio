"use client";

import { useImperativeHandle, useLayoutEffect, useRef, type Ref } from "react";

export interface GraphiteBackdropHandle {
  drawIntro: (elapsed: number, merge: number) => void;
  settle: (animate: boolean) => void;
}

interface Placement {
  x: number;
  y: number;
  width: number;
  depth: number;
  angle: number;
}

const LINES_PER_GROUP = 9;
const CURVE_STEPS = 56;

function mix(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function paintGraphite(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  merge: number,
  introTime: number,
  settledTime: number,
) {
  context.clearRect(0, 0, width, height);
  const compact = width <= 640;
  const settled: Placement = compact
    ? { x: width * 0.93, y: height * 0.34, width: Math.min(width * 1.34, height * 0.58), depth: width * 0.27, angle: -1.04 }
    : { x: width * 0.81, y: height * 0.52, width: Math.min(width * 0.61, height * 1.13), depth: Math.min(width * 0.18, height * 0.29), angle: -0.57 };
  const travel = introTime * Math.min(width, height);
  const opening: Placement[] = [
    {
      x: width * (compact ? 0.10 : 0.12) + travel * 0.040,
      y: height * (compact ? 0.23 : 0.26) - travel * 0.019,
      width: width * (compact ? 0.85 : 0.38),
      depth: Math.min(width * 0.19, height * 0.13),
      angle: -0.30,
    },
    {
      x: width * 0.92 - travel * 0.063,
      y: height * (compact ? 0.77 : 0.73) + travel * 0.024,
      width: width * (compact ? 0.85 : 0.41),
      depth: Math.min(width * 0.22, height * 0.15),
      angle: -0.38,
    },
  ];

  opening.forEach((origin, group) => {
    const x = mix(origin.x, settled.x, merge);
    const y = mix(origin.y, settled.y, merge) + Math.sin(Math.PI * merge) * height * (group === 0 ? -0.075 : 0.065);
    const span = mix(origin.width, settled.width, merge);
    const depth = mix(origin.depth, settled.depth, merge);
    const angle = mix(origin.angle, settled.angle, merge);
    const openingPhase = introTime * (group === 0 ? 1.15 : -1.67) + group * 1.8;
    const settledPhase = Math.sin(settledTime * 0.42) * 0.19;
    const segmentTime = mix(introTime * (group === 0 ? 1.9 : -2.7), settledTime * 0.62, merge);

    context.save();
    context.translate(x, y);
    context.rotate(angle);

    const ink = context.createLinearGradient(-span / 2, 0, span / 2, 0);
    ink.addColorStop(0, "rgb(168 168 168 / 0%)");
    ink.addColorStop(0.17, "rgb(168 168 168 / 14%)");
    ink.addColorStop(0.45, "rgb(168 168 168 / 32%)");
    ink.addColorStop(0.73, "rgb(168 168 168 / 24%)");
    ink.addColorStop(1, "rgb(168 168 168 / 0%)");
    context.lineCap = "round";

    for (let index = 0; index < LINES_PER_GROUP; index++) {
      const looseLane = index / (LINES_PER_GROUP - 1) - 0.5;
      const joinedLane = (index * 2 + group) / (LINES_PER_GROUP * 2 - 1) - 0.5;

      function trace(from: number, to: number, steps: number) {
        context.beginPath();
        for (let step = 0; step <= steps; step++) {
          const t = mix(from, to, step / steps);
          const looseCurve = Math.sin(t * 5.2 + openingPhase + looseLane * 0.78) * 0.27
            + Math.cos(t * 8 - openingPhase * 0.63) * 0.08
            + looseLane * (0.50 + Math.sin(t * 4.4 + openingPhase) * 0.14);
          const joinedCurve = Math.sin(t * 5.8 - 0.9 + settledPhase) * 0.30
            + Math.sin(t * 10.5 - 0.6 - settledPhase) * 0.12
            + joinedLane * (0.69 + Math.cos(t * 6.1 + settledPhase) * 0.28)
            + joinedLane * joinedLane * Math.sin(t * 6.6) * 0.22;
          const horizontal = (t - 0.5) * span;
          const vertical = mix(looseCurve, joinedCurve, merge) * depth;

          if (step === 0) context.moveTo(horizontal, vertical);
          else context.lineTo(horizontal, vertical);
        }
        context.stroke();
      }

      context.strokeStyle = ink;
      context.globalAlpha = (compact ? 0.67 : 0.87) * (0.62 + 0.38 * Math.sin((index + 1) * 2.38) ** 2);
      context.lineWidth = index % 4 === 0 ? 1 : 0.66;
      const start = 0.017 * (index % 4);
      const end = 1 - 0.022 * ((index + group) % 5);
      trace(start, end, CURVE_STEPS);

      // Short strokes come in and out along each underlying curve.
      const pulse = Math.max(0, Math.sin(segmentTime + index * 1.26 + group * 0.82));
      if (pulse > 0.06) {
        const offset = 0.49 + Math.sin(segmentTime * 0.73 + index * 2.31) * 0.31;
        context.strokeStyle = "rgb(188 188 188 / 42%)";
        context.globalAlpha = pulse * (compact ? 0.46 : 0.68);
        context.lineWidth = 1.16;
        trace(offset, offset + 0.032 + (index % 3) * 0.014, 8);
      }
    }

    context.restore();
  });
}

export function GraphiteBackdrop({ ref }: { ref: Ref<GraphiteBackdropHandle> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<GraphiteBackdropHandle | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let merge = 1;
    let introTime = 0;
    let settledTime = 0;
    let frameId = 0;
    let lastFrame = 0;

    const draw = () => paintGraphite(context, width, height, merge, introTime, settledTime);

    const animate = (now: number) => {
      if (!lastFrame) lastFrame = now;
      const elapsed = now - lastFrame;
      if (elapsed >= 32) {
        settledTime += Math.min(elapsed, 64) / 1000;
        lastFrame = now;
        draw();
      }
      frameId = requestAnimationFrame(animate);
    };

    const stop = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      lastFrame = 0;
    };

    controllerRef.current = {
      drawIntro(elapsed, amount) {
        stop();
        if (merge === 1 && amount === 1 && settledTime === 0) return;
        introTime = elapsed;
        merge = amount;
        settledTime = 0;
        draw();
      },
      settle(animateDrawing) {
        stop();
        merge = 1;
        introTime = 0;
        settledTime = 0;
        draw();
        if (animateDrawing) frameId = requestAnimationFrame(animate);
      },
    };

    function resize() {
      if (!canvas || !context) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      width = rect.width;
      height = rect.height;
      const scale = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      draw();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    return () => {
      stop();
      observer.disconnect();
      controllerRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    drawIntro: (elapsed, merge) => controllerRef.current?.drawIntro(elapsed, merge),
    settle: (animate) => controllerRef.current?.settle(animate),
  }), []);

  return (
    <div className="portfolio-hero-background" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
