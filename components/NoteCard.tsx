"use client";

import Image from "next/image";
import { useRef } from "react";
import { useInView } from "@/lib/useInView";
import type { NoteArticle } from "@/lib/note-types";

interface NoteCardProps {
  article: NoteArticle;
  index: number;
  sample?: boolean;
  scrollHighlight?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export default function NoteCard({ article, index, sample = false, scrollHighlight = false }: NoteCardProps) {
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(thumbnailRef, { amount: 0.7 });
  const date = article.publishedAt ? dateFormatter.format(new Date(article.publishedAt)) : null;

  const content = (
    <>
      <div className="note-card-meta">
        <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        {sample ? <span>SAMPLE</span> : date ? <time dateTime={article.publishedAt ?? undefined}>{date}</time> : null}
      </div>
      {article.thumbnailUrl || sample ? (
        <div ref={thumbnailRef} className="note-card-thumbnail-view">
          {article.thumbnailUrl ? (
            <div className="note-card-thumbnail">
              <Image
                src={article.thumbnailUrl}
                alt=""
                fill
                sizes="(max-width: 767px) calc(100vw - 36px), (max-width: 1023px) calc(100vw - 100px), 30vw"
              />
            </div>
          ) : (
            <div className={`note-card-thumbnail note-card-sample-thumbnail note-card-sample-${index % 3}`} aria-hidden="true">
              <span>NOTES / SAMPLE</span>
              <strong>{String(index + 1).padStart(2, "0")}</strong>
            </div>
          )}
        </div>
      ) : null}
      <h3>{article.title}</h3>
      {article.description ? <p>{article.description}</p> : null}
      <span className="note-card-action" aria-hidden="true">
        {sample ? "DISPLAY PREVIEW" : "READ ON NOTE ↗"}
      </span>
      {!sample && <span className="sr-only">（noteの記事を新しいタブで開きます）</span>}
    </>
  );

  return (
    <article className={`note-card${scrollHighlight && isInView ? " is-in-view" : ""}`}>
      {sample ? (
        <div className="note-card-link note-card-preview">{content}</div>
      ) : (
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="note-card-link">
          {content}
        </a>
      )}
    </article>
  );
}
