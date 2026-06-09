import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useSequencedTransition } from "./__root";
import { ArrowLeft, Trophy, Globe2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLeaderboard } from "@/lib/leaderboard.functions";

// Lazy-load the 3D World Map so it isn't initialized until the toggle is active.
const WorldMapPanel = lazy(() => import("@/components/dashboard/WorldMapPanel"));

const leaderboardQueryOptions = queryOptions({
  queryKey: ["leaderboard"],
  queryFn: () => getLeaderboard(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Live Stats — WSMP" },
      { name: "description", content: "Seasonal leaderboards and the live 3D world map for WSMP." },
      { property: "og:title", content: "WSMP Live Stats" },
      { property: "og:description", content: "Track the seasonal leaderboards and explore the live 3D world map." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(leaderboardQueryOptions),
  component: StatsPage,
  pendingComponent: () => null,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <Card className="mx-auto mt-16 max-w-md p-6 text-center border-2 border-border shadow-soft bg-card/90 backdrop-blur">
        <h2 className="font-pixel text-base text-slate-deep">Couldn't load leaderboard</h2>
        <p className="mt-2 text-sm text-slate-soft">{error.message}</p>
        <Button
          className="mt-4"
          onClick={() => {
            reset();
            void router.invalidate();
          }}
        >
          Retry
        </Button>
      </Card>
    );
  },
  notFoundComponent: () => (
    <div className="p-10 text-center text-slate-soft">Live Stats not found.</div>
  ),
});

type View = "leaderboards" | "map";

function SegmentedToggle({ value, onChange }: { value: View; onChange: (v: View) => void }) {
  const opts: { value: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "leaderboards", label: "Leaderboards", icon: Trophy },
    { value: "map", label: "3D World Map", icon: Globe2 },
  ];
  return (
    <div
      role="tablist"
      aria-label="Dashboard view"
      className="inline-flex items-center gap-1 rounded-full border-2 border-border bg-card/90 backdrop-blur p-1 shadow-soft"
    >
      {opts.map((o) => {
        const active = value === o.value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active
                ? "bg-gradient-primary text-primary-foreground shadow-pixel-primary"
                : "text-slate-soft hover:text-slate-deep"
            }`}
          >
            <Icon className="h-4 w-4" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const PLACEHOLDER_ROWS = [
  { rank: 1, player: "—", balance: "—", playtime: "—" },
  { rank: 2, player: "—", balance: "—", playtime: "—" },
  { rank: 3, player: "—", balance: "—", playtime: "—" },
  { rank: 4, player: "—", balance: "—", playtime: "—" },
  { rank: 5, player: "—", balance: "—", playtime: "—" },
];

function LeaderboardsPanel() {
  return (
    <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-pixel text-lg md:text-xl text-slate-deep">Seasonal Leaderboards</h2>
          <p className="mt-2 text-sm text-slate-soft">
            Track the top economy players across each WSMP season.
          </p>
        </div>
      </div>

      <Tabs defaultValue="active" className="mt-6 w-full">
        <TabsList className="bg-secondary p-1 rounded-xl">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary px-4 py-2"
          >
            Active Season
          </TabsTrigger>
          <TabsTrigger
            value="s1"
            className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary px-4 py-2"
          >
            Season 0 Archive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-5">
          <LiveLeaderboardTable />
        </TabsContent>

        <TabsContent value="s1" className="mt-5">
          <LeaderboardTable caption="Season 0 archive — final standings will be locked at season close." />
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function LeaderboardTable({ caption }: { caption: string }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/60">
            <TableHead className="w-16 font-pixel text-xs">#</TableHead>
            <TableHead className="font-pixel text-xs">Player</TableHead>
            <TableHead className="font-pixel text-xs">Balance</TableHead>
            <TableHead className="font-pixel text-xs">Playtime</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PLACEHOLDER_ROWS.map((r) => (
            <TableRow key={r.rank}>
              <TableCell className="font-mono text-primary font-bold">{r.rank}</TableCell>
              <TableCell className="text-slate-soft">{r.player}</TableCell>
              <TableCell className="text-slate-soft font-mono">{r.balance}</TableCell>
              <TableCell className="text-slate-soft font-mono">{r.playtime}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="px-4 py-3 text-xs text-muted-foreground border-t border-border bg-secondary/30">
        {caption}
      </p>
    </div>
  );
}

function LiveLeaderboardTable() {
  const { data } = useSuspenseQuery(leaderboardQueryOptions);
  const players = data.players;
  const caption =
    players.length === 0
      ? "No active players yet — check back once the season is live."
      : "Live standings — these reflect the current in-game stats!";

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/60">
            <TableHead className="w-16 font-pixel text-xs">#</TableHead>
            <TableHead className="font-pixel text-xs">Player</TableHead>
            <TableHead className="font-pixel text-xs">Balance</TableHead>
            <TableHead className="font-pixel text-xs">Playtime</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((p, i) => (
            <TableRow key={`${p.name}-${i}`}>
              <TableCell className="font-mono text-primary font-bold">{i + 1}</TableCell>
              <TableCell className="text-slate-deep font-medium">{p.name}</TableCell>
              <TableCell className="text-slate-soft font-mono">
                {`$${p.balanceValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </TableCell>
              <TableCell className="text-slate-soft font-mono">{p.playtimeDisplay}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="px-4 py-3 text-xs text-muted-foreground border-t border-border bg-secondary/30">
        {caption}
      </p>
    </div>
  );
}

function MapLoading() {
  return (
    <Card className="p-10 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="relative">
          <Globe2 className="h-12 w-12 text-primary" />
          <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 text-primary animate-spin" />
        </div>
        <div>
          <h3 className="font-pixel text-base text-slate-deep">Loading 3D World Map…</h3>
          <p className="mt-2 text-sm text-slate-soft max-w-sm">
            Spinning up the live world renderer.
          </p>
        </div>
      </div>
    </Card>
  );
}

function DashboardPage() {
  const [view, setView] = useState<View>("leaderboards");
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
          <h1 className="font-minecraft text-4xl md:text-5xl text-shadow-minecraft text-white">
            Dashboard
          </h1>
          <p className="mt-3 text-slate-soft">Seasonal standings and the live world view.</p>
        </div>

        <div className="mt-8 flex justify-center">
          <SegmentedToggle value={view} onChange={setView} />
        </div>

        <div className="mt-10">
          <div
            key={view}
            className="animate-fade-in"
          >
            {view === "leaderboards" ? (
              <LeaderboardsPanel />
            ) : (
              <Suspense fallback={<MapLoading />}>
                <WorldMapPanel />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
