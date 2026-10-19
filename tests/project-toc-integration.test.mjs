import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { extractTocAndInjectIds } from "../lib/toc.ts";
import { sanitizeArticle } from "../lib/article-html.ts";

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


test("TOC generation preserves sanitized IDs without creating HTML attributes", () => {
  for (const id of [
    "$& onmouseover=window.pwned=1//",
    "$` $' $$",
    'a&quot; onmouseover=&quot;window.pwned=1',
    "a&amp;quot;b",
  ]) {
    const sanitized = sanitizeArticle(`<h2 id="${id}">Safe heading</h2>`);
    const originalHeading = new JSDOM(sanitized).window.document.querySelector("h2");
    const { html, toc } = extractTocAndInjectIds(sanitized);
    const document = new JSDOM(html).window.document;
    const heading = document.querySelector("h2");

    assert.equal(heading.id, originalHeading.id);
    assert.deepEqual(heading.getAttributeNames(), ["id"]);
    assert.equal(document.getElementById(toc[0].id), heading);
    assert.equal(heading.textContent, "Safe heading");
  }
});

test("TOC IDs match decoded DOM IDs and remain unique across equivalent entities", () => {
  const sanitized = sanitizeArticle('<h2 id="a&amp;b">First</h2><h3 id="a&#38;b">Second</h3><h4 id="a&amp;b-2">Third</h4>');
  const { html, toc } = extractTocAndInjectIds(sanitized);
  const document = new JSDOM(html).window.document;

  assert.deepEqual(toc.map(item => item.id), ["a&b", "a&b-2", "a&b-2-2"]);
  const headings = [...document.querySelectorAll("h2, h3, h4")];
  toc.forEach((item, index) => assert.equal(document.getElementById(item.id), headings[index]));
});

test("TOC labels decode entities once without treating escaped examples as HTML", () => {
  const sanitized = sanitizeArticle('<h2>Map&lt;K, V&gt; &amp; R&amp;D <code>&amp;lt;tag&amp;gt;</code> &#x1F680;</h2>');
  const { html, toc } = extractTocAndInjectIds(sanitized);
  const heading = new JSDOM(html).window.document.querySelector("h2");

  assert.equal(toc[0].text, "Map<K, V> & R&D &lt;tag&gt; 🚀");
  assert.equal(toc[0].text, heading.textContent);
  assert.equal(heading.id, toc[0].id);
});
