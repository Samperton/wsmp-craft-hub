import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Swords, Trophy, Users, Circle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSequencedTransition } from './__root';

interface Player {
  uuid: string;
  name: string;
}

interface Match {
  id: string;
  round: number;
  status: 'WAITING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'BYE';
  player1: string | null;
  player2: string | null;
  winner: string | null;
  loser: string | null;
  isBronze: boolean;
  nextMatchId?: string;
}

interface TournamentData {
  season: number;
  active: boolean;
  status: 'IDLE' | 'IN_PROGRESS' | 'COMPLETED';
  podium: {
    first: string | null;
    second: string | null;
    third: string | null;
  };
  roster: Player[];
  matches: Match[];
}

const MOCK_DATA: TournamentData = {
  season: 1,
  active: true,
  status: 'IN_PROGRESS',
  podium: {
    first: 'Alex',
    second: 'Steve',
    third: 'Herobrine'
  },
  roster: [
    { uuid: '1', name: 'Steve' },
    { uuid: '2', name: 'Alex' },
    { uuid: '3', name: 'Notch' },
    { uuid: '4', name: 'Herobrine' },
    { uuid: '5', name: 'Derp' },
    { uuid: '6', name: 'CreeperBoy' },
    { uuid: '7', name: 'ShadowNinja' },
    { uuid: '8', name: 'DiamondMiner' }
  ],
  matches: [
    { id: 'R1M1', round: 1, status: 'COMPLETED', player1: 'Steve', player2: 'Derp', winner: 'Steve', loser: 'Derp', isBronze: false, nextMatchId: 'R2M1' },
    { id: 'R1M2', round: 1, status: 'COMPLETED', player1: 'Notch', player2: 'DiamondMiner', winner: 'Notch', loser: 'DiamondMiner', isBronze: false, nextMatchId: 'R2M1' },
    { id: 'R1M3', round: 1, status: 'COMPLETED', player1: 'Alex', player2: 'CreeperBoy', winner: 'Alex', loser: 'CreeperBoy', isBronze: false, nextMatchId: 'R2M2' },
    { id: 'R1M4', round: 1, status: 'COMPLETED', player1: 'Herobrine', player2: 'ShadowNinja', winner: 'Herobrine', loser: 'ShadowNinja', isBronze: false, nextMatchId: 'R2M2' },
    { id: 'R2M1', round: 2, status: 'COMPLETED', player1: 'Steve', player2: 'Notch', winner: 'Steve', loser: 'Notch', isBronze: false, nextMatchId: 'FINAL' },
    { id: 'R2M2', round: 2, status: 'IN_PROGRESS', player1: 'Alex', player2: 'Herobrine', winner: null, loser: null, isBronze: false, nextMatchId: 'FINAL' },
    { id: 'FINAL', round: 3, status: 'WAITING', player1: 'Steve', player2: null, winner: null, loser: null, isBronze: false },
    { id: 'BRONZE', round: 3, status: 'WAITING', player1: 'Notch', player2: null, winner: null, loser: null, isBronze: true }
  ]
};

