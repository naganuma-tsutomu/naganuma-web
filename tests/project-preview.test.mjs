import assert from "node:assert/strict";
import { test } from "node:test";
import {
  decodeProjectPreviewToken,
  encodeProjectPreviewToken,
  isValidDraftKey,
  isValidProjectContentId,
} from "../lib/project-preview.ts";

test("preview tokens round-trip the content ID and draft key", () => {
  const token = { contentId: "project-alpha_2", draftKey: "draft_key-123" };
  const encoded = encodeProjectPreviewToken(token);
  assert.equal(encoded.includes(token.draftKey), false);
  assert.deepEqual(decodeProjectPreviewToken(encoded), token);
});

test("invalid or malformed preview tokens fail closed", () => {
  for (const value of [
    undefined,
    "",
    "not-base64",
    Buffer.from("{}").toString("base64url"),
    Buffer.from(JSON.stringify({ contentId: "../secret", draftKey: "valid" })).toString("base64url"),
  ]) {
    assert.equal(decodeProjectPreviewToken(value), null);
  }
});

test("preview identifiers accept only bounded URL-safe values", () => {
  assert.equal(isValidProjectContentId("project-alpha_2"), true);
  assert.equal(isValidDraftKey("draft_key-123"), true);
  for (const value of ["", "../secret", "a/b", "a?b", "日本語"]) {
    assert.equal(isValidProjectContentId(value), false);
    assert.equal(isValidDraftKey(value), false);
  }
});
