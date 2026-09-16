import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { getNoteFeed, getNoteUserId, parseNoteRSS } from "../lib/note.ts";

let savedUserId;
beforeEach(() => {
  savedUserId = process.env.NOTE_USER_ID;
  delete process.env.NOTE_USER_ID;
});
afterEach(() => {
  if (savedUserId === undefined) delete process.env.NOTE_USER_ID;
  else process.env.NOTE_USER_ID = savedUserId;
  mock.restoreAll();
});

const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"><channel>
  <item>
    <title><![CDATA[最初の記事]]></title>
    <link>https://note.com/example/n/n123</link>
    <pubDate>Tue, 15 Sep 2026 03:00:00 GMT</pubDate>
    <description><![CDATA[<p>サーバーを<strong>構築</strong>しました。</p>]]></description>
    <media:thumbnail>https://assets.st-note.com/production/uploads/images/example.png?width=800</media:thumbnail>
  </item>
  <item><title>外部の記事</title><link>https://example.com/article</link></item>
  <item><title>画像なしの記事</title><link>https://note.com/example/n/n456</link><media:thumbnail url="https://example.com/unsafe.png" /></item>
</channel></rss>`;

test("parses note articles and turns RSS HTML into a plain excerpt", () => {
  assert.deepEqual(parseNoteRSS(rss), [{
    title: "最初の記事",
    url: "https://note.com/example/n/n123",
    publishedAt: "2026-09-15T03:00:00.000Z",
    description: "サーバーを構築しました。",
    thumbnailUrl: "https://assets.st-note.com/production/uploads/images/example.png?width=800",
  }, {
    title: "画像なしの記事",
    url: "https://note.com/example/n/n456",
    publishedAt: null,
    description: "",
    thumbnailUrl: null,
  }]);
});

test("accepts only a creator ID, not an arbitrary RSS URL", () => {
  assert.equal(getNoteUserId(), null);
  process.env.NOTE_USER_ID = " naga_numa-2026 ";
  assert.equal(getNoteUserId(), "naga_numa-2026");
  for (const value of ["https://note.com/example", "note.com/example", "../example"]) {
    process.env.NOTE_USER_ID = value;
    assert.throws(() => getNoteUserId(), /letters, numbers/);
  }
});

test("does not fetch until note is configured", async () => {
  const fetch = mock.method(globalThis, "fetch", async () => { throw new Error("Must not be called"); });
  assert.equal(await getNoteFeed(), null);
  assert.equal(fetch.mock.callCount(), 0);
});

test("fetches the fixed note RSS origin and caches it", async () => {
  process.env.NOTE_USER_ID = "example";
  const fetch = mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://note.com/example/rss");
    assert.match(options.headers.Accept, /application\/rss\+xml/);
    assert.equal(options.next.revalidate, 300);
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(rss, { status: 200 });
  });
  assert.deepEqual(await getNoteFeed(1), {
    profileUrl: "https://note.com/example",
    articles: [{
      title: "最初の記事",
      url: "https://note.com/example/n/n123",
      publishedAt: "2026-09-15T03:00:00.000Z",
      description: "サーバーを構築しました。",
      thumbnailUrl: "https://assets.st-note.com/production/uploads/images/example.png?width=800",
    }],
  });
  assert.equal(fetch.mock.callCount(), 1);
});

test("does not expose the note error response", async () => {
  process.env.NOTE_USER_ID = "example";
  mock.method(globalThis, "fetch", async () => new Response("private upstream details", { status: 404 }));
  await assert.rejects(getNoteFeed(), error => {
    assert.match(error.message, /404/);
    assert.equal(error.message.includes("private upstream details"), false);
    return true;
  });
});
