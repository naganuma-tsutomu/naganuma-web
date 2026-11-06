import InteriorPageHeader from "@/components/InteriorPageHeader";
import { createPageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import { connection } from "next/server";
import { WorkspaceGuidePublisher } from "@/components/WorkspaceContext";
import TerminalListing from "@/components/TerminalListing";
import { noteListing } from "@/lib/workspace-listing-data";
import { notesReaderGrid } from "@/components/readerGridStyles";
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
  const rawPage = (await searchParams).page;
  const { items, page, totalPages, startIndex } = paginate(entries, rawPage);
  const listing = noteListing({ articles: items.filter(item => !item.sample).map(item => item.article), samples: items.filter(item => item.sample).map(item => item.article), noteUnavailable, noteFeed });
  listing.items = listing.items.map((item, index) => ({ ...item, href: item.sample ? `/notes#note-sample-${startIndex + index}` : item.href }));

  return (
    <section className="projects-index site-shell @container/reader" aria-labelledby="notes-index-title">
      <WorkspaceGuidePublisher path="/notes" page={Array.isArray(rawPage) ? rawPage[0] ?? "" : rawPage ?? ""} guide={{ id: `notes-page-${page}`, command: "ls notes/", output: <TerminalListing listing={listing} /> }} noteOutput={<TerminalListing listing={listing} />} />
      <nav className="interior-breadcrumb" aria-label="パンくずリスト">
        <Link href="/">HOME</Link><span aria-hidden="true">/</span><span>NOTES</span>
      </nav>

      <InteriorPageHeader title={notesPageHeader.title} titleId="notes-index-title" kicker={notesPageHeader.kicker} description={notesPageHeader.description} meta={notesPageHeader.sideTagline} action={noteFeed?.profileUrl ? { href: noteFeed.profileUrl, label: notesPageHeader.sideLinkText } : undefined} />

      {noteUnavailable ? (
        <p className="m-0 border-y border-[#b1b5ab] py-[27px] text-[13px] leading-[1.8]" role="status">{showSamples ? notesPageMessages.unavailableWithSamples : notesPageMessages.unavailable}</p>
      ) : null}
      {entries.length > 0 ? (
        <>
        <div className={notesReaderGrid}>
          {items.map(({ article, sample }, index) => (
            <NoteCard id={sample ? `note-sample-${startIndex + index}` : undefined} key={sample ? `sample-${article.title}` : article.url} article={article} index={startIndex + index} sample={sample} />
          ))}
        </div>
        <ListPagination path="/notes" page={page} totalPages={totalPages} />
        </>
      ) : !noteUnavailable ? (
        <div className="flex items-center gap-6 border-y border-[#b1b5ab] py-[27px] max-[768px]:gap-4">
          <span className="font-[family-name:var(--mono)] text-[34px] text-[var(--teal)]" aria-hidden="true">&gt;_</span>
          <div>
            <h3 className="m-0 mb-2 font-[family-name:var(--font-oswald),var(--font-shippori-mincho),sans-serif] text-[19px] font-bold">{noteFeed ? notesPageMessages.emptyTitle : notesPageMessages.unconfiguredTitle}</h3>
            <p className="m-0 text-[13px] leading-[1.8] text-[var(--text-sub)]">{noteFeed ? notesPageMessages.emptyDescription : notesPageMessages.unconfiguredDescription}</p>
          </div>
          <span className="ml-auto font-[family-name:var(--mono)] text-[10px] leading-normal tracking-[0.08em] whitespace-nowrap max-[768px]:hidden">{noteFeed ? notesPageMessages.emptyTag : notesPageMessages.unconfiguredTag}</span>
        </div>
      ) : null}
    </section>
  );
}
