import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitizeArticle } from "../lib/article-html.ts";

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
