import assert from "node:assert/strict";
import { test } from "node:test";
import { createPageMetadata } from "../lib/site-metadata.ts";
import { securityHeaders } from "../lib/security-headers.ts";

test("page metadata keeps noindex and gives each page its own URL and social description", () => {
  const metadata = createPageMetadata({ title: "About", description: "プロフィール", path: "/about" });
  assert.deepEqual(metadata.robots, { index: false, follow: false });
  assert.equal(metadata.title, "About");
  assert.equal(metadata.alternates.canonical, "https://naganuma-web.com/about");
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal(metadata.openGraph.title, "About | NAGANUMA");
  assert.equal(metadata.openGraph.description, "プロフィール");
  assert.equal(metadata.openGraph.images[0].url, "https://naganuma-web.com/og");
  assert.equal(metadata.twitter.card, "summary_large_image");
  assert.deepEqual(metadata.twitter.images, metadata.openGraph.images);
});

test("articles share their own thumbnail and publication date without enabling indexing", () => {
  const metadata = createPageMetadata({ title: "Project", description: "記事", path: "/projects/example", article: true,
    imageUrl: "https://images.microcms-assets.io/assets/service/image.jpg", publishedAt: "2026-09-20T00:00:00.000Z" });
  assert.deepEqual(metadata.robots, { index: false, follow: false });
  assert.equal(metadata.openGraph.type, "article");
  assert.equal(metadata.openGraph.publishedTime, "2026-09-20T00:00:00.000Z");
  assert.equal(metadata.openGraph.images[0].url, "https://images.microcms-assets.io/assets/service/image.jpg");
});

test("missing article images use the shared card and invalid dates are omitted", () => {
  const metadata = createPageMetadata({ title: "Project", description: "記事", path: "/projects/example", article: true,
    imageUrl: "/images/no-image.jpg", publishedAt: "invalid" });
  assert.equal(metadata.openGraph.images[0].url, "https://naganuma-web.com/og");
  assert.equal(metadata.openGraph.publishedTime, undefined);
});

test("security headers preserve noindex and never enforce the observation CSP", () => {
  for (const production of [false, true]) {
    const headers = Object.fromEntries(securityHeaders(production).map(({ key, value }) => [key, value]));
    assert.equal(headers["X-Robots-Tag"], "noindex, nofollow");
    assert.equal(headers["X-Content-Type-Options"], "nosniff");
    assert.equal(headers["Content-Security-Policy"], undefined);
    if (production) {
      assert.match(headers["Content-Security-Policy-Report-Only"], /object-src 'none'/);
      assert.match(headers["Content-Security-Policy-Report-Only"], /https:\/\/\*\.google-analytics.com/);
      assert.equal(headers["Content-Security-Policy-Report-Only"].includes("script-src 'self' 'unsafe-inline'"), false);
    } else {
      assert.equal(headers["Content-Security-Policy-Report-Only"], undefined);
    }
  }
});

test("home title does not repeat the site name through the layout template", () => {
  const metadata = createPageMetadata({ title: "NAGANUMA", description: "ホーム", path: "/" });
  assert.deepEqual(metadata.title, { absolute: "NAGANUMA" });
  assert.equal(metadata.openGraph.title, "NAGANUMA");
});
