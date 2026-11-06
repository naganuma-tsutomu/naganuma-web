import { test, expect, mockNoteThumbnail, type Page } from "./fixtures/test";
import { cmsProjects } from "./fixtures/projects.mjs";
import { noteArticles } from "./fixtures/notes.mjs";

const panel = (page: Page) => page.locator(".terminal-panel");
const reader = (page: Page) => page.locator("[data-home-reader]");
const input = (page: Page) => page.locator("#terminal-command-input");
const navigation = (page: Page) => page.getByRole("navigation", { name: "ターミナルのセクション" });

async function section(page: Page, id: string) {
  await page.locator(`#${id}`).evaluate(element => {
    const root = document.querySelector<HTMLElement>("[data-workspace]")!;
    const viewport = document.querySelector<HTMLElement>("[data-home-reader]")!;
    if (root.dataset.layout === "split") {
      viewport.scrollTo({ top: viewport.scrollTop + element.getBoundingClientRect().top - viewport.getBoundingClientRect().top - 24, behavior: "instant" });
      viewport.dispatchEvent(new Event("scroll"));
    } else {
      window.scrollTo({ top: scrollY + element.getBoundingClientRect().top - document.querySelector(".site-header")!.getBoundingClientRect().bottom - 24, behavior: "instant" });
    }
  });
}

async function bookmark(page: Page) {
  return page.evaluate(() => {
    const viewport = document.querySelector<HTMLElement>("[data-home-reader]")!;
    const split = document.querySelector<HTMLElement>("[data-workspace]")!.dataset.layout === "split";
    const top = split ? viewport.getBoundingClientRect().top : document.querySelector(".site-header")!.getBoundingClientRect().bottom;
    const nodes = Array.from(viewport.querySelectorAll<HTMLElement>("[data-guide-section]"));
    const section = nodes.filter(element => element.getBoundingClientRect().top <= top + 1).at(-1) ?? nodes[0];
    return { section: section.dataset.guideSection, offset: top - section.getBoundingClientRect().top };
  });
}

test.beforeEach(async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: testInfo.title.includes("animation") ? "no-preference" : "reduce" });
  if (testInfo.project.name === "Desktop Chrome") await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => localStorage.setItem("naganuma-login-intro-seen", "1"));
  await page.goto("/");
  if (testInfo.project.name === "Desktop Chrome") await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", "split");
});

test("desktop reading window scrolls independently and follows four sections", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Desktop reading window");
  await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", "split");
  await expect(navigation(page).getByRole("link")).toHaveText(["TOP", "ABOUT", "PROJECT", "NOTES"]);
  await expect(panel(page)).toHaveAttribute("data-guide", "top");
  await expect(page.locator("[data-reader-title]")).toHaveText("TOP");
  expect((await panel(page).boundingBox())!.width).toBe(440);
  expect((await page.getByRole("region", { name: "本文ウィンドウ" }).boundingBox())!.width).toBeGreaterThan(760);
  const original = await panel(page).boundingBox();
  for (const [target, guide, label] of [["about-base", "about", "ABOUT"], ["projects", "projects", "PROJECT"], ["notes", "notes", "NOTES"], ["home", "top", "TOP"]]) {
    await section(page, target);
    await expect(panel(page)).toHaveAttribute("data-guide", guide);
    await expect(navigation(page).locator('[aria-current="location"]')).toHaveText(label);
    await expect(page.locator("[data-reader-title]")).toHaveText(label);
    expect(await panel(page).boundingBox()).toEqual(original);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  }
  await reader(page).focus();
  await page.keyboard.press("PageDown");
  await expect.poll(() => reader(page).evaluate(element => element.scrollTop)).toBeGreaterThan(100);
  await reader(page).evaluate(element => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
  await expect(page.locator("[data-site-footer]")).toBeInViewport({ ratio: 0.99 });
  await expect(page.locator("[data-site-footer]")).toHaveCount(1);
});

