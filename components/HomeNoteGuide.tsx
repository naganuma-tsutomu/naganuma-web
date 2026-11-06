import Link from "next/link";
import { loadHomeNotes } from "@/lib/home-notes";
import { notesPageMessages } from "@/app/data/notes";

const dates = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" });

export default async function HomeNoteGuide() {
  const { noteFeed, noteUnavailable, articles, samples } = await loadHomeNotes();
  return <div className="space-y-4 text-xs leading-[1.8]">
    {noteUnavailable ? <p>{notesPageMessages.unavailable}</p> : !articles.length && !samples.length ? <p>{noteFeed ? notesPageMessages.emptyDescription : notesPageMessages.unconfiguredDescription}</p> : null}
    <ul className="m-0 list-none space-y-4 p-0">
      {articles.map(article => <li key={article.url} data-command-row><a href={article.url} target="_blank" rel="noopener noreferrer" className="text-[var(--aqua)] underline underline-offset-4">{article.title} ↗<span className="sr-only">（noteの記事を新しいタブで開きます）</span></a>{article.publishedAt && <time dateTime={article.publishedAt} className="mt-1 block text-[#c4cccc]">{dates.format(new Date(article.publishedAt))}</time>}<span className="mt-1 block text-[10px] text-[#a5b6b9]">NOTE.COM / EXTERNAL</span></li>)}
      {samples.map((article, index) => <li key={article.title} data-command-row><a href={`/#note-sample-${index}`} className="text-[var(--aqua)] underline underline-offset-4">{article.title} [SAMPLE] ↓</a></li>)}
    </ul>
    <Link href="/#notes" className="inline-block text-[var(--aqua)] underline underline-offset-4">本文の記事一覧へ ↓</Link>
  </div>;
}
