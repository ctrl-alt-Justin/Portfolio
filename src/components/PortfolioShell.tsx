"use client";

import Lenis from "lenis";
import { ArrowUpRight, RotateCcw } from "lucide-react";
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
import { GraphiteBackdrop, type GraphiteBackdropHandle } from "@/components/GraphiteBackdrop";
import { MediaSurface } from "@/components/MediaSurface";
import { DetailStream, WorkShowcase } from "@/components/WorkShowcase";
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
  "fixed inset-0 z-50 pointer-events-none flex items-center justify-center px-6";
const DOCKED_WRAPPER_CLASS =
  "portfolio-brand-docked fixed top-0 inset-x-0 z-50 h-16 px-6 md:px-12 pointer-events-none flex items-center justify-end";

const UNDOCKED_BRAND_CLASS =
  "text-[clamp(2.25rem,5vw,4.75rem)] font-medium tracking-[-0.04em] text-[#F4F4F6] whitespace-nowrap leading-none";
const DOCKED_BRAND_CLASS =
  "text-xs sm:text-sm md:text-base font-medium tracking-[-0.02em] text-[#F4F4F6] whitespace-nowrap leading-none transition-colors duration-200 hover:text-white focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white/60";

const NAV_ITEMS = [
  { id: "profile", label: "PROFILE" },
  { id: "work", label: "SELECTED WORKS" },
  { id: "disciplines", label: "DISCIPLINES" },
] as const;

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