test("split screens never scroll the document and restore page scrolling outside that layout", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Desktop scroll containment");
  for (const [width, height] of [[1440, 1000], [1920, 1080], [1366, 768], [1280, 720], [960, 900]]) {
    await page.setViewportSize({ width, height });
    await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", "split");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(1);
    await expect(page.locator("[data-desktop-status]")).toBeInViewport({ ratio: 0.99 });
    await expect(page.getByRole("button", { name: "配置をリセット" })).toHaveCount(0);
    await reader(page).evaluate(element => element.scrollTo({ top: 0, behavior: "instant" }));
    await reader(page).hover();
    await page.mouse.wheel(0, 400);
    await expect.poll(() => reader(page).evaluate(element => element.scrollTop)).toBeGreaterThan(100);
    await reader(page).evaluate(element => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
    await expect(page.locator("[data-site-footer]")).toBeInViewport({ ratio: 0.99 });
    await page.mouse.wheel(0, 1000);
    await page.locator(".site-header").hover();
    await page.mouse.wheel(0, 1000);
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: "instant" }));
    expect(await page.evaluate(() => scrollY)).toBe(0);
  }
  for (const [width, height] of [[390, 900], [1440, 600]]) {
    await page.setViewportSize({ width, height });
    await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", "flow");
    await page.evaluate(() => window.scrollTo({ top: 500, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", "split");
  await page.getByRole("link", { name: "ABOUT", exact: true }).first().click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", "split");
  await expect(page.locator("[data-page-window]")).toHaveAttribute("data-layout", "window");
  await page.locator("[data-page-reader]").evaluate(element => element.scrollTo({ top: 500, behavior: "instant" }));
  await expect.poll(() => page.locator("[data-page-reader]").evaluate(element => element.scrollTop)).toBeGreaterThan(100);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test("tabs, terminal contents, and keyboard navigate the same reading region", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Desktop navigation");
  await panel(page).getByRole("link", { name: "projects/", exact: false }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(panel(page)).toHaveAttribute("data-guide", "projects");
  await navigation(page).getByRole("link", { name: "NOTES", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(panel(page)).toHaveAttribute("data-guide", "notes");
  const link = panel(page).getByRole("link", { name: noteArticles[0].title, exact: false });
  await expect(link).toHaveAttribute("href", noteArticles[0].url);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await expect(panel(page).locator("time").first()).toHaveAttribute("datetime", noteArticles[0].publishedAt);
  await expect(page.locator("#notes .note-card")).toHaveCount(3);
  await expect(page.locator("#notes .note-card").first().getByRole("link")).toHaveAttribute("href", noteArticles[0].url);
});

test("animation retains the original project and note card interactions inside the reading window", async ({ page }, testInfo) => {
  const project = page.locator("#projects .project-card").first();
  const surface = project.locator(".project-card-surface");
  await expect(project).toHaveCSS("opacity", "0");
  await section(page, "projects");
  await expect(project).toHaveCSS("opacity", "1");
  await expect(surface).toHaveCSS("border-top-width", "2px");
  await expect(surface).toContainText(`${cmsProjects[0].title}.md`);
  await expect(project.locator("img")).toHaveCSS("opacity", "1");
  if (testInfo.project.name === "Desktop Chrome") await project.hover();
  await expect(surface).toHaveCSS("translate", "3px 3px");
  await expect(project.locator("h3")).toHaveCSS("color", "rgb(217, 54, 38)");
  if (testInfo.project.name === "Desktop Chrome") {
    await expect.poll(() => page.locator('#projects .section-heading > div[aria-hidden="true"] > span').evaluate(element => getComputedStyle(element).scale.split(" ")[0])).toBe("1");
    await expect(page.locator("#projects .section-heading")).toContainText("SELECTED WORKS");
  }

  await section(page, "notes");
  const note = page.locator("#notes .note-card").first();
  const thumbnail = note.locator(".note-card-thumbnail-view");
  await expect(thumbnail).toBeInViewport({ ratio: 0.7 });
  await expect.poll(() => thumbnail.locator("img").evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  if (testInfo.project.name === "Desktop Chrome") {
    await note.hover();
    await expect(note.getByRole("link")).toHaveCSS("background-color", "rgb(255, 189, 118)");
    await expect(thumbnail).toHaveCSS("translate", "0px -3px");
    await expect.poll(() => page.locator('#notes .section-heading > div[aria-hidden="true"] > span').evaluate(element => getComputedStyle(element).scale.split(" ")[0])).toBe("1");
  } else {
    await expect(note).toHaveClass(/is-in-view/);
    await expect(thumbnail).toHaveCSS("translate", "0px -5px");
  }
  await expect(thumbnail.locator("span")).toHaveCSS("opacity", "1");
  await expect(thumbnail.locator("span")).toHaveCSS("translate", "4px 4px");
  await expect(note.getByRole("link")).toHaveAttribute("target", "_blank");
  await section(page, "home");
  await expect(project).toHaveCSS("opacity", "1");
});

test("a short final notes section remains selectable at the end and across resizing", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Short final section in a wide reading window");
  await page.locator("#notes .note-card-thumbnail-view").evaluateAll(nodes => nodes.forEach(node => { (node as HTMLElement).style.display = "none"; }));
  await navigation(page).getByRole("link", { name: "NOTES", exact: true }).click();
  await expect(page.locator("[data-reader-title]")).toHaveText("NOTES");
  await expect(page.locator("#notes")).toBeInViewport({ ratio: 0.99 });
  await reader(page).evaluate(element => element.scrollBy({ top: -1, behavior: "instant" }));
  await expect(page.locator("[data-reader-title]")).toHaveText("NOTES");
  await reader(page).evaluate(element => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
  for (const width of [1024, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator("[data-reader-title]")).toHaveText("NOTES");
    await expect.poll(() => reader(page).evaluate(element => element.scrollHeight - element.clientHeight - element.scrollTop)).toBeLessThanOrEqual(2);
  }
});

test("boundary hysteresis avoids repeated section switching", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Desktop navigation");
  const boundary = await page.locator("#projects").evaluate(element => {
    const viewport = document.querySelector<HTMLElement>("[data-home-reader]")!;
    return viewport.scrollTop + element.getBoundingClientRect().top - viewport.getBoundingClientRect().top - viewport.clientHeight * 0.3;
  });
  await reader(page).evaluate((element, y) => element.scrollTo({ top: y + 40, behavior: "instant" }), boundary);
  await expect(panel(page)).toHaveAttribute("data-guide", "projects");
  for (const offset of [10, -10, 20, -20]) {
    await reader(page).evaluate((element, y) => element.scrollTo({ top: y, behavior: "instant" }), boundary + offset);
    await expect(panel(page)).toHaveAttribute("data-guide", "projects");
  }
  await reader(page).evaluate((element, y) => element.scrollTo({ top: y - 40, behavior: "instant" }), boundary);
  await expect(panel(page)).toHaveAttribute("data-guide", "about");
});

test("manual input and results survive tabs, width changes, and returning to follow mode", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Terminal exists on wide screens");
  await input(page).fill("echo saved-result");
  await input(page).press("Enter");
  await input(page).fill("unfinished draft");
  await navigation(page).getByRole("link", { name: "NOTES", exact: true }).click();
  await expect(panel(page)).toHaveAttribute("data-guide", "top");
  await expect(input(page)).toHaveValue("unfinished draft");
  for (const width of [1024, 960, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", width >= 960 ? "split" : "flow");
    if (width >= 960) await expect(input(page)).toHaveValue("unfinished draft");
    else await expect(input(page)).toBeHidden();
    await expect(page.locator("[data-reader-title]")).toHaveText("NOTES");
  }
  await expect(panel(page).getByText("saved-result", { exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: "スクロール連動に戻る" }).click();
  await expect(panel(page)).toHaveAttribute("data-guide", "notes");
  await expect(input(page)).toHaveValue("");
  await input(page).focus();
  await expect(panel(page).getByText("saved-result", { exact: true })).toHaveCount(1);
});

test("resizing restores the section and its offset rather than the old pixel position", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Desktop layout transitions");
  await section(page, "projects");
  await reader(page).evaluate(element => element.scrollBy({ top: 180, behavior: "instant" }));
  await expect(panel(page)).toHaveAttribute("data-guide", "projects");
  const before = await bookmark(page);
  for (const width of [960, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", width >= 960 ? "split" : "flow");
    await expect.poll(async () => (await bookmark(page)).section).toBe(before.section);
    await expect.poll(async () => Math.abs((await bookmark(page)).offset - before.offset)).toBeLessThan(4);
  }
});

test("direct anchors, browser history, and article navigation retain the right position", async ({ page }) => {
  // Enter through a full navigation: a hash-only goto before initial Next hydration
  // completes can be replaced by the framework's initial canonical URL.
  await page.goto("/about");
  await page.goto("/#projects");
  await expect(page.locator("[data-reader-title]")).toHaveText("PROJECT");
  const first = page.locator("#projects .project-card").first().getByRole("link");
  await first.click();
  await expect(page).toHaveURL(`/projects/${cmsProjects[0].id}`);
  await expect(page.locator("[data-site-footer]")).toHaveCount(1);
  await page.goBack();
  await expect(page.locator("[data-reader-title]")).toHaveText("PROJECT");
  await page.goto("/#notes");
  await expect(page.locator("[data-reader-title]")).toHaveText("NOTES");
  await page.goto("/#homelab");
  const split = await page.locator("[data-workspace]").getAttribute("data-layout");
  await expect(page.locator(split === "split" ? "[data-desktop-status]" : "#homelab")).toBeInViewport({ ratio: 0.99 });
  await expect(page.locator("#homelab")).toHaveCount(1);
  await expect(page.locator('[data-guide-section="homelab"]')).toHaveCount(0);
});

test("mobile and short screens keep the window appearance and use document scrolling", async ({ page }) => {
  for (const [width, height] of [[320, 900], [390, 900], [768, 900], [820, 900], [960, 900], [1024, 900], [1280, 900], [1440, 600]]) {
    await page.setViewportSize({ width, height });
    const split = width >= 960 && height >= 680;
    await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", split ? "split" : "flow");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole("region", { name: "本文ウィンドウ" })).toBeVisible();
    if (split) {
      await expect(input(page)).toBeVisible();
      await input(page).scrollIntoViewIfNeeded();
      await expect(input(page)).toBeInViewport({ ratio: 0.99 });
      expect(await page.evaluate(() => scrollY)).toBe(0);
    } else {
      await expect(input(page)).toBeHidden();
      await expect(page.getByRole("button", { name: "TERMINAL / コマンドを入力する" })).toHaveCount(0);
      await expect(page.locator("#homelab .status-panel")).toBeVisible();
      const aboutBottom = await page.locator("#about-base").evaluate(element => element.getBoundingClientRect().bottom);
      const statusTop = (await page.locator("#homelab").boundingBox())!.y;
      const projectsTop = (await page.locator("#projects").boundingBox())!.y;
      expect(statusTop).toBeGreaterThanOrEqual(aboutBottom);
      expect(projectsTop).toBeGreaterThan(statusTop);
    }
  }
});

test("manual commands include linked notes and retain neofetch, clear, and navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Terminal exists on wide screens");
  await input(page).fill("ls notes/");
  await input(page).press("Enter");
  await expect(panel(page).getByRole("link", { name: noteArticles[0].title, exact: false })).toHaveAttribute("href", noteArticles[0].url);
  await input(page).fill("clear");
  await input(page).press("Enter");
  await expect(panel(page).locator("[data-guide-output]")).toHaveCount(0);
  await input(page).fill("help");
  await input(page).press("Enter");
  await expect(panel(page).getByText(/Commands: help, ls/)).toBeVisible();
  await input(page).fill("neofetch");
  await input(page).press("Enter");
  await expect(panel(page).getByText("OS:", { exact: true })).toBeVisible();
  await expect(panel(page).getByText("DEMO · NOT LIVE", { exact: true })).toBeVisible();
  await input(page).fill("cd about");
  await input(page).press("Enter");
  await expect(page).toHaveURL(/\/about$/);
});

test("terminal and status windows stay fixed when their titles are dragged", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Desktop mouse");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("[data-drag-handle], [data-hero-window]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "配置をリセット" })).toHaveCount(0);
  for (const window of [panel(page), page.locator("[data-desktop-status] .status-panel")]) {
    const title = window.locator(".panel-titlebar");
    const before = await window.boundingBox();
    const box = (await title.boundingBox())!;
    await expect(title).not.toHaveAttribute("tabindex");
    await expect(title).toHaveCSS("cursor", "auto");
    await page.mouse.move(box.x + 90, box.y + 15);
    await page.mouse.down();
    await page.mouse.move(box.x + 20, box.y + 50, { steps: 3 });
    await page.mouse.up();
    expect(await window.boundingBox()).toEqual(before);
    await expect(window).toHaveCSS("translate", "none");
  }
  await input(page).fill("echo fixed-layout");
  await input(page).press("Enter");
  await expect(panel(page).getByText("fixed-layout", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 600 });
  await expect(panel(page)).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(panel(page)).toBeVisible();
  await expect(panel(page)).toHaveCSS("translate", "none");
});

test("animation cancels stale guides and native neofetch still prints whole rows", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Desktop automatic commands");
  await expect(panel(page)).toHaveAttribute("data-boot", "complete");
  const time = new Date();
  await page.clock.install({ time });
  await page.clock.pauseAt(new Date(time.getTime() + 100));
  await section(page, "projects");
  await page.clock.runFor(120);
  await expect(panel(page)).toHaveAttribute("data-boot", "typing");
  await section(page, "notes");
  await page.clock.runFor(120);
  await expect(panel(page)).toHaveAttribute("data-guide", "notes");
  await page.clock.runFor(1500);
  await expect(panel(page)).toHaveAttribute("data-boot", "complete");
  await expect(panel(page).locator("[data-guide-output]")).toHaveCount(1);
  await expect(panel(page).locator("[data-command-row]")).toHaveCount(3);
  await input(page).fill("neofetch");
  await input(page).press("Enter");
  const output = panel(page).locator("[data-neofetch-output]").last();
  await expect(output).toHaveAttribute("data-neofetch-output", "printing");
  await expect(output.locator("pre")).toContainText("/#####");
  await expect(output.locator("pre span")).toHaveCount(0);
  await page.clock.runFor(50);
  const count = await output.locator("[data-neofetch-row]:visible").count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(8);
  await expect(output.locator("[data-neofetch-row]").first()).toHaveText("OS:Proxmox VE");
  await input(page).fill("unfinished draft");
  await page.clock.runFor(1000);
  await expect(output).toHaveAttribute("data-neofetch-output", "complete");
  await expect(input(page)).toHaveValue("unfinished draft");
  await page.getByRole("button", { name: "スクロール連動に戻る" }).click();
  await page.clock.runFor(120);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(panel(page)).toHaveAttribute("data-boot", "complete");
  await expect(panel(page).locator(".terminal-cursor")).toHaveCSS("animation-name", "none");
});

test("printing exposes the complete document without clipping or duplicate footers", async ({ page }) => {
  await page.emulateMedia({ media: "print" });
  await expect(panel(page)).toBeHidden();
  expect(await reader(page).evaluate(element => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
  await expect(page.locator("[data-site-footer]")).toHaveCount(1);
});

test("without JavaScript the whole document remains readable in normal flow", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 1440, height: 1000 } });
  await mockNoteThumbnail(context);
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", "flow");
  await expect(panel(page)).toBeHidden();
  await expect(page.locator("#projects .project-card")).toHaveCount(3);
  await expect(page.locator("#notes .note-card")).toHaveCount(3);
  await expect(page.locator("#projects .project-card").first()).toHaveCSS("opacity", "1");
  await expect(page.locator("#projects .project-card img").first()).toHaveCSS("opacity", "1");
  await expect(page.locator("[data-project-image-loading]").first()).toBeHidden();
  expect(await reader(page).evaluate(element => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
  await expect(page.locator("[data-site-footer]")).toHaveCount(1);
  await context.close();
});
