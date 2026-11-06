import Link from "next/link";
import { loadHomeProjects } from "./ProjectsSection";

export default async function HomeProjectGuide() {
  const { entries, projectsUnavailable } = await loadHomeProjects();
  return (
    <div className="space-y-4 text-xs leading-[1.7]">
      {projectsUnavailable && <p>プロジェクトを取得できませんでした。</p>}
      {!projectsUnavailable && entries.length === 0 && <p>公開中のプロジェクトはありません。</p>}
      <ul className="m-0 list-none space-y-4 p-0">
        {entries.map(({ project, sample }) => (
          <li key={project.slug} data-command-row>
            <Link href={sample ? `/#project-${project.slug}` : `/projects/${encodeURIComponent(project.slug)}`} className="text-[var(--aqua)] underline underline-offset-4">
              {project.title}{sample ? " [SAMPLE]" : ""} <span aria-hidden="true">↗</span>
            </Link>
            <p className="mt-1 mb-0 text-[#c4cccc]">{project.description}</p>
            {!sample && <a href={`/#project-${project.slug}`} className="mt-1 inline-block text-[#c4cccc] underline underline-offset-4">本文のカードへ ↓</a>}
          </li>
        ))}
      </ul>
      <Link href="/projects" className="inline-block text-[var(--aqua)] underline underline-offset-4">すべての制作実績 ↗</Link>
    </div>
  );
}
