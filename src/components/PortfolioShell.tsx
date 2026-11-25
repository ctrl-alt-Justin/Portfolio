"use client";

import Lenis from "lenis";
import { ArrowLeft, ArrowUpRight, RotateCcw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { DisciplineCard } from "@/components/DisciplineCard";
import { DISCIPLINES, getDisciplineBySlug } from "@/data/disciplines";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Flip, gsap } from "@/lib/gsap";

const INTRO_SESSION_KEY = "jal_portfolio_intro_seen";
const AUTHOR_NAME = "Justin A. Labrador";

const UNDOCKED_WRAPPER_CLASS =
  "fixed inset-0 z-40 pointer-events-none flex items-center justify-center px-6";
const DOCKED_WRAPPER_CLASS =
  "fixed inset-x-0 top-0 z-40 pointer-events-none flex items-center justify-end px-6 md:px-12 lg:px-16 py-6 md:py-8";

const UNDOCKED_BRAND_CLASS =
  "text-[clamp(2.25rem,5vw,4.75rem)] font-medium tracking-[-0.04em] text-[#F4F4F6] whitespace-nowrap leading-none";
const DOCKED_BRAND_CLASS =
  "text-sm sm:text-base md:text-lg font-medium tracking-[-0.02em] text-[#F4F4F6] whitespace-nowrap leading-none transition-colors duration-200 hover:text-white";

type PendingTransition =
  | { type: "open"; slug: string }
  | { type: "direct"; slug: string }
  | null;

