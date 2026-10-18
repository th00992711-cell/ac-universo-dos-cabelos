import { ImageResponse } from "next/og";

export const alt = "AC Universo dos Cabelos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 0%, #fffaf0 0%, #f3ead6 55%, #e8d7b0 100%)",
          color: "#2b2016",
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 999,
            border: "3px solid #c9a24d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            color: "#b58a36",
            letterSpacing: 4,
          }}
        >
          AC
        </div>
        <div style={{ marginTop: 36, fontSize: 30, letterSpacing: 14, color: "#8a6829" }}>UNIVERSO DOS CABELOS</div>
        <div style={{ marginTop: 24, width: 220, height: 2, background: "#c9a24d" }} />
        <div style={{ marginTop: 28, fontSize: 40, color: "#473727" }}>Sua beleza merece o extraordinário.</div>
      </div>
    ),
    size,
  );
}
