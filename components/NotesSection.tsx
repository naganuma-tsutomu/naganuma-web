import Link from "next/link";
import NoteCard from "./NoteCard";
import {
  notesPageMessages,
} from "@/app/data/notes";
import { loadHomeNotes } from "@/lib/home-notes";

// The original cards keep their appearance; only their grid follows the reading window's width.
import { notesReaderGrid as homeNotesGrid } from "./readerGridStyles";

export function NotesSkeleton({ narrow = false }: { narrow?: boolean }) {
  return (
    <div className={narrow ? homeNotesGrid : "grid grid-cols-3 border-y-2 border-[var(--ink)] max-[1024px]:grid-cols-1"} aria-busy="true" aria-label="note記事一覧を読み込み中">
      {Array.from({ length: 3 }).map((_, index) => (
        <article key={index} className="note-card min-w-0">
          <div className="flex h-full min-h-[280px] max-[1024px]:min-h-[220px] max-[768px]:min-h-0 flex-col px-[26px] pt-[22px] pb-6 max-[768px]:px-0.5 max-[768px]:pt-5 max-[768px]:pb-[22px] pointer-events-none">
            <div className="flex items-center justify-between gap-4 font-[family-name:var(--mono)] text-[11px] leading-normal tracking-[0.08em]">
              <span className="inline-block w-6 h-3 bg-[var(--border)] animate-pulse" />
              <span className="inline-block w-20 h-3 bg-[#dce5dd] animate-pulse" />
            </div>
            <div className="relative mt-[18px] aspect-[1.91/1] w-full border border-[var(--ink)] bg-[#dce5dd] animate-pulse" />
            <div className="my-6 h-6 bg-[var(--border)] w-4/5 animate-pulse" />
            <div className="space-y-2 mb-6">
              <div className="h-3 bg-[#dce5dd] w-full animate-pulse" />
              <div className="h-3 bg-[#dce5dd] w-2/3 animate-pulse" />
            </div>
            <div className="mt-auto pt-4 font-[family-name:var(--mono)] text-[11px] leading-normal tracking-[0.08em]">
              <span className="inline-block w-24 h-3 bg-[#dce5dd] animate-pulse" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default async function NotesSection({ narrow = false }: { narrow?: boolean }) {
  const { noteFeed, noteUnavailable, articles, samples, showSamples } = await loadHomeNotes();
  const hasCards = articles.length + samples.length > 0;

  return (
    <>
      {noteUnavailable ? (
        <p className="m-0 border-y border-[#b1b5ab] py-[27px] text-[13px] leading-[1.8]" role="status">{showSamples ? notesPageMessages.unavailableWithSamples : notesPageMessages.unavailable}</p>
      ) : articles.length === 0 && showSamples ? (
        <p className="m-0 border-y border-[#b1b5ab] py-[27px] text-[13px] leading-[1.8]">{notesPageMessages.emptyWithSamples}</p>
      ) : null}
      {hasCards ? (
        <div className={narrow ? homeNotesGrid : "grid grid-cols-3 border-y-2 border-[var(--ink)] max-[1024px]:grid-cols-1"}>
          {articles.map((article, index) => (
            <NoteCard key={article.url} article={article} index={index} scrollHighlight />
          ))}
          {samples.map((article, index) => (
            <NoteCard key={`sample-${article.title}`} id={narrow ? `note-sample-${index}` : undefined} article={article} index={articles.length + index} sample scrollHighlight />
          ))}
        </div>
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
      {noteFeed && articles.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
            <a className="m-0 block w-fit border-b border-current pb-1 font-[family-name:var(--mono)] text-[11px] leading-normal tracking-[0.08em] hover:text-[var(--red)]" href={noteFeed.profileUrl} target="_blank" rel="noopener noreferrer">
              ALL POSTS ON NOTE ↗
              <span className="sr-only">（新しいタブで開きます）</span>
            </a>
            <Link className="m-0 block w-fit border-b border-current pb-1 font-[family-name:var(--mono)] text-xs leading-[1.6] no-underline hover:text-[var(--red)]" href="/notes">
              LATEST NOTES →
            </Link>
          </div>
        </>
      ) : null}
    </>
  );
}
