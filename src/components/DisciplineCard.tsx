import type { ProjectBuild } from "@/data/disciplines";

interface DisciplineCardProps {
  build: ProjectBuild;
}

export function DisciplineCard({ build }: DisciplineCardProps) {
  return (
    <article
      data-build-card
      className="group relative rounded-sm border border-white/[0.08] bg-white/[0.02] p-6 md:p-8 backdrop-blur-md transition-colors duration-300 hover:border-white/[0.24] hover:bg-white/[0.035]"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[#71717A]">
          <span className="text-zinc-300">{build.buildLabel}</span>
          <span className="text-white/20">/</span>
          <span>{build.category}</span>
        </div>

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
      </div>

      <h3 className="text-xl md:text-2xl font-medium tracking-[-0.025em] text-[#F4F4F6] transition-colors duration-300 group-hover:text-white">
        {build.title}
      </h3>

      <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-zinc-400">
        {build.description}
      </p>

      <ul className="mt-6 space-y-2.5 border-t border-white/[0.06] pt-5">
        {build.highlights.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 text-[13px] leading-relaxed text-zinc-300/90"
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

      <div className="mt-6 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
        {build.stack.map((tech) => (
          <span
            key={tech}
            className="font-mono text-[11px] tracking-[0.02em] text-zinc-500"
          >
            {tech}
          </span>
        ))}
      </div>
    </article>
  );
}