export function PortfolioShell({ availableMedia: _availableMedia }: { availableMedia?: string[] }) {
  void _availableMedia;
  const [view, setView] = useState<ViewState>("profile");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [hoveredDisciplineSlug, setHoveredDisciplineSlug] = useState<string>(
    DISCIPLINES[0].slug
  );
  const [activeProfileSection, setActiveProfileSection] = useState<"profile" | "work">("profile");
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
  const topNavBarRef = useRef<HTMLElement>(null);
  const pendingProfileTargetRef = useRef<"#work" | null>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const eyebrowBorderRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLElement>(null);

  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rowMaskRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rowHeaderRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rowMetaRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rowBorderRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const previewCardRef = useRef<HTMLDivElement>(null);
  const quickXToRef = useRef<gsap.QuickToFunc | null>(null);
  const quickYToRef = useRef<gsap.QuickToFunc | null>(null);
  const isPreviewVisibleRef = useRef(false);

  // Stage 3: Option 1 Detail refs
  const dockedHeaderRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

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

  const hideCursorPreview = useCallback((immediate = false) => {
    isPreviewVisibleRef.current = false;
    const card = previewCardRef.current;
    if (!card) return;
    gsap.killTweensOf(card, "opacity,scale");
    if (immediate || reducedMotionRef.current) {
      gsap.set(card, { opacity: 0, scale: 0.96 });
    } else {
      gsap.to(card, {
        opacity: 0,
        scale: 0.96,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  }, []);

  const updateCursorPreviewPos = useCallback(
    (clientX: number, clientY: number, snap = false) => {
      const card = previewCardRef.current;
      if (!card || reducedMotionRef.current) return;
      const cardW = 280;
      const cardH = 175;
      const pad = 20;
      const targetX = Math.max(
        pad,
        Math.min(clientX + 24, window.innerWidth - cardW - pad)
      );
      const targetY = Math.max(
        pad,
        Math.min(clientY - cardH / 2, window.innerHeight - cardH - pad)
      );
      if (snap || !isPreviewVisibleRef.current) {
        gsap.set(card, { x: targetX, y: targetY });
      } else {
        quickXToRef.current?.(targetX);
        quickYToRef.current?.(targetY);
      }
    },
    []
  );

  useEffect(() => {
    if (view !== "disciplines" || reducedMotionRef.current) return;
    const card = previewCardRef.current;
    if (!card) return;

    quickXToRef.current = gsap.quickTo(card, "x", {
      duration: 0.3,
      ease: "power3.out",
    });
    quickYToRef.current = gsap.quickTo(card, "y", {
      duration: 0.3,
      ease: "power3.out",
    });

    return () => {
      quickXToRef.current = null;
      quickYToRef.current = null;
    };
  }, [view]);

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
    gsap.set([topNavBarRef.current, bottomBarRef.current], {
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
    gsap.set([topNavBarRef.current, bottomBarRef.current], {
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
      [topNavBarRef.current, bottomBarRef.current],
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
        gsap.set([topNavBarRef.current, bottomBarRef.current], { opacity: 1 });
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
        gsap.set([topNavBarRef.current, bottomBarRef.current], { opacity: 1 });
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

  // Track active section in Profile view for fixed top navigation highlight
  useEffect(() => {
    if (view !== "profile") return;
    const updateActiveSection = () => {
      const workEl = document.getElementById("work");
      if (!workEl) {
        setActiveProfileSection("profile");
        return;
      }
      const rect = workEl.getBoundingClientRect();
      setActiveProfileSection(
        rect.top <= window.innerHeight * 0.45 ? "work" : "profile"
      );
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
    };
  }, [view]);

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
      const targetHash = pendingProfileTargetRef.current;
      pendingProfileTargetRef.current = null;

      if (targetHash === "#work") {
        revealProfileImmediate();
        const workEl = document.getElementById("work");
        if (workEl) {
          if (lenisRef.current) {
            lenisRef.current.resize();
            lenisRef.current.scrollTo(workEl, { offset: -72, immediate: true });
          } else {
            workEl.scrollIntoView({ behavior: "instant" });
          }
        }
        if (!reducedMotionRef.current && profileStageRef.current) {
          gsap.fromTo(
            profileStageRef.current,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.28,
              ease: "power2.out",
              onComplete: () => {
                isTransitioningRef.current = false;
              },
            }
          );
        } else {
          isTransitioningRef.current = false;
        }
        return;
      }

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
      const cardEls = drawerEl
        ? Array.from(drawerEl.querySelectorAll<HTMLElement>("[data-build-card]"))
        : [];

      if (scene === "direct-detail" || reducedMotionRef.current) {
        if (disciplinesStageRef.current) {
          gsap.set(disciplinesStageRef.current, {
            opacity: 1,
            visibility: "hidden",
          });
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

      // 0.00s - 0.30s: Dismiss eyebrow, metadata, and unclicked rows
      tl.add(() => {
        if (clickedHeader) gsap.set(clickedHeader, { opacity: 0 });
      }, 0);

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
    (options?: { fromPopState?: boolean; targetHash?: "#work" }) => {
      if (
        viewRef.current === "profile" ||
        !introSettledRef.current ||
        isTransitioningRef.current
      ) {
        return;
      }

      isTransitioningRef.current = true;
      hideCursorPreview(true);
      setLightboxState(null);
      lenisRef.current?.start();
      transitionTlRef.current?.kill();
      activeFlipRef.current?.kill();

      pendingProfileTargetRef.current = options?.targetHash ?? null;

      if (!options?.fromPopState) {
        playClick();
        const nextUrl = options?.targetHash
          ? `${window.location.pathname}${options.targetHash}`
          : window.location.pathname;
        window.history.pushState({ view: "profile" }, "", nextUrl);
      }

      if (!options?.targetHash) {
        lenisRef.current?.scrollTo(0, { immediate: true });
      }

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
    [hideCursorPreview, playClick]
  );

  // Direct Transition: Profile (Featured Works) -> Discipline Detail
  const inspectDisciplineFromProfile = useCallback(
    (slug: string) => {
      if (
        viewRef.current !== "profile" ||
        !introSettledRef.current ||
        isTransitioningRef.current
      ) {
        return;
      }

      isTransitioningRef.current = true;
      transitionTlRef.current?.kill();
      playClick();
      window.history.replaceState(window.history.state, "", "#work");
      const nextUrl = `${window.location.pathname}?view=disciplines&discipline=${encodeURIComponent(slug)}`;
      window.history.pushState({ view: "detail", discipline: slug }, "", nextUrl);

      if (reducedMotionRef.current) {
        pendingSceneRef.current = "direct-detail";
        setActiveSlug(slug);
        setView("detail");
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          pendingSceneRef.current = "direct-detail";
          setActiveSlug(slug);
          setView("detail");
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
      hideCursorPreview(true);
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
    [hideCursorPreview, playClick]
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
      hideCursorPreview(true);
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
      const cardEls = drawerEl
        ? Array.from(drawerEl.querySelectorAll<HTMLElement>("[data-build-card]"))
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

      // Restore discipline header and 4 discipline rows
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
    [hideCursorPreview]
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

  const switchDisciplineInDetail = useCallback(
    (slug: string) => {
      if (
        viewRef.current !== "detail" ||
        isTransitioningRef.current ||
        activeSlugRef.current === slug
      ) {
        return;
      }
      playClick();
      setLightboxState(null);
      lenisRef.current?.scrollTo(0, { immediate: true });
      const nextUrl = `${window.location.pathname}?view=disciplines&discipline=${encodeURIComponent(slug)}`;
      window.history.pushState({ view: "detail", discipline: slug }, "", nextUrl);
      pendingSceneRef.current = "direct-detail";
      setActiveSlug(slug);
    },
    [playClick]
  );

  const handleRowEnter = (
    hoveredSlug: string,
    event?: ReactMouseEvent<HTMLButtonElement>
  ) => {
    if (
      !introSettled ||
      view !== "disciplines" ||
      isTransitioningRef.current ||
      reducedMotionRef.current
    ) {
      return;
    }

    playHoverTick();
    setHoveredDisciplineSlug(hoveredSlug);

    if (event) {
      updateCursorPreviewPos(
        event.clientX,
        event.clientY,
        !isPreviewVisibleRef.current
      );
      if (!isPreviewVisibleRef.current && previewCardRef.current) {
        isPreviewVisibleRef.current = true;
        gsap.killTweensOf(previewCardRef.current, "opacity,scale");
        gsap.fromTo(
          previewCardRef.current,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.24, ease: "power2.out" }
        );
      }
    }

    for (const d of DISCIPLINES) {
      const el = rowRefs.current[d.slug];
      if (!el) continue;

      if (d.slug === hoveredSlug) {
        gsap.to(el, {
          x: 10,
          opacity: 1,
          duration: 0.28,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else {
        gsap.to(el, {
          x: 0,
          opacity: 0.35,
          duration: 0.28,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    }
  };

  const handleListMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (
      !introSettled ||
      view !== "disciplines" ||
      isTransitioningRef.current ||
      reducedMotionRef.current ||
      !isPreviewVisibleRef.current
    ) {
      return;
    }
    updateCursorPreviewPos(event.clientX, event.clientY);
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

    hideCursorPreview();

    for (const d of DISCIPLINES) {
      const el = rowRefs.current[d.slug];
      if (!el) continue;
      gsap.to(el, {
        x: 0,
        opacity: 1,
        duration: 0.28,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const handleReplayIntro = () => {
    if (isTransitioningRef.current) return;
    playClick();
    hideCursorPreview(true);
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
  const previewDiscipline =
    getDisciplineBySlug(hoveredDisciplineSlug) ?? DISCIPLINES[0];
  const lightboxDisciplineIndex =
    activeDiscipline?.index ??
    (lightboxState
      ? DISCIPLINES.find((d) =>
          d.builds.some((b) => b.id === lightboxState.build.id)
        )?.index ?? "01"
      : "01");

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
    if (lenis) lenis.scrollTo(target, { offset: -72, duration: 0.85, immediate: reducedMotionRef.current });
    else target.scrollIntoView({ behavior: "instant" });
  };

  const handleNavProfile = () => {
    if (!introSettledRef.current || isTransitioningRef.current) return;
    if (viewRef.current === "profile") {
      playClick();
      if (window.location.hash) {
        window.history.replaceState(window.history.state, "", window.location.pathname);
      }
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(0, { duration: 0.85, immediate: reducedMotionRef.current });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      return;
    }
    goToProfile();
  };

  const handleNavWorks = () => {
    if (!introSettledRef.current || isTransitioningRef.current) return;
    if (viewRef.current === "profile") {
      const workEl = document.getElementById("work");
      if (!workEl) return;
      playClick();
      if (window.location.hash !== "#work") {
        window.history.pushState(window.history.state, "", "#work");
      }
      workEl.focus({ preventScroll: true });
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(workEl, {
          offset: -72,
          duration: 0.85,
          immediate: reducedMotionRef.current,
        });
      } else {
        workEl.scrollIntoView({ behavior: "instant" });
      }
      return;
    }
    goToProfile({ targetHash: "#work" });
  };

  const handleNavDisciplines = () => {
    if (!introSettledRef.current || isTransitioningRef.current) return;
    if (viewRef.current === "profile") {
      goToDisciplines();
      return;
    }
    if (viewRef.current === "detail") {
      playClick();
      closeDiscipline();
      return;
    }
    playClick();
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { duration: 0.85, immediate: reducedMotionRef.current });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const handleNavSelect = (id: (typeof NAV_ITEMS)[number]["id"]) => {
    if (id === "profile") handleNavProfile();
    else if (id === "work") handleNavWorks();
    else handleNavDisciplines();
  };

  const navSection: "profile" | "work" | "disciplines" =
    view === "disciplines" || view === "detail"
      ? "disciplines"
      : activeProfileSection === "work"
        ? "work"
        : "profile";

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
          tabIndex={introSettled ? 0 : -1}
          onClick={() => {
            if (viewRef.current !== "profile") {
              goToProfile();
            } else {
              playClick();
              const lenis = lenisRef.current;
              if (lenis) {
                lenis.scrollTo(0, {
                  duration: 0.85,
                  immediate: reducedMotionRef.current,
                });
              } else {
                window.scrollTo({ top: 0, behavior: "instant" });
              }
            }
          }}
          aria-label={
            view !== "profile"
              ? `${AUTHOR_NAME} — return to profile introduction`
              : `${AUTHOR_NAME} — scroll to top`
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

      {/* Persistent Fixed Top Navigation Bar */}
      <header
        ref={topNavBarRef}
        inert={!introSettled}
        className={`fixed top-0 inset-x-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0E0E10]/80 px-6 opacity-0 backdrop-blur-md md:px-12 ${
          introSettled ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <nav aria-label="Primary navigation" className="flex items-center gap-4 sm:gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive = navSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavSelect(item.id)}
                onMouseEnter={playHoverTick}
                aria-current={isActive ? "page" : undefined}
                className={`relative py-1 font-mono text-[10px] sm:text-xs uppercase tracking-[0.12em] whitespace-nowrap transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${
                  isActive
                    ? "text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-zinc-100"
                  />
                )}
              </button>
            );
          })}
        </nav>
        <div aria-hidden="true" className="w-28 sm:w-40 shrink-0" />
      </header>

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

            <WorkShowcase
              onBrowse={() => goToDisciplines()}
              onInspectDiscipline={inspectDisciplineFromProfile}
              onSelect={playClick}
              onHoverTick={playHoverTick}
              onExpandMedia={openLightbox}
            />
          </div>
        )}

        {/* STAGE 2: Scannable Hairline-Divided Disciplines Index (view === "disciplines") */}
        {(view === "disciplines" || view === "detail") && (
          <section
            ref={disciplinesStageRef}
            aria-label="Engineering Disciplines"
            className={
              view === "detail"
                ? "pointer-events-none absolute inset-x-0 top-0 mx-auto w-full max-w-6xl px-6 md:px-12 pt-24 md:pt-28 pb-20 opacity-0 invisible"
                : "relative mx-auto w-full max-w-6xl px-6 md:px-12 pt-24 md:pt-28 pb-20 opacity-0 invisible"
            }
          >
            <div className="relative flex flex-wrap items-baseline justify-between gap-4 pb-5">
              <div
                ref={eyebrowRef}
                className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500"
              >
                01–04 {"//"} Disciplines
              </div>
              <div
                ref={metaRef}
                className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500"
              >
                Click to inspect
              </div>
              <span
                ref={eyebrowBorderRef}
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px origin-left bg-white/10"
              />
            </div>

            <div
              onMouseLeave={handleListLeave}
              onMouseMove={handleListMouseMove}
              className="flex flex-col"
            >
              {DISCIPLINES.map((discipline) => (
                <button
                  key={discipline.slug}
                  ref={(el) => {
                    rowRefs.current[discipline.slug] = el;
                  }}
                  type="button"
                  onClick={() => openDiscipline(discipline.slug)}
                  onMouseEnter={(e) => handleRowEnter(discipline.slug, e)}
                  onFocus={() => handleRowEnter(discipline.slug)}
                  onBlur={handleListLeave}
                  tabIndex={view === "detail" ? -1 : 0}
                  className="group relative w-full text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
                >
                  <div className="overflow-hidden py-5 md:py-6">
                    <div
                      ref={(el) => {
                        rowMaskRefs.current[discipline.slug] = el;
                      }}
                      className="flex items-center justify-between gap-6"
                    >
                      <div
                        ref={(el) => {
                          rowHeaderRefs.current[discipline.slug] = el;
                        }}
                        data-flip-id={`discipline-header-${discipline.slug}`}
                        className="inline-flex items-baseline gap-4 md:gap-7"
                      >
                        <span className="shrink-0 font-mono text-xs md:text-sm tracking-[0.12em] text-zinc-500 transition-colors duration-200 group-hover:text-zinc-300">
                          {discipline.index} /
                        </span>
                        <span className="text-xl md:text-2xl font-medium tracking-tight text-zinc-200 transition-colors duration-200 group-hover:text-[#F4F4F6] leading-snug">
                          {discipline.title}
                        </span>
                      </div>

                      <div
                        ref={(el) => {
                          rowMetaRefs.current[discipline.slug] = el;
                        }}
                        className="flex shrink-0 items-center gap-5 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500"
                      >
                        <span className="hidden sm:inline">
                          {String(discipline.builds.length).padStart(2, "0")}{" "}
                          {discipline.builds.length === 1 ? "BUILD" : "BUILDS"}
                        </span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-zinc-500 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#F4F4F6]"
                        />
                      </div>
                    </div>
                  </div>
                  <span
                    ref={(el) => {
                      rowBorderRefs.current[discipline.slug] = el;
                    }}
                    aria-hidden="true"
                    className="block h-px w-full origin-left bg-white/10"
                  />
                </button>
              ))}
            </div>

            {view === "disciplines" && (
              <div
                ref={previewCardRef}
                aria-hidden="true"
                className="pointer-events-none fixed left-0 top-0 z-30 hidden aspect-[16/10] w-[280px] overflow-hidden rounded border border-white/15 bg-[#141417] opacity-0 shadow-2xl md:block"
              >
                <MediaSurface
                  src={previewDiscipline.previewMedia}
                  alt={`${previewDiscipline.title} preview`}
                  gradient={previewDiscipline.previewGradient}
                  label={previewDiscipline.previewLabel}
                />
              </div>
            )}
          </section>
        )}

        {/* STAGE 3: Full-Width Editorial Case-Study Stream (view === "detail") */}
        {view === "detail" && activeDiscipline && (
          <DetailStream
            discipline={activeDiscipline}
            dockedHeaderRef={dockedHeaderRef}
            drawerRef={drawerRef}
            onBack={() => closeDiscipline()}
            onSelectDiscipline={switchDisciplineInDetail}
            onExpandMedia={openLightbox}
            onClickSound={playClick}
            onHoverTick={playHoverTick}
          />
        )}
      </main>

      {/* Full-Screen Cinema Lightbox Modal */}
      {lightboxState && (
        <CinemaLightbox
          key={`${lightboxState.build.id}-${lightboxState.index}`}
          build={lightboxState.build}
          initialIndex={lightboxState.index}
          disciplineIndex={lightboxDisciplineIndex}
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
