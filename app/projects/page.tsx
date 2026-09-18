import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import ProjectCard from "@/components/ProjectCard";
import { getProjects } from "@/lib/projects";
import type { ProjectSummary } from "@/lib/project-types";

export const metadata: Metadata = {
  title: "PROJECTS | NAGANUMA",
  description: "制作したプロジェクトの一覧です。",
};

export default async function ProjectsPage() {
  await connection();
  let projects: ProjectSummary[] = [];
  let projectsUnavailable = false;

  try {
    projects = await getProjects();
  } catch (error) {
    console.error("Unable to load projects:", error instanceof Error ? error.message : "Unknown error");
    projectsUnavailable = true;
  }

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
        <p className="projects-message" role="status">プロジェクトを読み込めませんでした。時間をおいて再度アクセスしてください。</p>
      ) : projects.length === 0 ? (
        <p className="projects-message">プロジェクトは準備中です。</p>
      ) : (
        <div className="projects-grid">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
