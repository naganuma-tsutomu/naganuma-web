import { test as base, type BrowserContext } from "@playwright/test";
import { fileURLToPath } from "node:url";

// Card interaction tests use a local image, including when Next optimizes its URL.
export async function mockNoteThumbnail(context: BrowserContext) {
  await context.route(url => url.pathname === "/_next/image" && url.searchParams.get("url") === "https://assets.st-note.com/e2e-thumbnail.jpg", route => route.fulfill({
    path: fileURLToPath(new URL("../../public/images/no-image.jpg", import.meta.url)),
    contentType: "image/jpeg",
  }));
}

export const test = base.extend({
  context: async ({ context }, run) => {
    await mockNoteThumbnail(context);
    await run(context);
  },
});

export { expect, type Page } from "@playwright/test";
