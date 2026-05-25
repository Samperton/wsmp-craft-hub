import { createFileRoute } from "@tanstack/react-router";
import { IndexPage } from "./index";

export const Route = createFileRoute("/video")({
  head: () => ({
    meta: [
      { title: "What is the WSMP? — Trailer" },
      { name: "description", content: "Watch the WSMP server trailer — learn what WSMP is and how to join." },
      { property: "og:title", content: "What is the WSMP? — Trailer" },
      { property: "og:description", content: "Watch the WSMP server trailer — learn what WSMP is and how to join." },
      { property: "og:url", content: "https://wsmp-craft-hub.lovable.app/video" },
    ],
    links: [
      { rel: "canonical", href: "https://wsmp-craft-hub.lovable.app/video" },
    ],
  }),
  component: VideoPage,
});

function VideoPage() {
  return <IndexPage defaultTrailerOpen />;
}
