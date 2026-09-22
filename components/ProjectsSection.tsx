import Link from "next/link";
import ProjectCard from "./ProjectCard";
import {
  projects as projectSamples,
  projectsPageMessages,
} from "@/app/data/projects";
import { buildProjectEntries } from "@/lib/project-list";
import { getProjectList } from "@/lib/projects";
import type { ProjectListSource, ProjectSummary } from "@/lib/project-types";
import { sampleContentEnabled } from "@/lib/sample-content";

export function ProjectsSkeleton() {
  return (
    <div className="projects-grid" aria-busy="true" aria-label="プロジェクト一覧を読み込み中">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="project-card relative h-full font-[family-name:var(--font-shippori-mincho)]"
        >
          {/* Shadow Effect */}
          <div className="absolute top-2 left-2 w-full h-full bg-[var(--ink)]" />

          {/* Main Card Content */}
          <div className="relative bg-[var(--paper)] overflow-hidden border-2 border-[var(--ink)] h-full flex flex-col">
            {/* Browser Header */}
            <div className="flex items-center justify-between gap-2 p-2 bg-[#e9e4d8] border-b-2 border-[var(--ink)]">
              <div className="min-w-0 flex-1 text-left text-sm text-[var(--ink)] font-bold">
                <span className="inline-block w-24 h-3 bg-[#bcc8c9] animate-pulse" />
              </div>
              <div className="flex shrink-0 space-x-1" aria-hidden="true">
                <span className="w-3 h-3 rounded-full border border-[var(--ink)] bg-transparent" />
                <span className="w-3 h-3 rounded-full border border-[var(--ink)] bg-transparent" />
                <span className="w-3 h-3 rounded-full border border-[var(--ink)] bg-transparent" />
              </div>
            </div>

            {/* Image */}
            <div className="relative h-48 bg-[#e9e4d8] border-b-2 border-[var(--ink)] shrink-0 animate-pulse" />

            {/* Text Content */}
            <div className="p-6 flex-grow space-y-3">
              <div className="w-28 h-3 bg-[#e9e4d8] animate-pulse" />
              <div className="w-3/4 h-6 bg-[#bcc8c9] animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="w-full h-3 bg-[#e9e4d8] animate-pulse" />
                <div className="w-5/6 h-3 bg-[#e9e4d8] animate-pulse" />
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
  let projectSource: ProjectListSource | "unavailable" = "unavailable";
  let projectsUnavailable = false;

  try {
    const result = await getProjectList(3);
    projects = result.projects;
    projectSource = result.source;
  } catch (error) {
    console.error("Unable to load projects:", error instanceof Error ? error.message : "Unknown error");
    projectsUnavailable = true;
  }

  const showSamples = sampleContentEnabled();
  const entries = buildProjectEntries(projects, projectSamples, {
    includeSamples: showSamples,
    source: projectSource,
    maxItems: 3,
  });

  return (
    <>
      {projectsUnavailable ? (
        <p className="projects-message" role="status">{showSamples ? projectsPageMessages.unavailableWithSamples : projectsPageMessages.unavailable}</p>
      ) : projects.length === 0 ? (
        <p className="projects-message">{showSamples ? projectsPageMessages.emptyWithSamples : projectsPageMessages.empty}</p>
      ) : null}
      <div className="projects-grid">
        {entries.map(({ project, sample }, index) => (
          <ProjectCard key={`${sample ? "sample" : "project"}-${project.slug}`} project={project} index={index} sample={sample} />
        ))}
      </div>
      {!projectsUnavailable && projects.length > 0 && (
        <Link className="projects-all-link" href="/projects">ALL PROJECTS →</Link>
      )}
    </>
  );
}
