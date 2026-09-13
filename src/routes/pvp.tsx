import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  Swords,
  Trophy,
  Users,
  Check,
  Gift,
  Key,
  Crown,
  Coins,
  Shield,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
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
  player1Score?: number;
  player2Score?: number;
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

// Clean production default — starts empty and awaits live data
const EMPTY_STATE: TournamentData = {
  season: 1,
  active: false,
  status: 'IDLE',
  podium: {
    first: null,
    second: null,
    third: null
  },
  roster: [],
  matches: []
};

// Mock data used exclusively when testing via ?dev=true
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
    { id: 'R1M1', round: 1, status: 'COMPLETED', player1: 'Steve', player2: 'Derp', winner: 'Steve', loser: 'Derp', player1Score: 2, player2Score: 0, isBronze: false, nextMatchId: 'R2M1' },
    { id: 'R1M2', round: 1, status: 'COMPLETED', player1: 'Notch', player2: 'DiamondMiner', winner: 'Notch', loser: 'DiamondMiner', player1Score: 2, player2Score: 1, isBronze: false, nextMatchId: 'R2M1' },
    { id: 'R1M3', round: 1, status: 'COMPLETED', player1: 'Alex', player2: 'CreeperBoy', winner: 'Alex', loser: 'CreeperBoy', player1Score: 2, player2Score: 0, isBronze: false, nextMatchId: 'R2M2' },
    { id: 'R1M4', round: 1, status: 'COMPLETED', player1: 'Herobrine', player2: 'ShadowNinja', winner: 'Herobrine', loser: 'ShadowNinja', player1Score: 2, player2Score: 1, isBronze: false, nextMatchId: 'R2M2' },
    { id: 'R2M1', round: 2, status: 'COMPLETED', player1: 'Steve', player2: 'Notch', winner: 'Steve', loser: 'Notch', player1Score: 2, player2Score: 1, isBronze: false, nextMatchId: 'FINAL' },
    { id: 'R2M2', round: 2, status: 'IN_PROGRESS', player1: 'Alex', player2: 'Herobrine', winner: null, loser: null, player1Score: 1, player2Score: 1, isBronze: false, nextMatchId: 'FINAL' },
    { id: 'FINAL', round: 3, status: 'WAITING', player1: 'Steve', player2: null, winner: null, loser: null, player1Score: 0, player2Score: 0, isBronze: false },
    { id: 'BRONZE', round: 3, status: 'WAITING', player1: 'Notch', player2: null, winner: null, loser: null, player1Score: 0, player2Score: 0, isBronze: true }
  ]
};

export const Route = createFileRoute('/pvp')({
  head: () => ({
    meta: [
      { title: 'PvP Tournament — WSMP' },
      { name: 'description', content: 'Live bracket, prize pool, and standings for the WSMP Colosseum PvP Tournament.' },
      { property: 'og:title', content: 'PvP Tournament — WSMP' },
      { property: 'og:description', content: 'Live bracket, prize pool, and standings for the WSMP Colosseum PvP Tournament.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' }
    ]
  }),
  component: PvPComponent
});

