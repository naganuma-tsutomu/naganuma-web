"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
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
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(ref, { amount: 1 });
  const publishedAt = project.publishedAt ? new Date(project.publishedAt) : null;
  const date = publishedAt && !Number.isNaN(publishedAt.getTime()) ? dateFormatter.format(publishedAt) : null;

  const content = (
    <>
      {/* Shadow Effect */}
      <div className={`absolute top-2 left-2 w-full h-full bg-black dark:bg-white transition-transform duration-300 md:translate-x-0 md:translate-y-0 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] ${isInView ? "translate-x-[-2px] translate-y-[-2px]" : "translate-x-0 translate-y-0"
        }`}></div>

      {/* Main Card Content */}
      <motion.div
        className={`project-card-surface relative bg-white dark:bg-zinc-800 overflow-hidden border-2 border-black dark:border-white h-full flex flex-col transition-transform duration-300 md:translate-x-0 md:translate-y-0 group-hover:translate-x-[3px] group-hover:translate-y-[3px] ${isInView ? "translate-x-[3px] translate-y-[3px]" : "translate-x-0 translate-y-0"
          }`}
      >
        {/* Browser Header */}
        <div className="flex items-center justify-between gap-2 p-2 bg-gray-200 dark:bg-zinc-700 border-b-2 border-black dark:border-white transition-colors duration-300">
          <div className="min-w-0 flex-1 truncate text-left text-sm text-gray-700 dark:text-gray-300 font-bold">
            {project.title}.md
          </div>
          <div className="flex shrink-0 space-x-1" aria-hidden="true">
            <span className={`w-3 h-3 rounded-full border border-black dark:border-white group-hover:bg-[#1C1C1C] dark:group-hover:bg-white transition-colors md:bg-transparent md:dark:bg-transparent ${isInView ? "bg-[#1C1C1C] dark:bg-white" : "bg-transparent dark:bg-transparent"}`}></span>
            <span className={`w-3 h-3 rounded-full border border-black dark:border-white group-hover:bg-[#1C1C1C] dark:group-hover:bg-white transition-colors md:bg-transparent md:dark:bg-transparent ${isInView ? "bg-[#1C1C1C] dark:bg-white" : "bg-transparent dark:bg-transparent"}`}></span>
            <span className={`w-3 h-3 rounded-full border border-black dark:border-white group-hover:bg-[#1C1C1C] dark:group-hover:bg-white transition-colors md:bg-transparent md:dark:bg-transparent ${isInView ? "bg-[#1C1C1C] dark:bg-white" : "bg-transparent dark:bg-transparent"}`}></span>
          </div>
        </div>

        {/* Image */}
        <div className="relative h-48 bg-gray-100 dark:bg-zinc-900 border-b-2 border-black dark:border-white shrink-0">
          {isLoading && !imageError && (
            <div
              className="absolute inset-0 bg-gray-300 dark:bg-zinc-600 z-10 animate-[pulse_1.5s_ease-in-out_infinite] motion-reduce:animate-none"
            />
          )}
          <Image
            src={imageError ? "/images/no-image.jpg" : project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) 46vw, (max-width: 1600px) 30vw, 475px"
            className={`object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
            priority={index < 3}
            onLoad={() => setIsLoading(false)}
            onError={() => { setImageError(true); setIsLoading(false); }}
          />
        </div>

        {/* Text Content */}
        <div className="p-6 flex-grow transition-colors duration-300">
          {sample && <span className="project-card-sample">SAMPLE</span>}
          {date && <div className="mb-3 font-mono text-xs tracking-wider text-[#52605e] dark:text-gray-300">
            PUBLISHED / <time dateTime={project.publishedAt}>{date}</time>
          </div>}
          <h3 id={`${project.slug}-title`} className={`text-2xl font-bold font-oswald mb-2 group-hover:text-[var(--red)] dark:group-hover:text-[var(--red)] transition-colors md:text-[#1C1C1C] md:dark:text-white ${isInView ? "text-[var(--red)] dark:text-[var(--red)]" : "text-[#1C1C1C] dark:text-white"}`}>
            {project.title}
          </h3>
          <p className="text-[#3a3a3a] dark:text-gray-300 line-clamp-3 transition-colors duration-300">{project.description}</p>
        </div>
      </motion.div>
    </>
  );

  return (
    <motion.article
      ref={ref}
      // Keep SSR and hydration styles identical; CSS handles reduced motion immediately.
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : index * 0.1 }}
      className={`project-card group relative h-full font-[family-name:var(--font-shippori-mincho)] motion-reduce:opacity-100! motion-reduce:transform-none!${sample ? " project-card-preview" : ""}`}
      aria-labelledby={`${project.slug}-title`}
    >
      {sample ? (
        <div className="project-card-link">{content}</div>
      ) : (
        <Link href={`/projects/${encodeURIComponent(project.slug)}`} className="project-card-link" aria-labelledby={`${project.slug}-title`}>
          {content}
        </Link>
      )}
    </motion.article>
  );
}
