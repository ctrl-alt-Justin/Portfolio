"use client";

import Lenis from "lenis";
import {
  ArrowLeft,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { AboutSequence } from "@/components/AboutSequence";
import { CinemaLightbox } from "@/components/CinemaLightbox";
import { DisciplineCard } from "@/components/DisciplineCard";
import { GraphiteBackdrop, type GraphiteBackdropHandle } from "@/components/GraphiteBackdrop";
import { WorkShowcase } from "@/components/WorkShowcase";
import {
  DISCIPLINES,
  getDisciplineBySlug,
  type ProjectBuild,
} from "@/data/disciplines";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Flip, gsap } from "@/lib/gsap";

const INTRO_SESSION_KEY = "jal_portfolio_intro_seen";
const AUTHOR_NAME = "Justin A. Labrador";

function getProfileAnchor() {
  const target = document.getElementById(window.location.hash.slice(1));
  return target?.matches("#about, #work, .portfolio-chapter") ? target : null;
}

const UNDOCKED_WRAPPER_CLASS =
  "fixed inset-0 z-40 pointer-events-none flex items-center justify-center px-6";
const DOCKED_WRAPPER_CLASS =
  "portfolio-brand-docked absolute inset-x-0 top-0 z-40 pointer-events-none flex w-full items-center justify-end";

const UNDOCKED_BRAND_CLASS =
  "text-[clamp(2.25rem,5vw,4.75rem)] font-medium tracking-[-0.04em] text-[#F4F4F6] whitespace-nowrap leading-none";
const DOCKED_BRAND_CLASS =
  "text-sm sm:text-base md:text-lg font-medium tracking-[-0.02em] text-[#F4F4F6] whitespace-nowrap leading-none transition-colors duration-200 hover:text-white focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/60";

type ViewState = "profile" | "disciplines" | "detail";

type PendingScene =
  | "replay-profile"
  | "enter-profile"
  | "direct-profile"
  | "enter-disciplines"
  | "direct-disciplines"
  | "open-detail"
  | "direct-detail"
  | null;