function PvPComponent() {
  const [data, setData] = useState<TournamentData>(EMPTY_STATE);
  const [useLiveApi, setUseLiveApi] = useState(true);
  const [isDev, setIsDev] = useState(false);
  const navigate = useNavigate();
  const { start } = useSequencedTransition();

  // Show dev tools only when URL contains ?dev=true
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsDev(params.get('dev') === 'true');
    }
  }, []);

  // Poll live Cloudflare Worker API every 5 seconds
  useEffect(() => {
    if (!useLiveApi) return;

    const fetchTournamentData = () => {
      fetch('https://wsmp-pvp-api.maxvetting.workers.dev')
        .then((res) => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then((json: TournamentData) => {
          if (json) {
            setData(json);
          }
        })
        .catch((err) => {
          console.warn('Live API unreachable.', err);
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

  const isPreEvent = data.status === 'IDLE';

  return (
    <main className="min-h-screen">
      {/* Header Navigation */}
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
        {/* Title Hero */}
        <div className="text-center">
          <h1 className="font-minecraft text-4xl md:text-5xl text-shadow-minecraft text-white inline-flex items-center justify-center gap-3 flex-wrap">
            <Swords className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            PvP Tournament
          </h1>
          <p className="mt-3 text-slate-soft">
            Colosseum Championship — competitive single-elimination series bracket.
          </p>
        </div>

        {/* Dev Control Bar (Visible only when ?dev=true is appended to the URL) */}
        {isDev && (
          <Card className="mt-8 p-4 border-2 border-primary/50 shadow-soft bg-card/95 backdrop-blur flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary animate-pulse-dot" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              <span className="text-muted-foreground font-mono">
                DEV MODE: <strong className="text-primary font-bold">{data.status}</strong> | S{data.season}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-muted-foreground mr-1 text-[11px]">Preview States:</span>
              <button
                onClick={() => {
                  setUseLiveApi(false);
                  setData({ ...EMPTY_STATE, status: 'IDLE' });
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                  data.status === 'IDLE'
                    ? 'bg-gradient-primary text-primary-foreground border-primary shadow-pixel-primary'
                    : 'bg-card text-slate-soft border-border hover:bg-secondary'
                }`}
              >
                Pre-Event (Idle)
              </button>
              <button
                onClick={() => {
                  setUseLiveApi(false);
                  setData(MOCK_DATA);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                  data.status === 'IN_PROGRESS'
                    ? 'bg-gradient-primary text-primary-foreground border-primary shadow-pixel-primary'
                    : 'bg-card text-slate-soft border-border hover:bg-secondary'
                }`}
              >
                Live Bracket
              </button>
              <button
                onClick={() => {
                  setUseLiveApi(false);
                  setData({ ...MOCK_DATA, status: 'COMPLETED' });
                }}
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
        )}

        {/* Unified Tabs: Bracket/Roster & Podium */}
        <Tabs defaultValue="main" className="mt-10 w-full">
          <TabsList className="bg-secondary p-1 rounded-xl">
            <TabsTrigger
              value="main"
              className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary px-4 py-2"
            >
              {isPreEvent ? (
                <>
                  <Users className="h-4 w-4 mr-2" /> Overview & Roster
                </>
              ) : (
                <>
                  <Swords className="h-4 w-4 mr-2" /> Tournament Bracket
                </>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="podium"
              disabled={data.status !== 'COMPLETED'}
              className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trophy className="h-4 w-4 mr-2" /> Champions Podium
            </TabsTrigger>
          </TabsList>

          {/* MAIN TAB CONTENT */}
          <TabsContent value="main" className="mt-6 space-y-8">
            {/* 1. HORIZONTAL BRACKET VIEW (Displayed once tournament is live or completed) */}
            {!isPreEvent && (
              <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <div>
                    <h2 className="font-pixel text-lg md:text-xl text-slate-deep">Tournament Bracket</h2>
                    <p className="text-xs text-slate-soft mt-0.5">
                      Single-elimination series • Best of 3 (Finals: Best of 5)
                    </p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">Scroll horizontally if needed →</span>
                </div>

                <div className="flex flex-row items-center gap-8 overflow-x-auto pb-6 pt-2">
                  {/* Round 1 Column */}
                  <div className="flex flex-col gap-5 min-w-[270px]">
                    <div className="text-center">
                      <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                        Round 1 (Bo3)
                      </span>
                    </div>
                    {round1.map((match) => (
                      <MatchCard key={match.id} match={match} targetWins={2} />
                    ))}
                  </div>

                  {/* Round 2 (Semifinals) Column */}
                  <div className="flex flex-col justify-around gap-10 min-w-[270px]">
                    <div className="text-center">
                      <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                        Semifinals (Bo3)
                      </span>
                    </div>
                    {round2.map((match) => (
                      <MatchCard key={match.id} match={match} targetWins={2} />
                    ))}
                  </div>

                  {/* Finals & Bronze Column */}
                  <div className="flex flex-col justify-center gap-7 min-w-[290px]">
                    <div>
                      <div className="text-center mb-2">
                        <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                          ★ Grand Finals (Bo5) ★
                        </span>
                      </div>
                      {finalMatch && <MatchCard match={finalMatch} targetWins={3} isFinal />}
                    </div>

                    <div>
                      <div className="text-center mb-2">
                        <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider">
                          3rd Place Match (Bo3)
                        </span>
                      </div>
                      {bronzeMatch && <MatchCard match={bronzeMatch} targetWins={2} />}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* 2. REGISTERED FIGHTERS ROSTER */}
            <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-pixel text-lg md:text-xl text-slate-deep">Registered Fighters</h2>
                  <p className="text-xs text-slate-soft mt-0.5">
                    {isPreEvent ? (
                      <>
                        Registration is open! Join in-game using{' '}
                        <code className="bg-secondary text-primary px-1.5 py-0.5 rounded font-mono text-[11px]">
                          /pvp join
                        </code>
                      </>
                    ) : (
                      'Official tournament fighter roster'
                    )}
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold bg-secondary text-primary border border-border px-3.5 py-1.5 rounded-full">
                  {data.roster.length} Registered
                </span>
              </div>

              {data.roster.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
                  <p className="text-sm font-semibold text-slate-deep">No fighters registered yet</p>
                  <p className="text-xs text-slate-soft mt-1">
                    Be the first to enter by typing{' '}
                    <code className="bg-secondary text-primary px-1 py-0.5 rounded font-mono text-[10px]">
                      /pvp join
                    </code>{' '}
                    in-game!
                  </p>
                </div>
              ) : (
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
              )}
            </Card>

            {/* 3. TOURNAMENT REWARDS CARD */}
            <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-1">
                    <Gift className="h-3.5 w-3.5" /> Official Prize Pool
                  </div>
                  <h2 className="font-pixel text-lg md:text-xl text-slate-deep">Tournament Rewards</h2>
                  <p className="text-xs text-slate-soft mt-0.5">
                    Prizes awarded automatically at the conclusion of the Grand Finals.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1st Place */}
                <div className="relative bg-gradient-to-b from-amber-500/10 to-card border-2 border-amber-400/90 rounded-2xl p-5 flex flex-col justify-between shadow-soft">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-pixel text-[11px] text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Crown className="h-4 w-4 text-amber-500" /> 1st Place
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        CHAMPION
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-deep">
                      <li className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-purple-600 shrink-0" />
                        <span><strong>1x Ultra Crate Key</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-lime-600 shrink-0" />
                        <span><strong>10x Daily Crate Keys</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>Golden <strong>[CHAMP]</strong> Title</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-700 shrink-0" />
                        <span>Wither Skeleton Spawner</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-primary shrink-0" />
                        <span><strong>75 Tokens</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 2nd Place */}
                <div className="bg-secondary/40 border-2 border-border rounded-2xl p-5 flex flex-col justify-between shadow-soft">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-pixel text-[11px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Trophy className="h-4 w-4 text-slate-400" /> 2nd Place
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-secondary text-slate-deep border border-border">
                        RUNNER-UP
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-deep">
                      <li className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-purple-600 shrink-0" />
                        <span><strong>1x Ultra Crate Key</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-lime-600 shrink-0" />
                        <span><strong>5x Daily Crate Keys</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-700 shrink-0" />
                        <span>Creeper Spawner</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-primary shrink-0" />
                        <span><strong>50 Tokens</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="bg-secondary/40 border-2 border-border rounded-2xl p-5 flex flex-col justify-between shadow-soft">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-pixel text-[11px] text-amber-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Trophy className="h-4 w-4 text-amber-600" /> 3rd Place
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-secondary text-slate-deep border border-border">
                        BRONZE
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-deep">
                      <li className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-lime-600 shrink-0" />
                        <span><strong>5x Daily Crate Keys</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-700 shrink-0" />
                        <span>Iron Golem Spawner</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-primary shrink-0" />
                        <span><strong>40 Tokens</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Participation */}
                <div className="bg-secondary/40 border-2 border-border rounded-2xl p-5 flex flex-col justify-between shadow-soft">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-pixel text-[11px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-primary" /> Participation
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-secondary text-slate-deep border border-border">
                        ALL FIGHTERS
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-deep">
                      <li className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-lime-600 shrink-0" />
                        <span><strong>5x Daily Crate Keys</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-700 shrink-0" />
                        <span>Husk Spawner</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-primary shrink-0" />
                        <span><strong>10 Tokens</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* 4. RULES, FORMAT & STANDARDIZED KIT */}
            <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
              <div className="mb-6 pb-4 border-b border-border">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-1">
                  <Shield className="h-3.5 w-3.5" /> Colosseum Combat Guidelines
                </div>
                <h2 className="font-pixel text-lg md:text-xl text-slate-deep">Tournament Rules & Kit</h2>
                <p className="text-xs text-slate-soft mt-0.5">
                  Fair, competitive 1.21 survival PvP. All combatants receive identical loadouts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Format */}
                <div className="space-y-3 bg-secondary/30 border border-border rounded-2xl p-5">
                  <h3 className="font-pixel text-xs text-slate-deep font-bold uppercase tracking-wider flex items-center gap-2">
                    <Swords className="h-4 w-4 text-primary" /> Series Format
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-soft">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Best of 3:</strong> Opening rounds, Semifinals, and Bronze match require 2 round wins to advance.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Best of 5 Finals:</strong> The Grand Finals championship requires 3 round wins to crown the winner.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Bronze Playoff:</strong> Semifinal runners-up duel for official 3rd place rewards.</span>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Check-In & Forfeits */}
                <div className="space-y-3 bg-secondary/30 border border-border rounded-2xl p-5">
                  <h3 className="font-pixel text-xs text-slate-deep font-bold uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" /> Attendance & Forfeits
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-soft">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Mandatory Presence:</strong> Fighters must be online on <code>w-smp.org</code> when their bout is called.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Strict Forfeit:</strong> No-shows within the match call window forfeit immediately. Opponents advance automatically.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Inventory Safety:</strong> Survival items are safely backed up and restored upon arena exit.</span>
                    </li>
                  </ul>
                </div>

                {/* Column 3: The Standard Kit */}
                <div className="space-y-3 bg-secondary/30 border border-border rounded-2xl p-5">
                  <h3 className="font-pixel text-xs text-slate-deep font-bold uppercase tracking-wider flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" /> Standard Arena Kit
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-soft">
                    <div className="bg-card/80 p-2 rounded-xl border border-border">
                      <span className="text-slate-deep font-semibold block">🛡️ Armor</span>
                      Full Iron Set
                    </div>
                    <div className="bg-card/80 p-2 rounded-xl border border-border">
                      <span className="text-slate-deep font-semibold block">⚔️ Melee</span>
                      Diamond Sword & Iron Axe
                    </div>
                    <div className="bg-card/80 p-2 rounded-xl border border-border">
                      <span className="text-slate-deep font-semibold block">🏹 Ranged</span>
                      Bow + 16 Arrows
                    </div>
                    <div className="bg-card/80 p-2 rounded-xl border border-border">
                      <span className="text-slate-deep font-semibold block">🍎 Consumables</span>
                      2x G-Apples, 2x Splash II
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-soft">
                  Ready to compete? Join in-game with <code className="bg-secondary text-primary px-1.5 py-0.5 rounded font-mono text-[11px]">/pvp join</code>
                </span>
                <div className="inline-flex items-center gap-2 bg-slate-deep text-white px-4 py-2 rounded-xl text-xs font-mono">
                  <span className="text-muted-foreground">IP</span>
                  <span className="font-bold">w-smp.org</span>
                  <span className="text-primary ml-1">PORT 25565</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* PODIUM TAB CONTENT */}
          <TabsContent value="podium" className="mt-6">
            <Card className="p-8 md:p-10 border-2 border-border shadow-soft bg-card/90 backdrop-blur">
              <h2 className="text-center font-pixel text-base text-primary mb-8">
                ★ Tournament Champions ★
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto items-end">
                {/* 2nd Place */}
                <div className="bg-secondary/50 border border-border rounded-2xl p-6 text-center order-2 md:order-1">
                  <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                    2nd Place
                  </span>
                  <img
                    src={`https://mc-heads.net/avatar/${data.podium.second || 'steve'}/80`}
                    alt="2nd"
                    className="w-16 h-16 mx-auto my-3 rounded-xl border-2 border-border shadow-soft pixel-edges"
                  />
                  <h3 className="font-bold text-base text-slate-deep">{data.podium.second || 'TBD'}</h3>
                </div>

                {/* 1st Place */}
                <div className="bg-gradient-to-b from-primary/10 to-card border-2 border-primary rounded-3xl p-8 text-center order-1 md:order-2 shadow-glow">
                  <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-widest">
                    Champion (1st)
                  </span>
                  <img
                    src={`https://mc-heads.net/avatar/${data.podium.first || 'steve'}/96`}
                    alt="1st"
                    className="w-20 h-20 mx-auto my-3.5 rounded-2xl border-2 border-primary shadow-md pixel-edges"
                  />
                  <h3 className="font-extrabold text-2xl text-slate-deep">{data.podium.first || 'TBD'}</h3>
                </div>

                {/* 3rd Place */}
                <div className="bg-secondary/50 border border-border rounded-2xl p-6 text-center order-3">
                  <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-wider">
                    3rd Place
                  </span>
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
        </Tabs>
      </div>
    </main>
  );
}

// Subcomponent: Match Card with Score & Target Wins Display
function MatchCard({
  match,
  targetWins,
  isFinal
}: {
  match: Match;
  targetWins: number;
  isFinal?: boolean;
}) {
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
        <span className="font-mono font-semibold text-slate-deep">
          {match.id} <span className="text-[10px] text-muted-foreground">({isFinal ? 'Bo5' : 'Bo3'})</span>
        </span>
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
        score={match.player1Score ?? 0}
        targetWins={targetWins}
        isWinner={match.winner === match.player1 && match.winner !== null}
        isLoser={match.loser === match.player1 && match.loser !== null}
      />

      <PlayerSlot
        name={match.player2}
        score={match.player2Score ?? 0}
        targetWins={targetWins}
        isWinner={match.winner === match.player2 && match.winner !== null}
        isLoser={match.loser === match.player2 && match.loser !== null}
      />
    </div>
  );
}

// Subcomponent: Individual Player Row inside Match Card
function PlayerSlot({
  name,
  score,
  targetWins,
  isWinner,
  isLoser
}: {
  name: string | null;
  score: number;
  targetWins: number;
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
      <div className="flex items-center gap-1.5 ml-2 shrink-0">
        <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-card border border-border text-slate-deep">
          {score}
        </span>
        {isWinner && <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" />}
      </div>
    </div>
  );
}
