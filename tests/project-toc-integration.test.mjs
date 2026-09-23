import assert from "node:assert/strict";
import { test } from "node:test";
import { extractTocAndInjectIds } from "../lib/toc.ts";
import { sanitizeArticle } from "../lib/article-html.ts";
import { projects as samples } from "../app/data/projects.ts";

test("extracts TOC and injects IDs for sample project content", () => {
  const sampleContent =
    "<h2>プロジェクトについて</h2><p>このページは、記事のレイアウトを確認するためのサンプルです。</p><h2>設計と実装</h2><p>制作の背景や使用した技術。</p><h2>振り返り</h2><p>つくる過程で学んだこと。</p>";

  const sanitized = sanitizeArticle(sampleContent);
  const { html, toc } = extractTocAndInjectIds(sanitized);

  assert.equal(toc.length, 3);
  assert.equal(toc[0].text, "プロジェクトについて");
  assert.equal(toc[0].id, "プロジェクトについて");
  assert.equal(toc[0].level, 2);

  assert.equal(toc[1].text, "設計と実装");
  assert.equal(toc[1].id, "設計と実装");
  assert.equal(toc[1].level, 2);

  assert.equal(toc[2].text, "振り返り");
  assert.equal(toc[2].id, "振り返り");
  assert.equal(toc[2].level, 2);

  assert.match(html, /<h2 id="プロジェクトについて">プロジェクトについて<\/h2>/);
  assert.match(html, /<h2 id="設計と実装">設計と実装<\/h2>/);
  assert.match(html, /<h2 id="振り返り">振り返り<\/h2>/);
});

test("handles nested headings (H2, H3, H4) in markdown-converted HTML", () => {
  const html = `
    <h2>1. 概要</h2>
    <p>説明文</p>
    <h3>1.1 背景</h3>
    <p>背景の説明</p>
    <h4>1.1.1 課題</h4>
    <p>課題の詳細</p>
    <h2>2. 実装</h2>
  `;

  const { html: transformedHtml, toc } = extractTocAndInjectIds(html);

  assert.equal(toc.length, 4);
  assert.deepEqual(toc.map((t) => t.level), [2, 3, 4, 2]);
  assert.deepEqual(toc.map((t) => t.text), ["1. 概要", "1.1 背景", "1.1.1 課題", "2. 実装"]);
  assert.match(transformedHtml, /<h2 id="1-概要">1\. 概要<\/h2>/);
  assert.match(transformedHtml, /<h3 id="11-背景">1\.1 背景<\/h3>/);
  assert.match(transformedHtml, /<h4 id="111-課題">1\.1\.1 課題<\/h4>/);
  assert.match(transformedHtml, /<h2 id="2-実装">2\. 実装<\/h2>/);
});

test("returns empty toc for articles without headings", () => {
  const content = "<p>見出しのないシンプルな記事です。</p>";
  const { html, toc } = extractTocAndInjectIds(content);

  assert.equal(toc.length, 0);
  assert.equal(html, content);
});
