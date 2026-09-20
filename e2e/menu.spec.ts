import { test, expect } from "@playwright/test";

test.describe("Mobile Navigation Menu", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("opens and closes via toggle button and close button", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: /ナビゲーションメニューを開く/ });
    await expect(menuButton).toBeVisible();

    // Open menu
    await menuButton.click();
    const drawer = page.getByRole("dialog", { name: "サイト内ナビゲーション" });
    await expect(drawer).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");

    // Close with X button
    const closeButton = page.getByRole("button", { name: "メニューを閉じる" });
    await closeButton.click();
    await expect(drawer).not.toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("closes on Escape key and restores focus to trigger button", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: /ナビゲーションメニューを開く/ });
    await menuButton.click();

    const drawer = page.getByRole("dialog", { name: "サイト内ナビゲーション" });
    await expect(drawer).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
    await expect(menuButton).toBeFocused();
  });

  test("traps focus inside the open menu drawer", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: /ナビゲーションメニューを開く/ });
    await menuButton.click();

    const drawer = page.getByRole("dialog", { name: "サイト内ナビゲーション" });
    await expect(drawer).toBeVisible();

    // The close button inside the drawer should receive focus initially
    const closeButton = page.getByRole("button", { name: "メニューを閉じる" });
    await expect(closeButton).toBeFocused();

    // Press Shift+Tab from the first element (closeButton) -> wraps to last interactive element
    await page.keyboard.press("Shift+Tab");
    const activeInside = await page.evaluate(() => {
      const drawerEl = document.getElementById("mobile-navigation-drawer");
      return drawerEl?.contains(document.activeElement);
    });
    expect(activeInside).toBe(true);
  });

  test("navigates to another page from menu link", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: /ナビゲーションメニューを開く/ });
    await menuButton.click();

    const drawer = page.getByRole("dialog", { name: "サイト内ナビゲーション" });
    await expect(drawer).toBeVisible();

    const aboutLink = drawer.getByRole("link", { name: /ABOUT/ });
    await aboutLink.click();

    await expect(page).toHaveURL(/\/about/);
  });
});
