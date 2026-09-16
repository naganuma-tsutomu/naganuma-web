export interface ProjectSummary {
  title: string;
  description: string;
  slug: string;
  imageUrl: string;
}

export interface ProjectArticle extends ProjectSummary {
  content: string;
  publishedAt?: string;
  isSample: boolean;
}
