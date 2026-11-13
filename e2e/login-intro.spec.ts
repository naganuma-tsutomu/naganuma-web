import { test, expect } from "./fixtures/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.install();
  await page.clock.pauseAt(new Date());
});

test("intro background covers the viewport including the reserved scrollbar gutter", async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 800 });
  await page.goto("/about");
  await page.clock.runFor(300);
  await expect(page.getByRole("dialog", { name: "ウェルカム画面" })).toBeFocused();

  // A document with a classic scrollbar reserves space even while scrolling is locked.
  await page.addStyleTag({ content: "::-webkit-scrollbar { width: 16px; }" });
  await expect(page.locator("html")).toHaveCSS("scrollbar-gutter", "auto");
  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 960, height: 800 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.locator("[data-login-intro]")).toHaveCSS("width", `${viewport.width}px`);
    const bounds = await page.locator("[data-login-intro]").boundingBox();
    expect(bounds).toEqual({ x: 0, y: 0, ...viewport });
    const frame = await page.locator("[data-login-intro] > div").boundingBox();
    expect(frame).not.toBeNull();
    expect(frame!.x).toBeGreaterThanOrEqual(0);
    expect(frame!.y).toBeGreaterThanOrEqual(0);
    expect(frame!.x + frame!.width).toBeLessThanOrEqual(viewport.width);
    expect(frame!.y + frame!.height).toBeLessThanOrEqual(viewport.height);
    await expect(page.getByRole("button", { name: "SKIP INTRO" })).toBeInViewport({ ratio: 1 });
  }
});

for (const exit of ["skip", "escape", "automatic"] as const) {
  test(`${exit} dismissal releases keyboard navigation and background scrolling`, async ({ page }) => {
    await page.goto("/");
    await page.clock.runFor(300);
    const skip = page.getByRole("button", { name: "SKIP INTRO" });
    await expect(page.getByRole("dialog", { name: "ウェルカム画面" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(skip).toBeFocused();

    if (exit === "skip") await skip.click();
    else if (exit === "escape") await page.keyboard.press("Escape");
    else await page.clock.runFor(1700);
    await page.clock.runFor(600);

    await expect(page.locator("[data-login-intro]")).toHaveCount(0);
    await expect(page.locator("[data-workspace]")).not.toHaveAttribute("inert");
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    const reader = page.locator("[data-home-reader]");
    await expect(reader).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(reader).not.toBeFocused();
  });
}

for (const exit of ["skip", "automatic"] as const) {
  test(`${exit} dismissal without keyboard input does not outline the home window`, async ({ page }) => {
    await page.goto("/");
    await page.clock.runFor(300);
    const dialog = page.getByRole("dialog", { name: "ウェルカム画面" });
    await expect(dialog).toBeFocused();
    await expect(dialog).toHaveCSS("outline-style", "none");
    await expect(page.getByRole("button", { name: "SKIP INTRO" })).toHaveCSS("outline-style", "none");

    if (exit === "skip") await page.getByRole("button", { name: "SKIP INTRO" }).click();
    else await page.clock.runFor(1700);
    await page.clock.runFor(600);
    await expect(page.locator("[data-login-intro]")).toHaveCount(0);
    await expect(page.locator("#main-content")).toBeFocused();
    await expect(page.locator("[data-home-reader]")).not.toBeFocused();
    await expect(page.locator("[data-home-reader]")).toHaveCSS("outline-style", "none");
    await page.keyboard.press("Tab");
    await expect(page.locator("#main-content")).not.toBeFocused();
  });
}

test("reduced motion skips the intro without locking the page", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.clock.runFor(300);
  await expect(page.locator("[data-login-intro]")).toHaveCount(0);
  await expect(page.locator("[data-workspace]")).not.toHaveAttribute("inert");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("return visits skip the intro and preserve the document gutter", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("naganuma-login-intro-seen", "1"));
  await page.setViewportSize({ width: 960, height: 800 });
  await page.goto("/about");
  await page.clock.runFor(300);
  await expect(page.locator("[data-login-intro]")).toHaveCount(0);
  await expect(page.locator("html")).toHaveCSS("scrollbar-gutter", "stable");
  await expect(page.locator("[data-workspace]")).not.toHaveAttribute("inert");
});
