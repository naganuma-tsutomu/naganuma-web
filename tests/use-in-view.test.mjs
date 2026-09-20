import assert from "node:assert/strict";
import { test } from "node:test";
import { useInView } from "../lib/useInView.ts";

test("useInView is defined and exported as a function", () => {
  assert.equal(typeof useInView, "function");
});
