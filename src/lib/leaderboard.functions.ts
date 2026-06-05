import { createServerFn } from "@tanstack/react-start";

export type LeaderboardPlayer = {
  name: string;
  balanceDisplay: string;
  balanceValue: number;
  playtimeDisplay: string;
};

type RawPlayer = {
  name?: string;
  balance?: { d?: string; v?: string };
  activePlaytime?: { d?: string };
};

function stripHtml(input: string): string {
  return input.replace(/<[^>]+>/g, "").trim();
}

export const getLeaderboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ players: LeaderboardPlayer[] }> => {
    const res = await fetch("https://stats.w-smp.org/v1/players", {
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Leaderboard upstream returned ${res.status}`);
    }
    const json = (await res.json()) as { data?: RawPlayer[] };
    const rows = Array.isArray(json.data) ? json.data : [];

    const players: LeaderboardPlayer[] = rows.map((item) => {
      const rawName = typeof item.name === "string" ? item.name : "";
      const name = stripHtml(rawName) || "Unknown";
      const balanceDisplay = item.balance?.d ?? "—";
      const balanceValue = Number(item.balance?.v ?? "0") || 0;
      const playtimeDisplay = item.activePlaytime?.d ?? "—";
      return { name, balanceDisplay, balanceValue, playtimeDisplay };
    });

    players.sort((a, b) => b.balanceValue - a.balanceValue);
    return { players };
  },
);
