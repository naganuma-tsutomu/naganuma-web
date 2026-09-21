import type { NoteArticle } from "@/lib/note-types";

export interface NotesPageHeader {
  kicker: string;
  title: string;
  description: string;
  sideTagline: string;
  sideMotto: readonly string[];
  sideLinkText: string;
  sideFallbackLabel: string;
}

export interface NotesPageMessages {
  unavailableWithSamples: string;
  unavailable: string;
  emptyWithSamples: string;
  emptyTitle: string;
  emptyDescription: string;
  unconfiguredTitle: string;
  unconfiguredDescription: string;
  emptyTag: string;
  unconfiguredTag: string;
}

export const notesPageHeader: NotesPageHeader = {
  kicker: "ARTICLES / NOTE",
  title: "NOTES",
  description: "日々の記録を、noteからお届けします。",
  sideTagline: "LATEST FROM NOTE / FIELD LOG",
  sideMotto: ["READ", "LEARN", "WRITE", "SHARE."],
  sideLinkText: "ALL POSTS ON NOTE ↗",
  sideFallbackLabel: "NOTE JOURNAL ↗",
};

export const notesPageMessages: NotesPageMessages = {
  unavailableWithSamples: "noteの記事を読み込めませんでした。以下は表示サンプルです。",
  unavailable: "noteの記事を読み込めませんでした。時間をおいて再度アクセスしてください。",
  emptyWithSamples: "noteの記事は準備中です。以下は表示サンプルです。",
  emptyTitle: "RSSに記事はまだありません。",
  emptyDescription: "noteから記事が配信されると、ここに最新記事が表示されます。",
  unconfiguredTitle: "つくったこと、試したこと。",
  unconfiguredDescription: "サーバー構築や開発の記録を、noteからお届けします。",
  emptyTag: "WAITING FOR POSTS",
  unconfiguredTag: "READY TO CONNECT",
};

export const noteSamples: NoteArticle[] = [
  {
    title: "サーバー構築の記録",
    description: "サーバーの設定や、試したことを書き残す記事の表示サンプルです。",
    url: "",
    publishedAt: null,
    thumbnailUrl: null,
  },
  {
    title: "サイト制作のメモ",
    description: "サイトのデザインと実装を振り返る記事の表示サンプルです。",
    url: "",
    publishedAt: null,
    thumbnailUrl: null,
  },
  {
    title: "日々の開発ログ",
    description: "開発中に気づいたことをまとめる記事の表示サンプルです。",
    url: "",
    publishedAt: null,
    thumbnailUrl: null,
  },
  {
    title: "ネットワーク設定の覚え書き",
    description: "接続確認や設定変更の手順をまとめる記事の表示サンプルです。",
    url: "",
    publishedAt: null,
    thumbnailUrl: null,
  },
  {
    title: "UIを整える小さな工夫",
    description: "レイアウトや余白を見直す記事の表示サンプルです。",
    url: "",
    publishedAt: null,
    thumbnailUrl: null,
  },
  {
    title: "週末の技術メモ",
    description: "試してみた技術を振り返る記事の表示サンプルです。",
    url: "",
    publishedAt: null,
    thumbnailUrl: null,
  },
];
