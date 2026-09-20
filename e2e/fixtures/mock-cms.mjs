// Loaded via --import only by Playwright's server, never by the app or Docker image.
import { cmsProjects } from "./projects.mjs";

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input);
  if (url.origin !== "https://e2e-fixtures.microcms.io") return realFetch(input, init);

  const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  if (headers.get("X-MICROCMS-API-KEY") !== "e2e-only-key") {
    return Response.json({ message: "Invalid fixture key" }, { status: 401 });
  }
  if (url.pathname === "/api/v1/projects") {
    const ids = url.searchParams.get("ids")?.split(",");
    const projects = ids ? cmsProjects.filter(project => ids.includes(project.id)) : cmsProjects;
    const limit = Number(url.searchParams.get("limit") ?? 10);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const fields = url.searchParams.get("fields")?.split(",");
    const contents = projects.slice(offset, offset + limit).map(project => fields
      ? Object.fromEntries(Object.entries(project).filter(([key]) => fields.includes(key)))
      : project);
    return Response.json({ contents, totalCount: projects.length, offset, limit });
  }
  const project = cmsProjects.find(project => url.pathname === `/api/v1/projects/${project.id}`);
  return project
    ? Response.json(project)
    : Response.json({ message: "Not found" }, { status: 404 });
};