export function PortfolioShell() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [introSettled, setIntroSettled] = useState(false);

  const { soundEnabled, toggleSound, playKeystroke, playHoverTick, playClick } =
    useSoundEffects();

  const rootRef = useRef<HTMLDivElement>(null);
  const brandWrapperRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLButtonElement>(null);
  const brandTextRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  const eyebrowRef = useRef<HTMLDivElement>(null);
  const eyebrowBorderRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const skillsListRef = useRef<HTMLElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rowMaskRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rowHeaderRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rowMetaRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rowBorderRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const dockedHeaderRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const drawerLeftRef = useRef<HTMLDivElement>(null);
  const drawerRightRef = useRef<HTMLDivElement>(null);

  const lenisRef = useRef<Lenis | null>(null);
  const reducedMotionRef = useRef(false);
  const isIntroRunningRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const activeSlugRef = useRef<string | null>(null);
  const introSettledRef = useRef(false);

  const masterTlRef = useRef<gsap.core.Timeline | null>(null);
  const cursorBlinkRef = useRef<gsap.core.Tween | null>(null);
  const activeFlipRef = useRef<gsap.core.Timeline | null>(null);
  const transitionTlRef = useRef<gsap.core.Timeline | null>(null);

  const pendingFlipStateRef = useRef<Flip.FlipState | null>(null);
  const pendingTransitionRef = useRef<PendingTransition>(null);

  useEffect(() => {
    activeSlugRef.current = activeSlug;
  }, [activeSlug]);

  useEffect(() => {
    introSettledRef.current = introSettled;
  }, [introSettled]);

  const activeDiscipline = getDisciplineBySlug(activeSlug);

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

  const revealSettledIdleImmediate = useCallback(() => {
    applyDockedBrandInstant();
    if (skillsListRef.current) {
      gsap.set(skillsListRef.current, { opacity: 1, visibility: "visible" });
    }
    gsap.set([eyebrowRef.current, metaRef.current, bottomBarRef.current], {
      opacity: 1,
    });
    if (eyebrowBorderRef.current) {
      gsap.set(eyebrowBorderRef.current, { scaleX: 1, opacity: 1 });
    }
    for (const d of DISCIPLINES) {
      const row = rowRefs.current[d.slug];
      const mask = rowMaskRefs.current[d.slug];
      const header = rowHeaderRefs.current[d.slug];
      const meta = rowMetaRefs.current[d.slug];
      const border = rowBorderRefs.current[d.slug];
      if (row) {
        gsap.set(row, {
          opacity: 1,
          x: 0,
          y: 0,
        });
      }
      if (border) {
        gsap.set(border, {
          scaleX: 1,
          opacity: 1,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
        });
      }
      if (mask) gsap.set(mask, { yPercent: 0 });
      if (header) gsap.set(header, { opacity: 1, clearProps: "transform" });
      if (meta) gsap.set(meta, { opacity: 1 });
    }
    lenisRef.current?.start();
    isIntroRunningRef.current = false;
    setIntroSettled(true);
  }, [applyDockedBrandInstant]);

  const finishIntroImmediate = useCallback(() => {
    if (!isIntroRunningRef.current) return;
    cursorBlinkRef.current?.kill();
    cursorBlinkRef.current = null;
    if (cursorRef.current) {
      gsap.killTweensOf(cursorRef.current);
    }
    masterTlRef.current?.progress(1);
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
    revealSettledIdleImmediate();
  }, [revealSettledIdleImmediate]);

  const startIntroChoreography = useCallback(() => {
    cursorBlinkRef.current?.kill();
    if (cursorRef.current) {
      gsap.killTweensOf(cursorRef.current);
    }
    masterTlRef.current?.kill();
    activeFlipRef.current?.kill();
    transitionTlRef.current?.kill();

    if (reducedMotionRef.current) {
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      } catch {
        // Ignore storage access failures
      }
      revealSettledIdleImmediate();
      return;
    }

    isIntroRunningRef.current = true;
    setIntroSettled(false);
    lenisRef.current?.stop();
    lenisRef.current?.scrollTo(0, { immediate: true });

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

    gsap.set([eyebrowRef.current, metaRef.current, bottomBarRef.current], {
      opacity: 0,
    });
    if (eyebrowBorderRef.current) {
      gsap.set(eyebrowBorderRef.current, { scaleX: 0, opacity: 1 });
    }
    // Keep entire disciplines section hidden during Acts 1 and 2
    if (skillsListRef.current) {
      gsap.set(skillsListRef.current, { opacity: 0, visibility: "hidden" });
    }

    const masks: HTMLDivElement[] = [];
    const borders: HTMLSpanElement[] = [];
    for (const d of DISCIPLINES) {
      const row = rowRefs.current[d.slug];
      const mask = rowMaskRefs.current[d.slug];
      const header = rowHeaderRefs.current[d.slug];
      const meta = rowMetaRefs.current[d.slug];
      const border = rowBorderRefs.current[d.slug];
      if (row) {
        gsap.set(row, {
          opacity: 1,
          x: 0,
          y: 0,
        });
      }
      if (border) {
        gsap.set(border, {
          scaleX: 0,
          opacity: 1,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
        });
        borders.push(border);
      }
      if (mask) {
        gsap.set(mask, { yPercent: 100 });
        masks.push(mask);
      }
      if (header) gsap.set(header, { opacity: 1, clearProps: "transform" });
      if (meta) gsap.set(meta, { opacity: 1 });
    }

    cursorBlinkRef.current = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: 0.45,
      repeat: -1,
      yoyo: true,
      ease: "steps(1)",
    });

    const masterTl = gsap.timeline({
      onComplete: () => {
        cursorBlinkRef.current?.kill();
        cursorBlinkRef.current = null;
        isIntroRunningRef.current = false;
        setIntroSettled(true);
        if (brandRef.current) {
          brandRef.current.className = `${DOCKED_BRAND_CLASS} pointer-events-auto cursor-pointer`;
        }
        try {
          sessionStorage.setItem(INTRO_SESSION_KEY, "1");
        } catch {
          // Ignore storage access failures
        }
      },
    });
    masterTlRef.current = masterTl;

    // Act 1: Typewriter + keystroke ASMR + 0.4s dramatic hold
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

    // Act 2: Spatial Flight (GSAP Flip)
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
    });

    // Reserve 0.9s before Act 3 starts (overlaps final 0.2s of the 1.1s Flip flight)
    masterTl.to({}, { duration: 0.9 });

    // Act 3: Reveal disciplines container, draw hairlines left-to-right, and cascade text
    masterTl.add(() => {
      lenisRef.current?.start();
      if (skillsListRef.current) {
        gsap.set(skillsListRef.current, { opacity: 1, visibility: "visible" });
      }
    });
    masterTl.to([eyebrowRef.current, metaRef.current, bottomBarRef.current], {
      opacity: 1,
      duration: 0.55,
      ease: "power2.out",
    });
    if (eyebrowBorderRef.current) {
      masterTl.to(
        eyebrowBorderRef.current,
        {
          scaleX: 1,
          duration: 0.65,
          ease: "power3.out",
        },
        "<"
      );
    }
    masterTl.to(
      masks,
      {
        yPercent: 0,
        duration: 0.85,
        ease: "power4.out",
        stagger: 0.08,
      },
      "<"
    );
    masterTl.to(
      borders,
      {
        scaleX: 1,
        duration: 0.85,
        ease: "power4.out",
        stagger: 0.08,
      },
      "<"
    );
  }, [playKeystroke, revealSettledIdleImmediate]);

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

  // Initial mount choreography (handles reduced motion, sessionStorage, ?discipline=, and fresh intro)
  useLayoutEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const params = new URLSearchParams(window.location.search);
      const urlDiscipline = getDisciplineBySlug(params.get("discipline"));
      let introSeen = false;
      try {
        introSeen = sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
      } catch {
        introSeen = false;
      }

      if (urlDiscipline) {
        applyDockedBrandInstant();
        if (skillsListRef.current) {
          gsap.set(skillsListRef.current, { opacity: 1, visibility: "hidden" });
        }
        gsap.set([eyebrowRef.current, metaRef.current], { opacity: 0 });
        if (eyebrowBorderRef.current) {
          gsap.set(eyebrowBorderRef.current, { scaleX: 1, opacity: 0 });
        }
        gsap.set(bottomBarRef.current, { opacity: 1 });

        for (const d of DISCIPLINES) {
          const row = rowRefs.current[d.slug];
          const mask = rowMaskRefs.current[d.slug];
          const header = rowHeaderRefs.current[d.slug];
          const meta = rowMetaRefs.current[d.slug];
          const border = rowBorderRefs.current[d.slug];
          const isTarget = d.slug === urlDiscipline.slug;
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

        try {
          sessionStorage.setItem(INTRO_SESSION_KEY, "1");
        } catch {
          // Ignore storage access failures
        }

        lenisRef.current?.start();
        setIntroSettled(true);
        pendingTransitionRef.current = {
          type: "direct",
          slug: urlDiscipline.slug,
        };
        setActiveSlug(urlDiscipline.slug);
        return;
      }

      if (reducedMotionRef.current || introSeen) {
        revealSettledIdleImmediate();
        return;
      }

      startIntroChoreography();
    }, rootRef);

    return () => {
      cursorBlinkRef.current?.kill();
      masterTlRef.current?.kill();
      activeFlipRef.current?.kill();
      transitionTlRef.current?.kill();
      ctx.revert();
    };
  }, [
    applyDockedBrandInstant,
    revealSettledIdleImmediate,
    startIntroChoreography,
  ]);

  // Phase C: Open choreography after activeSlug mounts the docked header & drawer
  useLayoutEffect(() => {
    if (!activeSlug) return;
    const pending = pendingTransitionRef.current;
    if (!pending || pending.slug !== activeSlug) return;
    pendingTransitionRef.current = null;

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

    if (pending.type === "direct" || reducedMotionRef.current) {
      if (dockedEl) gsap.set(dockedEl, { opacity: 1, clearProps: "transform" });
      if (drawerEl) gsap.set(drawerEl, { clipPath: "none", opacity: 1 });
      if (leftEl) gsap.set(leftEl, { opacity: 1, y: 0 });
      if (cardEls.length) gsap.set(cardEls, { opacity: 1, y: 0 });
      if (skillsListRef.current) {
        gsap.set(skillsListRef.current, { visibility: "hidden" });
      }
      lenisRef.current?.resize();
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

    // 0.00s - 0.30s: Sibling dismissal & list row cleanup
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
      tl.to(
        clickedRow,
        {
          x: 0,
          duration: 0.2,
          ease: "power2.in",
        },
        0
      );
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
      if (skillsListRef.current) {
        gsap.set(skillsListRef.current, { visibility: "hidden" });
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

    // 0.45s - 1.05s: Editorial Drawer Unfold (clip-path wipe + staggered cards)
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
  }, [activeSlug]);

  const openDiscipline = useCallback(
    (slug: string, options?: { fromPopState?: boolean }) => {
      if (!introSettledRef.current || isTransitioningRef.current) return;
      if (activeSlugRef.current === slug) return;

      const rowHeaderEl = rowHeaderRefs.current[slug];
      if (!rowHeaderEl) return;

      isTransitioningRef.current = true;
      gsap.killTweensOf(Object.values(rowRefs.current).filter(Boolean));
      lenisRef.current?.scrollTo(0, { immediate: true });

      if (!options?.fromPopState) {
        playClick();
        const nextUrl = `${window.location.pathname}?discipline=${encodeURIComponent(slug)}`;
        window.history.pushState({ discipline: slug }, "", nextUrl);
      }

      if (!reducedMotionRef.current) {
        pendingFlipStateRef.current = Flip.getState(rowHeaderEl);
        pendingTransitionRef.current = { type: "open", slug };
      } else {
        pendingTransitionRef.current = { type: "direct", slug };
      }

      setActiveSlug(slug);
    },
    [playClick]
  );

  const closeDiscipline = useCallback(
    (options?: { fromPopState?: boolean }) => {
      const closingSlug = activeSlugRef.current;
      if (!closingSlug || isTransitioningRef.current) return;

      isTransitioningRef.current = true;
      transitionTlRef.current?.kill();
      activeFlipRef.current?.kill();

      if (!options?.fromPopState) {
        window.history.pushState(null, "", window.location.pathname);
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
        revealSettledIdleImmediate();
        setActiveSlug(null);
        isTransitioningRef.current = false;
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

      // Reverse Flip from docked top-left header back into the skill row
      tl.add(() => {
        if (skillsListRef.current) {
          gsap.set(skillsListRef.current, { opacity: 1, visibility: "visible" });
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
      // Keep timeline alive until the 0.72s reverse Flip finishes before onComplete fires
      tl.to({}, { duration: 0.74 }, 0.22);

      // Restore clicked row metadata/border and sibling rows
      if (clickedRow) {
        tl.to(
          clickedRow,
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.35,
            ease: "power2.out",
          },
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
    [revealSettledIdleImmediate]
  );

  // Global skip-intro & Escape / browser popstate listeners
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

      if (
        event.key === "Escape" &&
        activeSlugRef.current &&
        !isTransitioningRef.current
      ) {
        event.preventDefault();
        closeDiscipline();
      }
    };

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const target = getDisciplineBySlug(params.get("discipline"));
      if (target && target.slug !== activeSlugRef.current) {
        openDiscipline(target.slug, { fromPopState: true });
      } else if (!target && activeSlugRef.current) {
        closeDiscipline({ fromPopState: true });
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
  }, [closeDiscipline, finishIntroImmediate, openDiscipline]);

  const handleRowEnter = (hoveredSlug: string) => {
    if (
      !introSettled ||
      activeSlug ||
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
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
        if (border) {
          gsap.to(border, {
            backgroundColor: "rgba(255, 255, 255, 0.28)",
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      } else {
        gsap.to(el, {
          x: 0,
          opacity: 0.35,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
        if (border) {
          gsap.to(border, {
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            duration: 0.3,
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
      activeSlug ||
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
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
      if (border) {
        gsap.to(border, {
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    }
  };

  const handleReplayIntro = () => {
    if (isTransitioningRef.current) return;
    playClick();
    try {
      sessionStorage.removeItem(INTRO_SESSION_KEY);
    } catch {
      // Ignore storage access failures
    }
    if (window.location.search) {
      window.history.pushState(null, "", window.location.pathname);
    }
    setActiveSlug(null);
    startIntroChoreography();
  };

  return (
    <div ref={rootRef} className="relative z-10 min-h-screen w-full">
      {/* Persistent Brand Anchor (Centers in Act 1, Flies to Top-Right in Act 2) */}
      <div ref={brandWrapperRef} className={UNDOCKED_WRAPPER_CLASS}>
        <button
          ref={brandRef}
          type="button"
          data-flip-id="brand-name"
          onClick={() => {
            if (activeSlugRef.current) {
              playClick();
              closeDiscipline();
            }
          }}
          aria-label={
            activeDiscipline
              ? `${AUTHOR_NAME} — return to all disciplines`
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

      {/* Pinned Top-Left Discipline Header (Mounted when Discipline Active for Flip Target) */}
      {activeDiscipline && (
        <header className="fixed top-0 left-0 z-40 max-w-[54vw] sm:max-w-[62vw] px-6 md:px-12 lg:px-16 py-6 md:py-8 pointer-events-none">
          <div
            ref={dockedHeaderRef}
            data-flip-id={`discipline-header-${activeDiscipline.slug}`}
            className="inline-flex items-baseline gap-3 md:gap-4"
          >
            <span className="shrink-0 font-mono text-xs tracking-[0.12em] text-[#71717A]">
              {activeDiscipline.index} /
            </span>
            <span className="truncate text-sm sm:text-base md:text-lg font-medium tracking-[-0.02em] text-[#F4F4F6]">
              {activeDiscipline.title}
            </span>
          </div>
        </header>
      )}

      {/* Main Editorial Stage */}
      <main className="relative mx-auto min-h-screen w-full max-w-[1440px] px-6 md:px-12 lg:px-16">
        {/* Idle Disciplines List (Kept mounted during Phase C for reversible Flip coordinates) */}
        <section
          ref={skillsListRef}
          aria-label="Engineering Disciplines"
          onMouseLeave={handleListLeave}
          className={
            activeDiscipline
              ? "pointer-events-none absolute inset-x-0 top-0 px-6 md:px-12 lg:px-16 pt-28 md:pt-36 pb-24 opacity-0 invisible"
              : "relative pt-28 md:pt-36 pb-24 opacity-0 invisible"
          }
        >
          <div className="relative mb-8 md:mb-12 flex flex-wrap items-center justify-between gap-4 pb-4">
            <div
              ref={eyebrowRef}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#71717A]"
            >
              01–04 {"//"} Core Disciplines
            </div>
            <div
              ref={metaRef}
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500"
            >
              Select a domain to inspect builds
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
                tabIndex={activeDiscipline ? -1 : 0}
                className="group relative w-full py-7 md:py-9 text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
              >
                <div className="overflow-hidden">
                  <div
                    ref={(el) => {
                      rowMaskRefs.current[discipline.slug] = el;
                    }}
                    className="flex flex-col gap-4 lg:flex-row lg:items-baseline lg:justify-between"
                  >
                    <div
                      ref={(el) => {
                        rowHeaderRefs.current[discipline.slug] = el;
                      }}
                      data-flip-id={`discipline-header-${discipline.slug}`}
                      className="inline-flex items-baseline gap-4 md:gap-7"
                    >
                      <span className="shrink-0 font-mono text-xs md:text-sm tracking-[0.12em] text-[#71717A]">
                        {discipline.index} /
                      </span>
                      <span className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-medium tracking-[-0.03em] text-[#F4F4F6] leading-[1.12]">
                        {discipline.title}
                      </span>
                    </div>

                    <div
                      ref={(el) => {
                        rowMetaRefs.current[discipline.slug] = el;
                      }}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-9 md:pl-14 lg:pl-0 lg:justify-end"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {discipline.primaryTags.map((tag) => (
                          <span
                            key={tag}
                            className="border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] tracking-[0.02em] text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-4 w-4 text-[#71717A] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#F4F4F6]"
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

        {/* Active Discipline Editorial Workspace (Phase C Drawer) */}
        {activeDiscipline && (
          <section
            ref={drawerRef}
            aria-label={`${activeDiscipline.title} Case Studies`}
            className="relative pt-28 md:pt-36 pb-24"
          >
            <div className="border-t border-white/[0.08] pt-10 md:pt-12">
              <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
                {/* Left Column (35% width): Back button, Narrative Summary, Full Tech Stack */}
                <div
                  ref={drawerLeftRef}
                  className="lg:w-[35%] lg:shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      closeDiscipline();
                    }}
                    onMouseEnter={playHoverTick}
                    className="group mb-8 inline-flex items-center gap-2.5 border border-white/[0.08] bg-white/[0.02] px-3.5 py-2 font-mono text-xs tracking-[0.06em] text-zinc-300 transition-colors duration-200 hover:border-white/[0.24] hover:bg-white/[0.04] hover:text-white cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                  >
                    <ArrowLeft
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-[#71717A] transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-white"
                    />
                    <span>All Disciplines</span>
                  </button>

                  <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#71717A]">
                    {activeDiscipline.index} {"//"} Discipline Brief
                  </div>

                  <h1 className="mt-3 text-2xl md:text-3xl font-medium tracking-[-0.03em] text-[#F4F4F6] leading-tight">
                    {activeDiscipline.title}
                  </h1>

                  <p className="mt-5 text-sm md:text-[15px] leading-relaxed text-zinc-400">
                    {activeDiscipline.summary}
                  </p>

                  <div className="mt-8 border-t border-white/[0.08] pt-6">
                    <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#71717A]">
                      Core Stack
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeDiscipline.stack.map((tech) => (
                        <span
                          key={tech}
                          className="border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] text-zinc-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column (65% width): Staggered Dark Frosted-Glass Featured Builds */}
                <div
                  ref={drawerRightRef}
                  className="flex-1 lg:w-[65%] space-y-6"
                >
                  <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-[#71717A]">
                    <span>Featured Builds (02)</span>
                    <span>Esc to return</span>
                  </div>

                  {activeDiscipline.builds.map((build) => (
                    <DisciplineCard key={build.id} build={build} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Subtle Fixed Bottom-Left Controls (Replay Intro + Procedural Sound Toggle) */}
      <div
        ref={bottomBarRef}
        className="fixed bottom-6 left-6 md:left-12 lg:left-16 z-40 flex items-center gap-5 opacity-0"
      >
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
          {soundEnabled ? "[ SOUND: ON ]" : "[ SOUND: OFF ]"}
        </button>
      </div>
    </div>
  );
}
