import { createPageMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-metadata";
import { Suspense } from "react";
import HeroSection from "../components/HeroSection";
import ProjectsSection, { ProjectsSkeleton } from "../components/ProjectsSection";
import NotesSection, { NotesSkeleton } from "../components/NotesSection";
import InteractiveTerminal from "../components/InteractiveTerminal";
import { HomelabProvider } from "../components/HomelabProvider";
import { connection } from "next/server";

export const metadata = createPageMetadata({ title: SITE_NAME, description: SITE_DESCRIPTION, path: "/" });

export default async function Home() {
  // Read server credentials at runtime, including when deployed as a container.
  await connection();

  return (
    <HomelabProvider configured={Boolean(process.env.HOMELAB_PROMETHEUS_URL)}>
      {/* Hero Section */}
      <div className="group/desktop desktop-area">
        <div className="desktop-info site-shell flex h-[26px] items-center gap-[14px] pt-3 font-[family-name:var(--mono)] text-[10px] leading-[1.4] tracking-[0.08em] whitespace-nowrap text-[#526963] max-[768px]:hidden" aria-hidden="true">
          <span className="inline-flex items-center gap-[10px] text-[var(--ink)]">
            <span className="desktop-heading-marker h-[6px] w-[6px] shrink-0 bg-[var(--red)] transition-shadow duration-200 min-[768px]:group-hover/desktop:shadow-[0_0_8px_var(--red)] min-[768px]:group-focus-within/desktop:shadow-[0_0_8px_var(--red)]" aria-hidden="true" />
            <span className="desktop-info-title font-[family-name:var(--mono)] text-[11px] leading-[1.2] font-bold tracking-[0.12em] text-[var(--ink)] transition-colors duration-200 min-[768px]:group-hover/desktop:text-black min-[768px]:group-focus-within/desktop:text-black">DESKTOP</span>
            <span className="font-[family-name:var(--mono)] text-[10px] leading-none tracking-[0.08em] text-[#526963]">01</span>
          </span>
          <span className="h-px flex-1 bg-[#bac4b9]" />
        </div>
        <HeroSection />
      </div>

      <section id="projects" className="group/projects pt-[58px] max-[768px]:pt-[30px] site-shell" aria-labelledby="projects-title">
        <div className="mb-[30px] flex min-h-[34px] items-center gap-[18px] max-[768px]:gap-3">
          <div className="inline-flex shrink-0 items-center gap-[10px] max-[768px]:gap-2">
            <span className="h-[6px] w-[6px] shrink-0 bg-[var(--red)] transition-shadow duration-200 min-[768px]:group-hover/projects:shadow-[0_0_8px_var(--red)] min-[768px]:group-focus-within/projects:shadow-[0_0_8px_var(--red)]" aria-hidden="true" />
            <h2 id="projects-title" className="m-0 font-[family-name:var(--font-oswald),sans-serif] text-[24px] max-[768px]:text-[16px] font-bold leading-[1.2] tracking-[0.12em] text-[var(--ink)] transition-colors duration-200 min-[768px]:group-hover/projects:text-black min-[768px]:group-focus-within/projects:text-black">PROJECTS</h2>
            <span className="font-[family-name:var(--mono)] text-[10px] leading-none tracking-[0.08em] text-[#526963] transition-colors duration-200 min-[768px]:group-hover/projects:text-[var(--teal)] min-[768px]:group-focus-within/projects:text-[var(--teal)]" aria-hidden="true">02</span>
          </div>
          <span className="h-px flex-1 bg-[#bac4b9]" aria-hidden="true" />
          <div className="flex gap-[11px] max-[768px]:gap-[6px]" aria-hidden="true">
            <i className="inline-block h-[19px] w-[19px] max-[768px]:h-[14px] max-[768px]:w-[14px] bg-[var(--ink)]" />
            <i className="inline-block h-[19px] w-[19px] max-[768px]:h-[14px] max-[768px]:w-[14px] bg-[var(--teal)]" />
            <i className="inline-block h-[19px] w-[19px] max-[768px]:h-[14px] max-[768px]:w-[14px] bg-[var(--orange)]" />
            <i className="inline-block h-[19px] w-[19px] max-[768px]:h-[14px] max-[768px]:w-[14px] bg-transparent border border-current" />
          </div>
        </div>
        <Suspense fallback={<ProjectsSkeleton />}>
          <ProjectsSection />
        </Suspense>
      </section>

      <section className="mobile-terminal-section site-shell" aria-label="ターミナル">
        <details className="mobile-terminal-disclosure">
          <summary className="mobile-terminal-summary">
            <span className="mobile-terminal-prompt" aria-hidden="true">&gt;_</span>
            <span><strong>TERMINAL</strong></span>
            <span className="mobile-terminal-indicator" aria-hidden="true" />
          </summary>
          <InteractiveTerminal draggable={false} inputId="mobile-terminal-command-input" />
        </details>
      </section>

      <section id="notes" className="group/notes pt-[76px] pb-3 max-[768px]:pt-[54px] site-shell" aria-labelledby="notes-title">
        <div className="mb-[30px] flex min-h-[34px] items-center gap-[18px] max-[768px]:gap-3">
          <div className="inline-flex shrink-0 items-center gap-[10px] max-[768px]:gap-2">
            <span className="h-[6px] w-[6px] shrink-0 bg-[var(--red)] transition-shadow duration-200 min-[768px]:group-hover/notes:shadow-[0_0_8px_var(--red)] min-[768px]:group-focus-within/notes:shadow-[0_0_8px_var(--red)]" aria-hidden="true" />
            <h2 id="notes-title" className="m-0 font-[family-name:var(--font-oswald),sans-serif] text-[24px] max-[768px]:text-[16px] font-bold leading-[1.2] tracking-[0.12em] text-[var(--ink)] transition-colors duration-200 min-[768px]:group-hover/notes:text-black min-[768px]:group-focus-within/notes:text-black">NOTES</h2>
            <span className="font-[family-name:var(--mono)] text-[10px] leading-none tracking-[0.08em] text-[#526963] transition-colors duration-200 min-[768px]:group-hover/notes:text-[var(--teal)] min-[768px]:group-focus-within/notes:text-[var(--teal)]" aria-hidden="true">03</span>
          </div>
          <span className="h-px flex-1 bg-[#bac4b9]" aria-hidden="true" />
          <span className="font-[family-name:var(--mono)] text-[10px] leading-normal tracking-[0.08em]">LATEST FROM NOTE</span>
        </div>
        <Suspense fallback={<NotesSkeleton />}>
          <NotesSection />
        </Suspense>
      </section>
    </HomelabProvider>
  );
}
