import "server-only";
import { cache } from "react";
import { getNoteFeed } from "./note";
import { noteSamples } from "@/app/data/notes";
import { sampleContentEnabled } from "./sample-content";
import type { NoteFeed } from "./note-types";

export const loadHomeNotes = cache(async () => {
  let noteFeed: NoteFeed | null = null;
  let noteUnavailable = false;
  try {
    noteFeed = await getNoteFeed();
  } catch (error) {
    console.error("Unable to load note articles:", error instanceof Error ? error.message : "Unknown error");
    noteUnavailable = true;
  }
  const articles = noteFeed?.articles ?? [];
  const showSamples = sampleContentEnabled();
  const samples = showSamples ? noteSamples.slice(0, Math.max(0, 3 - articles.length)) : [];
  return { noteFeed, noteUnavailable, articles, samples, showSamples };
});
