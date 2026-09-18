import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import NoteCard from "@/components/NoteCard";
import ListPagination from "@/components/ListPagination";
import { noteSamples } from "@/app/data/note-samples";
import { getNoteFeed } from "@/lib/note";
import type { NoteFeed } from "@/lib/note-types";
import { paginate, sampleContentEnabled } from "@/lib/sample-content";

export const metadata: Metadata = {
  title: "NOTES | NAGANUMA",
  description: "noteで執筆した最新記事を最大20件掲載しています。サーバー構築や日々の開発の記録をお届けします。",
};

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
          <span className="interior-kicker">ARTICLES / NOTE</span>
          <h1 id="notes-index-title">NOTES<span className="interior-title-period">.</span></h1>
          <p>つくったこと、試したこと。noteの最新記事を最大20件掲載しています。</p>
          <span className="interior-hero-underscore" aria-hidden="true">_</span>
        </div>
        <div className="interior-hero-side">
          <span>LATEST FROM NOTE / FIELD LOG</span>
          <p>READ<br />LEARN<br />WRITE<br />SHARE.</p>
          {noteFeed?.profileUrl ? (
            <a
              href={noteFeed.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              ALL POSTS ON NOTE ↗
            </a>
          ) : (
            <span>NOTE JOURNAL ↗</span>
          )}
        </div>
      </header>

      {noteUnavailable ? (
        <p className="notes-message" role="status">{showSamples ? "noteの記事を読み込めませんでした。以下は表示サンプルです。" : "noteの記事を読み込めませんでした。時間をおいて再度アクセスしてください。"}</p>
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
            <h3>{noteFeed ? "RSSに記事はまだありません。" : "つくったこと、試したこと。"}</h3>
            <p>{noteFeed ? "noteから記事が配信されると、ここに最新記事が表示されます。" : "サーバー構築や開発の記録を、noteからお届けします。"}</p>
          </div>
          <span className="section-tag">{noteFeed ? "WAITING FOR POSTS" : "READY TO CONNECT"}</span>
        </div>
      ) : null}
    </section>
  );
}
