import { ImageResponse } from "next/og";

export const alt = "Mail Markdown — Markdown rein. Dein Stil bleibt. Kostenlos für deinen Mac.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", background: "#f6f9fd", color: "#20252b", display: "flex", flexDirection: "column", padding: "65px 75px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 15, fontSize: 24, fontWeight: 700 }}><span style={{ background: "#006fe4", color: "white", padding: "10px 14px", borderRadius: 10 }}>M↓</span> Mail Markdown.</div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 64, fontSize: 83, lineHeight: 1.08, letterSpacing: -5, fontWeight: 700 }}><span>Markdown rein.</span><span style={{ color: "#006bdc" }}>Dein Stil bleibt.</span></div>
      <div style={{ display: "flex", marginTop: "auto", justifyContent: "space-between", fontSize: 21, color: "#65717e" }}><span>Kostenlos. Lokal. Open Source.</span><span>Ein kleines Tool von E1NSER.</span></div>
      <div style={{ display: "flex", gap: 12, position: "absolute", right: 85, top: 205, width: 170, height: 170, alignItems: "center", justifyContent: "center", background: "#006fe4", borderRadius: 26, borderBottom: "12px solid #0056b2", color: "white", fontSize: 65, transform: "rotate(-8deg)", boxShadow: "0 22px 40px #0065d633" }}><svg width="52" height="52" viewBox="0 0 24 24" fill="none"><path d="M18 8a3 3 0 1 0-3-3v14a3 3 0 1 0 3-3H5a3 3 0 1 0 3 3V5a3 3 0 1 0-3 3Z" stroke="#fff" strokeWidth="1.7" /></svg><span>V</span></div>
    </div>, size,
  );
}
