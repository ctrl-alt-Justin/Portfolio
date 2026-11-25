"use client";

import { useEffect, useRef, useState, type MouseEventHandler } from "react";

const chapters = [
  {
    id: "about-study",
    label: "Computer Engineering",
    title: "Learn how systems fit together.",
    text: "I’m a Computer Engineering student in Metro Manila. I’m drawn to work that crosses the boundary between code and hardware, where a decision in one part of the system changes what’s possible in another.",
  },
  {
    id: "about-acamad",
    label: "Acamad",
    title: "Build things people can use.",
    text: "I’m a Technical Co-Founder and Lead Developer at Acamad. In my software work, I like getting close to the task someone is trying to complete. On a quotation tool, that means thinking about what happens all the way from entering prices to printing the finished document.",
  },
  {
    id: "about-robotics",
    label: "VEX U Robotics",
    title: "Take the design off the screen.",
    text: "I captain a VEX U robotics team. Taking a competition drivetrain from CAD to a physical build is a good reminder that an idea has to hold up once it’s assembled and put to work.",
  },
];

export function AboutSequence({ onNavigate }: { onNavigate: MouseEventHandler<HTMLAnchorElement> }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeChapter, setActiveChapter] = useState(chapters[0].id);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const sections = Array.from(section.querySelectorAll<HTMLElement>(".portfolio-chapter"));
    let frame = 0;
    let currentId = "";

    function update() {
      frame = 0;
      const readingLine = Math.min(window.innerHeight * 0.38, 210);
      const index = sections.findIndex((chapter) => chapter.getBoundingClientRect().bottom > readingLine);
      const id = sections.at(index)?.id;
      if (id && id !== currentId) {
        currentId = id;
        setActiveChapter(id);
      }
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sectionRef} id="about" tabIndex={-1} aria-labelledby="about-title" className="portfolio-home-section portfolio-about">
      <div className="portfolio-about-index">
        <h2 id="about-title">About me</h2>
        <nav aria-label="About chapters">
          <ol className="portfolio-chapter-list">
            {chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <a href={`#${chapter.id}`} aria-current={activeChapter === chapter.id ? "location" : undefined} onClick={onNavigate}>
                  <span aria-hidden="true">0{index + 1}</span>
                  {chapter.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
      <div className="portfolio-chapters">
        {chapters.map((chapter) => (
          <article key={chapter.id} id={chapter.id} tabIndex={-1} className="portfolio-chapter" aria-labelledby={`${chapter.id}-title`}>
            <div className="portfolio-chapter-content">
              <p className="portfolio-annotation">{chapter.label}</p>
              <h3 id={`${chapter.id}-title`}>{chapter.title}</h3>
              <p>{chapter.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
