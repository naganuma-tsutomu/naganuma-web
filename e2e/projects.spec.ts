import { test, expect } from "@playwright/test";
import { cmsProjects } from "./fixtures/projects.mjs";

// These tests exercise content, while menu.spec.ts still covers the first-visit intro.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("naganuma-login-intro-seen", "1"));
});

test("home displays only the three newest project cards", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator("#projects .project-card");
  await expect(cards).toHaveCount(3);
  await expect(cards.locator("h3")).toHaveText(cmsProjects.slice(0, 3).map(project => project.title));
  await expect(page.getByText("プロジェクトを読み込めませんでした。", { exact: false })).toHaveCount(0);
});

test("project cards show content and open an article with its metadata", async ({ page }) => {
  const project = cmsProjects[0];
  await page.goto("/projects");
  const cards = page.locator(".project-card");
  await expect(cards).toHaveCount(6);
  await expect(cards.first()).toContainText(project.description);
  await expect(cards.first().locator("time")).toHaveAttribute("datetime", project.publishedAt);
  await expect(cards.first().locator("img")).toBeVisible();
  await expect(cards.first().locator(".project-card-sample")).toHaveCount(0);

  await cards.first().getByRole("link", { name: project.title, exact: true }).click();
  await expect(page).toHaveURL(`/projects/${project.id}`);
  await expect(page.getByRole("heading", { level: 1, name: project.title })).toBeVisible();
  await expect(page.getByRole("heading", { name: "プロジェクト 01 の概要" })).toBeVisible();
  await expect(page.locator(".article-body")).toContainText("これはE2Eテスト用の記事本文です。");
  await expect(page).toHaveTitle(`${project.title} | NAGANUMA`);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute("content", project.publishedAt);
  await page.getByRole("link", { name: "← PROJECTS 一覧へ戻る" }).click();
  await expect(page).toHaveURL("/projects");
  await expect(page.locator(".project-card")).toHaveCount(6);
});

test("pagination displays six, six and one unique articles and supports returning", async ({ page }) => {
  await page.goto("/projects");
  const titles = page.locator(".project-card h3");
  const pagination = page.getByRole("navigation", { name: "ページ切り替え" });
  await expect(titles).toHaveText(cmsProjects.slice(0, 6).map(project => project.title));
  await expect(pagination.getByRole("link", { name: "1ページ目", exact: true })).toHaveAttribute("aria-current", "page");

  await pagination.getByRole("link", { name: "NEXT →" }).click();
  await expect(page).toHaveURL("/projects?page=2");
  await expect(titles).toHaveText(cmsProjects.slice(6, 12).map(project => project.title));
  await expect(pagination.getByRole("link", { name: "2ページ目", exact: true })).toHaveAttribute("aria-current", "page");

  await pagination.getByRole("link", { name: "3ページ目", exact: true }).click();
  await expect(page).toHaveURL("/projects?page=3");
  await expect(titles).toHaveText([cmsProjects[12].title]);
  await expect(pagination.getByRole("link", { name: "NEXT →" })).toHaveCount(0);
  await expect(pagination.getByRole("link", { name: "3ページ目", exact: true })).toHaveAttribute("aria-current", "page");

  await pagination.getByRole("link", { name: "← PREV" }).click();
  await expect(page).toHaveURL("/projects?page=2");
  await expect(titles).toHaveText(cmsProjects.slice(6, 12).map(project => project.title));
  await page.reload();
  await expect(titles).toHaveText(cmsProjects.slice(6, 12).map(project => project.title));
});

test("out-of-range pages show the last page and missing articles show the not-found screen", async ({ page }) => {
  await page.goto("/projects?page=999");
  await expect(page.locator(".project-card h3")).toHaveText([cmsProjects[12].title]);
  await expect(page.getByRole("link", { name: "3ページ目", exact: true })).toHaveAttribute("aria-current", "page");
  // Streamed Next.js not-found responses can have HTTP 200; verify the rendered state.
  await page.goto("/projects/does-not-exist");
  await expect(page.getByRole("heading", { level: 1, name: "記事が見つかりません" })).toBeVisible();
  await expect(page.getByText("404 / NOT FOUND", { exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  await expect(page.locator(".article-body")).toHaveCount(0);
});
