import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    [process.env.CI ? "github" : "list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "node --import ./e2e/fixtures/mock-cms.mjs ./node_modules/next/dist/bin/next start",
    env: {
      MICROCMS_SERVICE_DOMAIN: "e2e-fixtures",
      MICROCMS_API_KEY: "e2e-only-key",
      MICROCMS_PROJECTS_ENDPOINT: "projects",
      NOTE_USER_ID: "",
      HOMELAB_PROMETHEUS_URL: "",
      HOMELAB_PROMETHEUS_BEARER_TOKEN: "",
      SHOW_SAMPLE_CONTENT: "false",
    },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
