export interface NoteArticle {
  title: string;
  url: string;
  publishedAt: string | null;
  description: string;
  thumbnailUrl: string | null;
}

export interface NoteFeed {
  profileUrl: string;
  articles: NoteArticle[];
}
