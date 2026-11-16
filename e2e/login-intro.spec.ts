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
  await expect(page.locator("[data-intro-window]")).toHaveCount(0);
  await expect(page.locator("[data-intro-card]")).toHaveCount(1);

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
    const frame = await page.locator("[data-intro-stage]").boundingBox();
    expect(frame).not.toBeNull();
    expect(frame!.x).toBeGreaterThanOrEqual(0);
    expect(frame!.y).toBeGreaterThanOrEqual(0);
    expect(frame!.x + frame!.width).toBeLessThanOrEqual(viewport.width);
    expect(frame!.y + frame!.height).toBeLessThanOrEqual(viewport.height);
    await expect(page.getByRole("button", { name: "SKIP INTRO" })).toBeInViewport({ ratio: 1 });
    await expect(page.locator("[data-intro-card]")).toBeInViewport({ ratio: 1 });
  }
});

test("desktop panels fade in with HOME without moving sideways", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.clock.runFor(300);
  await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", "split");
  const sidebar = page.locator("[data-workspace-sidebar]");
  const home = page.locator("[data-home-window]");
  const restingSidebar = await sidebar.boundingBox();
  const restingHome = await home.boundingBox();
  const intro = page.locator("[data-login-intro]");

  await page.getByRole("button", { name: "SKIP INTRO" }).click();
  await expect(intro).toHaveAttribute("data-phase", "leaving");
  await intro.evaluate(element => {
    const animation = element.getAnimations().find(item => item instanceof CSSAnimation && item.animationName.includes("desktopReveal"))!;
    animation.pause();
    const timing = animation.effect!.getTiming();
    animation.currentTime = (timing.delay ?? 0) + Number(timing.duration) / 2;
  });
  const opacity = await intro.evaluate(element => Number(getComputedStyle(element).opacity));
  expect(opacity).toBeGreaterThan(0);
  expect(opacity).toBeLessThan(1);
  expect(await sidebar.boundingBox()).toEqual(restingSidebar);
  expect(await home.boundingBox()).toEqual(restingHome);
  await expect(sidebar).toHaveCSS("transform", "none");

  await page.clock.runFor(600);
  await expect(intro).toHaveCount(0);
  expect(await sidebar.boundingBox()).toEqual(restingSidebar);
  await expect(sidebar).not.toHaveAttribute("inert");
  await expect(sidebar).toHaveCSS("transform", "none");
});

test("HOME prepares its scrollbar before the intro reveals it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.clock.runFor(300);
  await expect(page.getByRole("dialog", { name: "ウェルカム画面" })).toBeFocused();
  await expect(page.locator("[data-workspace]")).toHaveAttribute("inert");
  const reader = page.locator("[data-home-reader]");
  await expect(reader).toHaveAttribute("data-scroll", "internal");
  await expect(reader).toHaveCSS("overflow-y", "auto");
  await expect(reader).toHaveCSS("scrollbar-gutter", "stable");
  expect(await reader.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  const before = await reader.evaluate(element => ({ width: element.clientWidth, height: element.clientHeight }));

  await page.getByRole("button", { name: "SKIP INTRO" }).click();
  await page.clock.runFor(300);
  expect(await reader.evaluate(element => ({ width: element.clientWidth, height: element.clientHeight }))).toEqual(before);
  await page.clock.runFor(400);
  await expect(page.locator("[data-login-intro]")).toHaveCount(0);
  expect(await reader.evaluate(element => ({ width: element.clientWidth, height: element.clientHeight }))).toEqual(before);
});

test("returning to HOME prepares internal scrolling while the loading window is open", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("naganuma-login-intro-seen", "1"));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/about");
  await page.clock.runFor(300);
  await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", "split");
  await page.getByRole("navigation", { name: "メインナビゲーション" }).getByRole("link", { name: "HOME", exact: true }).click();
  await page.clock.runFor(300);
  await expect(page).toHaveURL("/");
  await expect(page.locator("#main-content")).toHaveAttribute("inert");
  const reader = page.locator("[data-home-reader]");
  await expect(reader).toHaveAttribute("data-scroll", "internal");
  await expect(reader).toHaveCSS("overflow-y", "auto");
  const before = await reader.evaluate(element => ({ width: element.clientWidth, height: element.clientHeight }));
  await page.clock.runFor(1000);
  await expect(page.locator("#main-content")).not.toHaveAttribute("inert");
  expect(await reader.evaluate(element => ({ width: element.clientWidth, height: element.clientHeight }))).toEqual(before);
});

test("intro keeps the desktop background, header, and logo in place through dismissal", async ({ page }) => {
  await page.goto("/");
  await page.clock.runFor(300);
  const intro = page.locator("[data-login-intro]");
  await expect(intro).toBeFocused();
  const introLogo = await intro.locator(".site-wordmark").boundingBox();
  const mainLogo = page.locator(".site-header .site-wordmark");
  expect(await mainLogo.boundingBox()).toEqual(introLogo);
  expect(await page.locator("[data-intro-header]").boundingBox()).toEqual(await page.locator(".site-header").boundingBox());

  const background = await page.locator("body").evaluate(element => {
    const style = getComputedStyle(element);
    return { color: style.backgroundColor, image: style.backgroundImage, size: style.backgroundSize };
  });
  await expect(intro).toHaveCSS("background-color", background.color);
  await expect(intro).toHaveCSS("background-image", background.image);
  await expect(intro).toHaveCSS("background-size", background.size);

  await page.getByRole("button", { name: "SKIP INTRO" }).click();
  await expect(intro).toHaveAttribute("data-phase", "leaving");
  await expect(page.locator("[data-workspace]")).toHaveAttribute("inert");
  await page.clock.runFor(600);
  await expect(intro).toHaveCount(0);
  expect(await mainLogo.boundingBox()).toEqual(introLogo);
  await expect(page.locator("[data-workspace]")).not.toHaveAttribute("inert");
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
  expect(await page.locator("[data-workspace-sidebar]").evaluate(element => element.getAnimations().length)).toBe(0);
});

test("return visits skip the intro and preserve the document gutter", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("naganuma-login-intro-seen", "1"));
  await page.setViewportSize({ width: 960, height: 800 });
  await page.goto("/about");
  await page.clock.runFor(300);
  await expect(page.locator("[data-login-intro]")).toHaveCount(0);
  await expect(page.locator("html")).toHaveCSS("scrollbar-gutter", "stable");
  await expect(page.locator("[data-workspace]")).not.toHaveAttribute("inert");
  expect(await page.locator("[data-workspace-sidebar]").evaluate(element => element.getAnimations().length)).toBe(0);
});
