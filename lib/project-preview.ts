import "server-only";

export const PROJECT_PREVIEW_COOKIE = "project-preview";
export const PROJECT_PREVIEW_MAX_AGE = 15 * 60;

const CONTENT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const DRAFT_KEY_PATTERN = /^[a-zA-Z0-9_-]+$/;

export interface ProjectPreviewToken {
  contentId: string;
  draftKey: string;
}

export function isValidProjectContentId(value: string): boolean {
  return value.length <= 128 && CONTENT_ID_PATTERN.test(value);
}

export function isValidDraftKey(value: string): boolean {
  return value.length <= 256 && DRAFT_KEY_PATTERN.test(value);
}

export function encodeProjectPreviewToken(token: ProjectPreviewToken): string {
  return Buffer.from(JSON.stringify(token), "utf8").toString("base64url");
}

export function decodeProjectPreviewToken(value: string | undefined): ProjectPreviewToken | null {
  if (!value || value.length > 1024) return null;

  try {
    const parsed: unknown = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    const { contentId, draftKey } = parsed as Partial<ProjectPreviewToken>;
    if (typeof contentId !== "string" || typeof draftKey !== "string") return null;
    if (!isValidProjectContentId(contentId) || !isValidDraftKey(draftKey)) return null;
    return { contentId, draftKey };
  } catch {
    return null;
  }
}
