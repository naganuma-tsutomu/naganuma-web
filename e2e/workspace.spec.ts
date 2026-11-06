import { test, expect, type Page } from "./fixtures/test";

const input = (page: Page) => page.locator("#terminal-command-input");
const terminal = (page: Page) => page.locator(".terminal-panel");
const header = (page: Page) => page.getByRole("navigation", { name: "メインナビゲーション" });

test.beforeEach(async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem("naganuma-login-intro-seen", "1"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  if (testInfo.project.name === "Desktop Chrome") await page.setViewportSize({ width: 1440, height: 1000 });
});

test("sidebar DOM, manual session, fixed positions, and scroll survive all page navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Persistent desktop sidebar");
  await page.goto("/");
  await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", "split");
  await page.evaluate(() => {
    const panel = document.querySelector(".terminal-panel")!;
    const status = document.querySelector("[data-desktop-status]")!;
    Object.assign(window, { workspaceNodes: { panel, status } });
  });
  const translate = await terminal(page).evaluate(element => (element as HTMLElement).style.translate);
  await input(page).fill("echo persistent-session");
  await input(page).press("Enter");
  // Fill the taller terminal with enough history to exercise scroll restoration.
  for (let line = 0; line < 3; line++) {
    await input(page).fill(`echo ${"workspace-log ".repeat(12)}`);
    await input(page).press("Enter");
  }
  const screen = terminal(page).locator("[class*=overflow-y-auto]");
  await expect.poll(() => screen.evaluate(element => element.scrollHeight - element.clientHeight)).toBeGreaterThan(50);
  await screen.evaluate(element => { element.scrollTop = 40; element.dispatchEvent(new Event("scroll")); });
  const terminalScroll = await screen.evaluate(element => element.scrollTop);
  await input(page).fill("unfinished draft");
  const box = await terminal(page).boundingBox();
  for (const [label, path] of [["ABOUT", "/about"], ["PROJECTS", "/projects"], ["NOTES", "/notes"], ["CONTACT", "/contact"], ["HOME", "/"]]) {
    await header(page).getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(path);
    await expect(page.locator("[data-home-reader], [data-page-reader]")).toHaveAttribute("data-scroll", "internal");
    await expect(input(page)).toHaveValue("unfinished draft");
    await expect(terminal(page)).toHaveAttribute("data-mode", "manual");
    await expect(terminal(page).getByText("persistent-session", { exact: true })).toHaveCount(1);
    expect(await page.evaluate(() => {
      const nodes = (window as unknown as { workspaceNodes: { panel: Element; status: Element } }).workspaceNodes;
      return nodes.panel === document.querySelector(".terminal-panel") && nodes.status === document.querySelector("[data-desktop-status]");
    })).toBe(true);
    expect(await terminal(page).evaluate(element => (element as HTMLElement).style.translate)).toBe(translate);
    expect(await terminal(page).boundingBox()).toEqual(box);
    expect(await screen.evaluate(element => element.scrollTop)).toBe(terminalScroll);
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
  }
});

test("direct-route commands load listings, snapshot results, and cd returns home", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Desktop terminal commands");
  await page.goto("/about");
  await input(page).fill("clear"); await input(page).press("Enter");
  await input(page).fill("ls projects/"); await input(page).press("Enter");
  await expect(terminal(page).getByRole("link", { name: /E2E Project 01/ })).toBeVisible();
  const output = await terminal(page).innerText();
  await header(page).getByRole("link", { name: "PROJECTS", exact: true }).click();
  await expect(page).toHaveURL("/projects");
  await page.locator("[data-page-reader]").evaluate(element => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
  await page.getByRole("link", { name: "NEXT →", exact: true }).click();
  await expect(page).toHaveURL("/projects?page=2");
  await expect(terminal(page).getByRole("link", { name: /E2E Project 01/ })).toBeVisible();
  expect(await terminal(page).getByRole("link", { name: /E2E Project 07/ }).count()).toBe(0);
  expect(output).toContain("ls projects/");
  await input(page).fill("pwd"); await input(page).press("Enter");
  await expect(terminal(page).getByText("/projects", { exact: true })).toBeVisible();
  await input(page).fill("cd /"); await input(page).press("Enter");
  await expect(page).toHaveURL("/");
  await expect(input(page)).toBeFocused();
  await expect(terminal(page).getByText("Already at home.", { exact: true })).toHaveCount(0);
  await input(page).fill("cd about"); await input(page).press("Enter");
  await expect(page).toHaveURL("/about");
  await page.getByRole("button", { name: "自動案内に戻る" }).click();
  await expect(terminal(page)).toHaveAttribute("data-guide", "page:/about");
});

