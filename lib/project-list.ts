import type { ProjectListSource, ProjectSummary } from "@/lib/project-types";

export interface ProjectEntry {
  project: ProjectSummary;
  sample: boolean;
}

interface BuildProjectEntriesOptions {
  includeSamples: boolean;
  source: ProjectListSource | "unavailable";
  maxItems?: number;
}

export function buildProjectEntries(
  projects: readonly ProjectSummary[],
  samples: readonly ProjectSummary[],
  { includeSamples, source, maxItems }: BuildProjectEntriesOptions,
): ProjectEntry[] {
  const limit = maxItems ?? Number.POSITIVE_INFINITY;
  const entries: ProjectEntry[] = projects.slice(0, limit).map((project) => ({ project, sample: false }));

  if (!includeSamples || source === "development-samples" || entries.length >= limit) {
    return entries;
  }

  const usedSlugs = new Set(projects.map(({ slug }) => slug));
  for (const project of samples) {
    if (entries.length >= limit) break;
    if (usedSlugs.has(project.slug)) continue;
    usedSlugs.add(project.slug);
    entries.push({ project, sample: true });
  }

  return entries;
}
