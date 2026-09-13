import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';

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
  component: PvPComponent,
});

function PvPComponent() {
  const [data, setData] = useState<TournamentData>(MOCK_DATA);
  const [useLiveApi, setUseLiveApi] = useState(true);

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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      {/* Dev Control Bar */}
      <div className="max-w-6xl mx-auto mb-8 p-3.5 bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
          <span className="text-slate-500 font-mono">
            STATUS: <strong className="text-purple-700 font-bold">{data.status}</strong> | SEASON {data.season}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 mr-1 text-[11px]">Preview:</span>
          <button
            onClick={() => { setUseLiveApi(false); setData({ ...data, status: 'IDLE' }); }}
            className={`px-3 py-1 rounded-lg border text-xs font-medium transition ${
              data.status === 'IDLE'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Registration
          </button>
          <button
            onClick={() => { setUseLiveApi(false); setData({ ...data, status: 'IN_PROGRESS' }); }}
            className={`px-3 py-1 rounded-lg border text-xs font-medium transition ${
              data.status === 'IN_PROGRESS'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Live Bracket
          </button>
          <button
            onClick={() => { setUseLiveApi(false); setData({ ...data, status: 'COMPLETED' }); }}
            className={`px-3 py-1 rounded-lg border text-xs font-medium transition ${
              data.status === 'COMPLETED'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Podium
          </button>
          {!useLiveApi && (
            <button
              onClick={() => setUseLiveApi(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition ml-2"
            >
              Resume Live
            </button>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto space-y-10">
        {/* Header Hero Section */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-100/70 border border-purple-200 text-purple-700">
            <span>⚔️</span> Colosseum Championship
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            WSMP PvP Tournament
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
            Seasonal bracket championship. Compete for custom chat tags, token bounties, and server glory.
          </p>
        </header>

        {/* 1. PODIUM (Shown when status is COMPLETED) */}
        {data.status === 'COMPLETED' && (
          <section className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-lg shadow-slate-200/50">
            <h2 className="text-center text-xs font-mono font-bold tracking-widest uppercase text-amber-500 mb-8">
              ★ Tournament Champions ★
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto items-end">
              {/* 2nd Place */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 text-center order-2 md:order-1">
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">2nd Place</span>
                <img
                  src={`https://mc-heads.net/avatar/${data.podium.second || 'steve'}/80`}
                  alt="2nd"
                  className="w-16 h-16 mx-auto my-3 rounded-xl border-2 border-slate-300 shadow-sm"
                />
                <h3 className="font-bold text-base text-slate-800">{data.podium.second || 'TBD'}</h3>
              </div>

              {/* 1st Place (Elevated Champion Card) */}
              <div className="bg-gradient-to-b from-amber-50/70 to-white border-2 border-amber-400 rounded-3xl p-8 text-center order-1 md:order-2 shadow-xl shadow-amber-500/10">
                <span className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-widest">Champion (1st)</span>
                <img
                  src={`https://mc-heads.net/avatar/${data.podium.first || 'steve'}/96`}
                  alt="1st"
                  className="w-20 h-20 mx-auto my-3.5 rounded-2xl border-2 border-amber-400 shadow-md"
                />
                <h3 className="font-extrabold text-2xl text-slate-900">{data.podium.first || 'TBD'}</h3>
              </div>

              {/* 3rd Place */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 text-center order-3">
                <span className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-wider">3rd Place</span>
                <img
                  src={`https://mc-heads.net/avatar/${data.podium.third || 'steve'}/80`}
                  alt="3rd"
                  className="w-16 h-16 mx-auto my-3 rounded-xl border-2 border-amber-600/50 shadow-sm"
                />
                <h3 className="font-bold text-base text-slate-800">{data.podium.third || 'TBD'}</h3>
              </div>
            </div>
          </section>
        )}

        {/* 2. HORIZONTAL BRACKET SECTION */}
        {data.status !== 'IDLE' && (
          <section className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/50">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Tournament Bracket</h2>
                <p className="text-xs text-slate-500 mt-0.5">Live single-elimination matchups</p>
              </div>
              <span className="text-xs font-mono text-slate-400">Scroll horizontally if needed →</span>
            </div>

            <div className="flex flex-row items-center gap-8 overflow-x-auto pb-6 pt-2">
              {/* Round 1 Column */}
              <div className="flex flex-col gap-5 min-w-[240px]">
                <div className="text-center">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Round 1
                  </span>
                </div>
                {round1.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>

              {/* Round 2 (Semifinals) Column */}
              <div className="flex flex-col justify-around gap-10 min-w-[240px]">
                <div className="text-center">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Semifinals
                  </span>
                </div>
                {round2.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>

              {/* Finals & Bronze Column */}
              <div className="flex flex-col justify-center gap-7 min-w-[260px]">
                <div>
                  <div className="text-center mb-2">
                    <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
                      ★ Grand Finals ★
                    </span>
                  </div>
                  {finalMatch && <MatchCard match={finalMatch} isFinal />}
                </div>

                <div>
                  <div className="text-center mb-2">
                    <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wider">
                      3rd Place Match
                    </span>
                  </div>
                  {bronzeMatch && <MatchCard match={bronzeMatch} />}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. ROSTER GRID SECTION */}
        <section className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/50">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Registered Fighters</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Join in-game using <code className="bg-slate-100 text-purple-700 px-1.5 py-0.5 rounded font-mono text-[11px]">/pvp join</code>
              </p>
            </div>
            <span className="text-xs font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 px-3 py-1.5 rounded-full">
              {data.roster.length} Fighters
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3.5">
            {data.roster.map((fighter) => (
              <div
                key={fighter.uuid}
                className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-3 text-center flex flex-col items-center gap-2 hover:bg-white hover:border-purple-300 hover:shadow-sm transition"
              >
                <img
                  src={`https://mc-heads.net/avatar/${fighter.name}/48`}
                  alt={fighter.name}
                  className="w-10 h-10 rounded-xl border border-slate-200 shadow-xs"
                />
                <span className="text-xs font-medium text-slate-700 truncate w-full">
                  {fighter.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Instructions & Join Info Banner (Matches Website Card Vibe) */}
        <section className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold text-purple-600 uppercase tracking-wide">
              Tournament Rules & Kits
            </span>
            <h3 className="text-lg font-bold text-slate-900">Standardized Arena Combat</h3>
            <p className="text-xs text-slate-500 max-w-xl">
              All bouts feature standardized Colosseum gear. Inventories are cleared and restored automatically upon arena exit.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-mono">
            <span className="text-slate-400">IP</span>
            <span className="font-bold">w-smp.org</span>
            <span className="text-purple-400 ml-1">PORT 25565</span>
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
      className={`relative bg-white rounded-2xl border p-3 flex flex-col gap-2 transition shadow-xs ${
        isLive
          ? 'border-purple-500 ring-4 ring-purple-500/15 bg-purple-50/20'
          : isFinal
          ? 'border-amber-400/80 bg-gradient-to-b from-amber-50/30 to-white'
          : 'border-slate-200/90'
      }`}
    >
      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-100 pb-1.5">
        <span className="font-mono font-semibold text-slate-600">{match.id}</span>
        <span
          className={`font-mono text-[10px] font-bold uppercase ${
            isLive
              ? 'text-purple-600 animate-pulse'
              : match.status === 'COMPLETED'
              ? 'text-slate-400'
              : match.status === 'READY'
              ? 'text-emerald-600'
              : 'text-slate-400'
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
      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-slate-400 text-xs">
        <div className="w-5 h-5 rounded-lg bg-slate-200/80 flex items-center justify-center text-[10px] text-slate-500 font-mono">
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
          ? 'bg-slate-50 text-slate-400 line-through'
          : 'bg-slate-50/80 text-slate-700'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <img
          src={`https://mc-heads.net/avatar/${name}/24`}
          alt={name}
          className="w-5 h-5 rounded-md shadow-2xs"
        />
        <span className="truncate">{name}</span>
      </div>
      {isWinner && <span className="text-[11px] text-emerald-600 font-bold ml-1">✔</span>}
    </div>
  );
}
