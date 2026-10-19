import { test, expect, type Page } from "@playwright/test";

const articlePath = "/projects/e2e-project-13";
const targetId = "2026-検証";
const targetTitle = "2026年の検証";
const targetHash = `#${encodeURIComponent(targetId)}`;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("naganuma-login-intro-seen", "1"));
});

async function expectAnchorPosition(page: Page) {
  await expect.poll(() => page.evaluate((id) => {
    const target = document.getElementById(id)!;
    const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)
      + parseFloat(getComputedStyle(target).scrollMarginTop);
    return Math.abs(target.getBoundingClientRect().top - offset);
  }, targetId)).toBeLessThanOrEqual(2);
}

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`TOC click and a direct anchor use the same position (${reducedMotion})`, async ({ page, isMobile }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto(articlePath);
    await page.evaluate(() => document.fonts.ready);
    if (isMobile) await page.locator(".toc-mobile-accordion summary").click();
    const toc = page.getByRole("navigation", { name: isMobile ? "モバイル用目次" : "記事の目次" });
    await toc.getByRole("link", { name: targetTitle, exact: true }).click();
    await expect(page).toHaveURL(`${articlePath}${targetHash}`);
    if (isMobile) await expect(page.locator(".toc-mobile-accordion")).not.toHaveAttribute("open");
    await expectAnchorPosition(page);
    await expect(page.locator(`[id="${targetId}"]`)).toBeFocused();
    if (!isMobile) await expect(toc.getByRole("link", { name: targetTitle, exact: true })).toHaveAttribute("aria-current", "location");

    // A different document ensures this is a fresh anchor URL, not same-page history.
    await page.goto("/about");
    await page.goto(`${articlePath}${targetHash}`);
    await page.evaluate(() => document.fonts.ready);
    await expectAnchorPosition(page);
  });
}

test("only the visible TOC listens to scrolling across the 1024px breakpoint", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${articlePath}${targetHash}`);
  await page.evaluate(() => document.fonts.ready);
  const cdp = await page.context().newCDPSession(page);
  for (const width of [1023, 1024, 375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const desktop = width >= 1024;
    if (!desktop) await page.locator(".toc-mobile-accordion summary").click();
    const toc = page.getByRole("navigation", { name: desktop ? "記事の目次" : "モバイル用目次" });
    await toc.getByRole("link", { name: targetTitle, exact: true }).click();
    await expectAnchorPosition(page);
    await expect.poll(async () => {
      const { result } = await cdp.send("Runtime.evaluate", {
        expression: "(getEventListeners(window).scroll || []).length",
        includeCommandLineAPI: true,
        returnByValue: true,
      });
      return result.value;
    }).toBe(1);
  }
  await cdp.detach();
});

test("an encoded fragment at the end of a client navigation causes no selector error", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/projects?page=3");
  // Set the fragment as article markup arrives, before passive effects and the
  // transition timer. Waiting until click() returns races with a fast transition.
  await page.evaluate(({ id, hash }) => {
    const observer = new MutationObserver(() => {
      if (!document.getElementById(id)) return;
      observer.disconnect();
      history.replaceState(history.state, "", hash);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }, { id: targetId, hash: targetHash });
  await page.getByRole("link", { name: "E2E Project 13", exact: true }).click();
  await expect(page).toHaveURL(`${articlePath}${targetHash}`);
  await expect(page.locator('[role="status"][data-phase]')).toHaveAttribute("data-phase", "idle");
  await expectAnchorPosition(page);
  expect(errors).toEqual([]);
});


test("entity IDs and labels work without creating event attributes", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(articlePath);
  await page.evaluate(() => document.fonts.ready);
  if (isMobile) await page.locator(".toc-mobile-accordion summary").click();
  const toc = page.getByRole("navigation", { name: isMobile ? "モバイル用目次" : "記事の目次" });
  const link = toc.getByRole("link", { name: "A & B", exact: true });
  await expect(link).toHaveAttribute("href", "#a%26b");
  await link.click();
  await expect(page).toHaveURL(`${articlePath}#a%26b`);
  await expect(page.getByRole("heading", { name: "A & B", exact: true })).toBeFocused();
  await expect(page.locator(".article-body [onmouseover]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "安全なID", exact: true }))
    .toHaveAttribute("id", "$& onmouseover=window.pwned=1//");
});
