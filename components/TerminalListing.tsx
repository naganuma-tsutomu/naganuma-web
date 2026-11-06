import Link from "next/link";
import type { WorkspaceListing } from "@/lib/workspace-listing";

const dates = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" });
export default function TerminalListing({ listing }: { listing: WorkspaceListing }) {
  return <div className="space-y-4 text-xs leading-[1.8]">
    {listing.message && <p data-command-row>{listing.message}</p>}
    <ul className="m-0 list-none space-y-4 p-0">
      {listing.items.map((item, index) => <li key={`${item.href}-${index}`} data-command-row>
        <Link href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined} className="text-[var(--aqua)] underline underline-offset-4">{item.title}{item.sample ? " [SAMPLE]" : ""} ↗{item.external && <span className="sr-only">（noteの記事を新しいタブで開きます）</span>}</Link>
        {item.description && <p className="mt-1 mb-0 text-[#c4cccc]">{item.description}</p>}
        {item.publishedAt && <time dateTime={item.publishedAt} className="mt-1 block text-[#c4cccc]">{dates.format(new Date(item.publishedAt))}</time>}
        {item.external && <span className="mt-1 block text-[10px] text-[#a5b6b9]">NOTE.COM / EXTERNAL</span>}
        {item.anchor && <Link href={item.anchor} className="mt-1 inline-block text-[#c4cccc] underline underline-offset-4">本文のカードへ ↓</Link>}
      </li>)}
    </ul>
    <Link href={listing.href} className="inline-block text-[var(--aqua)] underline underline-offset-4">{listing.label}</Link>
  </div>;
}
