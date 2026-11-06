import { test, expect, mockNoteThumbnail, type Page } from "./fixtures/test";

const reader = (page: Page) => page.locator("[data-page-reader]");

test.beforeEach(async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("naganuma-login-intro-seen", "1"));
  if (testInfo.project.name === "Desktop Chrome") await page.setViewportSize({ width: 1440, height: 1000 });
});

test("other pages share the left window and keep content and footer inside", async ({ page }, testInfo) => {
  const desktop = testInfo.project.name === "Desktop Chrome";
  for (const [path, title] of [["/about", "ABOUT"], ["/projects", "PROJECTS"], ["/notes", "NOTES"], ["/contact", "CONTACT"], ["/projects/e2e-project-01", "PROJECTS"]]) {
    await page.goto(path);
    const window = page.locator("[data-page-window]");
    await expect(window).toHaveAttribute("data-layout", desktop ? "window" : "flow");
    await expect(window).toContainText(`${title} — naganuma-web`);
    await expect(reader(page).locator("h1")).toBeVisible();
    await expect(reader(page).locator("[data-site-footer]")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (desktop) {
      expect(Math.round((await window.boundingBox())!.width)).toBe(904);
      await expect(page.locator("[data-terminal-sidebar]")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
      const titleBar = await window.locator("section > div").first().boundingBox();
      await reader(page).evaluate(element => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
      await expect(reader(page).locator("[data-site-footer]")).toBeInViewport({ ratio: 0.99 });
      expect(await window.locator("section > div").first().boundingBox()).toEqual(titleBar);
      expect(await page.evaluate(() => scrollY)).toBe(0);
    } else {
      expect(await reader(page).evaluate(element => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
      await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      await expect(reader(page).locator("[data-site-footer]")).toBeInViewport({ ratio: 0.99 });
      expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    }
  }
});

test("page windows support keyboard reading, skip links, history, and pagination", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Desktop reader navigation");
  await page.goto("/projects");
  await expect(reader(page)).toHaveAttribute("data-scroll", "internal");
  await page.locator(".skip-link").focus();
  await page.keyboard.press("Enter");
  await expect(reader(page)).toBeFocused();
  await page.evaluate(() => document.fonts.ready);
  await page.keyboard.press("PageDown");
  await expect.poll(() => reader(page).evaluate(element => element.scrollTop)).toBeGreaterThan(100);
  // Native keyboard scrolling can continue after the key event, even with reduced motion.
  await expect.poll(() => reader(page).evaluate(async element => {
    const top = element.scrollTop;
    for (let frame = 0; frame < 4; frame++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      if (element.scrollTop !== top) return false;
    }
    return true;
  })).toBe(true);
  const position = await reader(page).evaluate(element => element.scrollTop);
  await expect.poll(() => page.evaluate(() => window.history.state?.naganumaPagePosition?.route)).toBe("/projects");
  await page.getByRole("navigation", { name: "メインナビゲーション" }).getByRole("link", { name: "ABOUT", exact: true }).click();
  await expect(page).toHaveURL("/about");
  await expect(reader(page)).toHaveAttribute("data-scroll", "internal");
  expect(await reader(page).evaluate(element => element.scrollTop)).toBe(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/projects#main-content$/);
  await expect.poll(async () => Math.abs(await reader(page).evaluate(element => element.scrollTop) - position)).toBeLessThan(3);
  await reader(page).evaluate(element => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
  await page.getByRole("link", { name: "NEXT →", exact: true }).click();
  await expect(page).toHaveURL("/projects?page=2");
  await expect(reader(page)).toHaveAttribute("data-scroll", "internal");
  await expect.poll(() => reader(page).evaluate(element => element.scrollTop)).toBe(0);
});

test("switching to a narrow or short screen retains the reading position and normal scrolling", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Desktop-to-flow transitions");
  await page.goto("/projects/e2e-project-13#2026-%E6%A4%9C%E8%A8%BC");
  await expect(reader(page)).toHaveAttribute("data-scroll", "internal");
  const target = page.getByRole("heading", { name: "2026年の検証", exact: true });
  await expect(target).toBeInViewport();
  await reader(page).evaluate(element => element.scrollBy({ top: 160, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => window.history.state?.naganumaPagePosition?.id)).toBe("2026-検証");
  const offset = await page.evaluate(() => window.history.state.naganumaPagePosition.offset);
  for (const [width, height, mode] of [[390, 900, "document"], [1440, 600, "document"], [1440, 1000, "internal"]] as const) {
    await page.setViewportSize({ width, height });
    await expect(reader(page)).toHaveAttribute("data-scroll", mode);
    await expect.poll(() => page.evaluate(() => window.history.state.naganumaPagePosition.offset)).toBeCloseTo(offset, 0);
    if (mode === "document") expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
    else expect(await page.evaluate(() => scrollY)).toBe(0);
  }
  await page.goto("/projects");
  await expect(reader(page)).toHaveAttribute("data-scroll", "internal");
  const card = page.locator(".project-card").first();
  const id = await card.getAttribute("id");
  await card.evaluate(element => {
    const viewport = document.querySelector<HTMLElement>("[data-page-reader]")!;
    viewport.scrollTo({ top: viewport.scrollTop + element.getBoundingClientRect().top - viewport.getBoundingClientRect().top + 40, behavior: "instant" });
  });
  await expect.poll(() => page.evaluate(() => window.history.state.naganumaPagePosition?.id)).toBe(id);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(reader(page)).toHaveAttribute("data-scroll", width >= 960 ? "internal" : "document");
    await expect.poll(() => page.evaluate(() => window.history.state.naganumaPagePosition?.id)).toBe(id);
  }
});

test("printing and no-JavaScript rendering expose the whole page", async ({ page, browser, baseURL }) => {
  await page.goto("/projects");
  await page.emulateMedia({ media: "print" });
  expect(await reader(page).evaluate(element => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
  await expect(page.locator("[data-site-footer]")).toHaveCount(1);
  await expect(page.locator(".project-card").last()).toHaveCSS("opacity", "1");
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 1440, height: 1000 } });
  await mockNoteThumbnail(context);
  try {
    const fallback = await context.newPage();
    await fallback.goto("/projects");
    await expect(fallback.locator("[data-page-window]")).toHaveAttribute("data-layout", "flow");
    await expect(fallback.locator(".project-card")).toHaveCount(6);
    await expect(fallback.locator(".project-card").last()).toHaveCSS("opacity", "1");
    expect(await fallback.locator("[data-page-reader]").evaluate(element => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
  } finally { await context.close(); }
});
