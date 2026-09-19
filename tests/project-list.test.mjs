import assert from "node:assert/strict";
import { test } from "node:test";
import { buildProjectEntries } from "../lib/project-list.ts";

const project = (slug) => ({
  slug,
  title: slug,
  description: `${slug} description`,
  imageUrl: "/images/no-image.jpg",
});

test("does not append samples to the development fallback", () => {
  const fallback = [project("alpha"), project("beta")];
  const entries = buildProjectEntries(fallback, fallback, {
    includeSamples: true,
    source: "development-samples",
  });

  assert.deepEqual(entries.map(({ project: entry, sample }) => [entry.slug, sample]), [
    ["alpha", false],
    ["beta", false],
  ]);
});

test("appends samples after microCMS projects", () => {
  const entries = buildProjectEntries([project("real")], [project("sample-a"), project("sample-b")], {
    includeSamples: true,
    source: "microcms",
  });

  assert.deepEqual(entries.map(({ project: entry, sample }) => [entry.slug, sample]), [
    ["real", false],
    ["sample-a", true],
    ["sample-b", true],
  ]);
});

test("shows only samples when the CMS is unavailable", () => {
  const entries = buildProjectEntries([], [project("sample-a"), project("sample-b")], {
    includeSamples: true,
    source: "unavailable",
  });

  assert.ok(entries.every(({ sample }) => sample));
  assert.deepEqual(entries.map(({ project: entry }) => entry.slug), ["sample-a", "sample-b"]);
});

test("keeps the real project when a sample slug conflicts", () => {
  const entries = buildProjectEntries([project("same")], [project("same"), project("different")], {
    includeSamples: true,
    source: "microcms",
  });

  assert.deepEqual(entries.map(({ project: entry, sample }) => [entry.slug, sample]), [
    ["same", false],
    ["different", true],
  ]);
});

test("fills the home list up to its limit without duplicates", () => {
  const entries = buildProjectEntries([project("real")], [project("real"), project("sample-a"), project("sample-b"), project("sample-c")], {
    includeSamples: true,
    source: "microcms",
    maxItems: 3,
  });

  assert.deepEqual(entries.map(({ project: entry }) => entry.slug), ["real", "sample-a", "sample-b"]);
});
