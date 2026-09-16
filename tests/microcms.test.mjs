import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { getMicroCMSConfig, microCMSGet, MicroCMSError } from "../lib/microcms.ts";

let savedDomain;
let savedKey;
let savedEndpoint;
beforeEach(() => {
  savedDomain = process.env.MICROCMS_SERVICE_DOMAIN;
  savedKey = process.env.MICROCMS_API_KEY;
  savedEndpoint = process.env.MICROCMS_PROJECTS_ENDPOINT;
  delete process.env.MICROCMS_SERVICE_DOMAIN;
  delete process.env.MICROCMS_API_KEY;
  delete process.env.MICROCMS_PROJECTS_ENDPOINT;
});
afterEach(() => {
  if (savedDomain === undefined) delete process.env.MICROCMS_SERVICE_DOMAIN;
  else process.env.MICROCMS_SERVICE_DOMAIN = savedDomain;
  if (savedKey === undefined) delete process.env.MICROCMS_API_KEY;
  else process.env.MICROCMS_API_KEY = savedKey;
  if (savedEndpoint === undefined) delete process.env.MICROCMS_PROJECTS_ENDPOINT;
  else process.env.MICROCMS_PROJECTS_ENDPOINT = savedEndpoint;
  mock.restoreAll();
});

test("only completely missing configuration enables sample mode", () => {
  assert.equal(getMicroCMSConfig(), null);
  process.env.MICROCMS_SERVICE_DOMAIN = "portfolio";
  assert.throws(() => getMicroCMSConfig(), /Set both/);
  delete process.env.MICROCMS_SERVICE_DOMAIN;
  process.env.MICROCMS_API_KEY = "test-key";
  assert.throws(() => getMicroCMSConfig(), /Set both/);
});

test("rejects a URL or another host instead of a service ID", () => {
  process.env.MICROCMS_API_KEY = "test-key";
  for (const domain of ["https://portfolio.microcms.io", "portfolio.example.com", "bad/service", "-bad"]) {
    process.env.MICROCMS_SERVICE_DOMAIN = domain;
    assert.throws(() => getMicroCMSConfig(), /service ID/);
  }
});

test("sends authentication only as a header and caches the public query", async () => {
  process.env.MICROCMS_SERVICE_DOMAIN = "portfolio";
  process.env.MICROCMS_API_KEY = "test-secret-never-in-url";
  const response = { contents: [{ id: "first", title: "First" }], totalCount: 1 };
  const fetch = mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url.origin, "https://portfolio.microcms.io");
    assert.equal(url.pathname, "/api/v1/projects");
    assert.equal(url.searchParams.get("limit"), "100");
    assert.equal(url.searchParams.get("offset"), "100");
    assert.equal(url.searchParams.has("draftKey"), false);
    assert.equal(url.href.includes(process.env.MICROCMS_API_KEY), false);
    assert.equal(options.headers["X-MICROCMS-API-KEY"], process.env.MICROCMS_API_KEY);
    assert.equal(options.next.revalidate, 60);
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json(response);
  });
  assert.deepEqual(await microCMSGet("projects", { limit: "100", offset: "100" }), response);
  assert.equal(fetch.mock.callCount(), 1);
});

test("distinguishes missing articles from auth errors and outages", async () => {
  process.env.MICROCMS_SERVICE_DOMAIN = "portfolio";
  process.env.MICROCMS_API_KEY = "test-key";
  let status = 404;
  mock.method(globalThis, "fetch", async () => new Response("upstream private details", { status }));
  for (status of [404, 401, 403, 500]) {
    await assert.rejects(microCMSGet("projects/missing"), error => {
      assert.ok(error instanceof MicroCMSError);
      assert.equal(error.status, status);
      assert.equal(error.message.includes("private details"), false);
      assert.equal(error.message.includes("test-key"), false);
      return true;
    });
  }
});

test("does not fetch when configuration is incomplete", async () => {
  process.env.MICROCMS_SERVICE_DOMAIN = "portfolio";
  const fetch = mock.method(globalThis, "fetch", async () => { throw new Error("Must not be called"); });
  await assert.rejects(microCMSGet("projects"), /Set both/);
  assert.equal(fetch.mock.callCount(), 0);
});

test("supports a configured API endpoint and defaults to projects", () => {
  process.env.MICROCMS_SERVICE_DOMAIN = "portfolio";
  process.env.MICROCMS_API_KEY = "test-key";
  assert.equal(getMicroCMSConfig().projectsEndpoint, "projects");
  process.env.MICROCMS_PROJECTS_ENDPOINT = " blogs ";
  assert.equal(getMicroCMSConfig().projectsEndpoint, "blogs");
  for (const endpoint of ["https://portfolio.microcms.io/api/v1/blogs", "/blogs", "../blogs"]) {
    process.env.MICROCMS_PROJECTS_ENDPOINT = endpoint;
    assert.throws(() => getMicroCMSConfig(), /endpoint name/);
  }
});

test("a missing list endpoint explains which settings to check", async () => {
  process.env.MICROCMS_SERVICE_DOMAIN = "portfolio";
  process.env.MICROCMS_API_KEY = "test-key";
  process.env.MICROCMS_PROJECTS_ENDPOINT = "blogs";
  mock.method(globalThis, "fetch", async url => {
    assert.equal(url.pathname, "/api/v1/blogs");
    return new Response(null, { status: 404 });
  });
  await assert.rejects(microCMSGet(getMicroCMSConfig().projectsEndpoint), error => {
    assert.match(error.message, /GET \/api\/v1\/blogs/);
    assert.match(error.message, /MICROCMS_SERVICE_DOMAIN and MICROCMS_PROJECTS_ENDPOINT/);
    assert.equal(error.message.includes("test-key"), false);
    return true;
  });
});
