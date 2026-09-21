import Link from "next/link";
import NoteCard from "./NoteCard";
import {
  noteSamples,
  notesPageMessages,
} from "@/app/data/notes";
import { getNoteFeed } from "@/lib/note";
import type { NoteFeed } from "@/lib/note-types";
import { sampleContentEnabled } from "@/lib/sample-content";

export function NotesSkeleton() {
  return (
    <div className="notes-grid" aria-busy="true" aria-label="note記事一覧を読み込み中">
      {Array.from({ length: 3 }).map((_, index) => (
        <article key={index} className="note-card">
          <div className="note-card-link pointer-events-none">
            <div className="note-card-meta">
              <span className="inline-block w-6 h-3 bg-gray-300 rounded animate-pulse" />
              <span className="inline-block w-20 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="note-card-thumbnail bg-gray-200 animate-pulse" />
            <div className="my-6 h-6 bg-gray-300 rounded w-4/5 animate-pulse" />
            <div className="space-y-2 mb-6">
              <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
            <div className="note-card-action">
              <span className="inline-block w-24 h-3 bg-gray-200 rounded animate-pulse" />
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

  const articles = noteFeed?.articles ?? [];
  const showSamples = sampleContentEnabled();
  const samples = showSamples ? noteSamples.slice(0, Math.max(0, 3 - articles.length)) : [];
  const hasCards = articles.length + samples.length > 0;

  return (
    <>
      {noteUnavailable ? (
        <p className="notes-message" role="status">{showSamples ? notesPageMessages.unavailableWithSamples : notesPageMessages.unavailable}</p>
      ) : articles.length === 0 && showSamples ? (
        <p className="notes-message">{notesPageMessages.emptyWithSamples}</p>
      ) : null}
      {hasCards ? (
        <div className="notes-grid">
          {articles.map((article, index) => (
            <NoteCard key={article.url} article={article} index={index} scrollHighlight />
          ))}
          {samples.map((article, index) => (
            <NoteCard key={`sample-${article.title}`} article={article} index={articles.length + index} sample scrollHighlight />
          ))}
        </div>
      ) : !noteUnavailable ? (
        <div className="notes-placeholder">
          <span className="notes-symbol" aria-hidden="true">&gt;_</span>
          <div>
            <h3>{noteFeed ? notesPageMessages.emptyTitle : notesPageMessages.unconfiguredTitle}</h3>
            <p>{noteFeed ? notesPageMessages.emptyDescription : notesPageMessages.unconfiguredDescription}</p>
          </div>
          <span className="section-tag">{noteFeed ? notesPageMessages.emptyTag : notesPageMessages.unconfiguredTag}</span>
        </div>
      ) : null}
      {noteFeed && articles.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
            <a className="notes-profile-link !m-0" href={noteFeed.profileUrl} target="_blank" rel="noopener noreferrer">
              ALL POSTS ON NOTE ↗
            </a>
            <Link className="projects-all-link !m-0" href="/notes">
              LATEST NOTES →
            </Link>
          </div>
        </>
      ) : null}
    </>
  );
}
