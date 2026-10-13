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

function HomeSectionHeading({
  title,
  index,
  id,
  className = "",
  trailing,
  decorative = false,
}: HomeSectionHeadingProps) {
  return (
    <div className={`section-heading relative ${className}`} aria-hidden={decorative || undefined}>
      <div className="section-heading-label shrink-0">
        <div className="relative flex items-center">
          {/* 左端から突き抜けてくるライン（エリアホバーで静かに深みのある色へ） */}
          <span
            className="pointer-events-none absolute right-full mr-2.5 h-px w-[100vw] bg-[#bac4b9] transition-colors duration-500 ease-out group-hover/section:bg-[#8ea49d] group-focus-within/section:bg-[#8ea49d] max-[768px]:hidden"
            aria-hidden="true"
          />
          <span
            className="section-heading-marker transition-shadow duration-300 group-hover/section:shadow-[0_0_8px_var(--red)] group-focus-within/section:shadow-[0_0_8px_var(--red)]"
            aria-hidden="true"
          />
        </div>
        {id ? (
          <h2 id={id} className="section-heading-title transition-colors duration-200 group-hover/section:text-[#000] group-focus-within/section:text-[#000]">
            {title}
          </h2>
        ) : (
          <span className="section-heading-title transition-colors duration-200 group-hover/section:text-[#000] group-focus-within/section:text-[#000]">
            {title}
          </span>
        )}
        <span
          className="section-heading-index transition-colors duration-200 group-hover/section:text-[var(--teal)] group-focus-within/section:text-[var(--teal)]"
          aria-hidden="true"
        >
          {index}
        </span>
      </div>

      {/* 中央の線（エリアホバー時に左から右へスーッと1本静かに走る慎重で上品なアクセントライン） */}
      <div className="relative h-px flex-1 bg-[#bac4b9] overflow-hidden" aria-hidden="true">
        <span className="absolute inset-0 origin-left scale-x-0 bg-[var(--teal)] transition-transform duration-300 ease-in group-hover/section:scale-x-100 group-hover/section:duration-700 group-hover/section:ease-out group-focus-within/section:scale-x-100 group-focus-within/section:duration-700 group-focus-within/section:ease-out" />
      </div>

      {trailing}

      {/* 右端の延長ライン（エリアホバーで静かに深みのある色へ） */}
      <span
        className="pointer-events-none -mr-[100vw] h-px w-[100vw] shrink-0 bg-[#bac4b9] transition-colors duration-500 ease-out group-hover/section:bg-[#8ea49d] group-focus-within/section:bg-[#8ea49d] max-[768px]:hidden"
        aria-hidden="true"
      />
    </div>
  );
}

export default async function Home() {
  // Read server credentials at runtime, including when deployed as a container.
  await connection();

  return (
    <HomelabProvider configured={Boolean(process.env.HOMELAB_PROMETHEUS_URL)}>
      {/* Hero Section */}
      <div className="home-section desktop-area group/section relative flex w-full flex-col justify-start overflow-x-clip pt-8 sm:pt-10 lg:pt-12 pb-4 sm:pb-6">
        <div className="site-shell">
          <HomeSectionHeading
            title="DESKTOP"
            index="01"
            className="desktop-info mb-4 sm:mb-6"
            decorative
          />
        </div>
        <HeroSection />
      </div>

      <section id="about-base" className="home-section group/section flex w-full scroll-mt-24 flex-col justify-start overflow-x-clip pt-8 pb-10 max-[768px]:pt-6 max-[768px]:pb-8" aria-labelledby="about-base-title">
        <div className="site-shell">
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
        </div>
      </section>

      <section id="projects" className="home-section projects-section group/section flex w-full scroll-mt-24 flex-col justify-start overflow-x-clip pt-8 pb-12 max-[768px]:pt-6 max-[768px]:pb-8" aria-labelledby="projects-title">
        <div className="site-shell">
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
        </div>
      </section>

      <section className="mobile-terminal-section site-shell" aria-label="ターミナル">
        <details className="mobile-terminal-disclosure group">
          <summary className="mobile-terminal-summary flex min-h-[70px] cursor-pointer list-none items-center gap-[14px] border-2 border-[var(--ink)] bg-[var(--teal)] px-[15px] py-3 text-[var(--paper)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--red)] [&::-webkit-details-marker]:hidden">
            <span className="mobile-terminal-prompt font-[family-name:var(--mono)] text-2xl font-bold leading-none text-[var(--aqua)]" aria-hidden="true">&gt;_</span>
            <span><strong className="font-[family-name:var(--mono)] text-sm tracking-[0.08em]">TERMINAL</strong></span>
            <span className="mobile-terminal-indicator ml-auto h-[9px] w-[9px] rotate-45 border-r-2 border-b-2 border-[var(--aqua)] transition-transform group-open:rotate-225" aria-hidden="true" />
          </summary>
          <InteractiveTerminal draggable={false} inputId="mobile-terminal-command-input" />
        </details>
      </section>

      <section id="notes" className="home-section notes-section group/section flex w-full scroll-mt-24 flex-col justify-start overflow-x-clip pt-8 pb-16 max-[768px]:pt-6 max-[768px]:pb-10" aria-labelledby="notes-title">
        <div className="site-shell">
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
        </div>
      </section>
    </HomelabProvider>
  );
}
