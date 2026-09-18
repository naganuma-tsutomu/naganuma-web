import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import ProjectCard from "@/components/ProjectCard";
import ListPagination from "@/components/ListPagination";
import { projects as projectSamples } from "@/app/data/projects";
import { getProjects } from "@/lib/projects";
import type { ProjectSummary } from "@/lib/project-types";
import { paginate, sampleContentEnabled } from "@/lib/sample-content";

export const metadata: Metadata = {
  title: "PROJECTS | NAGANUMA",
  description: "制作したプロジェクトの一覧です。",
};

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  await connection();
  let projects: ProjectSummary[] = [];
  let projectsUnavailable = false;

  try {
    projects = await getProjects();
  } catch (error) {
    console.error("Unable to load projects:", error instanceof Error ? error.message : "Unknown error");
    projectsUnavailable = true;
  }

  const showSamples = sampleContentEnabled();
  const entries = [
    ...projects.map(project => ({ project, sample: false })),
    ...(showSamples ? projectSamples.map(project => ({ project, sample: true })) : []),
  ];
  const { items, page, totalPages } = paginate(entries, (await searchParams).page);

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
      ) : entries.length === 0 ? (
        <p className="projects-message">プロジェクトは準備中です。</p>
      ) : null}
      {entries.length > 0 && (
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
