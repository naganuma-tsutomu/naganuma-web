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
      <div className="desktop-area">
        <div className="desktop-info site-shell flex h-[26px] items-center gap-[14px] pt-3 font-[family-name:var(--mono)] text-[10px] leading-[1.4] tracking-[0.08em] whitespace-nowrap text-[#526963] max-[768px]:hidden" aria-hidden="true">
          <span className="inline-flex items-center gap-[10px] text-[var(--ink)]">
            <span className="desktop-heading-marker h-[6px] w-[6px] shrink-0 bg-[var(--red)] transition-shadow duration-200" aria-hidden="true" />
            <span className="desktop-info-title font-[family-name:var(--mono)] text-[11px] leading-[1.2] font-bold tracking-[0.12em] text-[var(--ink)] transition-colors duration-200">DESKTOP</span>
            <span className="font-[family-name:var(--mono)] text-[10px] leading-none tracking-[0.08em] text-[#526963]">01</span>
          </span>
          <span className="h-px flex-1 bg-[#bac4b9]" />
        </div>
        <HeroSection />
      </div>

      <section id="projects" className="projects-section site-shell" aria-labelledby="projects-title">
        <div className="section-heading">
          <div className="section-heading-label">
            <span className="section-heading-marker" aria-hidden="true" />
            <h2 id="projects-title">PROJECTS</h2>
            <span className="section-heading-index" aria-hidden="true">02</span>
          </div>
          <span className="section-rule" aria-hidden="true" />
          <div className="section-palette" aria-hidden="true"><i /><i /><i /><i /></div>
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

      <section id="notes" className="notes-section site-shell" aria-labelledby="notes-title">
        <div className="section-heading">
          <div className="section-heading-label">
            <span className="section-heading-marker" aria-hidden="true" />
            <h2 id="notes-title">NOTES</h2>
            <span className="section-heading-index" aria-hidden="true">03</span>
          </div>
          <span className="section-rule" aria-hidden="true" />
          <span className="section-tag">LATEST FROM NOTE</span>
        </div>
        <Suspense fallback={<NotesSkeleton />}>
          <NotesSection />
        </Suspense>
      </section>
    </HomelabProvider>
  );
}
