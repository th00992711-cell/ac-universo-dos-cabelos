import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "AC Universo dos Cabelos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const emblem = await readFile(join(process.cwd(), "public/brand/ac-emblema.png"));
  const src = `data:image/png;base64,${emblem.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 64,
          background: "radial-gradient(circle at 30% 20%, #ffffff 0%, #faf8f4 45%, #f3ead6 100%)",
          color: "#2b2016",
        }}
      >
        <img src={src} width={430} height={428} alt="" />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 520 }}>
          <div style={{ fontSize: 22, letterSpacing: 8, color: "#8a6829" }}>CATÁLOGO ONLINE</div>
          <div style={{ marginTop: 20, width: 140, height: 2, background: "#c9a24d" }} />
          <div style={{ marginTop: 28, fontSize: 58, lineHeight: 1.1, color: "#473727" }}>Sua beleza merece o extraordinário.</div>
        </div>
      </div>
    ),
    size,
  );
}
