import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WorkForce Attendance",
    short_name: "WorkForce",
    description: "Simple mobile attendance app",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#2563EB",
    orientation: "portrait",
    icons: [
      {
        src: "/logo.svg",
        sizes: "48x48",
        type: "image/svg+xml",
      },
    ],
  };
}
