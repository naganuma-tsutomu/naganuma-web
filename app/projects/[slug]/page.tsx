import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/site-metadata";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { getProject, getProjectPreview } from "@/lib/projects";
import { sanitizeArticle } from "@/lib/article-html";
import { decodeProjectPreviewToken, PROJECT_PREVIEW_COOKIE } from "@/lib/project-preview";

interface Props {
  params: Promise<{ slug: string }>;
}

async function loadProject(slug: string) {
  const token = decodeProjectPreviewToken((await cookies()).get(PROJECT_PREVIEW_COOKIE)?.value);
  const isPreview = token?.contentId === slug;
  const project = isPreview
    ? await getProjectPreview(slug, token.draftKey)
    : await getProject(slug);
  return { project, isPreview };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const { project } = await loadProject(slug);
  if (!project) return { title: "記事が見つかりません", robots: { index: false, follow: false } };
  return createPageMetadata({
    title: project.title,
    description: project.description,
    path: `/projects/${encodeURIComponent(project.slug)}`,
    imageUrl: project.isSample ? undefined : project.imageUrl,
    publishedAt: project.isSample ? undefined : project.publishedAt,
    article: true,
  });
}

export default async function ProjectPage({ params }: Props) {
  await connection();
  const { slug } = await params;
  const { project, isPreview } = await loadProject(slug);
  if (!project) notFound();

  const publishedAt = project.publishedAt ? new Date(project.publishedAt) : null;
  const hasDate = publishedAt && !Number.isNaN(publishedAt.getTime());

  return (
    <div className="project-article-shell site-shell">
      <nav className="article-breadcrumb" aria-label="パンくずリスト">
        <Link href="/projects">PROJECTS</Link><span aria-hidden="true">/</span><span>{project.title}</span>
      </nav>
      <article>
        <header className="article-header">
          <div className="article-meta">
            <span>PROJECT JOURNAL</span>
            {isPreview && <span className="article-sample">PREVIEW</span>}
            {project.isSample && <span className="article-sample">SAMPLE</span>}
            {hasDate && <time dateTime={project.publishedAt}>{new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Tokyo" }).format(publishedAt)}</time>}
          </div>
          <h1>{project.title}</h1>
          <p className="article-description">{project.description}</p>
        </header>
        <div className="article-cover">
          <Image src={project.imageUrl} alt={project.title} fill sizes="(max-width: 767px) calc(100vw - 32px), 920px" priority />
        </div>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: sanitizeArticle(project.content) }} />
      </article>
      <footer className="article-footer"><Link href="/projects">← PROJECTS 一覧へ戻る</Link></footer>
    </div>
  );
}
