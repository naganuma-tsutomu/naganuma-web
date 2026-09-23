import assert from "node:assert/strict";
import { test } from "node:test";
import { markdownToArticleHtml, sanitizeArticle } from "../lib/article-html.ts";

test("keeps article formatting, code, tables and safe images", () => {
  const html = sanitizeArticle('<h2 id="overview">概要</h2><p><strong>太字</strong></p><ul><li>項目</li></ul><pre><code class="language-ts">const n = 1;</code></pre><table><tbody><tr><td colspan="2">値</td></tr></tbody></table><img src="https://images.microcms-assets.io/assets/example/image.jpg" alt="構成図">');
  assert.match(html, /<h2 id="overview">概要<\/h2>/);
  assert.match(html, /<ul><li>項目<\/li><\/ul>/);
  assert.match(html, /class="language-ts"/);
  assert.match(html, /colspan="2"/);
  assert.match(html, /alt="構成図"/);
  assert.match(html, /loading="lazy"/);
});

test("strips script execution, embedded pages and unsafe URLs", () => {
  const html = sanitizeArticle('<script>alert(1)</script><p onclick="alert(1)">安全な本文</p><a href="javascript:alert(1)">危険なリンク</a><img src="data:image/svg+xml,bad" onerror="alert(1)"><iframe src="https://example.com"></iframe><style>body{display:none}</style>');
  assert.match(html, /安全な本文/);
  assert.doesNotMatch(html, /<script|onclick|onerror|javascript:|data:image|<iframe|<style|alert\(1\)/);
});

test("protects links that open a new tab", () => {
  const html = sanitizeArticle('<a href="https://example.com" target="_blank">参照</a>');
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test("renders GFM tables after removing front matter and extra blank rows", () => {
  const html = markdownToArticleHtml(`---

title: "metadata only"
description: "not article content"

---

## クラスタ構成

| Node | CPU |

| --- | --- |

| proxmox | Ryzen 5 |
`);
  assert.doesNotMatch(html, /metadata only|description:/);
  assert.match(html, /<h2>クラスタ構成<\/h2>/);
  assert.match(html, /<table>/);
  assert.match(html, /<th>Node<\/th>/);
  assert.match(html, /<td>Ryzen 5<\/td>/);
});

test("compacts loose lists and consecutive callout lines", () => {
  const html = markdownToArticleHtml("- LXC\n\n- KVM VM\n\n> 2026年9月時点\n\n> 稼働数は変動します");
  assert.match(html, /<ul>[\s\S]*<li>LXC<\/li>[\s\S]*<li>KVM VM<\/li>[\s\S]*<\/ul>/);
  assert.equal((html.match(/<blockquote>/g) ?? []).length, 1);
});

test("sanitizes raw HTML and unsafe links after Markdown conversion", () => {
  const html = markdownToArticleHtml('[危険](javascript:alert(1))<script>alert(2)</script><img src="https://example.com/image.jpg" onerror="alert(3)">');
  assert.doesNotMatch(html, /javascript:|<script|onerror|alert\(/);
  assert.match(html, /loading="lazy"/);
});
