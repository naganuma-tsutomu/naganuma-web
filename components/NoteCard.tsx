import Image from "next/image";
import type { NoteArticle } from "@/lib/note-types";

interface NoteCardProps {
  article: NoteArticle;
  index: number;
}

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export default function NoteCard({ article, index }: NoteCardProps) {
  const date = article.publishedAt ? dateFormatter.format(new Date(article.publishedAt)) : null;

  return (
    <article className="note-card">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="note-card-link">
        <div className="note-card-meta">
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          {date ? <time dateTime={article.publishedAt ?? undefined}>{date}</time> : null}
        </div>
        {article.thumbnailUrl ? (
          <div className="note-card-thumbnail">
            <Image
              src={article.thumbnailUrl}
              alt=""
              fill
              sizes="(max-width: 767px) calc(100vw - 36px), (max-width: 1023px) calc(100vw - 100px), 30vw"
            />
          </div>
        ) : null}
        <h3>{article.title}</h3>
        {article.description ? <p>{article.description}</p> : null}
        <span className="note-card-action" aria-hidden="true">READ ON NOTE ↗</span>
      </a>
    </article>
  );
}
