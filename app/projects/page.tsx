import type { Metadata } from "next";
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
      <header className="projects-index-header">
        <span className="section-tag">WORK / ARCHIVE</span>
        <div className="section-heading">
          <h1 id="projects-index-title">PROJECTS</h1>
          <span className="section-rule" aria-hidden="true" />
          <div className="section-palette" aria-hidden="true"><i /><i /><i /><i /></div>
        </div>
        <p>制作したものや、試してきたことをまとめています。</p>
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
