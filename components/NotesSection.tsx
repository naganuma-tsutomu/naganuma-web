import NoteCard from "./NoteCard";
import { getNoteFeed } from "@/lib/note";
import type { NoteFeed } from "@/lib/note-types";

export function NotesSkeleton() {
  return (
    <div className="notes-grid" aria-busy="true" aria-label="note記事一覧を読み込み中">
      {Array.from({ length: 3 }).map((_, index) => (
        <article key={index} className="note-card">
          <div className="note-card-link pointer-events-none">
            <div className="note-card-meta">
              <span className="inline-block w-6 h-3 bg-gray-300 dark:bg-zinc-600 rounded animate-pulse" />
              <span className="inline-block w-20 h-3 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
            </div>
            <div className="note-card-thumbnail bg-gray-200 dark:bg-zinc-800 animate-pulse" />
            <div className="my-6 h-6 bg-gray-300 dark:bg-zinc-600 rounded w-4/5 animate-pulse" />
            <div className="space-y-2 mb-6">
              <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-2/3 animate-pulse" />
            </div>
            <div className="note-card-action">
              <span className="inline-block w-24 h-3 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default async function NotesSection() {
  let noteFeed: NoteFeed | null = null;
  let noteUnavailable = false;

  try {
    noteFeed = await getNoteFeed();
  } catch (error) {
    console.error("Unable to load note articles:", error instanceof Error ? error.message : "Unknown error");
    noteUnavailable = true;
  }

  return (
    <>
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
    </>
  );
}
