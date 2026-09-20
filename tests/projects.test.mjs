import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { getProject, getProjectList, getProjectPage } from "../lib/projects.ts";

let saved;
beforeEach(() => {
  saved = { ...process.env };
  process.env.NODE_ENV = "production";
  process.env.MICROCMS_SERVICE_DOMAIN = "portfolio";
  process.env.MICROCMS_API_KEY = "test-key";
  delete process.env.MICROCMS_PROJECTS_ENDPOINT;
});
afterEach(() => {
  process.env = saved;
  mock.restoreAll();
});

function cms(count, collisions = []) {
  return mock.method(globalThis, "fetch", async (url) => {
    if (url.searchParams.has("ids")) {
      assert.equal(url.searchParams.get("fields"), "id");
      assert.equal(url.searchParams.get("limit"), "6");
      return Response.json({ contents: collisions.map(id => ({ id })), totalCount: collisions.length });
    }
    const offset = Number(url.searchParams.get("offset"));
    const limit = Number(url.searchParams.get("limit"));
    assert.equal(url.searchParams.get("orders"), "-publishedAt");
    assert.equal(url.searchParams.get("fields"), "id,title,description,thumbnail,publishedAt");
    const contents = Array.from({ length: Math.max(0, Math.min(limit, count - offset)) }, (_, i) => ({
      id: `real-${offset + i}`, title: `Project ${offset + i}`, description: "Description",
    }));
    return Response.json({ contents, totalCount: count });
  });
}

test("fetches only six records at the requested offset for a CMS with 101 articles", async () => {
  const fetch = cms(101);
  const result = await getProjectPage("17", false);
  assert.equal(fetch.mock.callCount(), 1);
  const url = fetch.mock.calls[0].arguments[0];
  assert.equal(url.searchParams.get("limit"), "6");
  assert.equal(url.searchParams.get("offset"), "96");
  assert.equal(result.page, 17);
  assert.equal(result.totalPages, 17);
  assert.deepEqual(result.items.map(({ project }) => project.slug), ["real-96", "real-97", "real-98", "real-99", "real-100"]);
});

test("keeps the home query limited to three articles", async () => {
  const fetch = cms(101);
  const result = await getProjectList(3);
  assert.equal(result.projects.length, 3);
  assert.equal(result.totalCount, 101);
  assert.equal(fetch.mock.callCount(), 1);
});

test("clamps an out-of-range page and fetches the last page", async () => {
  const fetch = cms(13);
  const result = await getProjectPage("999", false);
  assert.equal(result.page, 3);
  assert.equal(result.totalPages, 3);
  assert.deepEqual(result.items.map(({ project }) => project.slug), ["real-12"]);
  assert.equal(fetch.mock.callCount(), 2);
  assert.equal(fetch.mock.calls[1].arguments[0].searchParams.get("offset"), "12");
});

test("invalid page values use page one", async () => {
  cms(13);
  for (const raw of [undefined, ["2"], "0", "-1", "1.5", "abc", "9007199254740991", "9007199254740992"]) {
    const result = await getProjectPage(raw, false);
    assert.equal(result.page, 1);
    assert.equal(result.items[0].project.slug, "real-0");
  }
});

test("an empty CMS produces an empty first page", async () => {
  const fetch = cms(0);
  assert.deepEqual(await getProjectPage("99", false), { items: [], page: 1, totalPages: 1 });
  assert.equal(fetch.mock.callCount(), 1);
});

test("appends samples across page boundaries and excludes collisions on other CMS pages", async () => {
  cms(7, ["project-alpha"]);
  const result = await getProjectPage("2", true);
  assert.equal(result.totalPages, 2);
  assert.deepEqual(result.items.map(({ project, sample }) => [project.slug, sample]), [
    ["real-6", false], ["project-beta", true], ["project-gamma", true],
    ["project-delta", true], ["project-epsilon", true], ["project-zeta", true],
  ]);
});

test("sample-only pages start at the correct sample offset", async () => {
  cms(8);
  const result = await getProjectPage("3", true);
  assert.equal(result.totalPages, 3);
  assert.deepEqual(result.items.map(({ project }) => project.slug), ["project-epsilon", "project-zeta"]);
  assert.ok(result.items.every(({ sample }) => sample));
  assert.deepEqual(await getProjectPage("999", true), result);
});

test("development fallback stays paginated without duplicate samples", async () => {
  process.env.NODE_ENV = "development";
  delete process.env.MICROCMS_SERVICE_DOMAIN;
  delete process.env.MICROCMS_API_KEY;
  const fetch = mock.method(globalThis, "fetch", () => { throw new Error("Unexpected fetch"); });
  const result = await getProjectPage("2", true);
  assert.equal(result.page, 1);
  assert.equal(result.totalPages, 1);
  assert.equal(result.items.length, 6);
  assert.equal(new Set(result.items.map(({ project }) => project.slug)).size, 6);
  assert.equal(fetch.mock.callCount(), 0);
});

test("CMS errors propagate to the page's unavailable fallback", async () => {
  mock.method(globalThis, "fetch", async () => new Response(null, { status: 503 }));
  await assert.rejects(getProjectPage("1", true), /503/);
});

