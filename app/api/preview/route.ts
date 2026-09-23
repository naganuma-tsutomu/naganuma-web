import { NextRequest, NextResponse } from "next/server";
import {
  encodeProjectPreviewToken,
  isValidDraftKey,
  isValidProjectContentId,
  PROJECT_PREVIEW_COOKIE,
  PROJECT_PREVIEW_MAX_AGE,
} from "@/lib/project-preview";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const contentId = request.nextUrl.searchParams.get("contentId") ?? "";
  const draftKey = request.nextUrl.searchParams.get("draftKey") ?? "";

  if (!isValidProjectContentId(contentId) || !isValidDraftKey(draftKey)) {
    return new NextResponse("Invalid preview URL.", {
      status: 400,
      headers: {
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  }

  const destination = new URL(`/projects/${encodeURIComponent(contentId)}`, request.url);
  const response = NextResponse.redirect(destination, 307);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.cookies.set({
    name: PROJECT_PREVIEW_COOKIE,
    value: encodeProjectPreviewToken({ contentId, draftKey }),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PROJECT_PREVIEW_MAX_AGE,
    path: "/projects",
  });
  return response;
}
