import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#f4f1e5", color: "#0a171d", padding: 48, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%", border: "3px solid #0a171d", padding: 44, justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3 }}>
          <span>PERSONAL WORKSPACE</span><span>WEB / SERVER / HOMELAB</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 116, fontWeight: 700, letterSpacing: -5 }}>
            NAGANUMA<span style={{ color: "#d93626" }}>.</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 4 }}>BUILD. TWEAK. LEARN. REPEAT.</div>
        </div>
        <div style={{ display: "flex", borderTop: "2px solid #0a171d", paddingTop: 22, fontSize: 22, justifyContent: "space-between" }}>
          <span>PROJECTS / NOTES / HOMELAB</span><span style={{ color: "#d93626" }}>N_</span>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
