import { createFileRoute } from "@tanstack/react-router";
import { StatsPage } from "./stats";

export const Route = createFileRoute("/stats/s0")({
  head: () => ({
    meta: [
      { title: "Season 0 Leaderboard — WSMP" },
      { name: "description", content: "Final Season 0 economy leaderboard for the WSMP Minecraft server." },
      { property: "og:title", content: "WSMP Season 0 Leaderboard" },
      { property: "og:description", content: "Final Season 0 economy leaderboard for the WSMP Minecraft server." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Season0StatsPage,
});

function Season0StatsPage() {
  return <StatsPage defaultSeasonTab="s1" />;
}