test("only the loading window animates while the main window switches instantly and the sidebar stays usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Desktop transition scope");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/about(?:\?.*)?$/, async route => { await gate; await route.continue(); });
  try {
    await page.goto("/");
    await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", "split");
    await input(page).fill("echo previous"); await input(page).press("Enter");
    const original = await terminal(page).boundingBox();
    const status = await page.locator("[data-desktop-status]").boundingBox();
    const slot = await page.locator("[data-transition-scope]").boundingBox();
    const main = page.locator("#main-content");
    const background = await page.locator("body").evaluate(element => ({
      image: getComputedStyle(element).backgroundImage,
      attachment: getComputedStyle(element).backgroundAttachment,
    }));
    expect(background.image).toContain("linear-gradient");
    expect(background.attachment.split(",").map(value => value.trim())).toEqual(["fixed", "fixed"]);
    await header(page).getByRole("link", { name: "ABOUT", exact: true }).click();
    await expect(page.locator("[data-phase]")).toHaveAttribute("data-phase", "closing");
    const loadingWindow = page.locator("[data-phase] > div").filter({ hasText: "naganuma@home: navigation" });
    await expect(loadingWindow).toBeVisible();
    await expect(loadingWindow).not.toHaveCSS("animation-name", "none");
    await expect(main).toHaveCSS("visibility", "hidden");
    await expect(page.locator("[data-phase]")).toHaveCSS("background-image", "none");
    await expect(page.locator("[data-phase]")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    expect(await page.locator("body").evaluate(element => getComputedStyle(element).backgroundImage)).toBe(background.image);
    await expect(main).toHaveCSS("opacity", "1");
    await expect(main).toHaveCSS("transform", "none");
    await expect(main).toHaveCSS("filter", "none");
    await expect(main).toHaveCSS("animation-name", "none");
    expect(await page.locator("[data-transition-scope]").boundingBox()).toEqual(slot);
    await input(page).fill("draft during transition");
    await expect(terminal(page)).toBeVisible();
    expect(await terminal(page).boundingBox()).toEqual(original);
    expect(await page.locator("[data-desktop-status]").boundingBox()).toEqual(status);
    release();
    await expect(page).toHaveURL("/about");
    await expect(page.locator("[data-phase]")).toHaveAttribute("data-phase", "opening");
    await expect(main).toHaveCSS("visibility", "hidden");
    await expect(loadingWindow).not.toHaveCSS("animation-name", "none");
    await expect(page.locator("[data-phase]")).toHaveAttribute("data-phase", "idle");
    await expect(main).toHaveCSS("visibility", "visible");
    const shadow = await main.locator(":scope > div > section").evaluate(element => {
      const animation = element.getAnimations().find(animation =>
        animation instanceof CSSAnimation && animation.animationName === "window-shadow-in");
      if (!animation) throw new Error("Missing window shadow animation");
      const box = element.getBoundingClientRect().toJSON();
      animation.pause();
      const samples = [0, 80, 200, 320].map(time => {
        animation.currentTime = time;
        const style = getComputedStyle(element);
        return { shadow: style.boxShadow, opacity: style.opacity, transform: style.transform, filter: style.filter, box: element.getBoundingClientRect().toJSON() };
      });
      animation.finish();
      return { box, samples };
    });
    expect(shadow.samples[0].shadow).toBe(shadow.samples[1].shadow);
    expect(shadow.samples[1].shadow).not.toBe(shadow.samples[2].shadow);
    expect(shadow.samples[2].shadow).not.toBe(shadow.samples[3].shadow);
    for (const sample of shadow.samples) {
      expect(sample.opacity).toBe("1");
      expect(sample.transform).toBe("none");
      expect(sample.filter).toBe("none");
      expect(sample.box).toEqual(shadow.box);
    }
    await expect(main).toHaveCSS("animation-name", "none");
    await expect(main).toHaveCSS("transform", "none");
    await expect(main).toHaveCSS("filter", "none");
    await expect(main).not.toHaveAttribute("inert");
    expect(await page.locator("body").evaluate(element => getComputedStyle(element).backgroundImage)).toBe(background.image);
    await expect(input(page)).toHaveValue("draft during transition");
    await expect(input(page)).toBeFocused();
    expect(await terminal(page).boundingBox()).toEqual(original);
  } finally { release(); }
});

