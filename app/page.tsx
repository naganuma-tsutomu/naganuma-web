import { Suspense } from "react";
import HeroSection from "../components/HeroSection";
import ProjectsSection, { ProjectsSkeleton } from "../components/ProjectsSection";
import NotesSection, { NotesSkeleton } from "../components/NotesSection";
import InteractiveTerminal from "../components/InteractiveTerminal";
import { connection } from "next/server";

export default async function Home() {
  // Read server credentials at runtime, including when deployed as a container.
  await connection();

  return (
    <>
      {/* Hero Section */}
      <div className="desktop-area">
        <div className="desktop-info site-shell" aria-hidden="true">
          <span className="desktop-info-label">
            <span className="desktop-heading-marker" aria-hidden="true" />
            <span className="desktop-info-title">DESKTOP</span>
            <span className="desktop-info-index">01</span>
          </span>
          <span className="desktop-info-rule" />
        </div>
        <HeroSection homelabConfigured={Boolean(process.env.HOMELAB_PROMETHEUS_URL)} />
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
    </>
  );
}
