export interface ProjectSummary {
  title: string;
  description: string;
  slug: string;
  imageUrl: string;
  publishedAt?: string;
}

export type ProjectListSource = "microcms" | "development-samples";

export interface ProjectListResult {
  projects: ProjectSummary[];
  source: ProjectListSource;
}

export interface ProjectArticle extends ProjectSummary {
  content: string;
  isSample: boolean;
}
