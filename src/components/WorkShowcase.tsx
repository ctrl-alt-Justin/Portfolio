"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { MediaSurface } from "@/components/MediaSurface";
import { DISCIPLINES, isVideoMedia, type ProjectBuild } from "@/data/disciplines";

const featuredProjects = [
  {
    id: "commercial-ecommerce-crm",
    name: "ETJO Aigi",
    title: "ETJO Aigi Trading",
    label: "Commerce & operations",
    summary: "A furniture storefront connected to the same system that tracks inventory, customer relationships, and orders.",
  },
  {
    id: "risse-ai-lms-socratic-rag",
    name: "Risse",
    title: "Risse AI LMS",
    label: "Applied AI & learning",
    summary: "A learning platform with interactive skill trees and a tutor that uses course material to guide students through questions.",
  },
  {
    id: "vex-u-drivetrain-cad-assemblies",
    name: "VEX U",
    title: "VEX U drivetrain",
    label: "CAD & competition robotics",
    summary: "A competition drivetrain developed through parametric CAD, with an eight-motor architecture and custom 3D-printed gearing.",
  },
].flatMap((project) => {
  for (const discipline of DISCIPLINES) {
    const build = discipline.builds.find(({ id }) => id === project.id);
    if (build) return [{ ...project, build, discipline: discipline.slug }];
  }
  return [];
});

const previewDetails: Record<string, { title: string; width: number; height: number }> = {
  "/featured/E-Commerce 1.png": { title: "Storefront", width: 1875, height: 964 },
  "/featured/E-Commerce2.png": { title: "Product catalog", width: 1877, height: 958 },
  "/featured/BackOffice.png": { title: "Back office", width: 1879, height: 966 },
  "/featured/RisseAILMS.png": { title: "Risse sign-in screen", width: 1877, height: 959 },
  "/featured/Drivetrain.png": { title: "Drivetrain CAD render", width: 2048, height: 1536 },
};

function FeaturedCover({ build, media, onSelect }: { build: ProjectBuild; media: string[]; onSelect: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const index = activeIndex < media.length ? activeIndex : 0;
  const preview = media[index];
  if (!preview) return null;

  const { title, width, height } = previewDetails[preview] ?? {
    title: `Project view ${index + 1}`,
    width: 1600,
    height: 900,
  };

  return (
    <figure className="portfolio-featured-cover">
      <div key={preview} className="portfolio-featured-image">
        {isVideoMedia(preview) ? (
          <div className="portfolio-featured-video">
            <MediaSurface src={preview} alt={`${build.title} — ${title}`} gradient={build.mediaGradient} />
          </div>
        ) : (
          <Image src={preview} alt={`${build.title} — ${title}`} width={width} height={height} sizes="(max-width: 880px) 92vw, 60vw" />
        )}
      </div>
      <figcaption>
        {media.length === 1 ? title : (
          <div className="portfolio-featured-views" role="group" aria-label={`${build.title} images`}>
            {media.map((src, position) => (
              <button
                key={src}
                type="button"
                aria-pressed={index === position}
                onClick={() => {
                  if (position === index) return;
                  onSelect();
                  setActiveIndex(position);
                }}
              >
                {previewDetails[src]?.title ?? `View ${position + 1}`}
              </button>
            ))}
          </div>
        )}
      </figcaption>
    </figure>
  );
}

interface WorkShowcaseProps {
  availableMedia: string[];
  onBrowse: () => void;
  onSelect: () => void;
}

export function WorkShowcase({ availableMedia, onBrowse, onSelect }: WorkShowcaseProps) {
  const [projectIndex, setProjectIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const project = featuredProjects[projectIndex];
  if (!project) return null;

  const { build, discipline } = project;
  const media = build.media.filter((src) => availableMedia.includes(src));

  function selectProject(index: number) {
    if (index === projectIndex) return;
    onSelect();
    setProjectIndex(index);
  }

  function handleProjectKey(event: KeyboardEvent<HTMLButtonElement>) {
    const count = featuredProjects.length;
    let index: number;
    switch (event.key) {
      case "ArrowLeft": index = (projectIndex + count - 1) % count; break;
      case "ArrowRight": index = (projectIndex + 1) % count; break;
      case "Home": index = 0; break;
      case "End": index = count - 1; break;
      default: return;
    }
    event.preventDefault();
    selectProject(index);
    tabRefs.current[index]?.focus();
  }

  return (
    <section id="work" tabIndex={-1} aria-labelledby="work-title" className="portfolio-showcase">
      <div className="portfolio-showcase-inner">
        <header className="portfolio-showcase-header">
          <h2 id="work-title">Featured work</h2>
          <div className="portfolio-featured-selector" role="tablist" aria-label="Featured projects">
            {featuredProjects.map((entry, index) => (
              <button
                key={entry.id}
                id={`featured-tab-${entry.id}`}
                ref={(node) => { tabRefs.current[index] = node; }}
                role="tab"
                type="button"
                aria-selected={projectIndex === index}
                aria-controls="featured-project-panel"
                tabIndex={projectIndex === index ? 0 : -1}
                onClick={() => selectProject(index)}
                onKeyDown={handleProjectKey}
              >
                {entry.name}
              </button>
            ))}
          </div>
        </header>

        <div id="featured-project-panel" role="tabpanel" aria-labelledby={`featured-tab-${build.id}`}>
          <article key={build.id} className="portfolio-featured-project" aria-labelledby="featured-project-title">
            <div className="portfolio-featured-copy">
              <p className="portfolio-annotation">{project.label}</p>
              <h3 id="featured-project-title">{project.title}</h3>
              <p className="portfolio-featured-description">{project.summary}</p>
              <a
                className="portfolio-action portfolio-action-primary"
                href={`?view=disciplines&discipline=${discipline}#${build.id}`}
                onClick={onSelect}
              >
                Read case study
              </a>
            </div>
            <FeaturedCover build={build} media={media} onSelect={onSelect} />
            <details className="portfolio-featured-details">
              <summary>How it works</summary>
              <ul className="portfolio-featured-highlights">
                {build.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
              </ul>
              <ul aria-label="Tools and skills" className="portfolio-featured-skills">
                {build.stack.map((skill) => <li key={skill}>{skill}</li>)}
              </ul>
            </details>
          </article>
        </div>

        <div className="portfolio-action-list portfolio-showcase-links">
          <button type="button" onClick={onBrowse} className="portfolio-action">Browse all disciplines</button>
          <a href="mailto:justin.labrador@example.com" onClick={onSelect} className="portfolio-action">Get in touch</a>
        </div>
      </div>
    </section>
  );
}

