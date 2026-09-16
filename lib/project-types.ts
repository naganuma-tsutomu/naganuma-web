export interface ProjectSummary {
  title: string;
  description: string;
  slug: string;
  imageUrl: string;
  publishedAt?: string;
}

export interface ProjectArticle extends ProjectSummary {
  content: string;
  isSample: boolean;
}
