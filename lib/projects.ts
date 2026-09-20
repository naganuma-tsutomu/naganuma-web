import "server-only";

import { cache } from "react";
import { projects as samples } from "../app/data/projects.ts";
import { getMicroCMSConfig, MicroCMSError, microCMSGet } from "./microcms.ts";
import type { ProjectArticle, ProjectListResult, ProjectSummary } from "@/lib/project-types";

import { LIST_PAGE_SIZE } from "./sample-content.ts";
import { buildProjectEntries } from "./project-list.ts";

interface CMSProject {
  id: string;
  title: string;
  description: string;
  thumbnail?: { url: string };
  content?: string;
  publishedAt?: string;
}

interface CMSList {
  contents: CMSProject[];
  totalCount: number;
}

function toSummary(project: CMSProject): ProjectSummary {
  if (!project.id || !project.title || typeof project.description !== "string") {
    throw new Error("Invalid projects schema: id, title and description are required.");
  }
  const imageUrl = project.thumbnail?.url;
  return {
    slug: project.id,
    title: project.title,
    description: project.description,
    publishedAt: project.publishedAt,
    imageUrl: imageUrl?.startsWith("https://images.microcms-assets.io/assets/")
      ? imageUrl
      : "/images/no-image.jpg",
  };
}

export async function getProjectList(limit = LIST_PAGE_SIZE, offset = 0): Promise<ProjectListResult> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0) {
    throw new Error("Invalid project pagination parameters.");
  }
  const config = getMicroCMSConfig();
  if (!config) {
    return {
      projects: samples.slice(offset, offset + limit),
      totalCount: samples.length,
      source: "development-samples",
    };
  }

  const page = await microCMSGet<CMSList>(config.projectsEndpoint, {
    limit: String(limit),
    offset: String(offset),
    orders: "-publishedAt",
    fields: "id,title,description,thumbnail,publishedAt",
  });
  if (!Array.isArray(page.contents) || !Number.isSafeInteger(page.totalCount) || page.totalCount < 0) {
    throw new Error("Invalid microCMS list response.");
  }
  return { projects: page.contents.map(toSummary), totalCount: page.totalCount, source: "microcms" };
}

export async function getProjectPage(rawPage: string | string[] | undefined, includeSamples: boolean) {
  const requested = typeof rawPage === "string" && /^[1-9]\d*$/.test(rawPage) ? Number(rawPage) : 1;
  const requestedPage = Number.isSafeInteger(requested) && Number.isSafeInteger((requested - 1) * LIST_PAGE_SIZE)
    ? requested : 1;
  let result = await getProjectList(LIST_PAGE_SIZE, (requestedPage - 1) * LIST_PAGE_SIZE);
  let extraSamples = includeSamples && result.source === "microcms" ? samples : [];
  if (extraSamples.length > 0) {
    // Check only sample IDs, including collisions outside the requested page.
    const config = getMicroCMSConfig()!;
    const matches = await microCMSGet<{ contents: { id: string }[] }>(config.projectsEndpoint, {
      ids: extraSamples.map(({ slug }) => slug).join(","),
      fields: "id",
      limit: String(extraSamples.length),
    });
    const usedSlugs = new Set(matches.contents.map(({ id }) => id));
    extraSamples = extraSamples.filter(({ slug }) => !usedSlugs.has(slug));
  }
  const totalPages = Math.max(1, Math.ceil((result.totalCount + extraSamples.length) / LIST_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * LIST_PAGE_SIZE;
  if (page !== requestedPage && offset < result.totalCount) {
    result = await getProjectList(LIST_PAGE_SIZE, offset);
  }
  const pageSamples = extraSamples.slice(Math.max(0, offset - result.totalCount));
  const items = buildProjectEntries(offset < result.totalCount ? result.projects : [], pageSamples, {
    includeSamples,
    source: result.source,
    maxItems: LIST_PAGE_SIZE,
  });
  return { items, page, totalPages };
}

export const getProject = cache(async (slug: string): Promise<ProjectArticle | null> => {
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) return null;
  const config = getMicroCMSConfig();
  if (!config) {
    const sample = samples.find(project => project.slug === slug);
    if (!sample) return null;
    return {
      ...sample,
      isSample: true,
      content: "<h2>プロジェクトについて</h2><p>このページは、記事のレイアウトを確認するためのサンプルです。実際のプロジェクト内容は準備中です。</p><h2>設計と実装</h2><p>制作の背景や使用した技術、工夫した点などをここにまとめていきます。</p><h2>振り返り</h2><p>つくる過程で学んだことや、今後取り組みたい改善点を記録する予定です。</p>",
    };
  }

  try {
    const project = await microCMSGet<CMSProject>(`${config.projectsEndpoint}/${encodeURIComponent(slug)}`);
    if (typeof project.content !== "string") {
      throw new Error("Invalid projects schema: content must be rich-editor HTML.");
    }
    return {
      ...toSummary(project),
      content: project.content,
      publishedAt: project.publishedAt,
      isSample: false,
    };
  } catch (error) {
    if (error instanceof MicroCMSError && error.status === 404) return null;
    throw error;
  }
});
