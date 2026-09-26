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

const sampleBgStyles = [
  "bg-[#0a171d] text-[var(--surface)]",
  "bg-[#ffc18b] text-[#0a171d]",
  "bg-[#bcd7d1] text-[#0a171d]",
] as const;

export default function NoteCard({ article, index, sample = false, scrollHighlight = false }: NoteCardProps) {
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(thumbnailRef, { amount: 0.7 });
  const date = article.publishedAt ? dateFormatter.format(new Date(article.publishedAt)) : null;
  const hasThumbnail = Boolean(article.thumbnailUrl || sample);

  const thumbnailViewClasses = `note-card-thumbnail-view relative isolate mt-[18px] aspect-[1.91/1] w-full transition-transform duration-300 ease-in-out will-change-transform group-hover/notecard:-translate-y-[3px] ${
    scrollHighlight && isInView
      ? "max-[768px]:-translate-y-[5px] max-[768px]:duration-450"
      : ""
  }`;
  const thumbnailShadowClasses = `pointer-events-none absolute inset-0 bg-[var(--ink)] opacity-0 transition-[translate,opacity] duration-300 ease-in-out will-change-[translate,opacity] group-hover/notecard:translate-x-1 group-hover/notecard:translate-y-1 group-hover/notecard:opacity-100 ${
    scrollHighlight && isInView ? "max-[768px]:translate-x-1 max-[768px]:translate-y-1 max-[768px]:opacity-100 max-[768px]:duration-450" : ""
  }`;
  const thumbnailClasses = "relative z-[1] h-full w-full overflow-hidden border border-[var(--ink)] bg-[#dce5dd]";

  const linkClasses = "group/notecard flex h-full min-h-[280px] max-[1024px]:min-h-[220px] max-[768px]:min-h-0 flex-col px-[26px] pt-[22px] pb-6 max-[768px]:px-0.5 max-[768px]:pt-5 max-[768px]:pb-[22px] font-[family-name:var(--font-shippori-mincho)] text-inherit no-underline transition-colors duration-200 hover:bg-[var(--orange)] focus-visible:relative focus-visible:z-[1] focus-visible:outline-offset-[-5px]";

  const content = (
    <>
      <div className="flex items-center justify-between gap-4 font-[family-name:var(--mono)] text-[11px] leading-normal tracking-[0.08em]">
        <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        {sample ? <span>SAMPLE</span> : date ? <time dateTime={article.publishedAt ?? undefined}>{date}</time> : null}
      </div>
      {hasThumbnail ? (
        <div ref={thumbnailRef} className={thumbnailViewClasses}>
          <span className={thumbnailShadowClasses} aria-hidden="true" />
          {article.thumbnailUrl ? (
            <div className={thumbnailClasses}>
              <Image
                src={article.thumbnailUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 767px) calc(100vw - 36px), (max-width: 1023px) calc(100vw - 100px), 30vw"
              />
            </div>
          ) : (
            <div className={`${thumbnailClasses} flex flex-col justify-between px-[18px] py-[15px] font-[family-name:var(--mono)] text-[10px] leading-[1.4] tracking-[0.1em] ${sampleBgStyles[index % 3]}`} aria-hidden="true">
              <span>NOTES / SAMPLE</span>
              <strong className="self-end font-[family-name:var(--mono)] text-[clamp(34px,5vw,60px)] font-bold leading-none">{String(index + 1).padStart(2, "0")}</strong>
            </div>
          )}
        </div>
      ) : null}
      <h3 className={`font-[family-name:var(--font-shippori-mincho),serif] font-bold text-[23px] max-[768px]:text-[20px] leading-[1.45] [overflow-wrap:anywhere] ${hasThumbnail ? "mt-[19px] mb-[13px]" : "mt-[34px] max-[768px]:mt-[25px] mb-[13px]"}`}>
        {article.title}
      </h3>
      {article.description ? (
        <p className="m-0 mb-6 text-[13px] leading-[1.8] text-[var(--text-sub)] transition-colors duration-200 group-hover/notecard:text-[var(--ink)] [overflow-wrap:anywhere] line-clamp-3">
          {article.description}
        </p>
      ) : null}
      <span className="mt-auto pt-4 font-[family-name:var(--mono)] text-[11px] leading-normal tracking-[0.08em] transition-colors duration-200 group-hover/notecard:text-[var(--red)]" aria-hidden="true">
        {sample ? "DISPLAY PREVIEW" : "READ ON NOTE ↗"}
      </span>
      {!sample && <span className="sr-only">（noteの記事を新しいタブで開きます）</span>}
    </>
  );

  return (
    <article className={`note-card min-w-0${scrollHighlight && isInView ? " is-in-view" : ""}`}>
      {sample ? (
        <div className={`${linkClasses} note-card-preview`}>{content}</div>
      ) : (
        <a href={article.url} target="_blank" rel="noopener noreferrer" className={linkClasses}>
          {content}
        </a>
      )}
    </article>
  );
}
