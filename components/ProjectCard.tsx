"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { useInView } from "@/lib/useInView";
import type { ProjectSummary } from "@/lib/project-types";

interface ProjectCardProps {
  project: ProjectSummary;
  index: number;
  sample?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export default function ProjectCard({ project, index, sample = false }: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef<HTMLElement>(null);
  const isVisible = useInView(ref, { once: true, margin: "-50px" });
  const isFullyInView = useInView(ref, { amount: 1 });
  const publishedAt = project.publishedAt ? new Date(project.publishedAt) : null;
  const date = publishedAt && !Number.isNaN(publishedAt.getTime()) ? dateFormatter.format(publishedAt) : null;

  const content = (
    <>
      {/* Shadow Effect */}
      <div
        className={`absolute top-2 left-2 w-full h-full bg-[var(--ink)] transition-transform duration-300 md:translate-x-0 md:translate-y-0 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] ${
          isFullyInView ? "translate-x-[-2px] translate-y-[-2px]" : "translate-x-0 translate-y-0"
        }`}
      />

      {/* Main Card Content */}
      <div
        className={`project-card-surface relative bg-white overflow-hidden border-2 border-[var(--ink)] h-full flex flex-col transition-[transform,background-color,border-color] duration-300 md:translate-x-0 md:translate-y-0 group-hover:translate-x-[3px] group-hover:translate-y-[3px] group-hover:border-[var(--red)] group-hover:bg-[#fff8eb] group-focus-within:border-[var(--red)] ${
          isFullyInView ? "translate-x-[3px] translate-y-[3px]" : "translate-x-0 translate-y-0"
        }`}
      >
        {/* Browser Header */}
        <div className="flex items-center justify-between gap-2 p-2 bg-gray-200 border-b-2 border-[var(--ink)] transition-colors duration-300">
          <div className="min-w-0 flex-1 truncate text-left text-sm text-gray-700 font-bold">
            {project.title}.md
          </div>
          <div className="flex shrink-0 space-x-1" aria-hidden="true">
            <span
              className={`w-3 h-3 rounded-full border border-[var(--ink)] group-hover:bg-[var(--ink)] transition-colors md:bg-transparent ${
                isFullyInView ? "bg-[var(--ink)]" : "bg-transparent"
              }`}
            />
            <span
              className={`w-3 h-3 rounded-full border border-[var(--ink)] group-hover:bg-[var(--ink)] transition-colors md:bg-transparent ${
                isFullyInView ? "bg-[var(--ink)]" : "bg-transparent"
              }`}
            />
            <span
              className={`w-3 h-3 rounded-full border border-[var(--ink)] group-hover:bg-[var(--ink)] transition-colors md:bg-transparent ${
                isFullyInView ? "bg-[var(--ink)]" : "bg-transparent"
              }`}
            />
          </div>
        </div>

        {/* Image */}
        <div className="relative h-48 bg-gray-100 border-b-2 border-[var(--ink)] shrink-0">
          {isLoading && !imageError && (
            <div className="absolute inset-0 bg-gray-300 z-10 animate-[pulse_1.5s_ease-in-out_infinite] motion-reduce:animate-none" />
          )}
          <Image
            src={imageError ? "/images/no-image.jpg" : project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) 46vw, (max-width: 1600px) 30vw, 475px"
            className={`object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
            priority={index < 3}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImageError(true);
              setIsLoading(false);
            }}
          />
        </div>

        {/* Text Content */}
        <div className="p-6 flex-grow transition-colors duration-300">
          {sample && <span className="project-card-sample transition-colors duration-200 group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)]">SAMPLE</span>}
          {date && (
            <div className="mb-3 font-mono text-xs tracking-wider text-[#52605e]">
              PUBLISHED / <time dateTime={project.publishedAt}>{date}</time>
            </div>
          )}
          <h3
            id={`${project.slug}-title`}
            className={`text-2xl font-bold font-[family-name:var(--font-oswald),sans-serif] mb-2 group-hover:text-[var(--red)] group-focus-within:text-[var(--red)] transition-colors md:text-[var(--ink)] ${
              isFullyInView ? "text-[var(--red)]" : "text-[var(--ink)]"
            }`}
          >
            {project.title}
          </h3>
          <p className="text-[#38484a] line-clamp-3 transition-colors duration-300">
            {project.description}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <article
      ref={ref}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
      className={`project-card group relative h-full font-[family-name:var(--font-shippori-mincho)] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none! motion-reduce:opacity-100! motion-reduce:transform-none! ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }${sample ? " project-card-preview" : ""}`}
      aria-labelledby={`${project.slug}-title`}
    >
      {sample ? (
        <div className="project-card-link">{content}</div>
      ) : (
        <Link
          href={`/projects/${encodeURIComponent(project.slug)}`}
          className="project-card-link"
          aria-labelledby={`${project.slug}-title`}
        >
          {content}
        </Link>
      )}
    </article>
  );
}
