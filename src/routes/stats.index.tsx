import { createFileRoute } from "@tanstack/react-router";
import { StatsPage } from "./stats";

export const Route = createFileRoute("/stats/")({
  component: StatsIndexPage,
});

function StatsIndexPage() {
  return <StatsPage />;
}
