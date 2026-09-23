import "server-only";

export class MicroCMSError extends Error {
  readonly status: number;

  constructor(status: number, path?: string) {
    const target = path ? ` GET /api/v1/${path}` : "";
    const hint = status === 404 && path && !path.includes("/")
      ? " Check MICROCMS_SERVICE_DOMAIN and MICROCMS_PROJECTS_ENDPOINT against your microCMS API settings."
      : "";
    super(`microCMS request failed (${status}).${target}${hint}`);
    this.name = "MicroCMSError";
    this.status = status;
  }
}

export function getMicroCMSConfig() {
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN?.trim();
  const apiKey = process.env.MICROCMS_API_KEY?.trim();
  const projectsEndpoint = process.env.MICROCMS_PROJECTS_ENDPOINT?.trim() || "projects";

  if (!serviceDomain && !apiKey) {
    if (process.env.NODE_ENV === "development") return null;
    throw new Error("Set both MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY. Sample projects are available only in development.");
  }
  if (!serviceDomain || !apiKey) {
    throw new Error("Set both MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY.");
  }
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(serviceDomain)) {
    throw new Error("MICROCMS_SERVICE_DOMAIN must be the service ID, not a URL.");
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(projectsEndpoint)) {
    throw new Error("MICROCMS_PROJECTS_ENDPOINT must be the endpoint name, not a URL or path.");
  }
  return { serviceDomain, apiKey, projectsEndpoint };
}

const MICROCMS_TIMEOUT_MS = 4000;

interface MicroCMSGetOptions {
  noStore?: boolean;
}

export async function microCMSGet<T>(
  path: string,
  query: Record<string, string> = {},
  options: MicroCMSGetOptions = {},
): Promise<T> {
  const config = getMicroCMSConfig();
  if (!config) throw new Error("microCMS is not configured.");

  const url = new URL(`https://${config.serviceDomain}.microcms.io/api/v1/${path}`);
  url.search = new URLSearchParams(query).toString();
  const response = await fetch(url, {
    headers: { "X-MICROCMS-API-KEY": config.apiKey },
    ...(options.noStore ? { cache: "no-store" as const } : { next: { revalidate: 60 } }),
    signal: AbortSignal.timeout(MICROCMS_TIMEOUT_MS),
  });
  if (!response.ok) throw new MicroCMSError(response.status, path);
  return response.json() as Promise<T>;
}