export function PortfolioShell({ availableMedia }: { availableMedia: string[] }) {
  const [view, setView] = useState<ViewState>("profile");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [introSettled, setIntroSettled] = useState(false);
  const [lightboxState, setLightboxState] = useState<{
    build: ProjectBuild;
    index: number;
  } | null>(null);

  const { soundEnabled, toggleSound, playKeystroke, playHoverTick, playClick } =
    useSoundEffects();

  const rootRef = useRef<HTMLDivElement>(null);
  const brandWrapperRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLButtonElement>(null);
  const brandTextRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const graphiteRef = useRef<GraphiteBackdropHandle>(null);

  // Stage 1: Profile & Introduction refs
  const profileStageRef = useRef<HTMLDivElement>(null);
  const profileDividerRef = useRef<HTMLDivElement>(null);

  // Stage 2: Full-width 4-Discipline Index refs
  const disciplinesStageRef = useRef<HTMLElement>(null);
  const backToProfileRef = useRef<HTMLButtonElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const eyebrowBorderRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLElement>(null);

  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rowMaskRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rowHeaderRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rowMetaRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rowBorderRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  // Stage 3: Option 1 Detail refs
  const dockedHeaderRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerLeftRef = useRef<HTMLDivElement>(null);
  const drawerRightRef = useRef<HTMLDivElement>(null);

  const lenisRef = useRef<Lenis | null>(null);
  const reducedMotionRef = useRef(false);
  const isIntroRunningRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const viewRef = useRef<ViewState>("profile");
  const activeSlugRef = useRef<string | null>(null);
  const introSettledRef = useRef(false);
  const lightboxStateRef = useRef<{
    build: ProjectBuild;
    index: number;
  } | null>(null);

  const masterTlRef = useRef<gsap.core.Timeline | null>(null);
  const cursorBlinkRef = useRef<gsap.core.Tween | null>(null);
  const activeFlipRef = useRef<gsap.core.Timeline | null>(null);
  const transitionTlRef = useRef<gsap.core.Timeline | null>(null);

  const pendingFlipStateRef = useRef<Flip.FlipState | null>(null);
  const pendingSceneRef = useRef<PendingScene>(null);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    activeSlugRef.current = activeSlug;
  }, [activeSlug]);

  useEffect(() => {
    introSettledRef.current = introSettled;
  }, [introSettled]);

  useEffect(() => {
    lightboxStateRef.current = lightboxState;
  }, [lightboxState]);

  const activeDiscipline = getDisciplineBySlug(activeSlug);

  const getProfileBlocks = useCallback((): HTMLElement[] => {
    if (!profileStageRef.current) return [];
    return Array.from(
      profileStageRef.current.querySelectorAll<HTMLElement>(
        "[data-profile-block]"
      )
    );
  }, []);

  const getProfileMasks = useCallback((): HTMLElement[] => {
    if (!profileStageRef.current) return [];
    return Array.from(
      profileStageRef.current.querySelectorAll<HTMLElement>(
        "[data-profile-mask]"
      )
    );
  }, []);

  const openLightbox = useCallback(
    (build: ProjectBuild, index = 0) => {
      playClick();
      lenisRef.current?.stop();
      setLightboxState({ build, index });
    },
    [playClick]
  );

  const closeLightbox = useCallback(() => {
    if (!lightboxStateRef.current) return;
    playClick();
    setLightboxState(null);
    lenisRef.current?.start();
  }, [playClick]);

  const applyDockedBrandInstant = useCallback(() => {
    if (brandWrapperRef.current) {
      brandWrapperRef.current.className = DOCKED_WRAPPER_CLASS;
    }
    if (brandRef.current) {
      brandRef.current.className = `${DOCKED_BRAND_CLASS} pointer-events-auto cursor-pointer`;
      gsap.set(brandRef.current, { clearProps: "transform", opacity: 1 });
    }
    if (brandTextRef.current) {
      brandTextRef.current.textContent = AUTHOR_NAME;
    }
    if (cursorRef.current) {
      gsap.set(cursorRef.current, { opacity: 0, width: 0, marginLeft: 0 });
    }
  }, []);

  const revealProfileImmediate = useCallback(() => {
    applyDockedBrandInstant();
    graphiteRef.current?.settle(false);
    if (profileStageRef.current) {
      gsap.set(profileStageRef.current, { opacity: 1, visibility: "visible" });
    }
    const blocks = getProfileBlocks();
    const masks = getProfileMasks();
    if (blocks.length) gsap.set(blocks, { opacity: 1, y: 0 });
    if (masks.length) gsap.set(masks, { yPercent: 0 });
    if (profileDividerRef.current) {
      gsap.set(profileDividerRef.current, { scaleX: 1, opacity: 1, y: 0 });
    }
    gsap.set(bottomBarRef.current, {
      opacity: 1,
      y: 0,
    });
    lenisRef.current?.start();
    getProfileAnchor()?.scrollIntoView({ behavior: "instant" });
    isIntroRunningRef.current = false;
    isTransitioningRef.current = false;
    setIntroSettled(true);
  }, [applyDockedBrandInstant, getProfileBlocks, getProfileMasks]);

  const finishIntroImmediate = useCallback(() => {
    if (!isIntroRunningRef.current) return;
    cursorBlinkRef.current?.kill();
    cursorBlinkRef.current = null;
    if (cursorRef.current) {
      gsap.killTweensOf(cursorRef.current);
    }
    masterTlRef.current?.kill();
    masterTlRef.current = null;
    activeFlipRef.current?.progress(1);
    activeFlipRef.current?.kill();
    activeFlipRef.current = null;

    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    } catch {
      // Ignore storage access failures in private/restricted environments
    }
    revealProfileImmediate();
  }, [revealProfileImmediate]);

  const startIntroChoreography = useCallback(() => {
    cursorBlinkRef.current?.kill();
    if (cursorRef.current) {
      gsap.killTweensOf(cursorRef.current);
    }
    masterTlRef.current?.kill();
    activeFlipRef.current?.kill();
    transitionTlRef.current?.kill();
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });

    if (reducedMotionRef.current) {
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      } catch {
        // Ignore storage access failures
      }
      revealProfileImmediate();
      return;
    }

    isIntroRunningRef.current = true;
    isTransitioningRef.current = false;
    setIntroSettled(false);
    lenisRef.current?.stop();

    const graphite = graphiteRef.current;
    const drawing = { merge: 0 };
    graphite?.drawIntro(0, 0);

    if (brandWrapperRef.current) {
      brandWrapperRef.current.className = UNDOCKED_WRAPPER_CLASS;
    }
    if (brandRef.current) {
      brandRef.current.className = `${UNDOCKED_BRAND_CLASS} pointer-events-none`;
      gsap.set(brandRef.current, { clearProps: "transform", opacity: 1 });
    }
    if (brandTextRef.current) {
      brandTextRef.current.textContent = "";
    }
    if (cursorRef.current) {
      gsap.set(cursorRef.current, {
        opacity: 1,
        width: "auto",
        marginLeft: "0.06em",
      });
    }

    // Keep Profile stage completely hidden during Acts 1 and 2
    if (profileStageRef.current) {
      gsap.set(profileStageRef.current, { opacity: 0, visibility: "hidden" });
    }
    const blocks = getProfileBlocks();
    const masks = getProfileMasks();
    if (blocks.length) gsap.set(blocks, { opacity: 1, y: 0 });
    if (masks.length) gsap.set(masks, { yPercent: 100 });
    if (profileDividerRef.current) {
      gsap.set(profileDividerRef.current, { scaleX: 0, opacity: 1, y: 0 });
    }
    gsap.set(bottomBarRef.current, {
      opacity: 0,
      y: 0,
    });

    cursorBlinkRef.current = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: 0.45,
      repeat: -1,
      yoyo: true,
      ease: "steps(1)",
    });

    const masterTl = gsap.timeline({
      onUpdate: () => {
        graphite?.drawIntro(masterTl.time(), drawing.merge);
      },
      onComplete: () => {
        cursorBlinkRef.current?.kill();
        cursorBlinkRef.current = null;
        isIntroRunningRef.current = false;
        setIntroSettled(true);
        if (brandRef.current) {
          brandRef.current.className = `${DOCKED_BRAND_CLASS} pointer-events-auto cursor-pointer`;
        }
        graphite?.settle(true);
        try {
          sessionStorage.setItem(INTRO_SESSION_KEY, "1");
        } catch {
          // Ignore storage access failures
        }
      },
    });
    masterTlRef.current = masterTl;

    // Act 1: Typewriter + Web Audio keystrokes + 0.4s dramatic hold
    let lastTypedLen = 0;
    masterTl.to(brandTextRef.current, {
      duration: 1.35,
      text: { value: AUTHOR_NAME, delimiter: "" },
      ease: "none",
      onUpdate: () => {
        const currentText = brandTextRef.current?.textContent ?? "";
        const len = currentText.length;
        if (len > lastTypedLen) {
          if (len - lastTypedLen <= 2) {
            playKeystroke(currentText[len - 1] === " ");
          }
          lastTypedLen = len;
        }
      },
    });
    masterTl.to({}, { duration: 0.4 });

    // Act 2: Dock the name in the profile masthead.
    masterTl.addLabel("intro-dock");
    masterTl.add(() => {
      const brandEl = brandRef.current;
      const wrapperEl = brandWrapperRef.current;
      if (!brandEl || !wrapperEl) return;

      cursorBlinkRef.current?.kill();
      cursorBlinkRef.current = null;

      const flipState = Flip.getState(brandEl);
      wrapperEl.className = DOCKED_WRAPPER_CLASS;
      brandEl.className = `${DOCKED_BRAND_CLASS} pointer-events-auto cursor-pointer`;

      gsap.to(cursorRef.current, {
        opacity: 0,
        width: 0,
        marginLeft: 0,
        duration: 0.35,
        ease: "power2.out",
      });

      activeFlipRef.current = Flip.from(flipState, {
        duration: 1.1,
        ease: "expo.inOut",
        scale: true,
        absolute: true,
      });
    }, "intro-dock");
    masterTl.to(drawing, { merge: 1, duration: 0.86, ease: "power2.inOut" }, "intro-dock");

    // Reserve 0.9s before Act 3 starts (overlaps final 0.2s of the 1.1s Flip flight)
    masterTl.to({}, { duration: 0.9 }, "intro-dock");

    // Act 3: Reveal the profile in reading order with masked slides.
    masterTl.add(() => {
      lenisRef.current?.start();
      if (profileStageRef.current) {
        gsap.set(profileStageRef.current, {
          opacity: 1,
          visibility: "visible",
        });
      }
    });
    if (masks.length) {
      masterTl.to(masks, {
        yPercent: 0,
        duration: 0.85,
        ease: "power4.out",
        stagger: 0.07,
      });
    }
    if (profileDividerRef.current) {
      masterTl.to(
        profileDividerRef.current,
        {
          scaleX: 1,
          duration: 0.9,
          ease: "power4.out",
        },
        "<"
      );
    }
    masterTl.to(
      bottomBarRef.current,
      {
        opacity: 1,
        duration: 0.55,
        ease: "power2.out",
      },
      "<"
    );
  }, [getProfileBlocks, getProfileMasks, playKeystroke, revealProfileImmediate]);

  // Lenis initialization & ticker sync
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Initial mount routing & choreography
  useLayoutEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionPreference.matches;

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (!event.matches) return;
      if (isIntroRunningRef.current) finishIntroImmediate();
      else graphiteRef.current?.settle(false);
    };
    motionPreference.addEventListener("change", handleMotionChange);

    const ctx = gsap.context(() => {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get("view");
      const urlDiscipline = getDisciplineBySlug(params.get("discipline"));
      let introSeen = false;
      try {
        introSeen = sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
      } catch {
        introSeen = false;
      }

      if (urlDiscipline) {
        if (urlView !== "disciplines") {
          window.history.replaceState(
            { view: "detail", discipline: urlDiscipline.slug },
            "",
            `?view=disciplines&discipline=${encodeURIComponent(urlDiscipline.slug)}`
          );
        }
        applyDockedBrandInstant();
        gsap.set(bottomBarRef.current, { opacity: 1 });
        try {
          sessionStorage.setItem(INTRO_SESSION_KEY, "1");
        } catch {
          // Ignore storage access failures
        }
        lenisRef.current?.start();
        setIntroSettled(true);
        pendingSceneRef.current = "direct-detail";
        setActiveSlug(urlDiscipline.slug);
        setView("detail");
        return;
      }

      if (urlView === "disciplines") {
        applyDockedBrandInstant();
        gsap.set(bottomBarRef.current, { opacity: 1 });
        try {
          sessionStorage.setItem(INTRO_SESSION_KEY, "1");
        } catch {
          // Ignore storage access failures
        }
        lenisRef.current?.start();
        setIntroSettled(true);
        pendingSceneRef.current = "direct-disciplines";
        setView("disciplines");
        return;
      }

      if (reducedMotionRef.current || introSeen || getProfileAnchor()) {
        revealProfileImmediate();
        return;
      }

      startIntroChoreography();
    }, rootRef);

    return () => {
      motionPreference.removeEventListener("change", handleMotionChange);
      cursorBlinkRef.current?.kill();
      masterTlRef.current?.kill();
      activeFlipRef.current?.kill();
      transitionTlRef.current?.kill();
      ctx.revert();
    };
  }, [
    applyDockedBrandInstant,
    finishIntroImmediate,
    revealProfileImmediate,
    startIntroChoreography,
  ]);

  // Handle mounted scene entrance transitions across Profile / Disciplines / Detail
  useLayoutEffect(() => {
    const scene = pendingSceneRef.current;
    if (!scene) return;

    if (view === "profile" && scene === "replay-profile") {
      pendingSceneRef.current = null;
      startIntroChoreography();
      return;
    }

    if (view === "profile" && (scene === "enter-profile" || scene === "direct-profile")) {
      pendingSceneRef.current = null;
      lenisRef.current?.scrollTo(0, { immediate: true });

      if (scene === "direct-profile" || reducedMotionRef.current || getProfileAnchor()) {
        revealProfileImmediate();
        return;
      }

      if (profileStageRef.current) {
        gsap.set(profileStageRef.current, {
          opacity: 1,
          visibility: "visible",
        });
      }
      const blocks = getProfileBlocks();
      const masks = getProfileMasks();
      if (blocks.length) gsap.set(blocks, { opacity: 1, y: 0 });
      if (masks.length) gsap.set(masks, { yPercent: 100 });
      if (profileDividerRef.current) {
        gsap.set(profileDividerRef.current, { scaleX: 0, opacity: 1, y: 0 });
      }

      const tl = gsap.timeline({
        onComplete: () => {
          lenisRef.current?.resize();
          isTransitioningRef.current = false;
        },
      });
      transitionTlRef.current = tl;

      if (masks.length) {
        tl.to(masks, {
          yPercent: 0,
          duration: 0.78,
          ease: "power4.out",
          stagger: 0.06,
        });
      }
      if (profileDividerRef.current) {
        tl.to(
          profileDividerRef.current,
          { scaleX: 1, duration: 0.85, ease: "power4.out" },
          "<"
        );
      }
      return;
    }

    if (
      view === "disciplines" &&
      (scene === "enter-disciplines" || scene === "direct-disciplines")
    ) {
      pendingSceneRef.current = null;
      lenisRef.current?.scrollTo(0, { immediate: true });

      const masks: HTMLDivElement[] = [];
      const borders: HTMLSpanElement[] = [];
      for (const d of DISCIPLINES) {
        const row = rowRefs.current[d.slug];
        const mask = rowMaskRefs.current[d.slug];
        const header = rowHeaderRefs.current[d.slug];
        const meta = rowMetaRefs.current[d.slug];
        const border = rowBorderRefs.current[d.slug];
        if (row) gsap.set(row, { opacity: 1, x: 0, y: 0 });
        if (header) gsap.set(header, { opacity: 1, clearProps: "transform" });
        if (meta) gsap.set(meta, { opacity: 1 });
        if (mask) masks.push(mask);
        if (border) borders.push(border);
      }

      if (scene === "direct-disciplines" || reducedMotionRef.current) {
        if (disciplinesStageRef.current) {
          gsap.set(disciplinesStageRef.current, {
            opacity: 1,
            visibility: "visible",
          });
        }
        if (backToProfileRef.current) {
          gsap.set(backToProfileRef.current, { opacity: 1, x: 0 });
        }
        gsap.set([eyebrowRef.current, metaRef.current], { opacity: 1 });
        if (eyebrowBorderRef.current) {
          gsap.set(eyebrowBorderRef.current, { scaleX: 1, opacity: 1 });
        }
        if (masks.length) gsap.set(masks, { yPercent: 0 });
        if (borders.length) {
          gsap.set(borders, {
            scaleX: 1,
            opacity: 1,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
          });
        }
        lenisRef.current?.resize();
        isTransitioningRef.current = false;
        return;
      }

      if (disciplinesStageRef.current) {
        gsap.set(disciplinesStageRef.current, {
          opacity: 1,
          visibility: "visible",
        });
      }
      if (backToProfileRef.current) {
        gsap.set(backToProfileRef.current, { opacity: 0, x: -10 });
      }
      gsap.set([eyebrowRef.current, metaRef.current], { opacity: 0 });
      if (eyebrowBorderRef.current) {
        gsap.set(eyebrowBorderRef.current, { scaleX: 0, opacity: 1 });
      }
      if (masks.length) gsap.set(masks, { yPercent: 100 });
      if (borders.length) {
        gsap.set(borders, {
          scaleX: 0,
          opacity: 1,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
        });
      }

      const tl = gsap.timeline({
        onComplete: () => {
          lenisRef.current?.resize();
          isTransitioningRef.current = false;
        },
      });
      transitionTlRef.current = tl;

      if (backToProfileRef.current) {
        tl.to(
          backToProfileRef.current,
          { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" },
          0
        );
      }
      tl.to(
        [eyebrowRef.current, metaRef.current],
        { opacity: 1, duration: 0.45, ease: "power2.out" },
        0.04
      );
      if (eyebrowBorderRef.current) {
        tl.to(
          eyebrowBorderRef.current,
          { scaleX: 1, duration: 0.65, ease: "power3.out" },
          0.04
        );
      }
      if (masks.length) {
        tl.to(
          masks,
          {
            yPercent: 0,
            duration: 0.8,
            ease: "power4.out",
            stagger: 0.08,
          },
          0.08
        );
      }
      if (borders.length) {
        tl.to(
          borders,
          {
            scaleX: 1,
            duration: 0.8,
            ease: "power4.out",
            stagger: 0.08,
          },
          0.08
        );
      }
      return;
    }

    if (
      view === "detail" &&
      activeSlug &&
      (scene === "open-detail" || scene === "direct-detail")
    ) {
      pendingSceneRef.current = null;

      const drawerEl = drawerRef.current;
      const dockedEl = dockedHeaderRef.current;
      const leftEl = drawerLeftRef.current;
      const cardEls = drawerRightRef.current
        ? Array.from(
            drawerRightRef.current.querySelectorAll<HTMLElement>(
              "[data-build-card]"
            )
          )
        : [];

      if (scene === "direct-detail" || reducedMotionRef.current) {
        if (disciplinesStageRef.current) {
          gsap.set(disciplinesStageRef.current, {
            opacity: 1,
            visibility: "hidden",
          });
        }
        if (backToProfileRef.current) {
          gsap.set(backToProfileRef.current, { opacity: 0, x: -8 });
        }
        gsap.set([eyebrowRef.current, metaRef.current], { opacity: 0 });
        if (eyebrowBorderRef.current) {
          gsap.set(eyebrowBorderRef.current, { scaleX: 1, opacity: 0 });
        }
        for (const d of DISCIPLINES) {
          const row = rowRefs.current[d.slug];
          const mask = rowMaskRefs.current[d.slug];
          const header = rowHeaderRefs.current[d.slug];
          const meta = rowMetaRefs.current[d.slug];
          const border = rowBorderRefs.current[d.slug];
          const isTarget = d.slug === activeSlug;
          if (mask) gsap.set(mask, { yPercent: 0 });
          if (row) {
            gsap.set(row, {
              opacity: isTarget ? 1 : 0,
              y: isTarget ? 0 : 24,
              x: 0,
            });
          }
          if (border) {
            gsap.set(border, {
              scaleX: 1,
              opacity: isTarget ? 0 : 1,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            });
          }
          if (header) gsap.set(header, { opacity: isTarget ? 0 : 1 });
          if (meta) gsap.set(meta, { opacity: isTarget ? 0 : 1 });
        }
        if (dockedEl) gsap.set(dockedEl, { opacity: 1, clearProps: "transform" });
        if (drawerEl) gsap.set(drawerEl, { clipPath: "none", opacity: 1 });
        if (leftEl) gsap.set(leftEl, { opacity: 1, y: 0 });
        if (cardEls.length) gsap.set(cardEls, { opacity: 1, y: 0 });
        lenisRef.current?.resize();
        const project = cardEls.find((card) => `#${card.id}` === window.location.hash);
        project?.focus({ preventScroll: true });
        project?.scrollIntoView({ behavior: "instant" });
        isTransitioningRef.current = false;
        return;
      }

      const capturedState = pendingFlipStateRef.current;
      pendingFlipStateRef.current = null;

      const clickedRow = rowRefs.current[activeSlug];
      const clickedHeader = rowHeaderRefs.current[activeSlug];
      const clickedMeta = rowMetaRefs.current[activeSlug];
      const clickedBorder = rowBorderRefs.current[activeSlug];
      const siblingRows = DISCIPLINES.filter((d) => d.slug !== activeSlug)
        .map((d) => rowRefs.current[d.slug])
        .filter((el): el is HTMLButtonElement => Boolean(el));

      if (drawerEl) {
        gsap.set(drawerEl, { clipPath: "inset(0% 0% 100% 0%)", opacity: 1 });
      }
      if (leftEl) gsap.set(leftEl, { opacity: 0, y: 18 });
      if (cardEls.length) gsap.set(cardEls, { opacity: 0, y: 30 });
      if (dockedEl) gsap.set(dockedEl, { opacity: 1 });

      const tl = gsap.timeline({
        onComplete: () => {
          if (drawerEl) gsap.set(drawerEl, { clipPath: "none" });
          lenisRef.current?.resize();
          isTransitioningRef.current = false;
        },
      });
      transitionTlRef.current = tl;

      // 0.00s - 0.30s: Dismiss top-left "<- Profile", eyebrow, and unclicked rows
      tl.add(() => {
        if (clickedHeader) gsap.set(clickedHeader, { opacity: 0 });
      }, 0);

      if (backToProfileRef.current) {
        tl.to(
          backToProfileRef.current,
          { opacity: 0, x: -8, duration: 0.2, ease: "power2.in" },
          0
        );
      }
      if (clickedMeta) {
        tl.to(
          clickedMeta,
          { opacity: 0, duration: 0.2, ease: "power2.in" },
          0
        );
      }
      if (clickedRow) {
        tl.to(clickedRow, { x: 0, duration: 0.2, ease: "power2.in" }, 0);
      }
      if (clickedBorder) {
        tl.to(
          clickedBorder,
          { opacity: 0, duration: 0.2, ease: "power2.in" },
          0
        );
      }
      tl.to(
        [eyebrowRef.current, eyebrowBorderRef.current, metaRef.current],
        { opacity: 0, duration: 0.2, ease: "power2.in" },
        0
      );
      if (siblingRows.length) {
        tl.to(
          siblingRows,
          {
            opacity: 0,
            y: 24,
            duration: 0.28,
            stagger: 0.035,
            ease: "power3.in",
          },
          0
        );
      }
      tl.add(() => {
        if (disciplinesStageRef.current) {
          gsap.set(disciplinesStageRef.current, { visibility: "hidden" });
        }
      }, 0.32);

      // 0.05s - 0.85s: Shared-Element Header Morph via GSAP Flip
      if (capturedState && dockedEl) {
        const flipTl = Flip.from(capturedState, {
          targets: dockedEl,
          duration: 0.8,
          ease: "expo.inOut",
          scale: true,
          absolute: true,
        });
        activeFlipRef.current = flipTl;
        tl.add(flipTl, 0.05);
      }

      // 0.45s - 1.05s: Editorial Drawer Unfold
      if (drawerEl) {
        tl.to(
          drawerEl,
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.6,
            ease: "expo.out",
          },
          0.45
        );
      }
      if (leftEl) {
        tl.to(
          leftEl,
          { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" },
          0.55
        );
      }
      if (cardEls.length) {
        tl.to(
          cardEls,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.1,
            ease: "power3.out",
          },
          0.58
        );
      }
    }
  }, [activeSlug, getProfileBlocks, getProfileMasks, revealProfileImmediate, startIntroChoreography, view]);

  // Transition: Profile -> Disciplines
  const goToDisciplines = useCallback(
    (options?: { fromPopState?: boolean }) => {
      if (
        viewRef.current !== "profile" ||
        !introSettledRef.current ||
        isTransitioningRef.current
      ) {
        return;
      }

      isTransitioningRef.current = true;
      transitionTlRef.current?.kill();

      if (!options?.fromPopState) {
        playClick();
        window.history.replaceState(window.history.state, "", "#work");
        window.history.pushState({ view: "disciplines" }, "", "?view=disciplines");
      }

      if (reducedMotionRef.current) {
        pendingSceneRef.current = "direct-disciplines";
        setView("disciplines");
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          pendingSceneRef.current = "enter-disciplines";
          setView("disciplines");
        },
      });
      transitionTlRef.current = tl;

      if (profileStageRef.current) {
        tl.to(profileStageRef.current, {
          opacity: 0,
          duration: 0.24,
        });
      }
    },
    [playClick]
  );

  // Transition: Disciplines or Detail -> Profile
  const goToProfile = useCallback(
    (options?: { fromPopState?: boolean }) => {
      if (
        viewRef.current === "profile" ||
        !introSettledRef.current ||
        isTransitioningRef.current
      ) {
        return;
      }

      isTransitioningRef.current = true;
      setLightboxState(null);
      lenisRef.current?.start();
      transitionTlRef.current?.kill();
      activeFlipRef.current?.kill();

      if (!options?.fromPopState) {
        playClick();
        window.history.pushState({ view: "profile" }, "", window.location.pathname);
      }

      lenisRef.current?.scrollTo(0, { immediate: true });

      if (reducedMotionRef.current) {
        pendingSceneRef.current = "direct-profile";
        setActiveSlug(null);
        setView("profile");
        return;
      }

      if (viewRef.current === "detail") {
        const outTargets = [dockedHeaderRef.current, drawerRef.current].filter(
          (el) => el !== null
        );
        const tl = gsap.timeline({
          onComplete: () => {
            pendingSceneRef.current = "enter-profile";
            setActiveSlug(null);
            setView("profile");
          },
        });
        transitionTlRef.current = tl;

        tl.to(outTargets, {
          opacity: 0,
          y: -20,
          duration: 0.34,
          ease: "power3.in",
        });
        return;
      }

      const rows = DISCIPLINES.map((d) => rowRefs.current[d.slug]).filter(
        (el): el is HTMLButtonElement => Boolean(el)
      );
      const tl = gsap.timeline({
        onComplete: () => {
          pendingSceneRef.current = "enter-profile";
          setActiveSlug(null);
          setView("profile");
        },
      });
      transitionTlRef.current = tl;

      if (backToProfileRef.current) {
        tl.to(
          backToProfileRef.current,
          { opacity: 0, x: -10, duration: 0.25, ease: "power2.in" },
          0
        );
      }
      tl.to(
        [eyebrowRef.current, eyebrowBorderRef.current, metaRef.current],
        { opacity: 0, duration: 0.25, ease: "power2.in" },
        0
      );
      if (rows.length) {
        tl.to(
          rows,
          {
            opacity: 0,
            y: 22,
            duration: 0.32,
            stagger: 0.03,
            ease: "power3.in",
          },
          0
        );
      }
    },
    [playClick]
  );

  // Option 1 Takeover: Disciplines -> Detail
  const openDiscipline = useCallback(
    (slug: string, options?: { fromPopState?: boolean }) => {
      if (
        viewRef.current !== "disciplines" ||
        !introSettledRef.current ||
        isTransitioningRef.current
      ) {
        return;
      }
      if (activeSlugRef.current === slug) return;

      const rowHeaderEl = rowHeaderRefs.current[slug];
      if (!rowHeaderEl) return;

      isTransitioningRef.current = true;
      gsap.killTweensOf(Object.values(rowRefs.current).filter(Boolean));
      lenisRef.current?.scrollTo(0, { immediate: true });

      if (!options?.fromPopState) {
        playClick();
        const nextUrl = `${window.location.pathname}?view=disciplines&discipline=${encodeURIComponent(slug)}`;
        window.history.pushState({ view: "detail", discipline: slug }, "", nextUrl);
      }

      if (!reducedMotionRef.current) {
        pendingFlipStateRef.current = Flip.getState(rowHeaderEl);
        pendingSceneRef.current = "open-detail";
      } else {
        pendingSceneRef.current = "direct-detail";
      }

      setActiveSlug(slug);
      setView("detail");
    },
    [playClick]
  );

  // Reverse Option 1 Takeover: Detail -> Disciplines
  const closeDiscipline = useCallback(
    (options?: { fromPopState?: boolean }) => {
      const closingSlug = activeSlugRef.current;
      if (
        viewRef.current !== "detail" ||
        !closingSlug ||
        isTransitioningRef.current
      ) {
        return;
      }

      isTransitioningRef.current = true;
      setLightboxState(null);
      lenisRef.current?.start();
      transitionTlRef.current?.kill();
      activeFlipRef.current?.kill();

      if (!options?.fromPopState) {
        window.history.pushState(
          { view: "disciplines" },
          "",
          "?view=disciplines"
        );
      }

      lenisRef.current?.scrollTo(0, { immediate: true });

      const rowHeaderEl = rowHeaderRefs.current[closingSlug];
      const clickedRow = rowRefs.current[closingSlug];
      const clickedMeta = rowMetaRefs.current[closingSlug];
      const clickedBorder = rowBorderRefs.current[closingSlug];
      const siblingRows = DISCIPLINES.filter((d) => d.slug !== closingSlug)
        .map((d) => rowRefs.current[d.slug])
        .filter((el): el is HTMLButtonElement => Boolean(el));

      const dockedEl = dockedHeaderRef.current;
      const drawerEl = drawerRef.current;
      const leftEl = drawerLeftRef.current;
      const cardEls = drawerRightRef.current
        ? Array.from(
            drawerRightRef.current.querySelectorAll<HTMLElement>(
              "[data-build-card]"
            )
          )
        : [];

      if (reducedMotionRef.current || !dockedEl || !rowHeaderEl) {
        pendingSceneRef.current = "direct-disciplines";
        setActiveSlug(null);
        setView("disciplines");
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          for (const d of DISCIPLINES) {
            const row = rowRefs.current[d.slug];
            const header = rowHeaderRefs.current[d.slug];
            if (row) gsap.set(row, { clearProps: "transform" });
            if (header) gsap.set(header, { clearProps: "transform", opacity: 1 });
          }
          setActiveSlug(null);
          setView("disciplines");
          lenisRef.current?.resize();
          isTransitioningRef.current = false;
        },
      });
      transitionTlRef.current = tl;

      if (cardEls.length) {
        tl.to(
          cardEls,
          { opacity: 0, y: 18, duration: 0.22, stagger: 0.04, ease: "power2.in" },
          0
        );
      }
      if (leftEl) {
        tl.to(
          leftEl,
          { opacity: 0, y: 14, duration: 0.2, ease: "power2.in" },
          0
        );
      }
      if (drawerEl) {
        tl.to(
          drawerEl,
          {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 0.35,
            ease: "expo.in",
          },
          0.04
        );
      }

      // Reverse Flip from docked top-left header back into the discipline row
      tl.add(() => {
        if (disciplinesStageRef.current) {
          gsap.set(disciplinesStageRef.current, {
            opacity: 1,
            visibility: "visible",
          });
        }
        const dockedState = Flip.getState(dockedEl);
        gsap.set(dockedEl, { opacity: 0 });
        gsap.set(rowHeaderEl, { opacity: 1 });

        const reverseFlip = Flip.from(dockedState, {
          targets: rowHeaderEl,
          duration: 0.72,
          ease: "expo.inOut",
          scale: true,
          absolute: true,
        });
        activeFlipRef.current = reverseFlip;
      }, 0.22);
      tl.to({}, { duration: 0.74 }, 0.22);

      // Restore top-left "<- Profile", header, and 4 discipline rows
      if (backToProfileRef.current) {
        tl.to(
          backToProfileRef.current,
          { opacity: 1, x: 0, duration: 0.38, ease: "power3.out" },
          0.38
        );
      }
      if (clickedRow) {
        tl.to(
          clickedRow,
          { opacity: 1, x: 0, y: 0, duration: 0.35, ease: "power2.out" },
          0.38
        );
      }
      if (clickedBorder) {
        tl.to(
          clickedBorder,
          {
            opacity: 1,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            duration: 0.35,
            ease: "power2.out",
          },
          0.38
        );
      }
      if (clickedMeta) {
        tl.to(
          clickedMeta,
          { opacity: 1, duration: 0.35, ease: "power2.out" },
          0.4
        );
      }
      tl.to(
        [eyebrowRef.current, eyebrowBorderRef.current, metaRef.current],
        { opacity: 1, duration: 0.35, ease: "power2.out" },
        0.38
      );
      if (siblingRows.length) {
        tl.to(
          siblingRows,
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.42,
            stagger: 0.05,
            ease: "power3.out",
          },
          0.38
        );
      }
    },
    []
  );

  // Global skip-intro, Escape, and popstate handlers.
  useEffect(() => {
    const handleClickSkip = (event: MouseEvent) => {
      if (isIntroRunningRef.current) {
        event.preventDefault();
        event.stopPropagation();
        finishIntroImmediate();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        isIntroRunningRef.current &&
        (event.code === "Space" || event.key === "Escape")
      ) {
        event.preventDefault();
        finishIntroImmediate();
        return;
      }

      if (event.key === "Escape" && lightboxStateRef.current) {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (
        event.key === "Escape" &&
        viewRef.current === "detail" &&
        activeSlugRef.current &&
        !isTransitioningRef.current
      ) {
        event.preventDefault();
        closeDiscipline();
      }
    };

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const targetDiscipline = getDisciplineBySlug(params.get("discipline"));
      const targetView = params.get("view");

      if (targetDiscipline) {
        if (viewRef.current === "disciplines") {
          openDiscipline(targetDiscipline.slug, { fromPopState: true });
        } else if (viewRef.current === "profile") {
          pendingSceneRef.current = "direct-detail";
          setActiveSlug(targetDiscipline.slug);
          setView("detail");
        }
        return;
      }

      if (targetView === "disciplines") {
        if (viewRef.current === "detail") {
          closeDiscipline({ fromPopState: true });
        } else if (viewRef.current === "profile") {
          goToDisciplines({ fromPopState: true });
        }
        return;
      }

      if (viewRef.current !== "profile") {
        goToProfile({ fromPopState: true });
      }
    };

    window.addEventListener("click", handleClickSkip, true);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("click", handleClickSkip, true);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [
    closeDiscipline,
    closeLightbox,
    finishIntroImmediate,
    goToDisciplines,
    goToProfile,
    openDiscipline,
  ]);

  const handleRowEnter = (hoveredSlug: string) => {
    if (
      !introSettled ||
      view !== "disciplines" ||
      isTransitioningRef.current ||
      reducedMotionRef.current
    ) {
      return;
    }

    playHoverTick();

    for (const d of DISCIPLINES) {
      const el = rowRefs.current[d.slug];
      const border = rowBorderRefs.current[d.slug];
      if (!el) continue;

      if (d.slug === hoveredSlug) {
        gsap.to(el, {
          x: 12,
          opacity: 1,
          duration: 0.28,
          ease: "power2.out",
          overwrite: "auto",
        });
        if (border) {
          gsap.to(border, {
            backgroundColor: "rgba(255, 255, 255, 0.28)",
            duration: 0.28,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      } else {
        gsap.to(el, {
          x: 0,
          opacity: 0.35,
          duration: 0.28,
          ease: "power2.out",
          overwrite: "auto",
        });
        if (border) {
          gsap.to(border, {
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            duration: 0.28,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      }
    }
  };

  const handleListLeave = () => {
    if (
      !introSettled ||
      view !== "disciplines" ||
      isTransitioningRef.current ||
      reducedMotionRef.current
    ) {
      return;
    }

    for (const d of DISCIPLINES) {
      const el = rowRefs.current[d.slug];
      const border = rowBorderRefs.current[d.slug];
      if (!el) continue;
      gsap.to(el, {
        x: 0,
        opacity: 1,
        duration: 0.28,
        ease: "power2.out",
        overwrite: "auto",
      });
      if (border) {
        gsap.to(border, {
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          duration: 0.28,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    }
  };

  const handleReplayIntro = () => {
    if (isTransitioningRef.current) return;
    playClick();
    setLightboxState(null);
    try {
      sessionStorage.removeItem(INTRO_SESSION_KEY);
    } catch {
      // Ignore storage access failures
    }
    if (window.location.search || window.location.hash) {
      window.history.pushState(null, "", window.location.pathname);
    }
    setActiveSlug(null);
    if (view === "profile") {
      startIntroChoreography();
    } else {
      pendingSceneRef.current = "replay-profile";
      setView("profile");
    }
  };

  const isProfile = view === "profile";

  const navigateProfile = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const hash = event.currentTarget.hash;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;

    event.preventDefault();
    playClick();
    if (window.location.hash !== hash) window.history.pushState(window.history.state, "", hash);
    target.focus({ preventScroll: true });

    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(target, { duration: 0.85, immediate: reducedMotionRef.current });
    else target.scrollIntoView({ behavior: "instant" });
  };

  return (
    <div
      ref={rootRef}
      data-portfolio-view={view}
      className="portfolio-shell relative z-10 min-h-screen w-full"
    >
      {isProfile && <GraphiteBackdrop ref={graphiteRef} />}
      {/* Persistent brand anchor for the intro and return navigation. */}
      <div ref={brandWrapperRef} className={UNDOCKED_WRAPPER_CLASS}>
        <button
          ref={brandRef}
          type="button"
          data-flip-id="brand-name"
          tabIndex={isProfile ? -1 : 0}
          onClick={() => {
            if (viewRef.current !== "profile") {
              goToProfile();
            }
          }}
          aria-label={
            view !== "profile"
              ? `${AUTHOR_NAME} — return to profile introduction`
              : AUTHOR_NAME
          }
          className={`${UNDOCKED_BRAND_CLASS} opacity-0 pointer-events-none text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40`}
        >
          <span className="inline-grid items-baseline">
            <span
              className="col-start-1 row-start-1 invisible select-none"
              aria-hidden="true"
            >
              {AUTHOR_NAME}
            </span>
            <span className="col-start-1 row-start-1 inline-flex items-baseline">
              <span ref={brandTextRef} />
              <span
                ref={cursorRef}
                aria-hidden="true"
                className="ml-[0.06em] inline-block font-light text-zinc-400"
              >
                |
              </span>
            </span>
          </span>
        </button>
      </div>

      {/* Top-Left Navigation Anchor when in Disciplines View */}
      {(view === "disciplines" || view === "detail") && (
        <div className="portfolio-scene-nav pointer-events-none absolute inset-x-0 top-0 z-40">
          <div className="portfolio-frame flex items-center">
            <button
              ref={backToProfileRef}
              type="button"
              onClick={() => goToProfile()}
              onMouseEnter={playHoverTick}
              tabIndex={view === "disciplines" ? 0 : -1}
              className={`group inline-flex items-center gap-2 font-mono text-xs tracking-[0.06em] text-zinc-400 transition-colors duration-200 hover:text-zinc-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${
                view === "disciplines"
                  ? "pointer-events-auto cursor-pointer"
                  : "pointer-events-none"
              }`}
            >
              <ArrowLeft
                aria-hidden="true"
                className="h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-zinc-100"
              />
              <span>Home</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Stage */}
      <main className="portfolio-main relative min-h-screen w-full">
        {isProfile && (
          <div
            ref={profileStageRef}
            className="w-full invisible opacity-0"
            inert={!introSettled}
          >
            <section className="portfolio-hero" aria-labelledby="profile-title">
              <header className="portfolio-masthead portfolio-grid">
                <div data-profile-block className="portfolio-location overflow-hidden">
                  <p data-profile-mask className="portfolio-annotation">
                    <span>Metro Manila</span>
                    <span>UTC+08:00</span>
                  </p>
                </div>
                <div ref={profileDividerRef} className="portfolio-masthead-rule" aria-hidden="true" />
              </header>

              <div className="portfolio-hero-body portfolio-grid">
                <div data-profile-block className="portfolio-intro-label overflow-hidden">
                  <p data-profile-mask className="portfolio-annotation">Computer engineering</p>
                </div>

                <h1 id="profile-title" className="portfolio-headline">
                  <span data-profile-block className="portfolio-headline-line">
                    <span data-profile-mask>Justin</span>
                  </span>
                </h1>

                <div data-profile-block className="portfolio-intro-copy overflow-hidden">
                  <div data-profile-mask>
                    <p className="portfolio-intro-summary">
                      I&apos;m a Computer Engineering student in Metro Manila. I build web platforms, AI tutors, and embedded systems, and work with real-time 3D.
                    </p>
                  </div>
                </div>

                <nav data-profile-block aria-label="Portfolio" className="portfolio-actions overflow-hidden">
                  <div data-profile-mask className="portfolio-action-list">
                    <a
                      href="#about"
                      onClick={navigateProfile}
                      onMouseEnter={playHoverTick}
                      className="portfolio-action portfolio-action-primary"
                    >
                      About me
                    </a>
                    <a
                      href="#work"
                      onClick={navigateProfile}
                      onMouseEnter={playHoverTick}
                      className="portfolio-action"
                    >
                      Featured work
                    </a>
                  </div>
                </nav>
              </div>
            </section>

            <AboutSequence onNavigate={navigateProfile} />

            <WorkShowcase availableMedia={availableMedia} onBrowse={() => goToDisciplines()} onSelect={playClick} />
          </div>
        )}

        {/* STAGE 2: Full-Width 4-Discipline Index (Kept mounted during Detail for Flip) */}
        {(view === "disciplines" || view === "detail") && (
          <section
            ref={disciplinesStageRef}
            aria-label="Engineering Disciplines"
            onMouseLeave={handleListLeave}
            className={
              view === "detail"
                ? "portfolio-frame portfolio-index pointer-events-none absolute inset-x-0 top-0 opacity-0 invisible"
                : "portfolio-frame portfolio-index relative opacity-0 invisible"
            }
          >
            <div className="relative mb-6 md:mb-8 flex flex-wrap items-center justify-between gap-4 pb-4">
              <div
                ref={eyebrowRef}
                className="text-3xl font-medium tracking-[-0.02em] sm:text-4xl"
              >
                <h1>Disciplines</h1>
              </div>
              <div
                ref={metaRef}
                className="font-mono text-xs text-zinc-400"
              >
                {DISCIPLINES.length} areas of work
              </div>
              <span
                ref={eyebrowBorderRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-white/[0.08]"
              />
            </div>

            <div className="flex flex-col">
              {DISCIPLINES.map((discipline) => (
                <button
                  key={discipline.slug}
                  ref={(el) => {
                    rowRefs.current[discipline.slug] = el;
                  }}
                  type="button"
                  onClick={() => openDiscipline(discipline.slug)}
                  onMouseEnter={() => handleRowEnter(discipline.slug)}
                  onFocus={() => handleRowEnter(discipline.slug)}
                  onBlur={handleListLeave}
                  tabIndex={view === "detail" ? -1 : 0}
                  className="group relative w-full py-6 md:py-8 text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
                >
                  <div className="overflow-hidden">
                    <div
                      ref={(el) => {
                        rowMaskRefs.current[discipline.slug] = el;
                      }}
                      className="portfolio-index-row"
                    >
                      <div
                        ref={(el) => {
                          rowHeaderRefs.current[discipline.slug] = el;
                        }}
                        data-flip-id={`discipline-header-${discipline.slug}`}
                        className="portfolio-index-title"
                      >
                        <span className="font-mono text-xs text-zinc-400">
                          {discipline.index}
                        </span>
                        <span className="portfolio-index-name">
                          {discipline.title}
                        </span>
                      </div>

                      <div
                        ref={(el) => {
                          rowMetaRefs.current[discipline.slug] = el;
                        }}
                        className="portfolio-index-meta"
                      >
                        <span className="text-zinc-400 group-hover:text-zinc-200">
                          {discipline.primaryTags.join(" / ")}
                        </span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#F4F4F6]"
                        />
                      </div>
                    </div>
                  </div>
                  <span
                    ref={(el) => {
                      rowBorderRefs.current[discipline.slug] = el;
                    }}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-white/[0.08]"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* STAGE 3: Option 1 Shared-Element Discipline Showcase (view === "detail") */}
        {view === "detail" && activeDiscipline && (
          <section
            aria-labelledby="discipline-title"
            className="portfolio-frame portfolio-detail relative"
          >
            <button
              type="button"
              onClick={() => closeDiscipline()}
              onMouseEnter={playHoverTick}
              className="portfolio-detail-back inline-flex cursor-pointer items-center gap-2 font-mono text-xs text-zinc-300 hover:text-white focus-visible:outline-1 focus-visible:outline-offset-4"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              All disciplines
            </button>

            <div
              ref={dockedHeaderRef}
              data-flip-id={`discipline-header-${activeDiscipline.slug}`}
              className="portfolio-detail-heading"
            >
              <span className="font-mono text-sm text-zinc-400">{activeDiscipline.index}</span>
              <h1 id="discipline-title">{activeDiscipline.title}</h1>
            </div>

            <div ref={drawerRef} className="portfolio-detail-body">
              <div ref={drawerLeftRef}>
                <p className="max-w-[38ch] text-base leading-relaxed text-zinc-300 sm:text-lg">
                  {activeDiscipline.summary}
                </p>
                <p className="mt-6 font-mono text-xs leading-relaxed text-zinc-400">
                  {activeDiscipline.stack.join(" / ")}
                </p>
              </div>

              <div ref={drawerRightRef} className="min-w-0">
                {activeDiscipline.builds.map((build) => (
                  <DisciplineCard
                    key={build.id}
                    build={{ ...build, media: build.media.filter((src) => availableMedia.includes(src)) }}
                    onExpandMedia={openLightbox}
                    onClickSound={playClick}
                    onHoverTick={playHoverTick}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Full-Screen Cinema Lightbox Modal */}
      {lightboxState && activeDiscipline && (
        <CinemaLightbox
          key={`${lightboxState.build.id}-${lightboxState.index}`}
          build={lightboxState.build}
          initialIndex={lightboxState.index}
          disciplineIndex={activeDiscipline.index}
          onClose={closeLightbox}
          onClickSound={playClick}
          onHoverTick={playHoverTick}
        />
      )}

      <footer
        ref={bottomBarRef}
        inert={!introSettled}
        className="portfolio-utilities pointer-events-none relative z-40 opacity-0"
      >
        <div className="portfolio-utilities-inner flex flex-wrap items-center justify-between gap-4">
          <div className="portfolio-utility-settings pointer-events-auto flex items-center gap-5">
            <button
              type="button"
              onClick={handleReplayIntro}
              onMouseEnter={playHoverTick}
              className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 transition-colors duration-200 hover:text-zinc-200 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              <RotateCcw aria-hidden="true" className="h-3 w-3" />
              <span>Replay Intro</span>
            </button>

            <button
              type="button"
              onClick={toggleSound}
              onMouseEnter={playHoverTick}
              aria-pressed={soundEnabled}
              className="text-xs font-mono text-zinc-500 transition-colors duration-200 hover:text-zinc-200 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              {soundEnabled ? "Sound on" : "Sound off"}
            </button>
          </div>

          <div className="portfolio-utility-socials pointer-events-auto flex items-center gap-5 font-mono text-xs text-zinc-500">
            <a
              href="https://github.com/ctrl-alt-Justin"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={playHoverTick}
              onClick={playClick}
              className="transition-colors duration-200 hover:text-zinc-200"
            >
              GitHub ↗
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={playHoverTick}
              onClick={playClick}
              className="transition-colors duration-200 hover:text-zinc-200"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