test("rejects malformed CMS totals and invalid pagination parameters", async () => {
  mock.method(globalThis, "fetch", async () => Response.json({ contents: [], totalCount: -1 }));
  await assert.rejects(getProjectList(), /Invalid microCMS list/);
  for (const args of [[0], [101], [6, -1], [6, 0.5]]) {
    await assert.rejects(getProjectList(...args), /Invalid project pagination/);
  }
});

const article = {
  id: "real-article", title: "Real article", description: "A project",
  content: "<p>Article body</p>", publishedAt: "2026-09-20T00:00:00.000Z",
  thumbnail: { url: "https://images.microcms-assets.io/assets/service/image.jpg" },
};

test("loads an article from the configured endpoint with its metadata", async () => {
  process.env.MICROCMS_PROJECTS_ENDPOINT = "works";
  const fetch = mock.method(globalThis, "fetch", async url => {
    assert.equal(url.pathname, "/api/v1/works/real-article");
    return Response.json(article);
  });
  assert.deepEqual(await getProject("real-article"), {
    slug: article.id, title: article.title, description: article.description,
    content: article.content, publishedAt: article.publishedAt,
    imageUrl: article.thumbnail.url, isSample: false,
  });
  assert.equal(fetch.mock.callCount(), 1);
});

test("rejects invalid article slugs before making a request", async () => {
  const fetch = mock.method(globalThis, "fetch", () => { throw new Error("Unexpected fetch"); });
  for (const slug of ["", "../secret", "a/b", "a?draftKey=secret", "%2F", "日本語"]) {
    assert.equal(await getProject(slug), null);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("only article 404s become missing articles; authentication and outage errors propagate", async () => {
  let status = 404;
  mock.method(globalThis, "fetch", async () => new Response(null, { status }));
  assert.equal(await getProject("missing"), null);
  for (status of [401, 403, 429, 500, 503]) {
    await assert.rejects(getProject("real-article"), error => error.status === status);
  }
});

test("article transport failures and invalid JSON propagate", async () => {
  const fetch = mock.method(globalThis, "fetch", async () => { throw new Error("Connection failed"); });
  await assert.rejects(getProject("real-article"), /Connection failed/);
  fetch.mock.mockImplementation(async () => new Response("invalid JSON"));
  await assert.rejects(getProject("real-article"), SyntaxError);
});

test("validates required list and article fields", async () => {
  let payload;
  mock.method(globalThis, "fetch", async () => Response.json(payload));
  for (const invalid of [{ ...article, id: "" }, { ...article, title: "" }, { ...article, description: null }]) {
    payload = invalid;
    await assert.rejects(getProject("real-article"), /Invalid projects schema/);
    payload = { contents: [invalid], totalCount: 1 };
    await assert.rejects(getProjectList(), /Invalid projects schema/);
  }
  for (const content of [undefined, null, 42]) {
    payload = { ...article, content };
    await assert.rejects(getProject("real-article"), /content must be rich-editor HTML/);
  }
  for (payload of [{ contents: null, totalCount: 0 }, { contents: [], totalCount: "1" }]) {
    await assert.rejects(getProjectList(), /Invalid microCMS list response/);
  }
});

test("uses a placeholder for missing or untrusted thumbnails in lists and articles", async () => {
  let payload;
  mock.method(globalThis, "fetch", async () => Response.json(payload));
  for (const url of [undefined, "http://images.microcms-assets.io/assets/image.jpg", "https://images.microcms-assets.io.evil.test/assets/image.jpg", "https://example.com/image.jpg"]) {
    payload = { ...article, thumbnail: url ? { url } : undefined };
    assert.equal((await getProject("real-article")).imageUrl, "/images/no-image.jpg");
    payload = { contents: [payload], totalCount: 1 };
    assert.equal((await getProjectList()).projects[0].imageUrl, "/images/no-image.jpg");
  }
});

test("development article fallback marks samples and returns null for unknown slugs", async () => {
  process.env.NODE_ENV = "development";
  delete process.env.MICROCMS_SERVICE_DOMAIN;
  delete process.env.MICROCMS_API_KEY;
  const fetch = mock.method(globalThis, "fetch", () => { throw new Error("Unexpected fetch"); });
  const sample = await getProject("project-alpha");
  assert.equal(sample.slug, "project-alpha");
  assert.equal(sample.isSample, true);
  assert.match(sample.content, /サンプル/);
  assert.equal(await getProject("missing"), null);
  assert.equal(fetch.mock.callCount(), 0);
});

test("missing production configuration never returns sample articles or lists", async () => {
  delete process.env.MICROCMS_SERVICE_DOMAIN;
  delete process.env.MICROCMS_API_KEY;
  const fetch = mock.method(globalThis, "fetch", () => { throw new Error("Unexpected fetch"); });
  await assert.rejects(getProject("project-alpha"), /Sample projects are available only in development/);
  await assert.rejects(getProjectList(), /Sample projects are available only in development/);
  assert.equal(fetch.mock.callCount(), 0);
});
