import "server-only";

import { cache } from "react";
import { projects as samples } from "@/app/data/projects";
import { getMicroCMSConfig, MicroCMSError, microCMSGet } from "@/lib/microcms";
import type { ProjectArticle, ProjectListResult, ProjectSummary } from "@/lib/project-types";

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

export async function getProjectList(limit?: number): Promise<ProjectListResult> {
  const config = getMicroCMSConfig();
  if (!config) {
    return {
      projects: limit === undefined ? samples : samples.slice(0, limit),
      source: "development-samples",
    };
  }

  const projects: ProjectSummary[] = [];
  let offset = 0;
  let totalCount: number;
  do {
    const page = await microCMSGet<CMSList>(config.projectsEndpoint, {
      limit: String(Math.min(100, limit === undefined ? 100 : limit - projects.length)),
      offset: String(offset),
      orders: "-publishedAt",
      fields: "id,title,description,thumbnail,publishedAt",
    });
    if (!Array.isArray(page.contents) || !Number.isInteger(page.totalCount) || page.totalCount < 0) {
      throw new Error("Invalid microCMS list response.");
    }
    projects.push(...page.contents.map(toSummary));
    offset += page.contents.length;
    totalCount = page.totalCount;
    // Content may be unpublished while the list is being retrieved.
    if (page.contents.length === 0) break;
  } while (offset < totalCount && (limit === undefined || projects.length < limit));
  return { projects, source: "microcms" };
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
