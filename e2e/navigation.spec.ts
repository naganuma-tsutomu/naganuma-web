import { test, expect } from "@playwright/test";

test.describe("Page Navigation and Security Headers", () => {
  const pages = [
    { path: "/", title: "NAGANUMA" },
    { path: "/about", title: "About | NAGANUMA" },
    { path: "/projects", title: "PROJECTS | NAGANUMA" },
    { path: "/notes", title: "NOTES | NAGANUMA" },
    { path: "/contact", title: "Contact | NAGANUMA" },
  ];

  for (const { path, title } of pages) {
    test(`page ${path} delivers security headers and noindex metadata`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response).not.toBeNull();
      expect(response?.status()).toBe(200);

      // Verify response security headers
      const headers = response?.headers() || {};
      expect(headers["x-robots-tag"]).toContain("noindex");
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(headers["content-security-policy-report-only"]).toBeUndefined();
      expect(headers["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[^']+'/);
      expect(headers["content-security-policy"]).toContain("https://static.cloudflareinsights.com");

      const nonce = headers["content-security-policy"].match(/'nonce-([^']+)'/)?.[1];
      expect(nonce).toBeTruthy();
      expect(await page.locator("script[nonce]").first().evaluate((script) => script.nonce)).toBe(nonce);

      // Verify robots meta tag in HTML
      const robotsMeta = page.locator('meta[name="robots"]');
      await expect(robotsMeta).toHaveAttribute("content", /noindex/);

      // Verify page title
      await expect(page).toHaveTitle(title);
    });
  }

  test("desktop header navigates between pages", async ({ page }) => {
    test.skip(test.info().project.name === "Mobile Chrome", "Desktop only test");

    await page.goto("/");
    const nav = page.locator("header nav");

    // Click PROJECTS link
    await nav.getByRole("link", { name: "PROJECTS" }).click();
    await expect(page).toHaveURL(/\/projects/);

    // Click ABOUT link
    await nav.getByRole("link", { name: "ABOUT" }).click();
    await expect(page).toHaveURL(/\/about/);

    // Click CONTACT link
    await nav.getByRole("link", { name: "CONTACT" }).click();
    await expect(page).toHaveURL(/\/contact/);
  });
});