export const Route = createFileRoute('/pvp')({
  head: () => ({
    meta: [
      { title: 'PvP Tournament — WSMP' },
      { name: 'description', content: 'Live bracket and standings for the WSMP Colosseum PvP Tournament.' },
      { property: 'og:title', content: 'PvP Tournament — WSMP' },
      { property: 'og:description', content: 'Live bracket and standings for the WSMP Colosseum PvP Tournament.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: PvPComponent,
});

function PvPComponent() {
  const [data, setData] = useState<TournamentData>(MOCK_DATA);
  const [useLiveApi, setUseLiveApi] = useState(true);
  const navigate = useNavigate();
  const { start } = useSequencedTransition();

  useEffect(() => {
    if (!useLiveApi) return;

    const fetchTournamentData = () => {
      fetch('https://wsmp-pvp-api.maxvetting.workers.dev')
        .then((res) => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then((json: TournamentData) => {
          if (json && (json.matches.length > 0 || json.roster.length > 0 || json.status !== 'IDLE')) {
            setData(json);
          }
        })
        .catch((err) => {
          console.warn('Live API unreachable, using preview data.', err);
        });
    };

    fetchTournamentData();
    const interval = setInterval(fetchTournamentData, 5000);
    return () => clearInterval(interval);
  }, [useLiveApi]);

  const round1 = data.matches.filter((m) => m.round === 1);
  const round2 = data.matches.filter((m) => m.round === 2);
  const finalMatch = data.matches.find((m) => m.id === 'FINAL');
  const bronzeMatch = data.matches.find((m) => m.id === 'BRONZE');

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-card/80 backdrop-blur"
          onClick={() => start(() => navigate({ to: '/' }))}
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

      <div className="mx-auto max-w-6xl px-6 pt-16 pb-24">
        <div className="text-center">
          <h1 className="font-minecraft text-4xl md:text-5xl text-shadow-minecraft text-white inline-flex items-center justify-center gap-3 flex-wrap">
            <Swords className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            PvP Tournament
          </h1>
          <p className="mt-3 text-slate-soft">
            Colosseum Championship — live single-elimination bracket.
          </p>
        </div>

        {/* Dev Control Bar */}
        <Card className="mt-8 p-4 border-2 border-border shadow-soft bg-card/90 backdrop-blur flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary animate-pulse-dot" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="text-muted-foreground font-mono">
              STATUS: <strong className="text-primary font-bold">{data.status}</strong> | SEASON {data.season}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-muted-foreground mr-1 text-[11px]">Preview:</span>
            <button
              onClick={() => { setUseLiveApi(false); setData({ ...data, status: 'IDLE' }); }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                data.status === 'IDLE'
                  ? 'bg-gradient-primary text-primary-foreground border-primary shadow-pixel-primary'
                  : 'bg-card text-slate-soft border-border hover:bg-secondary'
              }`}
            >
              Registration
            </button>
            <button
              onClick={() => { setUseLiveApi(false); setData({ ...data, status: 'IN_PROGRESS' }); }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                data.status === 'IN_PROGRESS'
                  ? 'bg-gradient-primary text-primary-foreground border-primary shadow-pixel-primary'
                  : 'bg-card text-slate-soft border-border hover:bg-secondary'
              }`}
            >
              Live Bracket
            </button>
            <button
              onClick={() => { setUseLiveApi(false); setData({ ...data, status: 'COMPLETED' }); }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                data.status === 'COMPLETED'
                  ? 'bg-gradient-primary text-primary-foreground border-primary shadow-pixel-primary'
                  : 'bg-card text-slate-soft border-border hover:bg-secondary'
              }`}
            >
              Podium
            </button>
            {!useLiveApi && (
              <button
                onClick={() => setUseLiveApi(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition ml-2"
              >
                Resume Live
              </button>
            )}
          </div>
        </Card>

        <Tabs defaultValue="bracket" className="mt-10 w-full">
          <TabsList className="bg-secondary p-1 rounded-xl">
            <TabsTrigger
              value="bracket"
              className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary px-4 py-2"
            >
              <Swords className="h-4 w-4 mr-2" /> Bracket
            </TabsTrigger>
            <TabsTrigger
              value="podium"
              disabled={data.status !== 'COMPLETED'}
              className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trophy className="h-4 w-4 mr-2" /> Podium
            </TabsTrigger>
            <TabsTrigger
              value="roster"
              className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary px-4 py-2"
            >
              <Users className="h-4 w-4 mr-2" /> Roster
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bracket" className="mt-6">
            {data.status === 'IDLE' ? (
              <Card className="p-8 md:p-12 border-2 border-border shadow-soft bg-card/90 backdrop-blur text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <Circle className="h-6 w-6 text-muted-foreground" />
                </div>
                <h2 className="mt-4 font-pixel text-lg text-slate-deep">Tournament registration is open</h2>
                <p className="mt-2 text-sm text-slate-soft max-w-md mx-auto">
                  The bracket will appear here once the first round begins. Join in-game with{" "}
                  <code className="bg-secondary text-primary px-1.5 py-0.5 rounded font-mono text-[11px]">/pvp join</code>.
                </p>
              </Card>
            ) : (
              <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <div>
                    <h2 className="font-pixel text-lg md:text-xl text-slate-deep">Tournament Bracket</h2>
                    <p className="text-xs text-slate-soft mt-0.5">Live single-elimination matchups</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">Scroll horizontally if needed →</span>
                </div>

                <div className="flex flex-row items-center gap-8 overflow-x-auto pb-6 pt-2">
                  {/* Round 1 Column */}
                  <div className="flex flex-col gap-5 min-w-[260px]">
                    <div className="text-center">
                      <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                        Round 1
                      </span>
                    </div>
                    {round1.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>

                  {/* Round 2 (Semifinals) Column */}
                  <div className="flex flex-col justify-around gap-10 min-w-[260px]">
                    <div className="text-center">
                      <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                        Semifinals
                      </span>
                    </div>
                    {round2.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>

                  {/* Finals & Bronze Column */}
                  <div className="flex flex-col justify-center gap-7 min-w-[280px]">
                    <div>
                      <div className="text-center mb-2">
                        <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                          ★ Grand Finals ★
                        </span>
                      </div>
                      {finalMatch && <MatchCard match={finalMatch} isFinal />}
                    </div>

                    <div>
                      <div className="text-center mb-2">
                        <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider">
                          3rd Place Match
                        </span>
                      </div>
                      {bronzeMatch && <MatchCard match={bronzeMatch} />}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="podium" className="mt-6">
            <Card className="p-8 md:p-10 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
              <h2 className="text-center font-pixel text-base text-primary mb-8">
                ★ Tournament Champions ★
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto items-end">
                {/* 2nd Place */}
                <div className="bg-secondary/50 border border-border rounded-2xl p-6 text-center order-2 md:order-1">
                  <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">2nd Place</span>
                  <img
                    src={`https://mc-heads.net/avatar/${data.podium.second || 'steve'}/80`}
                    alt="2nd"
                    className="w-16 h-16 mx-auto my-3 rounded-xl border-2 border-border shadow-soft pixel-edges"
                  />
                  <h3 className="font-bold text-base text-slate-deep">{data.podium.second || 'TBD'}</h3>
                </div>

                {/* 1st Place (Elevated Champion Card) */}
                <div className="bg-gradient-to-b from-primary/10 to-card border-2 border-primary rounded-3xl p-8 text-center order-1 md:order-2 shadow-glow">
                  <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-widest">Champion (1st)</span>
                  <img
                    src={`https://mc-heads.net/avatar/${data.podium.first || 'steve'}/96`}
                    alt="1st"
                    className="w-20 h-20 mx-auto my-3.5 rounded-2xl border-2 border-primary shadow-md pixel-edges"
                  />
                  <h3 className="font-extrabold text-2xl text-slate-deep">{data.podium.first || 'TBD'}</h3>
                </div>

                {/* 3rd Place */}
                <div className="bg-secondary/50 border border-border rounded-2xl p-6 text-center order-3">
                  <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-wider">3rd Place</span>
                  <img
                    src={`https://mc-heads.net/avatar/${data.podium.third || 'steve'}/80`}
                    alt="3rd"
                    className="w-16 h-16 mx-auto my-3 rounded-xl border-2 border-primary/50 shadow-soft pixel-edges"
                  />
                  <h3 className="font-bold text-base text-slate-deep">{data.podium.third || 'TBD'}</h3>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="roster" className="mt-6">
            <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-pixel text-lg md:text-xl text-slate-deep">Registered Fighters</h2>
                  <p className="text-xs text-slate-soft mt-0.5">
                    Join in-game using <code className="bg-secondary text-primary px-1.5 py-0.5 rounded font-mono text-[11px]">/pvp join</code>
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold bg-secondary text-primary border border-border px-3 py-1.5 rounded-full">
                  {data.roster.length} Fighters
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3.5">
                {data.roster.map((fighter) => (
                  <div
                    key={fighter.uuid}
                    className="bg-secondary/50 border border-border rounded-2xl p-3 text-center flex flex-col items-center gap-2 hover:bg-card hover:border-primary hover:shadow-soft transition"
                  >
                    <img
                      src={`https://mc-heads.net/avatar/${fighter.name}/48`}
                      alt={fighter.name}
                      className="w-10 h-10 rounded-xl border border-border shadow-xs pixel-edges"
                    />
                    <span className="text-xs font-medium text-slate-deep truncate w-full">
                      {fighter.name}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rules & Join Info Banner */}
        <section className="mt-10 bg-card/90 backdrop-blur border-2 border-border rounded-3xl p-6 sm:p-8 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-wide">
              Tournament Rules & Kits
            </span>
            <h3 className="text-lg font-bold text-slate-deep">Standardized Arena Combat</h3>
            <p className="text-xs text-slate-soft max-w-xl">
              All bouts feature standardized Colosseum gear. Inventories are cleared and restored automatically upon arena exit.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-slate-deep text-white px-5 py-2.5 rounded-2xl shadow-soft text-xs font-mono">
            <span className="text-muted-foreground">IP</span>
            <span className="font-bold">w-smp.org</span>
            <span className="text-primary ml-1">PORT 25565</span>
          </div>
        </section>
      </div>
    </main>
  );
}

function MatchCard({ match, isFinal }: { match: Match; isFinal?: boolean }) {
  const isLive = match.status === 'IN_PROGRESS';

  return (
    <div
      className={`relative bg-card rounded-2xl border p-3 flex flex-col gap-2 transition shadow-xs ${
        isLive
          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
          : isFinal
          ? 'border-primary/80 bg-gradient-to-b from-primary/10 to-card'
          : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border pb-1.5">
        <span className="font-mono font-semibold text-slate-deep">{match.id}</span>
        <span
          className={`font-mono text-[10px] font-bold uppercase ${
            isLive
              ? 'text-primary animate-pulse'
              : match.status === 'COMPLETED'
              ? 'text-muted-foreground'
              : match.status === 'READY'
              ? 'text-emerald-600'
              : 'text-muted-foreground'
          }`}
        >
          {match.status}
        </span>
      </div>

      <PlayerSlot
        name={match.player1}
        isWinner={match.winner === match.player1 && match.winner !== null}
        isLoser={match.loser === match.player1 && match.loser !== null}
      />

      <PlayerSlot
        name={match.player2}
        isWinner={match.winner === match.player2 && match.winner !== null}
        isLoser={match.loser === match.player2 && match.loser !== null}
      />
    </div>
  );
}

function PlayerSlot({
  name,
  isWinner,
  isLoser
}: {
  name: string | null;
  isWinner: boolean;
  isLoser: boolean;
}) {
  if (!name) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary text-muted-foreground text-xs">
        <div className="w-5 h-5 rounded-lg bg-muted flex items-center justify-center text-[10px] text-slate-soft font-mono">
          ?
        </div>
        <span className="italic text-[11px]">TBD / Waiting</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-xl text-xs transition ${
        isWinner
          ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
          : isLoser
          ? 'bg-secondary/50 text-muted-foreground line-through'
          : 'bg-secondary/50 text-slate-deep'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <img
          src={`https://mc-heads.net/avatar/${name}/24`}
          alt={name}
          className="w-5 h-5 rounded-md shadow-2xs pixel-edges"
        />
        <span className="truncate">{name}</span>
      </div>
      {isWinner && <Check className="h-3.5 w-3.5 text-emerald-600 font-bold ml-1" />}
    </div>
  );
}
