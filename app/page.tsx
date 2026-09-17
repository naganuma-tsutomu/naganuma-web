import HeroSection from "../components/HeroSection";
import ProjectCard from "../components/ProjectCard";
import Link from "next/link";
import { connection } from "next/server";
import { getProjects } from "@/lib/projects";
import type { ProjectSummary } from "@/lib/project-types";
import { getNoteFeed } from "@/lib/note";
import type { NoteFeed } from "@/lib/note-types";
import NoteCard from "@/components/NoteCard";

export default async function Home() {
  // Read server credentials at runtime, including when deployed as a container.
  await connection();
  let projects: ProjectSummary[] = [];
  let noteFeed: NoteFeed | null = null;
  let projectsUnavailable = false;
  let noteUnavailable = false;
  const [projectsResult, noteResult] = await Promise.allSettled([
    getProjects(3),
    getNoteFeed(),
  ]);
  if (projectsResult.status === "fulfilled") {
    projects = projectsResult.value;
  } else {
    console.error("Unable to load projects:", projectsResult.reason instanceof Error ? projectsResult.reason.message : "Unknown error");
    projectsUnavailable = true;
  }
  if (noteResult.status === "fulfilled") {
    noteFeed = noteResult.value;
  } else {
    console.error("Unable to load note articles:", noteResult.reason instanceof Error ? noteResult.reason.message : "Unknown error");
    noteUnavailable = true;
  }
  return (
    <>
      {/* Hero Section */}
      <HeroSection homelabConfigured={Boolean(process.env.HOMELAB_PROMETHEUS_URL)} />

      <section id="projects" className="projects-section site-shell" aria-labelledby="projects-title">
        <div className="section-heading">
          <h2 id="projects-title">PROJECTS</h2>
          <span className="section-rule" aria-hidden="true" />
          <div className="section-palette" aria-hidden="true"><i /><i /><i /><i /></div>
        </div>
        {projectsUnavailable ? (
          <p className="projects-message" role="status">プロジェクトを読み込めませんでした。時間をおいて再度アクセスしてください。</p>
        ) : projects.length === 0 ? (
          <p className="projects-message">プロジェクトは準備中です。</p>
        ) : null}
        <div className="projects-grid">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
        {!projectsUnavailable && projects.length > 0 && (
          <Link className="projects-all-link" href="/projects">ALL PROJECTS →</Link>
        )}
      </section>
      <section id="notes" className="notes-section site-shell" aria-labelledby="notes-title">
        <div className="section-heading">
          <h2 id="notes-title">BLOG</h2><span className="section-rule" aria-hidden="true" />
          <span className="section-tag">LATEST FROM NOTE</span>
        </div>
        {noteUnavailable ? (
          <p className="notes-message" role="status">noteの記事を読み込めませんでした。時間をおいて再度アクセスしてください。</p>
        ) : noteFeed?.articles.length ? (
          <>
            <div className="notes-grid">
              {noteFeed.articles.map((article, index) => (
                <NoteCard key={article.url} article={article} index={index} />
              ))}
            </div>
            <a className="notes-profile-link" href={noteFeed.profileUrl} target="_blank" rel="noopener noreferrer">
              ALL POSTS ON NOTE ↗
            </a>
          </>
        ) : (
          <div className="notes-placeholder">
            <span className="notes-symbol" aria-hidden="true">&gt;_</span>
            <div>
              <h3>{noteFeed ? "RSSに記事はまだありません。" : "つくったこと、試したこと。"}</h3>
              <p>{noteFeed ? "noteから記事が配信されると、ここに最新記事が表示されます。" : "サーバー構築や開発の記録を、noteからお届けします。"}</p>
            </div>
            <span className="section-tag">{noteFeed ? "WAITING FOR POSTS" : "READY TO CONNECT"}</span>
          </div>
        )}
      </section>
    </>
  );
}
