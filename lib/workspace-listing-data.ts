import "server-only";
import type { WorkspaceListing } from "./workspace-listing";
import type { ProjectSummary } from "./project-types";
import type { NoteArticle, NoteFeed } from "./note-types";
import { notesPageMessages } from "@/app/data/notes";

export function projectListing({ entries, projectsUnavailable }: { entries: Array<{ project: ProjectSummary; sample: boolean }>; projectsUnavailable: boolean }): WorkspaceListing {
  return {
    message: projectsUnavailable ? "プロジェクトを取得できませんでした。" : !entries.length ? "公開中のプロジェクトはありません。" : undefined,
    items: entries.map(({ project, sample }) => ({ title: project.title, href: sample ? `/#project-${project.slug}` : `/projects/${encodeURIComponent(project.slug)}`, description: project.description, sample })),
    href: "/projects", label: "すべての制作実績 ↗",
  };
}

export function noteListing({ articles, samples, noteUnavailable, noteFeed }: { articles: NoteArticle[]; samples: NoteArticle[]; noteUnavailable: boolean; noteFeed: NoteFeed | null }): WorkspaceListing {
  return {
    message: noteUnavailable ? notesPageMessages.unavailable : !articles.length && !samples.length ? noteFeed ? notesPageMessages.emptyDescription : notesPageMessages.unconfiguredDescription : undefined,
    items: [...articles.map(article => ({ title: article.title, href: article.url, publishedAt: article.publishedAt, external: true })), ...samples.map((article, index) => ({ title: article.title, href: `/#note-sample-${index}`, sample: true }))],
    href: "/notes", label: "記事の一覧へ ↗",
  };
}
