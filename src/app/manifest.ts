import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AC Universo dos Cabelos",
    short_name: "AC Cabelos",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#faf8f4",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
