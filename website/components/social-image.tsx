import { ImageResponse } from "next/og";
import type { Locale } from "@/lib/i18n";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function socialImage(locale: Locale) {
  const de = locale === "de";
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#1375db",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        padding: "65px 75px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 15,
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        <span
          style={{
            background: "#0a3d78",
            color: "white",
            padding: "10px 14px",
            borderRadius: 10,
          }}
        >
          M↓
        </span>{" "}
        Mail Markdown.
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 64,
          fontSize: 88,
          lineHeight: 1.08,
          letterSpacing: -5,
          fontWeight: 700,
        }}
      >
        <span>{de ? "Dein KI-Text." : "Your AI text."}</span>
        <span style={{ color: "#cce6ff", fontWeight: 700 }}>In Apple Mail.</span>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          justifyContent: "space-between",
          fontSize: 21,
          color: "#d7edff",
        }}
      >
        <span>{de ? "Markdown für Apple Mail." : "Markdown for Apple Mail."}</span>
        <span>{de ? "Kostenlos. Lokal. Open Source." : "Free. Local. Open source."}</span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          position: "absolute",
          right: 85,
          top: 205,
          width: 170,
          height: 170,
          alignItems: "center",
          justifyContent: "center",
          background: "#0a3d78",
          borderRadius: 26,
          borderBottom: "12px solid #0056b2",
          color: "white",
          fontSize: 65,
          transform: "rotate(-8deg)",
          boxShadow: "0 22px 40px #0065d633",
        }}
      >
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 8a3 3 0 1 0-3-3v14a3 3 0 1 0 3-3H5a3 3 0 1 0 3 3V5a3 3 0 1 0-3 3Z"
            stroke="#fff"
            strokeWidth="1.7"
          />
        </svg>
        <span>V</span>
      </div>
    </div>,
    size,
  );
}
