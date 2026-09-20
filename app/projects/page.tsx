import { createPageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import { connection } from "next/server";
import ProjectCard from "@/components/ProjectCard";
import ListPagination from "@/components/ListPagination";
import { projects as projectSamples } from "@/app/data/projects";
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

  return (
    <section className="projects-index site-shell" aria-labelledby="projects-index-title">
      <nav className="interior-breadcrumb" aria-label="パンくずリスト">
        <Link href="/">HOME</Link><span aria-hidden="true">/</span><span>PROJECTS</span>
      </nav>

      <header className="interior-hero projects-index-header">
        <div className="interior-hero-main">
          <span className="interior-kicker">WORK / ARCHIVE</span>
          <h1 id="projects-index-title">PROJECTS<span className="interior-title-period">.</span></h1>
          <p>制作したものや、試してきたことをまとめています。</p>
          <span className="interior-hero-underscore" aria-hidden="true">_</span>
        </div>
        <div className="interior-hero-side">
          <span>SELECTED WORK / FIELD NOTES</span>
          <p>BUILD<br />TEST<br />TWEAK<br />REPEAT.</p>
          <span>PROJECT JOURNAL ↗</span>
        </div>
      </header>
      {projectsUnavailable ? (
        <p className="projects-message" role="status">{showSamples ? "プロジェクトを読み込めませんでした。以下は表示サンプルです。" : "プロジェクトを読み込めませんでした。時間をおいて再度アクセスしてください。"}</p>
      ) : items.length === 0 ? (
        <p className="projects-message">プロジェクトは準備中です。</p>
      ) : null}
      {items.length > 0 && (
        <>
        <div className="projects-grid">
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
