import "server-only";

import { XMLParser } from "fast-xml-parser";
import sanitizeHtml from "sanitize-html";
import type { NoteArticle, NoteFeed } from "@/lib/note-types";

const NOTE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const RSS_REVALIDATE_SECONDS = 5 * 60;
const NOTE_TIMEOUT_MS = 4000;

type XMLValue = string | number | Record<string, unknown> | XMLValue[] | undefined;

function textValue(value: XMLValue): string {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (value && !Array.isArray(value) && typeof value === "object") {
    const record = value as Record<string, XMLValue>;
    return textValue(record["#text"] ?? record["__cdata"]);
  }
  return "";
}

function excerptFromHtml(value: string, title: string): string {
  // sanitize-html returns escaped HTML; cards render this value as React text.
  // Undo only its text escaping, once, so literal entity examples stay literal.
  const plainText = sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    textFilter: (text, tagName) =>
      tagName === "a" && /(?:続きを読む|続きを[見み]る)\s*$/u.test(text) ? "" : text,
  }).replace(/&(amp|lt|gt);/g, (entity) => ({
    "&amp;": "&", "&lt;": "<", "&gt;": ">",
  })[entity] ?? entity).replace(/\s+/g, " ").trim();

  if ([
    "続きを読む",
    "続きを見る",
    "続きをみる",
    `${title}を続きを読む`,
    `${title}の続きを見る`,
    `${title}の続きをみる`,
  ].includes(plainText)) return "";

  const characters = Array.from(plainText);
  return characters.length > 120 ? `${characters.slice(0, 120).join("")}…` : plainText;
}

function safeNoteUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "note.com" ? url.toString() : null;
  } catch {
    return null;
  }
}

function safeNoteThumbnailUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "assets.st-note.com" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function parseNoteRSS(xml: string, limit = 3): NoteArticle[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    processEntities: true,
    trimValues: true,
  });
  const document = parser.parse(xml) as Record<string, XMLValue>;
  const rss = document.rss;
  if (!rss || Array.isArray(rss) || typeof rss !== "object") {
    throw new Error("Invalid note RSS response.");
  }
  const channel = (rss as Record<string, XMLValue>).channel;
  if (!channel || Array.isArray(channel) || typeof channel !== "object") {
    throw new Error("Invalid note RSS channel.");
  }

  const rawItems = (channel as Record<string, XMLValue>).item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  return items.flatMap((rawItem): NoteArticle[] => {
    if (!rawItem || Array.isArray(rawItem) || typeof rawItem !== "object") return [];
    const item = rawItem as Record<string, XMLValue>;
    const title = textValue(item.title);
    const url = safeNoteUrl(textValue(item.link));
    if (!title || !url) return [];

    const rawDate = textValue(item.pubDate);
    const publishedAt = rawDate && !Number.isNaN(Date.parse(rawDate))
      ? new Date(rawDate).toISOString()
      : null;
    const rawDescription = textValue(item.description ?? item["content:encoded"]);
    const rawThumbnail = item["media:thumbnail"];
    const thumbnailValue = textValue(rawThumbnail)
      || (rawThumbnail && !Array.isArray(rawThumbnail) && typeof rawThumbnail === "object"
        ? textValue((rawThumbnail as Record<string, XMLValue>)["@_url"])
        : "");

    return [{
      title,
      url,
      publishedAt,
      description: excerptFromHtml(rawDescription, title),
      thumbnailUrl: safeNoteThumbnailUrl(thumbnailValue),
    }];
  }).slice(0, Math.max(0, limit));
}

export function getNoteUserId(): string | null {
  const userId = process.env.NOTE_USER_ID?.trim();
  if (!userId) return null;
  if (!NOTE_ID_PATTERN.test(userId)) {
    throw new Error("NOTE_USER_ID may contain only letters, numbers, underscores and hyphens.");
  }
  return userId;
}

export async function getNoteFeed(limit = 3): Promise<NoteFeed | null> {
  const userId = getNoteUserId();
  if (!userId) return null;

  const profileUrl = `https://note.com/${userId}`;
  const response = await fetch(`${profileUrl}/rss`, {
    headers: {
      Accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8",
    },
    next: { revalidate: RSS_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(NOTE_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`note RSS request failed (${response.status}).`);
  }

  return {
    profileUrl,
    articles: parseNoteRSS(await response.text(), limit),
  };
}
