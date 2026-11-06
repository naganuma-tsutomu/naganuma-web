import { createPageMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-metadata";
import { connection } from "next/server";
import HeroSection from "@/components/HeroSection";
import AboutBaseSection from "@/components/AboutBaseSection";
import ProjectsSection from "@/components/ProjectsSection";
import NotesSection from "@/components/NotesSection";
import HomeWorkspace from "@/components/HomeWorkspace";
import HomeProjectGuide from "@/components/HomeProjectGuide";
import HomeNoteGuide from "@/components/HomeNoteGuide";
import HomelabStatus from "@/components/HomelabStatus";
import Footer from "@/components/Footer";

export const metadata = createPageMetadata({ title: SITE_NAME, description: SITE_DESCRIPTION, path: "/" });

function HomeSectionHeading({ title, index, id, description }: { title: string; index: string; id: string; description?: string }) {
  if (description) return (
    <div className="section-heading relative mb-[30px]">
      <div className="section-heading-label shrink-0">
        <span className="section-heading-marker transition-shadow duration-300 group-hover/section:shadow-[0_0_8px_var(--red)] group-focus-within/section:shadow-[0_0_8px_var(--red)]" aria-hidden="true" />
        <h2 id={id} className="section-heading-title transition-colors duration-200 group-hover/section:text-[#000] group-focus-within/section:text-[#000]">{title}</h2>
        <span className="section-heading-index transition-colors duration-200 group-hover/section:text-[var(--teal)] group-focus-within/section:text-[var(--teal)]" aria-hidden="true">{index}</span>
      </div>
      <div className="relative h-px flex-1 overflow-hidden bg-[#bac4b9]" aria-hidden="true">
        <span className="absolute inset-0 origin-left scale-x-0 bg-[var(--teal)] transition-transform duration-300 ease-in group-hover/section:scale-x-100 group-hover/section:duration-700 group-hover/section:ease-out group-focus-within/section:scale-x-100 group-focus-within/section:duration-700 group-focus-within/section:ease-out" />
      </div>
      <span className="hidden shrink-0 font-[family-name:var(--mono)] text-[10px] leading-normal tracking-[0.08em] whitespace-nowrap text-[var(--ink)] @min-[600px]/reader:block">{description}</span>
    </div>
  );
  return <div className="mb-7 flex items-center gap-3"><span className="h-1.5 w-1.5 shrink-0 bg-[var(--red)]" aria-hidden="true" /><h2 id={id} className="m-0 font-[family-name:var(--font-oswald),sans-serif] text-xl font-bold tracking-[.06em] @min-[600px]/reader:text-2xl">{title}</h2><span className="font-[family-name:var(--mono)] text-[10px] text-[var(--text-sub)]">{index}</span><span className="h-px flex-1 bg-[#bac4b9]" aria-hidden="true" /></div>;
}

export default async function Home() {
  await connection();
  return <HomeWorkspace projectOutput={<HomeProjectGuide />} noteOutput={<HomeNoteGuide />}>
      <noscript><style>{"[data-workspace] .project-card { opacity: 1 !important; transform: none !important; } [data-workspace] .project-card img { opacity: 1 !important; } [data-workspace] [data-project-image-loading] { display: none !important; }"}</style></noscript>
      <HeroSection />
      <section id="about-base" data-guide-section="about" className="scroll-mt-6 pb-14" aria-labelledby="about-base-title">
        <HomeSectionHeading title="ABOUT" index="01" id="about-base-title" /><AboutBaseSection />
      </section>
      <div id="homelab" data-mobile-status className="mb-14 [[data-layout=split]_&]:hidden print:block" tabIndex={-1} aria-label="ホームラボの稼働状態"><HomelabStatus /></div>
      <section id="projects" data-guide-section="projects" className="group/section scroll-mt-6 pb-14" aria-labelledby="projects-title">
        <HomeSectionHeading title="PROJECTS" index="02" id="projects-title" description="SELECTED WORKS" /><ProjectsSection narrow />
      </section>
      <section id="notes" data-guide-section="notes" className="group/section scroll-mt-6 pb-6" aria-labelledby="notes-title">
        <HomeSectionHeading title="NOTES" index="03" id="notes-title" description="LATEST FROM NOTE" /><NotesSection narrow />
      </section>
      <Footer compact />
    </HomeWorkspace>;
}
