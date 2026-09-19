import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { paginate, sampleContentEnabled, sampleExperienceEnabled } from "../lib/sample-content.ts";

const savedSetting = process.env.SHOW_SAMPLE_CONTENT;
const savedNodeEnv = process.env.NODE_ENV;
afterEach(() => {
  if (savedSetting === undefined) delete process.env.SHOW_SAMPLE_CONTENT;
  else process.env.SHOW_SAMPLE_CONTENT = savedSetting;
  if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = savedNodeEnv;
});

test("the sample content switch is off unless explicitly enabled", () => {
  delete process.env.SHOW_SAMPLE_CONTENT;
  assert.equal(sampleContentEnabled(), false);
  process.env.SHOW_SAMPLE_CONTENT = "false";
  assert.equal(sampleContentEnabled(), false);
  process.env.SHOW_SAMPLE_CONTENT = "true";
  assert.equal(sampleContentEnabled(), true);
});

test("the sample experience requires both development mode and the sample switch", () => {
  process.env.NODE_ENV = "development";
  process.env.SHOW_SAMPLE_CONTENT = "false";
  assert.equal(sampleExperienceEnabled(), false);

  process.env.SHOW_SAMPLE_CONTENT = "true";
  assert.equal(sampleExperienceEnabled(), true);

  process.env.NODE_ENV = "production";
  assert.equal(sampleExperienceEnabled(), false);
});

test("a seventh item is available on the second listing page", () => {
  const first = paginate([1, 2, 3, 4, 5, 6, 7], "1");
  assert.deepEqual(first, { items: [1, 2, 3, 4, 5, 6], page: 1, totalPages: 2, startIndex: 0 });

  const second = paginate([1, 2, 3, 4, 5, 6, 7], "2");
  assert.deepEqual(second, { items: [7], page: 2, totalPages: 2, startIndex: 6 });
});

test("invalid and out-of-range page values stay within the listing", () => {
  assert.equal(paginate([1], "-1").page, 1);
  assert.equal(paginate([1], ["1", "2"]).page, 1);
  assert.equal(paginate([1, 2, 3, 4, 5, 6, 7], "99").page, 2);
  assert.deepEqual(paginate([], undefined).items, []);
});
