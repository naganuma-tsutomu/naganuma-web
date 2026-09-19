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
    <description><![CDATA[<p>サーバーを<strong>構築</strong>しました。</p><a href="https://note.com/example/n/n123">続きを読む</a>]]></description>
    <media:thumbnail>https://assets.st-note.com/production/uploads/images/example.png?width=800</media:thumbnail>
  </item>
  <item><title>外部の記事</title><link>https://example.com/article</link></item>
  <item><title>画像なしの記事</title><link>https://note.com/example/n/n456</link><description><![CDATA[<a href="https://note.com/example/n/n456">画像なしの記事を続きを読む</a>]]></description><media:thumbnail url="https://example.com/unsafe.png" /></item>
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

test("omits read-more text when it is the entire RSS description", () => {
  const readMoreOnlyRss = `<?xml version="1.0"?><rss version="2.0"><channel><item>
    <title>テスト記事</title>
    <link>https://note.com/example/n/n789</link>
    <description>テスト記事を続きを読む</description>
  </item></channel></rss>`;

  assert.equal(parseNoteRSS(readMoreOnlyRss)[0].description, "");
});

test("keeps the excerpt while removing note's actual read-more link", () => {
  const noteRss = `<?xml version="1.0"?><rss version="2.0"><channel><item>
    <title>テスト記事</title>
    <link>https://note.com/example/n/n789</link>
    <description><![CDATA[<p name="022ae7ae-326b-468b-8272-adefbf0d507e" id="022ae7ae-326b-468b-8272-adefbf0d507e">テスト記事だよ</p><br/><a href='https://note.com/example/n/n789'>続きをみる</a>]]></description>
  </item></channel></rss>`;

  assert.equal(parseNoteRSS(noteRss)[0].description, "テスト記事だよ");
});

test("decodes XML and HTML entities without interpreting literal text as markup", () => {
  const entityRss = `<rss><channel><item>
    <title>A &amp; B &lt;C&gt;</title>
    <link>https://note.com/example/n/entities</link>
    <description><![CDATA[<p>A &amp; B &lt;C&gt; &quot;D&quot; &#39;E&#39; &#x1F600; &copy; &amp;lt;</p><script>hidden()</script>]]></description>
    <media:thumbnail>https://assets.st-note.com/image.png?width=800&amp;height=400</media:thumbnail>
  </item><item>
    <title><![CDATA[Literal &amp; <title>]]></title>
    <link>https://note.com/example/n/escaped</link>
    <description>&lt;p&gt;A &amp;amp; B&lt;/p&gt;</description>
  </item></channel></rss>`;
  const articles = parseNoteRSS(entityRss);
  assert.equal(articles[0].title, "A & B <C>");
  assert.equal(articles[0].description, 'A & B <C> "D" \'E\' 😀 © &lt;');
  assert.equal(articles[0].thumbnailUrl, "https://assets.st-note.com/image.png?width=800&height=400");
  assert.equal(articles[1].title, "Literal &amp; <title>");
  assert.equal(articles[1].description, "A & B");
});

test("counts decoded characters when truncating excerpts", () => {
  const entityRss = `<rss><channel><item>
    <title>Long excerpt</title><link>https://note.com/example/n/long</link>
    <description><![CDATA[<p>${"&amp;".repeat(121)}</p>]]></description>
  </item></channel></rss>`;
  assert.equal(parseNoteRSS(entityRss)[0].description, `${"&".repeat(120)}…`);
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