test("route guides, tabs, listing pagination, and mobile status follow the visible page", async ({ page }, testInfo) => {
  const desktop = testInfo.project.name === "Desktop Chrome";
  for (const [path, tab] of [["/about", "ABOUT"], ["/projects", "PROJECT"], ["/notes", "NOTES"], ["/contact", ""], ["/projects/e2e-project-01", "PROJECT"]]) {
    await page.goto(path);
    await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", desktop ? "split" : "flow");
    if (desktop) {
      const selected = terminal(page).locator("nav [aria-current]");
      if (tab) await expect(selected).toHaveText(tab); else await expect(selected).toHaveCount(0);
      await expect(page.locator("[data-mobile-status]")).toBeHidden();
      if (path === "/projects") await expect(terminal(page).getByRole("link", { name: /E2E Project 01/ })).toBeVisible();
      if (path.startsWith("/projects/e2e")) await expect(terminal(page).getByText("E2E Project 01", { exact: true })).toBeVisible();
    } else {
      await expect(terminal(page)).toBeHidden();
      await page.locator("[data-mobile-status]").scrollIntoViewIfNeeded();
      await expect(page.locator("[data-mobile-status]")).toBeInViewport();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("delayed navigation and Escape keep the sidebar usable and recover the left window", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Desktop delayed navigation");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/about(?:\?.*)?$/, async route => { await gate; await route.continue(); });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  try {
    await page.goto("/");
    await expect(page.locator("[data-workspace]")).toHaveAttribute("data-layout", "split");
    const original = await terminal(page).boundingBox();
    await header(page).getByRole("link", { name: "ABOUT", exact: true }).click();
    await expect(page.locator("[data-phase]")).toHaveAttribute("data-phase", "closing");
    await input(page).fill("echo still-usable"); await input(page).press("Enter");
    await expect(terminal(page).getByText("still-usable", { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-phase]")).toHaveAttribute("data-phase", "idle");
    await expect(page.locator("#main-content")).not.toHaveAttribute("inert");
    release();
    await expect(page).toHaveURL("/about");
    await expect(page.locator("[data-phase]")).toHaveAttribute("data-phase", "idle");
    await expect(page.getByRole("heading", { name: "ABOUT.", exact: true })).toBeVisible();
    expect(await terminal(page).boundingBox()).toEqual(original);
    await input(page).fill("draft after recovery");
    await header(page).getByRole("link", { name: "PROJECTS", exact: true }).click();
    await header(page).getByRole("link", { name: "NOTES", exact: true }).click();
    await expect(page).toHaveURL("/notes");
    await expect(page.locator("[data-phase]")).toHaveAttribute("data-phase", "idle");
    await expect(input(page)).toHaveValue("draft after recovery");
    expect(errors).toEqual([]);
  } finally { release(); }
});

test("article links and not-found views keep the same sidebar and correct route tabs", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "Mobile Chrome", "Desktop article session");
  await page.goto("/projects");
  await page.evaluate(() => Object.assign(window, { originalTerminal: document.querySelector(".terminal-panel") }));
  await page.locator(".project-card").first().getByRole("link").click();
  await expect(page).toHaveURL("/projects/e2e-project-01");
  await expect(terminal(page).getByText("E2E Project 01", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { originalTerminal: Element }).originalTerminal === document.querySelector(".terminal-panel"))).toBe(true);
  await terminal(page).getByRole("navigation").getByRole("link", { name: "PROJECT", exact: true }).click();
  await expect(page).toHaveURL("/projects");
  await page.locator("[data-page-reader]").evaluate(element => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
  await page.getByRole("link", { name: "NEXT →", exact: true }).click();
  await expect(page).toHaveURL("/projects?page=2");
  await expect(terminal(page).getByRole("link", { name: /E2E Project 07/ })).toBeVisible();
  await expect(terminal(page).getByRole("link", { name: /E2E Project 01/ })).toHaveCount(0);
  await page.goto("/projects/does-not-exist");
  await expect(page.getByRole("heading", { name: "記事が見つかりません" })).toBeVisible();
  await expect(terminal(page)).toHaveAttribute("data-guide", "not-found");
  await expect(terminal(page).locator("nav [aria-current]")).toHaveCount(0);
});
