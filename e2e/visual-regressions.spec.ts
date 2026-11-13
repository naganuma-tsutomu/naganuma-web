import { test, expect } from "./fixtures/test";

const firstVisitTitle = "first-visit intro keeps focus inside and restores the reader";

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.title === firstVisitTitle) return;
  await page.addInitScript(() => localStorage.setItem("naganuma-login-intro-seen", "1"));
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("intermediate widths keep a full-width reader and wide screens keep enough reading space", async ({ page }) => {
  await page.goto("/projects");
  for (const width of [960, 1024, 1279, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const split = width >= 1280;
    await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", split ? "split" : "flow");
    await expect(page.locator("[data-page-reader]")).toHaveAttribute("data-scroll", split ? "internal" : "document");
    await expect.poll(() => page.locator("[data-page-reader]").evaluate(element => element.clientWidth)).toBeGreaterThanOrEqual(split ? 700 : width - 100);
  }
});

test("long unbroken project titles wrap inside their cards", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projects");
  const title = page.locator(".project-card h3").first();
  await title.evaluate(element => { element.textContent = "ProxmoxInfrastructureAutomation"; });
  await expect.poll(() => title.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  expect(await title.evaluate(element => element.clientHeight)).toBeGreaterThan(36);
});

test("image failures fall back in notes, project cards, and article covers", async ({ page }) => {
  await page.route(url => url.pathname === "/_next/image", route => route.fulfill({ status: 404, body: "Not found" }));
  await page.goto("/notes");
  const note = page.locator(".note-card").first();
  await note.scrollIntoViewIfNeeded();
  await expect(note.locator("[data-image-fallback]")).toBeVisible();
  await expect(note.locator("img")).toHaveCount(0);
  await page.goto("/projects");
  const project = page.locator(".project-card").first();
  await project.scrollIntoViewIfNeeded();
  await expect(project.locator("[data-image-fallback]")).toBeVisible();
  await expect(project.locator("[data-project-image-loading], img")).toHaveCount(0);
  await project.getByRole("link").click();
  await expect(page.locator(".article-cover [data-image-fallback]")).toBeVisible();
  await expect(page.locator(".article-cover img")).toHaveCount(0);
});

test("notes with and without thumbnails align their heading positions", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/notes");
  const cards = page.locator(".note-card");
  await expect(cards.nth(0).locator("img")).toBeVisible();
  await expect(cards.nth(1).locator("[data-image-fallback]")).toBeVisible();
  const headings = await cards.locator("h3").evaluateAll(elements => elements.slice(0, 2).map(element => element.getBoundingClientRect().top));
  expect(Math.abs(headings[0] - headings[1])).toBeLessThan(1);
});

test("mobile status has one visible state label and panel ornaments retain their size", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  const status = page.locator("[data-mobile-status]");
  await status.scrollIntoViewIfNeeded();
  await expect(status.locator("[data-state]:visible")).toHaveCount(1);
  await expect(status.getByText("MAKE", { exact: false })).toBeHidden();
  const profileDots = page.locator(".panel-titlebar").first().locator("i");
  await expect(profileDots).toHaveCount(3);
  expect(await profileDots.evaluateAll(elements => elements.every(element => element.getBoundingClientRect().width >= 9 && element.getBoundingClientRect().height >= 9))).toBe(true);
});

test("mobile contact exposes both profile links before the explanatory section", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact");
  const links = page.locator(".contact-grid .dark-panel a");
  await expect(links).toHaveCount(2);
  await expect(links.nth(0)).toBeInViewport({ ratio: 0.99 });
  await expect(links.nth(1)).toBeInViewport({ ratio: 0.99 });
  expect((await links.last().boundingBox())!.y).toBeLessThan((await page.locator(".contact-details").boundingBox())!.y);
});

test(firstVisitTitle, async ({ page }) => {
  const time = new Date("2026-11-07T01:00:00Z");
  await page.clock.install({ time });
  await page.clock.pauseAt(new Date(time.getTime() + 1000));
  await page.goto("/");
  await page.clock.runFor(300);
  const skip = page.getByRole("button", { name: "SKIP INTRO" });
  await expect(page.getByRole("dialog", { name: "ウェルカム画面" })).toBeFocused();
  await expect(page.locator("[data-workspace]")).toHaveAttribute("inert");
  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(skip).toBeFocused();
  await page.keyboard.press("Escape");
  await page.clock.runFor(600);
  await expect(page.locator("[data-login-intro]")).toHaveCount(0);
  await expect(page.locator("[data-workspace]")).not.toHaveAttribute("inert");
  await expect(page.locator("[data-home-reader]")).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});
