import { loadHomeProjects } from "@/components/ProjectsSection";
import { loadHomeNotes } from "@/lib/home-notes";
import { projectListing, noteListing } from "@/lib/workspace-listing-data";

export async function GET(request: Request) {
  const section = new URL(request.url).searchParams.get("section");
  if (section !== "projects" && section !== "notes") return Response.json({ error: "Unknown section" }, { status: 400 });
  const listing = section === "projects"
    ? projectListing(await loadHomeProjects())
    : noteListing(await loadHomeNotes());
  // Source readers keep their existing caches; failures must not become browser-cached successes.
  return Response.json(listing, { headers: { "Cache-Control": "no-store" } });
}
