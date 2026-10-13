import { test, expect } from "@playwright/test";

test.describe("Mobile Navigation Menu", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("opens and closes via toggle button and close button", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.locator('button[aria-controls="mobile-navigation-drawer"]');
    await expect(menuButton).toBeVisible();

    // Open menu
    await menuButton.click();
    const drawer = page.getByRole("dialog", { name: "サイト内ナビゲーション" });
    await expect(drawer).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");

    // Close with X button
    const closeButton = drawer.getByRole("button", { name: "メニューを閉じる", exact: true });
    await closeButton.click();
    await expect(drawer).not.toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("closes on Escape key and restores focus to trigger button", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.locator('button[aria-controls="mobile-navigation-drawer"]');
    await menuButton.click();

    const drawer = page.getByRole("dialog", { name: "サイト内ナビゲーション" });
    await expect(drawer).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
    await expect(menuButton).toBeFocused();
  });

  test("traps focus inside the open menu drawer", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.locator('button[aria-controls="mobile-navigation-drawer"]');
    await menuButton.click();

    const drawer = page.getByRole("dialog", { name: "サイト内ナビゲーション" });
    await expect(drawer).toBeVisible();

    // The close button inside the drawer should receive focus initially
    const closeButton = drawer.getByRole("button", { name: "メニューを閉じる", exact: true });
    await expect(closeButton).toBeFocused();

    // Press Shift+Tab from the first element (closeButton) -> wraps to last interactive element
    await page.keyboard.press("Shift+Tab");
    await expect(drawer.getByRole("link").last()).toBeFocused();

    // Tab from the last element wraps back to the close button.
    await page.keyboard.press("Tab");
    await expect(closeButton).toBeFocused();
  });

  test("navigates to another page from menu link", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.locator('button[aria-controls="mobile-navigation-drawer"]');
    await menuButton.click();

    const drawer = page.getByRole("dialog", { name: "サイト内ナビゲーション" });
    await expect(drawer).toBeVisible();

    const aboutLink = drawer.getByRole("link", { name: /ABOUT/ });
    await aboutLink.click();

    await expect(page).toHaveURL(/\/about/);
  });

  test("hands off from the mobile drawer to the page transition without overlapping motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => localStorage.setItem("naganuma-login-intro-seen", "1"));
    let releaseNavigation!: () => void;
    const navigationGate = new Promise<void>((resolve) => { releaseNavigation = resolve; });
    await page.route(/\/about(?:\?.*)?$/, async (route) => {
      await navigationGate;
      await route.continue();
    });
    try {
      await page.goto("/");
      await page.locator('button[aria-controls="mobile-navigation-drawer"]').click();
      const drawer = page.locator("#mobile-navigation-drawer");
      await expect(drawer).toBeVisible();
      await drawer.getByRole("link", { name: /ABOUT/ }).click();
      const overlay = page.locator('[role="status"][data-phase]');
      await expect(overlay).toHaveAttribute("data-phase", "closing");
      await expect(drawer).toBeHidden();
      await expect.poll(() => page.locator("#main-content").evaluate((main) => {
        const matrix = new DOMMatrix(getComputedStyle(main).transform);
        return matrix.a === 1 && matrix.d === 1 && matrix.e === 0
          && matrix.f < 0 && matrix.f >= -12;
      })).toBe(true);
      await expect(page.locator("#main-content")).toHaveCSS("filter", "none");
      releaseNavigation();
      await expect(page).toHaveURL(/\/about/);
      await expect(overlay).toHaveAttribute("data-phase", "idle");
      await expect(page.locator("#main-content")).not.toHaveAttribute("inert");
      await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    } finally {
      releaseNavigation();
    }
  });

});
