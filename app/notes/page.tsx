import { createPageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import { connection } from "next/server";
import NoteCard from "@/components/NoteCard";
import ListPagination from "@/components/ListPagination";
import {
  noteSamples,
  notesPageHeader,
  notesPageMessages,
} from "@/app/data/notes";
import { getNoteFeed } from "@/lib/note";
import type { NoteFeed } from "@/lib/note-types";
import { paginate, sampleContentEnabled } from "@/lib/sample-content";

export const metadata = createPageMetadata({
  title: "NOTES",
  description: "noteで執筆した最新記事を最大20件掲載しています。サーバー構築や日々の開発の記録をお届けします。",
  path: "/notes",
});

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  await connection();
  let noteFeed: NoteFeed | null = null;
  let noteUnavailable = false;

  try {
    noteFeed = await getNoteFeed(20);
  } catch (error) {
    console.error("Unable to load note articles:", error instanceof Error ? error.message : "Unknown error");
    noteUnavailable = true;
  }

  const showSamples = sampleContentEnabled();
  const articles = noteFeed?.articles ?? [];
  const entries = [
    ...articles.map(article => ({ article, sample: false })),
    ...(showSamples ? noteSamples.map(article => ({ article, sample: true })) : []),
  ];
  const { items, page, totalPages, startIndex } = paginate(entries, (await searchParams).page);

  return (
    <section className="projects-index site-shell" aria-labelledby="notes-index-title">
      <nav className="interior-breadcrumb" aria-label="パンくずリスト">
        <Link href="/">HOME</Link><span aria-hidden="true">/</span><span>NOTES</span>
      </nav>

      <header className="interior-hero projects-index-header">
        <div className="interior-hero-main">
          <span className="interior-kicker">{notesPageHeader.kicker}</span>
          <h1 id="notes-index-title">{notesPageHeader.title}<span className="interior-title-period">.</span></h1>
          <p>{notesPageHeader.description}</p>
          <span className="interior-hero-underscore" aria-hidden="true">_</span>
        </div>
        <div className="interior-hero-side">
          <span>{notesPageHeader.sideTagline}</span>
          <p>{notesPageHeader.sideMotto.map((word, index) => (
            <span key={word}>{word}{index < notesPageHeader.sideMotto.length - 1 && <br />}</span>
          ))}</p>
          {noteFeed?.profileUrl ? (
            <a
              href={noteFeed.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {notesPageHeader.sideLinkText}
            </a>
          ) : (
            <span>{notesPageHeader.sideFallbackLabel}</span>
          )}
        </div>
      </header>

      {noteUnavailable ? (
        <p className="notes-message" role="status">{showSamples ? notesPageMessages.unavailableWithSamples : notesPageMessages.unavailable}</p>
      ) : null}
      {entries.length > 0 ? (
        <>
        <div className="notes-grid">
          {items.map(({ article, sample }, index) => (
            <NoteCard key={sample ? `sample-${article.title}` : article.url} article={article} index={startIndex + index} sample={sample} />
          ))}
        </div>
        <ListPagination path="/notes" page={page} totalPages={totalPages} />
        </>
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
    </section>
  );
}
