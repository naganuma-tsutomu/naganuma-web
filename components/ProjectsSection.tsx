import Link from "next/link";
import ProjectCard from "./ProjectCard";
import { projects as projectSamples } from "@/app/data/projects";
import { getProjects } from "@/lib/projects";
import type { ProjectSummary } from "@/lib/project-types";
import { sampleContentEnabled } from "@/lib/sample-content";

export function ProjectsSkeleton() {
  return (
    <div className="projects-grid" aria-busy="true" aria-label="プロジェクト一覧を読み込み中">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="project-card relative h-full"
          style={{ fontFamily: "var(--font-shippori-mincho), serif" }}
        >
          {/* Shadow Effect */}
          <div className="absolute top-2 left-2 w-full h-full bg-black dark:bg-white" />

          {/* Main Card Content */}
          <div className="relative bg-white dark:bg-zinc-800 overflow-hidden border-2 border-black dark:border-white h-full flex flex-col">
            {/* Browser Header */}
            <div className="flex items-center justify-between gap-2 p-2 bg-gray-200 dark:bg-zinc-700 border-b-2 border-black dark:border-white">
              <div className="min-w-0 flex-1 text-left text-sm text-gray-700 dark:text-gray-300 font-bold">
                <span className="inline-block w-24 h-3 bg-gray-300 dark:bg-zinc-600 rounded animate-pulse" />
              </div>
              <div className="flex shrink-0 space-x-1" aria-hidden="true">
                <span className="w-3 h-3 rounded-full border border-black dark:border-white bg-transparent" />
                <span className="w-3 h-3 rounded-full border border-black dark:border-white bg-transparent" />
                <span className="w-3 h-3 rounded-full border border-black dark:border-white bg-transparent" />
              </div>
            </div>

            {/* Image */}
            <div className="relative h-48 bg-gray-200 dark:bg-zinc-700 border-b-2 border-black dark:border-white shrink-0 animate-pulse" />

            {/* Text Content */}
            <div className="p-6 flex-grow space-y-3">
              <div className="w-28 h-3 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
              <div className="w-3/4 h-6 bg-gray-300 dark:bg-zinc-600 rounded animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="w-full h-3 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="w-5/6 h-3 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ProjectsSection() {
  let projects: ProjectSummary[] = [];
  let projectsUnavailable = false;

  try {
    projects = await getProjects(3);
  } catch (error) {
    console.error("Unable to load projects:", error instanceof Error ? error.message : "Unknown error");
    projectsUnavailable = true;
  }

  const showSamples = sampleContentEnabled();
  const samples = showSamples
    ? projectSamples.slice(0, Math.max(0, 3 - projects.length))
    : [];

  return (
    <>
      {projectsUnavailable ? (
        <p className="projects-message" role="status">{showSamples ? "プロジェクトを読み込めませんでした。以下は表示サンプルです。" : "プロジェクトを読み込めませんでした。時間をおいて再度アクセスしてください。"}</p>
      ) : projects.length === 0 ? (
        <p className="projects-message">{showSamples ? "プロジェクトは準備中です。以下は表示サンプルです。" : "プロジェクトは準備中です。"}</p>
      ) : null}
      <div className="projects-grid">
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
        {samples.map((project, index) => (
          <ProjectCard key={`sample-${project.slug}`} project={project} index={projects.length + index} sample />
        ))}
      </div>
      {!projectsUnavailable && projects.length > 0 && (
        <Link className="projects-all-link" href="/projects">ALL PROJECTS →</Link>
      )}
    </>
  );
}
