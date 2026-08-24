import { createFileRoute } from "@tanstack/react-router";
import { StatsPage } from "./stats";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "3D World Map — WSMP" },
      { name: "description", content: "Explore the live 3D world map of the WSMP Minecraft server." },
      { property: "og:title", content: "3D World Map — WSMP" },
      { property: "og:description", content: "Explore the live 3D world map of the WSMP Minecraft server." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return <StatsPage defaultView="map" />;
}
