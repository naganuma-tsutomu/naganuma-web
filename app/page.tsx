import { createPageMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-metadata";
import { Suspense, type ReactNode } from "react";
import HeroSection from "../components/HeroSection";
import ProjectsSection, { ProjectsSkeleton } from "../components/ProjectsSection";
import NotesSection, { NotesSkeleton } from "../components/NotesSection";
import InteractiveTerminal from "../components/InteractiveTerminal";
import { HomelabProvider } from "../components/HomelabProvider";
import { connection } from "next/server";

export const metadata = createPageMetadata({ title: SITE_NAME, description: SITE_DESCRIPTION, path: "/" });

interface HomeSectionHeadingProps {
  title: string;
  index: string;
  id?: string;
  className?: string;
  trailing?: ReactNode;
  decorative?: boolean;
}

function HomeSectionHeading({ title, index, id, className = "", trailing, decorative = false }: HomeSectionHeadingProps) {
  return (
    <div className={`section-heading ${className}`} aria-hidden={decorative || undefined}>
      <div className="section-heading-label">
        <span className="section-heading-marker" aria-hidden="true" />
        {id ? <h2 id={id} className="section-heading-title">{title}</h2> : <span className="section-heading-title">{title}</span>}
        <span className="section-heading-index" aria-hidden="true">{index}</span>
      </div>
      <span className="section-rule h-px flex-1 bg-[#bac4b9]" aria-hidden="true" />
      {trailing}
    </div>
  );
}

export default async function Home() {
  // Read server credentials at runtime, including when deployed as a container.
  await connection();

  return (
    <HomelabProvider configured={Boolean(process.env.HOMELAB_PROMETHEUS_URL)}>
      {/* Hero Section */}
      <div className="home-section desktop-area">
        <HomeSectionHeading title="DESKTOP" index="01" className="desktop-info site-shell pt-3 max-[768px]:hidden" decorative />
        <HeroSection />
      </div>

      <section id="projects" className="home-section projects-section site-shell" aria-labelledby="projects-title">
        <HomeSectionHeading
          title="PROJECTS"
          index="02"
          id="projects-title"
          className="mb-[30px]"
          trailing={
            <div className="section-palette" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
          }
        />
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

      <section id="notes" className="home-section notes-section site-shell" aria-labelledby="notes-title">
        <HomeSectionHeading
          title="NOTES"
          index="03"
          id="notes-title"
          className="mb-[30px]"
          trailing={<span className="font-[family-name:var(--mono)] text-[10px] leading-normal tracking-[0.08em]">LATEST FROM NOTE</span>}
        />
        <Suspense fallback={<NotesSkeleton />}>
          <NotesSection />
        </Suspense>
      </section>
    </HomelabProvider>
  );
}
