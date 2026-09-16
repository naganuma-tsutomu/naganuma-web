import { getHomelabStatus } from "@/lib/homelab";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getHomelabStatus();
  return Response.json(status, { headers: { "Cache-Control": "no-store" } });
}
