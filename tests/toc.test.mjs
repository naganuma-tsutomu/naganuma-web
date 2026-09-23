import assert from "node:assert/strict";
import { test } from "node:test";
import { extractTocAndInjectIds } from "../lib/toc.ts";

test("extracts h2, h3, and h4 headings and injects IDs", () => {
  const html = `
    <h2>はじめに</h2>
    <p>本文です</p>
    <h3>環境構築</h3>
    <p>設定手順</p>
    <h4>依存関係のインストール</h4>
    <p>npm install</p>
  `;

  const { html: transformedHtml, toc } = extractTocAndInjectIds(html);

  assert.equal(toc.length, 3);
  assert.deepEqual(toc[0], { id: "はじめに", text: "はじめに", level: 2 });
  assert.deepEqual(toc[1], { id: "環境構築", text: "環境構築", level: 3 });
  assert.deepEqual(toc[2], { id: "依存関係のインストール", text: "依存関係のインストール", level: 4 });

  assert.match(transformedHtml, /<h2 id="はじめに">はじめに<\/h2>/);
  assert.match(transformedHtml, /<h3 id="環境構築">環境構築<\/h3>/);
  assert.match(transformedHtml, /<h4 id="依存関係のインストール">依存関係のインストール<\/h4>/);
});

test("preserves existing IDs", () => {
  const html = '<h2 id="custom-id" class="heading">カスタムID</h2>';
  const { html: transformedHtml, toc } = extractTocAndInjectIds(html);

  assert.equal(toc.length, 1);
  assert.equal(toc[0].id, "custom-id");
  assert.equal(toc[0].text, "カスタムID");
  assert.match(transformedHtml, /<h2 id="custom-id" class="heading">カスタムID<\/h2>/);
});

test("handles duplicate heading IDs by appending numbers", () => {
  const html = `
    <h2>概要</h2>
    <h2>概要</h2>
    <h2>概要</h2>
  `;
  const { html: transformedHtml, toc } = extractTocAndInjectIds(html);

  assert.equal(toc.length, 3);
  assert.equal(toc[0].id, "概要");
  assert.equal(toc[1].id, "概要-2");
  assert.equal(toc[2].id, "概要-3");

  assert.match(transformedHtml, /<h2 id="概要">概要<\/h2>/);
  assert.match(transformedHtml, /<h2 id="概要-2">概要<\/h2>/);
  assert.match(transformedHtml, /<h2 id="概要-3">概要<\/h2>/);
});

test("strips inner tags for TOC text while keeping them in rendered heading HTML", () => {
  const html = '<h2><span>ステップ1:</span> <code>config.json</code> の作成</h2>';
  const { html: transformedHtml, toc } = extractTocAndInjectIds(html);

  assert.equal(toc.length, 1);
  assert.equal(toc[0].text, "ステップ1: config.json の作成");
  assert.match(transformedHtml, /<h2 id="[^"]+"><span>ステップ1:<\/span> <code>config.json<\/code> の作成<\/h2>/);
});

test("ignores h1, h5, h6 headings", () => {
  const html = '<h1>タイトル</h1><h2>中見出し</h2><h5>小見出し5</h5>';
  const { toc } = extractTocAndInjectIds(html);

  assert.equal(toc.length, 1);
  assert.equal(toc[0].level, 2);
  assert.equal(toc[0].text, "中見出し");
});
