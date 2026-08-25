import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSequencedTransition } from "./__root";

export const Route = createFileRoute("/modpack")({
  head: () => ({
    meta: [
      { title: "Mods & Voice Chat — WSMP" },
      { name: "description", content: "Download the optional WSMP client modpack for voice chat and quality-of-life enhancements." },
      { property: "og:title", content: "WSMP Mods & Voice Chat" },
      { property: "og:description", content: "Download the optional WSMP client modpack for voice chat and quality-of-life enhancements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ModpackPage,
});

const MODPACK_DOWNLOAD_URL = "https://github.com/Samperton/wsmp-craft-hub/releases/download/v1.0.0/wsmp-modpack.zip";

const steps = [
  {
    title: "Download Fabric Loader",
    description: (
      <>
        Visit{" "}
        <a
          href="https://fabricmc.net"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2"
        >
          fabricmc.net
        </a>{" "}
        and download the universal <code>.jar</code> installer.
      </>
    ),
  },
  {
    title: "Download the Modpack",
    description: (
      <>
        Click the download button above to get the <code>wsmp-modpack.zip</code>.
      </>
    ),
  },
  {
    title: "Install Fabric",
    description: (
      <>
        Run the downloaded Fabric installer, select Minecraft version <strong>26.2</strong>, and click Install.
      </>
    ),
  },
  {
    title: "Generate Folders",
    description: (
      <>
        Open your Minecraft Launcher, select the new <strong>Fabric 26.2</strong> profile, launch the game once to
        the main menu, then close it.
      </>
    ),
  },
  {
    title: "Open Mods Directory",
    description: (
      <>
        Open the Minecraft Launcher, go to the <strong>Installations</strong> tab, hover over Fabric 26.2, click the{" "}
        <strong>Folder icon</strong>, and navigate to the <code>mods</code> folder.
      </>
    ),
  },
  {
    title: "Install Modpack",
    description: (
      <>
        Unzip <code>wsmp-modpack.zip</code> and move all <code>.jar</code> files into that <code>mods</code> folder.
      </>
    ),
  },
  {
    title: "Launch & Play",
    description: (
      <>
        Re-launch Fabric 26.2 in your launcher, jump into <code>w-smp.org</code>, and press{" "}
        <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">Caps Lock</kbd> to configure your voice
        chat!
      </>
    ),
  },
];

const TUTORIAL_VIDEO_URL =
  'https://cdnapisec.kaltura.com/p/812561/embedPlaykitJs/uiconf_id/52484262?iframeembed=true&entry_id=1_yoxtxe4p&config[provider]={"widgetId":"1_zjtqw5rw"}';

function VideoEmbed() {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-border bg-slate-deep shadow-soft">
      <iframe
        src={TUTORIAL_VIDEO_URL}
        title="WSMP Modpack Installation Tutorial"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

export default function ModpackPage() {
  const navigate = useNavigate();
  const { start } = useSequencedTransition();

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-card/80 backdrop-blur"
          onClick={() => start(() => navigate({ to: "/" }))}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="font-minecraft text-2xl md:text-3xl tracking-tight flex items-center text-shadow-minecraft">
          <span className="text-primary">W</span>
          <span className="text-white text-shadow-minecraft">SMP</span>
        </div>
        <div className="w-[72px]" aria-hidden />
      </header>

      <div className="mx-auto max-w-4xl px-6 pt-16 pb-24">
        <div className="text-center">
          <h1 className="font-minecraft text-4xl md:text-5xl text-shadow-minecraft text-white inline-flex items-center gap-3">
            <Package className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            Mods & Voice Chat
          </h1>
          <p className="mt-3 text-slate-soft">
            Optional client modpack for voice chat and quality-of-life enhancements.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="font-pixel text-lg md:text-xl text-slate-deep">Optional Client Modpack</h2>
            <p className="mt-3 text-sm text-slate-soft">
              The WSMP modpack is completely optional. It adds proximity voice chat, significantly increased render distance, and a few lightweight client-side enhancements and tweaks!
            </p>
          </section>

          <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
            <h3 className="font-pixel text-base text-slate-deep">Video tutorial</h3>
            <p className="mt-2 text-sm text-slate-soft">
              A quick walkthrough of the install process.
            </p>
            <div className="mt-4">
              <VideoEmbed />
            </div>
          </Card>

          <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-pixel text-base text-slate-deep">Download the modpack</h3>
                <p className="mt-2 text-sm text-slate-soft">
                  Get the latest <code>wsmp-modpack.zip</code> and follow the checklist below.
                </p>
              </div>
              <Button
                asChild
                className="bg-gradient-primary hover:opacity-90 shadow-pixel-primary border-2 border-slate-deep w-fit"
              >
                <a href={MODPACK_DOWNLOAD_URL} download>
                  <Download className="h-4 w-4" /> Download WSMP Modpack (.zip)
                </a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Requires Minecraft 26.2 Java Edition & Fabric Loader.
            </p>
          </Card>

          <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
            <h3 className="font-pixel text-base text-slate-deep">Step-by-step installation</h3>
            <ol className="mt-5 space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {i + 1}
                  </span>
                  <div className="text-sm">
                    <div className="font-semibold text-foreground">{step.title}</div>
                    <div className="mt-0.5 text-slate-soft">{step.description}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </main>
  );
}
