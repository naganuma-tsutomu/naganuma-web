import InteriorPageHeader from "@/components/InteriorPageHeader";
import { createPageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import { connection } from "next/server";
import { WorkspaceGuidePublisher } from "@/components/WorkspaceContext";
import TerminalListing from "@/components/TerminalListing";
import { projectListing } from "@/lib/workspace-listing-data";
import ProjectCard from "@/components/ProjectCard";
import ListPagination from "@/components/ListPagination";
import {
  projects as projectSamples,
  projectsPageHeader,
  projectsPageMessages,
} from "@/app/data/projects";
import { buildProjectEntries } from "@/lib/project-list";
import { getProjectPage } from "@/lib/projects";
import { paginate, sampleContentEnabled } from "@/lib/sample-content";

export const metadata = createPageMetadata({
  title: "PROJECTS",
  description: "制作したプロジェクトの一覧です。",
  path: "/projects",
});

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  await connection();
  const rawPage = (await searchParams).page;
  const showSamples = sampleContentEnabled();
  let projectsUnavailable = false;
  let pagination;
  try {
    pagination = await getProjectPage(rawPage, showSamples);
  } catch (error) {
    console.error("Unable to load projects:", error instanceof Error ? error.message : "Unknown error");
    projectsUnavailable = true;
    pagination = paginate(buildProjectEntries([], projectSamples, {
      includeSamples: showSamples,
      source: "unavailable",
    }), rawPage);
  }
  const { items, page, totalPages } = pagination;
  const listing = projectListing({ entries: items, projectsUnavailable });
  listing.items = listing.items.map(item => ({ ...item, href: item.sample ? item.href.replace("/#", "/projects#") : item.href }));

  return (
    <section className="projects-index site-shell @container/reader" aria-labelledby="projects-index-title">
      <WorkspaceGuidePublisher path="/projects" page={Array.isArray(rawPage) ? rawPage[0] ?? "" : rawPage ?? ""} guide={{ id: `projects-page-${page}`, command: "ls projects/", output: <TerminalListing listing={listing} /> }} projectOutput={<TerminalListing listing={listing} />} />
      <nav className="interior-breadcrumb" aria-label="パンくずリスト">
        <Link href="/">HOME</Link><span aria-hidden="true">/</span><span>PROJECTS</span>
      </nav>

      <InteriorPageHeader title={projectsPageHeader.title} titleId="projects-index-title" kicker={projectsPageHeader.kicker} description={projectsPageHeader.description} meta={projectsPageHeader.sideTagline} />
      {projectsUnavailable ? (
        <p className="border-2 border-[var(--ink)] bg-[#fffdf7] p-7 leading-[1.8]" role="status">{showSamples ? projectsPageMessages.unavailableWithSamples : projectsPageMessages.unavailable}</p>
      ) : items.length === 0 ? (
        <p className="border-2 border-[var(--ink)] bg-[#fffdf7] p-7 leading-[1.8]">{projectsPageMessages.empty}</p>
      ) : null}
      {items.length > 0 && (
        <>
        <div className="grid gap-8 @min-[600px]/reader:grid-cols-2 @min-[800px]/reader:grid-cols-3">
          {items.map(({ project, sample }, index) => (
            <ProjectCard key={`${sample ? "sample" : "project"}-${project.slug}`} project={project} index={index} sample={sample} />
          ))}
        </div>
        <ListPagination path="/projects" page={page} totalPages={totalPages} />
        </>
      )}
    </section>
  );
}
