import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

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
      aria-label="Live stats view"
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

type SortKey = "balance" | "playtime";

const SEASON_0_ROWS: { player: string; balance: number; playtime: string }[] = [
  { player: "KattmannPlayzz", balance: 1111111111.11, playtime: "63h 11m" },
  { player: "AydenFruitPlayzz", balance: 502305615.81, playtime: "63h 24m" },
  { player: "_JT5923_", balance: 401107494.45, playtime: "185h 34m" },
  { player: "MoonlitRaes", balance: 284147724.0, playtime: "195h 40m" },
  { player: "Maddogz102", balance: 158017466.21, playtime: "28h 27m" },
  { player: "IMM3RSIVE", balance: 98041604.37, playtime: "82h 57m" },
  { player: "SampsonSnuggles", balance: 80426221.58, playtime: "86h 20m" },
  { player: "Archdruid_Lupin", balance: 24969510.0, playtime: "53h 36m" },
  { player: "DoctorineZombie", balance: 13668454.95, playtime: "24h 54m" },
  { player: "DiplexC", balance: 1187798.89, playtime: "100h 37m" },
  { player: "Allerianx", balance: 771387.25, playtime: "39h 30m" },
  { player: "Blumblor", balance: 554908.26, playtime: "79h 41m" },
  { player: "CrazyAckman", balance: 341931.09, playtime: "20h 29m" },
  { player: "GreasyBurrito2", balance: 309712.5, playtime: "5h 37m" },
  { player: "EKKOREE_lCRv6yx", balance: 306570.0, playtime: "14h 42m" },
  { player: "deaady", balance: 224565.78, playtime: "37h 56m" },
  { player: "tuggalives", balance: 95498.0, playtime: "4h 18m" },
  { player: "vanexla", balance: 92431.46, playtime: "43h 12m" },
  { player: "Spaghost", balance: 53774.95, playtime: "45h 8m" },
  { player: "kbamyy", balance: 53436.7, playtime: "27h 11m" },
  { player: "Fire_star_123", balance: 35616.5, playtime: "10h 28m" },
  { player: "MTImJustbored", balance: 30186.0, playtime: "5h 40m" },
  { player: "numces", balance: 30156.35, playtime: "39h 30m" },
  { player: "MT_Sampson", balance: 19900.0, playtime: "2h 53m" },
  { player: "MelloCh0mp", balance: 19834.5, playtime: "13h 46m" },
  { player: "cxtcz", balance: 10800.0, playtime: "1h 52m" },
  { player: "JH0529", balance: 10118.75, playtime: "56m 50s" },
  { player: "NamelessBunBun", balance: 4104.0, playtime: "2h 50m" },
  { player: "JewelMaven", balance: 1500.0, playtime: "14m 23s" },
  { player: "8BitBambi", balance: 1500.0, playtime: "22m 49s" },
  { player: "gupperss", balance: 1500.0, playtime: "3h 32m" },
  { player: "Go1dfq1con", balance: 628.0, playtime: "39m 29s" },
  { player: "9milesaway", balance: 540.0, playtime: "2h 22m" },
  { player: "SharkJGM", balance: 501.0, playtime: "1h 48m" },
];

function parsePlaytimeToMinutes(display: string): number {
  let total = 0;
  const hMatch = display.match(/(\d+)h/);
  const mMatch = display.match(/(\d+)m/);
  const sMatch = display.match(/(\d+)s/);
  if (hMatch) total += Number(hMatch[1]) * 60;
  if (mMatch) total += Number(mMatch[1]);
  if (sMatch) total += Number(sMatch[1]) / 60;
  return total;
}

function LeaderboardsPanel({ defaultTab = "active" }: { defaultTab?: "active" | "s1" }) {
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

      <Tabs defaultValue={defaultTab} className="mt-6 w-full">
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
            Season 0
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-5">
          <LiveLeaderboardTable />
        </TabsContent>

        <TabsContent value="s1" className="mt-5">
          <Season0LeaderboardTable />
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function SortableHeader({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: "desc" | "asc";
  onClick: () => void;
}) {
  return (
    <TableHead className="font-pixel text-xs cursor-pointer select-none" onClick={onClick}>
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="inline-flex flex-col leading-none text-[10px] text-muted-foreground">
          <span className={active && direction === "desc" ? "text-primary" : ""}>▲</span>
          <span className={active && direction === "asc" ? "text-primary" : ""}>▼</span>
        </span>
      </span>
    </TableHead>
  );
}

function Season0LeaderboardTable() {
  const [sort, setSort] = useState<SortKey>("balance");
  const [direction, setDirection] = useState<"desc" | "asc">("desc");

  const rows = [...SEASON_0_ROWS].sort((a, b) => {
    let comparison = 0;
    if (sort === "balance") {
      comparison = a.balance - b.balance;
    } else {
      comparison = parsePlaytimeToMinutes(a.playtime) - parsePlaytimeToMinutes(b.playtime);
    }
    return direction === "desc" ? -comparison : comparison;
  });

  function toggleSort(key: SortKey) {
    if (sort === key) {
      setDirection((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSort(key);
      setDirection("desc");
    }
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/60">
            <TableHead className="w-16 font-pixel text-xs">#</TableHead>
            <TableHead className="font-pixel text-xs">Player</TableHead>
            <SortableHeader
              label="Balance"
              active={sort === "balance"}
              direction={direction}
              onClick={() => toggleSort("balance")}
            />
            <SortableHeader
              label="Playtime"
              active={sort === "playtime"}
              direction={direction}
              onClick={() => toggleSort("playtime")}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.player}>
              <TableCell className="font-mono text-primary font-bold">{i + 1}</TableCell>
              <TableCell className="text-slate-deep font-medium">{r.player}</TableCell>
              <TableCell className="text-slate-soft font-mono">
                {`$${r.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </TableCell>
              <TableCell className="text-slate-soft font-mono">{r.playtime}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="px-4 py-3 text-xs text-muted-foreground border-t border-border bg-secondary/30">
        Season 0 final standings — click a column header to sort.
      </p>
    </div>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function LiveLeaderboardTable() {
  const { data } = useSuspenseQuery(leaderboardQueryOptions);
  const mounted = useMounted();
  if (!mounted) {
    return (
      <div className="rounded-xl border border-border overflow-hidden bg-card p-8 text-center text-slate-soft">
        Loading live standings…
      </div>
    );
  }
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

function StatsPageInner({ defaultView = "leaderboards" }: { defaultView?: View }) {
  const [view, setView] = useState<View>(defaultView);
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
            Live Stats
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

export function StatsPage({ defaultView }: { defaultView?: View } = {}) {
  return <StatsPageInner defaultView={defaultView} />;
}

