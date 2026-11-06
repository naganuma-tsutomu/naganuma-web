import { test, expect } from "./fixtures/test";
import { homelabIdentity, homelabPreview } from "../app/data/homelab";

test("one status session survives routes, pauses when hidden, and neofetch keeps its snapshot", async ({ page }, testInfo) => {
  test.skip(process.env.E2E_LIVE_STATUS !== "1" || testInfo.project.name === "Mobile Chrome", "Run separately with E2E_LIVE_STATUS=1");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("naganuma-login-intro-seen", "1");
    const intervals = new Map<number, () => void>();
    const interval = window.setInterval.bind(window);
    const clear = window.clearInterval.bind(window);
    const probe = { intervals, started: 0, tick: () => intervals.forEach(callback => callback()) };
    Object.assign(window, { statusProbe: probe });
    window.setInterval = ((callback: () => void, delay?: number, ...args: unknown[]) => {
      const id = interval(callback, delay, ...args);
      if (delay === 30_000) { intervals.set(id, callback); probe.started++; }
      return id;
    }) as typeof window.setInterval;
    window.clearInterval = ((id?: number) => { if (id !== undefined) intervals.delete(id); clear(id); }) as typeof window.clearInterval;
  });
  let requests = 0;
  let fail = false;
  await page.route("**/api/homelab", async route => {
    requests++;
    await route.fulfill({ status: fail ? 503 : 200, json: {
      state: "live",
      metrics: homelabPreview.metrics.map(({ label }) => ({ label, value: 10 + requests, fillPercent: 10 + requests, unit: "%" })),
      network: homelabPreview.network,
      system: { ...homelabIdentity, ...homelabPreview.system, cpuCoreCount: requests * 8, state: "live" },
    } });
  });
  await page.goto("/about");
  await expect(page.locator("[data-desktop-status]")).toContainText("LIVE");
  await expect.poll(() => requests).toBe(1);
  const input = page.locator("#terminal-command-input");
  await input.fill("clear"); await input.press("Enter");
  await input.fill("neofetch"); await input.press("Enter");
  await expect(page.locator(".terminal-panel")).toContainText("8 cores");
  for (const label of ["PROJECTS", "NOTES", "CONTACT", "HOME"]) {
    await page.getByRole("navigation", { name: "メインナビゲーション" }).getByRole("link", { name: label, exact: true }).click();
    await expect(page.locator(".terminal-panel")).toContainText("8 cores");
  }
  expect(requests).toBe(1);
  const probe = () => page.evaluate(() => {
    const state = (window as unknown as { statusProbe: { intervals: Map<number, () => void>; started: number } }).statusProbe;
    return { active: state.intervals.size, started: state.started };
  });
  expect(await probe()).toEqual({ active: 1, started: 1 });
  await page.evaluate(() => (window as unknown as { statusProbe: { tick: () => void } }).statusProbe.tick());
  await expect.poll(() => requests).toBe(2);
  await expect(page.locator("[data-desktop-status]")).toContainText("12%");
  await expect(page.locator(".terminal-panel")).toContainText("8 cores");
  await expect(page.locator(".terminal-panel")).not.toContainText("16 cores");
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" }); document.dispatchEvent(new Event("visibilitychange")); });
  expect(await probe()).toEqual({ active: 0, started: 1 });
  fail = true;
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(() => requests).toBe(3);
  await expect(page.locator("[data-desktop-status]")).toContainText("OFFLINE");
  expect(await probe()).toEqual({ active: 1, started: 2 });
  await expect(page.locator(".terminal-panel")).toContainText("8 cores");
});
