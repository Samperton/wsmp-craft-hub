import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSequencedTransition } from "./__root";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — WSMP" },
      { name: "description", content: "Server events on WSMP — duels, builds, and more." },
      { property: "og:title", content: "WSMP Events" },
      { property: "og:description", content: "Server events on WSMP — duels, builds, and more." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
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
            <Calendar className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            Events
          </h1>
          <p className="mt-3 text-slate-soft">Server events, competitions, and community gatherings.</p>
        </div>

        <div className="mt-10">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="bg-secondary p-1 rounded-xl">
              <TabsTrigger
                value="about"
                className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary px-4 py-2"
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="duels"
                className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary px-4 py-2"
              >
                Duels
              </TabsTrigger>
              <TabsTrigger
                value="builds"
                className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary px-4 py-2"
              >
                Builds
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-5">
              <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
                <h2 className="font-pixel text-lg text-slate-deep">About Events</h2>
                <p className="mt-3 text-sm text-slate-soft">Details coming soon.</p>
              </Card>
            </TabsContent>

            <TabsContent value="duels" className="mt-5">
              <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
                <h2 className="font-pixel text-lg text-slate-deep">Duels</h2>
                <p className="mt-3 text-sm text-slate-soft">Details coming soon.</p>
              </Card>
            </TabsContent>

            <TabsContent value="builds" className="mt-5">
              <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
                <h2 className="font-pixel text-lg text-slate-deep">Builds</h2>
                <p className="mt-3 text-sm text-slate-soft">Details coming soon.</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
