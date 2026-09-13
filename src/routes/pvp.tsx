import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';

// Data types matching the WPvP Minecraft Plugin
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

// Built-in Mock Data for Instant Preview Testing
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
  component: PvPComponent,
});

function PvPComponent() {
  const [data, setData] = useState<TournamentData>(MOCK_DATA);
  const [useLiveApi, setUseLiveApi] = useState(true);

  // Polls your dedicated Cloudflare Worker every 5 seconds
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
          console.warn('Live API unreachable, falling back to mock data.', err);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      {/* Dev Control Bar */}
      <div className="max-w-6xl mx-auto mb-8 p-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
        <span className="text-slate-400 font-mono">
          STATUS: <strong className="text-purple-400">{data.status}</strong> | SEASON: {data.season}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Preview States:</span>
          <button
            onClick={() => { setUseLiveApi(false); setData({ ...data, status: 'IDLE' }); }}
            className={`px-2 py-1 rounded border ${data.status === 'IDLE' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
          >
            Registration
          </button>
          <button
            onClick={() => { setUseLiveApi(false); setData({ ...data, status: 'IN_PROGRESS' }); }}
            className={`px-2 py-1 rounded border ${data.status === 'IN_PROGRESS' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
          >
            Live Bracket
          </button>
          <button
            onClick={() => { setUseLiveApi(false); setData({ ...data, status: 'COMPLETED' }); }}
            className={`px-2 py-1 rounded border ${data.status === 'COMPLETED' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
          >
            Podium (Finished)
          </button>
          {!useLiveApi && (
            <button
              onClick={() => setUseLiveApi(true)}
              className="px-2 py-1 rounded border bg-emerald-600 border-emerald-400 text-white ml-2"
            >
              Resume Live Mode
            </button>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto space-y-12">
        <header className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            WSMP PvP Tournament
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Season {data.season} Championship • Colosseum Arena
          </p>
        </header>

        {/* 1. PODIUM */}
        {data.status === 'COMPLETED' && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-center text-xl font-bold tracking-wider uppercase text-amber-400 mb-8">
              Tournament Champions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-end">
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 text-center order-2 md:order-1">
                <span className="text-xs uppercase font-semibold text-slate-400">2nd Place</span>
                <img
                  src={`https://mc-heads.net/avatar/${data.podium.second || 'steve'}/80`}
                  alt="2nd"
                  className="w-16 h-16 mx-auto my-3 rounded border-2 border-slate-400"
                />
                <h3 className="font-bold text-lg text-slate-200">{data.podium.second || 'TBD'}</h3>
              </div>

              <div className="bg-slate-800 border-2 border-amber-400 rounded-xl p-8 text-center order-1 md:order-2 shadow-lg shadow-amber-500/10">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Champion (1st)</span>
                <img
                  src={`https://mc-heads.net/avatar/${data.podium.first || 'steve'}/96`}
                  alt="1st"
                  className="w-20 h-20 mx-auto my-3 rounded border-2 border-amber-400 shadow"
                />
                <h3 className="font-extrabold text-2xl text-amber-300">{data.podium.first || 'TBD'}</h3>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 text-center order-3">
                <span className="text-xs uppercase font-semibold text-amber-600">3rd Place</span>
                <img
                  src={`https://mc-heads.net/avatar/${data.podium.third || 'steve'}/80`}
                  alt="3rd"
                  className="w-16 h-16 mx-auto my-3 rounded border-2 border-amber-700"
                />
                <h3 className="font-bold text-lg text-slate-200">{data.podium.third || 'TBD'}</h3>
              </div>
            </div>
          </section>
        )}

        {/* 2. HORIZONTAL BRACKET */}
        {data.status !== 'IDLE' && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-300">
                Tournament Bracket
              </h2>
              <span className="text-xs text-slate-500">Scroll horizontally if needed →</span>
            </div>

            <div className="flex flex-row items-center gap-12 overflow-x-auto pb-6 pt-2">
              <div className="flex flex-col gap-6 min-w-[240px]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  Round 1
                </span>
                {round1.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>

              <div className="flex flex-col justify-around gap-12 min-w-[240px]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  Semifinals
                </span>
                {round2.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>

              <div className="flex flex-col justify-center gap-8 min-w-[260px]">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center block mb-2">
                    Grand Finals
                  </span>
                  {finalMatch && <MatchCard match={finalMatch} isFinal />}
                </div>

                <div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider text-center block mb-2">
                    3rd Place Match
                  </span>
                  {bronzeMatch && <MatchCard match={bronzeMatch} />}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. ROSTER GRID */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-200">Registered Fighters</h2>
              <p className="text-xs text-slate-400">Type /pvp join in-game to enter the tournament roster</p>
            </div>
            <span className="text-xs font-mono bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
              {data.roster.length} Registered
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {data.roster.map((fighter) => (
              <div
                key={fighter.uuid}
                className="bg-slate-800/60 border border-slate-800 rounded-lg p-3 text-center flex flex-col items-center gap-2"
              >
                <img
                  src={`https://mc-heads.net/avatar/${fighter.name}/48`}
                  alt={fighter.name}
                  className="w-10 h-10 rounded"
                />
                <span className="text-xs font-medium text-slate-300 truncate w-full">
                  {fighter.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function MatchCard({ match, isFinal }: { match: Match; isFinal?: boolean }) {
  const isLive = match.status === 'IN_PROGRESS';

  return (
    <div
      className={`relative bg-slate-800/90 rounded-lg border p-3 flex flex-col gap-2 shadow-md ${
        isLive
          ? 'border-purple-500 ring-2 ring-purple-500/20'
          : isFinal
          ? 'border-amber-400/60 bg-slate-800'
          : 'border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-700/60 pb-1">
        <span className="font-mono">{match.id}</span>
        <span
          className={`font-semibold uppercase ${
            isLive
              ? 'text-purple-400 animate-pulse'
              : match.status === 'COMPLETED'
              ? 'text-slate-400'
              : match.status === 'READY'
              ? 'text-emerald-400'
              : 'text-slate-500'
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
      <div className="flex items-center gap-2 p-1.5 rounded bg-slate-900/40 text-slate-500 text-xs">
        <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px]">?</div>
        <span className="italic text-[11px]">TBD / Waiting</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between p-1.5 rounded text-xs ${
        isWinner
          ? 'bg-emerald-950/40 text-emerald-200 font-semibold border border-emerald-800/40'
          : isLoser
          ? 'bg-slate-900/60 text-slate-500 line-through'
          : 'bg-slate-900/40 text-slate-200'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <img
          src={`https://mc-heads.net/avatar/${name}/24`}
          alt={name}
          className="w-5 h-5 rounded"
        />
        <span className="truncate">{name}</span>
      </div>
      {isWinner && <span className="text-[10px] text-emerald-400 ml-1">✔</span>}
    </div>
  );
}
