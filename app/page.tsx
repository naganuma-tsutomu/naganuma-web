import { createPageMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-metadata";
import { Suspense, type ReactNode } from "react";
import HeroSection from "../components/HeroSection";
import AboutBaseSection from "../components/AboutBaseSection";
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
      <div className="home-section desktop-area relative flex w-full flex-col justify-start overflow-x-clip pt-8 sm:pt-10 lg:pt-12 pb-4 sm:pb-6">
        <HomeSectionHeading title="DESKTOP" index="01" className="desktop-info w-full px-4 sm:px-8 lg:px-12 xl:px-16 mb-4 sm:mb-6 max-[768px]:hidden" decorative />
        <HeroSection />
      </div>

      <section id="about-base" className="home-section site-shell flex scroll-mt-24 flex-col justify-start pt-8 pb-10 max-[768px]:pt-6 max-[768px]:pb-8" aria-labelledby="about-base-title">
        <HomeSectionHeading
          title="ABOUT THIS BASE"
          index="02"
          id="about-base-title"
          className="mb-[30px]"
          trailing={
            <span className="font-[family-name:var(--mono)] text-[10px] leading-normal tracking-[0.08em] text-[#526963] max-[640px]:hidden">
              DISPATCH &amp; EXPERIMENTAL STATION
            </span>
          }
        />
        <AboutBaseSection />
      </section>

      <section id="projects" className="home-section projects-section site-shell flex scroll-mt-24 flex-col justify-start pt-8 pb-12 max-[768px]:pt-6 max-[768px]:pb-8" aria-labelledby="projects-title">
        <HomeSectionHeading
          title="PROJECTS"
          index="03"
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

      <section id="notes" className="home-section notes-section site-shell flex scroll-mt-24 flex-col justify-start pt-8 pb-16 max-[768px]:pt-6 max-[768px]:pb-10" aria-labelledby="notes-title">
        <HomeSectionHeading
          title="NOTES"
          index="04"
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
