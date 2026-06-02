import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Copy, Check, Users, Server, Shield, Bug, UserPlus, BookOpen, ArrowRight, Puzzle, Sparkles, Flag, MessageCircle, PlayCircle, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import pluginsData from "@/data/plugins.json";
import gameplayData from "@/data/gameplay-changes.json";

// TODO: update when finalized — currently Sept 4, 2025 7pm CST
const SEASON_START = new Date("2026-09-04T19:00:00-05:00");
const DISCORD_INVITE = "https://dsc.gg/w-smp";

const TAB_VALUES = ["join", "rules", "plugins", "gameplay", "staff", "bug", "player"] as const;
const searchSchema = z.object({
  tab: fallback(z.enum(TAB_VALUES), undefined as unknown as (typeof TAB_VALUES)[number]).optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "WSMP — Economy Survival Minecraft Server" },
      { name: "description", content: "Join WSMP, the university Minecraft economy survival server. Play, build, and connect. IP: w-smp.org — Java & Bedrock supported." },
      { property: "og:title", content: "WSMP — Economy Survival Minecraft Server" },
      { property: "og:description", content: "Compete, build, and hang out. Join WSMP at w-smp.org." },
    ],
  }),
  component: Index,
});

export function ServerTrailer() {
  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      <div className="relative aspect-video w-full rounded-xl overflow-hidden border-2 border-border bg-card shadow-soft">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src="https://cdnapisec.kaltura.com/p/812561/embedPlaykitJs/uiconf_id/52484262?iframeembed=true&entry_id=1_exco0q39&config"
          title="WSMP Server Trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          frameBorder="0"
        />
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="font-minecraft text-2xl md:text-3xl tracking-tight flex items-center text-shadow-minecraft">
      <span className="text-primary">W</span>
      <span className="text-white text-shadow-minecraft">SMP</span>
    </div>
  );
}

function PlayerCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const fetchServerStatus = () => {
      fetch("https://api.mcsrvstat.us/2/w-smp.org")
        .then((res) => res.json())
        .then((data) => {
          setOnline(data.online);
          if (data.online && data.players) {
            setCount(data.players.online);
          } else {
            setCount(null);
          }
        })
        .catch((err) => {
          console.error("Error fetching Minecraft server status:", err);
          setOnline(false);
          setCount(null);
        });
    };

    // Pull data immediately when the component mounts
    fetchServerStatus();

    // Check for updates every 60 seconds
    // (api.mcsrvstat.us caches data internally for 5 minutes, so 60s is perfectly safe)
    const id = setInterval(fetchServerStatus, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card/90 backdrop-blur px-4 py-2 shadow-soft">
      <span className="relative flex h-2.5 w-2.5">
        <span className={`absolute inline-flex h-full w-full rounded-full ${online ? "bg-online" : "bg-destructive"} animate-pulse-dot`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${online ? "bg-online" : "bg-destructive"}`} />
      </span>
      <Users className="h-4 w-4 text-slate-soft" />
      <span className="font-mono text-sm font-semibold text-foreground">
        {online && count !== null ? count : "—"} <span className="text-muted-foreground font-normal">players online</span>
      </span>
    </div>
  );
}

function CopyIpButton() {
  const [copied, setCopied] = useState(false);
  const ip = "w-smp.org";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      toast.success("Server IP copied", { description: ip });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — long-press to copy manually");
    }
  };
  return (
    <button
      onClick={copy}
      className="group inline-flex items-center gap-3 rounded-lg border-2 border-slate-deep bg-card pl-4 pr-2 py-2 shadow-pixel transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
    >
      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">IP</span>
      <span className="font-mono text-base md:text-lg font-bold text-foreground">{ip}</span>
      <span className="ml-1 inline-flex items-center justify-center rounded-md bg-gradient-primary px-3 py-2 text-primary-foreground transition-colors">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        <span className="ml-2 text-xs font-semibold">{copied ? "Copied" : "Copy"}</span>
      </span>
    </button>
  );
}

function Hero({ onNav, trailerOpen, onTrailerOpenChange, onOpenDashboard }: { onNav: (target: "join" | "gameplay" | "discord") => void; trailerOpen: boolean; onTrailerOpenChange: (open: boolean) => void; onOpenDashboard: () => void }) {
  const cards: { label: string; desc: string; target: "join" | "gameplay" | "discord" }[] = [
    { label: "PLAY", desc: "Economy Survival", target: "join" },
    { label: "BUILD", desc: "Easy Land Claims", target: "gameplay" },
    { label: "CONNECT", desc: "Linked Discord", target: "discord" },
  ];
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/55 to-background" aria-hidden />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
        <Logo />
        <div className="hidden md:block">
          <PlayerCounter />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pt-20 pb-28 md:pt-28 md:pb-36 text-center">
        <h1 className="font-minecraft text-5xl md:text-7xl leading-[1.15] text-shadow-minecraft">
          <span className="text-primary">W</span><span className="text-white text-shadow-minecraft">SMP</span>
        </h1>
        <p className="mt-6 mx-auto max-w-2xl text-lg md:text-xl text-slate-soft">
          Whether you enjoy competing for economic advantage or casual Minecraft play,
          we'd love you to be part of the WSMP community.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <CopyIpButton />
          <Dialog open={trailerOpen} onOpenChange={onTrailerOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-card/80 backdrop-blur">
                <PlayCircle className="h-4 w-4 text-primary" />
                What is the WSMP?
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0 border-2 overflow-hidden bg-card">
              <DialogTitle className="sr-only">WSMP Server Trailer</DialogTitle>
              <div className="relative aspect-video w-full">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://cdnapisec.kaltura.com/p/812561/embedPlaykitJs/uiconf_id/52484262?iframeembed=true&entry_id=1_exco0q39&config"
                  title="WSMP Server Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                />
              </div>
            </DialogContent>
          </Dialog>
          <div className="md:hidden">
            <PlayerCounter />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
          {cards.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => onNav(f.target)}
              className="text-left rounded-xl border border-border bg-card/85 backdrop-blur p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="font-minecraft text-lg md:text-xl text-primary">{f.label}</div>
              <div className="mt-2 text-xs md:text-sm text-slate-soft">{f.desc}</div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={onOpenDashboard}
            size="lg"
            className="gap-2 bg-gradient-primary hover:opacity-90 shadow-pixel-primary border-2 border-slate-deep"
          >
            <LayoutDashboard className="h-4 w-4" />
            Open Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function InfoTabs({ value, onValueChange }: { value: string; onValueChange: (v: string) => void }) {
  return (
    <section id="info" className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center mb-10">
        <h2 className="font-pixel text-xl md:text-2xl text-slate-deep">Get Started</h2>
        <p className="mt-3 text-slate-soft">Everything you need to jump in, follow the rules, or help run the server.</p>
      </div>

      <Tabs value={value} onValueChange={onValueChange} className="w-full">
        <TabsList className="flex flex-wrap w-full h-auto bg-secondary p-1 rounded-xl gap-1">
          <TabsTrigger value="join" className="flex-1 min-w-[140px] data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary py-2.5">
            <BookOpen className="h-4 w-4 mr-2" /> How to Join
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex-1 min-w-[140px] data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary py-2.5">
            <Shield className="h-4 w-4 mr-2" /> Server Rules
          </TabsTrigger>
          <TabsTrigger value="plugins" className="flex-1 min-w-[140px] data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary py-2.5">
            <Puzzle className="h-4 w-4 mr-2" /> Plugins
          </TabsTrigger>
          <TabsTrigger value="gameplay" className="flex-1 min-w-[140px] data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary py-2.5">
            <Sparkles className="h-4 w-4 mr-2" /> Gameplay
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex-1 min-w-[140px] data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary py-2.5">
            <UserPlus className="h-4 w-4 mr-2" /> Staff Application
          </TabsTrigger>
          <TabsTrigger value="bug" className="flex-1 min-w-[140px] data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary py-2.5">
            <Bug className="h-4 w-4 mr-2" /> Report a Bug
          </TabsTrigger>
          <TabsTrigger value="player" className="flex-1 min-w-[140px] data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary py-2.5">
            <Flag className="h-4 w-4 mr-2" /> Report a Player
          </TabsTrigger>
        </TabsList>

        <TabsContent value="join" className="mt-6">
          <Card className="p-6 md:p-8 border-2 border-border shadow-soft">
            <h3 className="font-pixel text-base text-slate-deep">Join in 3 steps</h3>
            <ol className="mt-5 space-y-4">
              {[
                { t: "Launch Minecraft", d: "Open Java Edition 1.21+ or Bedrock Edition on any platform." },
                { t: "Add the server", d: "Use IP w-smp.org — Bedrock players use the same address with port 25565." },
                { t: "Hit play", d: "Spawn into the Social Hub, read the rules, and meet the community." },
              ].map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="font-pixel text-primary text-sm w-8 shrink-0">0{i + 1}</span>
                  <div>
                    <div className="font-semibold text-foreground">{s.t}</div>
                    <div className="text-sm text-slate-soft">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <CopyIpButton />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <Card className="p-6 md:p-8 border-2 border-border shadow-soft">
            <h3 className="font-pixel text-base text-slate-deep">Community rules</h3>
            <ul className="mt-5 grid gap-3">
              {[
                { rule: "Be respectful and understanding of how others would like to be treated." },
                { rule: "No hate speech, slurs, or hateful imagery in builds." },
                { rule: "No chat spam, including large ASCII images." },
                {
                  rule: "No griefing (including but not limited to: lag machines, destructive/malicious intent, theft).",
                  sub: [
                    "Chunk loaders are banned to reduce lag. If a player-built farm puts too much strain on the server you may be asked to change/remove it.",
                  ],
                },
                { rule: "No cheats, exploits, autoclickers, macros, or automated scripts of any kind." },
                { rule: "Certain client-side addons/mods like Litematica and Fullbright are allowed as long as they don't break any of the other rules. Contact an Admin if you have a client-side mod you would like to use!" },
                {
                  rule: "Players are encouraged to collaborate and share resources! In the interest of fairness for individuals, \"groups\" are limited to 5 players.",
                  sub: [
                    "A \"group\" is a team of players who pool resources, create farms together, and have the goal of being at the top of the leaderboard.",
                  ],
                },
                {
                  rule: "AFK and idling (not making any actions or movements in game) is limited to 15 minutes. AFK penalties will not affect those who leave for short periods like to get food. Abuse of the AFK system to gain an economic advantage is against the rules and will be grounds for action. Do not bypass autokick in any way; using methods including but not limited to: re-joining to AFK again, aforementioned macros, or AFK machines.",
                  sub: [
                    "Farms that require you to be in one area are allowed, but beware the risk of appearing to be AFK.",
                    "Repeating actions like mining, mob farming, XP farming, etc. are allowed, but only in accordance to previous rules.",
                    "Admins may check if you are AFK, and repeated AFK behaviour will result in action.",
                    "Rules like AFK are important — we want players to thrive in a competitive environment where their peers are actively playing the game. It's more fun for everyone when players are active!",
                  ],
                },
                {
                  rule: "Respect the staff and their decisions. All rules and decisions are made in the interest of fairness, community safety, and gameplay quality.",
                  sub: ["Staff reserve the right to mute based on text activity."],
                },
                { rule: "Staff reserve the right to add more rules to the list at any point if necessary." },
                { rule: "This is an independent project, so please understand that the staff will address any server or individual problems when we can. Please have patience and refrain from repeatedly asking staff when something will be fixed." },
              ].map((r, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-border p-3">
                  <span className="font-pixel text-primary text-xs mt-0.5">#{(i + 1).toString().padStart(2, "0")}</span>
                  <div className="flex-1">
                    <span className="text-sm text-slate-soft">{r.rule}</span>
                    {r.sub && (
                      <ul className="mt-2 ml-4 space-y-1 list-disc list-outside text-sm text-slate-soft/90">
                        {r.sub.map((s, j) => (
                          <li key={j}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="plugins" className="mt-6">
          <Card className="p-6 md:p-8 border-2 border-border shadow-soft">
            <h3 className="font-pixel text-base text-slate-deep">Installed plugins</h3>
            <p className="mt-3 text-sm text-slate-soft max-w-xl">The plugins that shape gameplay on WSMP.</p>
            <ul className="mt-5 grid gap-3 md:grid-cols-2">
              {pluginsData.map((p) => (
                <li key={p.name} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Puzzle className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">{p.name}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-soft">{p.description}</p>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="gameplay" className="mt-6">
          <Card className="p-6 md:p-8 border-2 border-border shadow-soft">
            <h3 className="font-pixel text-base text-slate-deep">Gameplay changes</h3>
            <p className="mt-3 text-sm text-slate-soft max-w-xl">Tweaks and custom rules that make WSMP different from vanilla Minecraft.</p>
            <ul className="mt-5 grid gap-3">
              {gameplayData.map((g) => (
                <li key={g.name} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">{g.name}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-soft">{g.description}</p>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <Card className="p-6 md:p-8 border-2 border-border shadow-soft">
            <h3 className="font-pixel text-base text-slate-deep">Apply to join the staff team</h3>
            <p className="mt-3 text-sm text-slate-soft max-w-xl">
              We're looking for active, fair, and friendly players to help moderate chat, review reports,
              and host community events.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-soft list-disc list-inside">
              <li>Minimum age 16 · 30+ hours of playtime on WSMP</li>
              <li>Active Discord presence and good standing</li>
              <li>Comfortable with basic moderation tools</li>
            </ul>
            <Button className="mt-6 bg-gradient-primary hover:opacity-90 shadow-pixel-primary border-2 border-slate-deep">
              Open application form <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="bug" className="mt-6">
          <Card className="p-6 md:p-8 border-2 border-border shadow-soft">
            <h3 className="font-pixel text-base text-slate-deep">Report a bug</h3>
            <p className="mt-3 text-sm text-slate-soft max-w-xl">
              Found a duplication glitch, broken plugin, or world issue? Send it our way with as much
              detail as possible — a description, coordinates, and steps to reproduce help us fix things fast.
            </p>
            <form
              className="mt-6 grid gap-3 max-w-xl"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = new FormData(form);
                try {
                  const reportContent = `**New Bug Report Submitted!**\n\n**Reporter:** ${data.get("username")}\n**Issue Title:** ${data.get("title")}\n**Description Details:**\n${data.get("body")}`;
                  
                  const res = await fetch(import.meta.env.VITE_DISCORD_WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      username: "Server Bug Tracker", // Controls the name of the bot user in Discord
                      content: reportContent,         // Discord reads this key perfectly
                    }),
                  });
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  toast.success("Bug report sent", { description: "Thanks — staff will review it shortly." });
                  form.reset();
                } catch (err) {
                  toast.error("Failed to send report", { description: (err as Error).message });
                }
              }}
            >
              <input
                required
                name="username"
                placeholder="In-game username"
                className="rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                required
                name="title"
                placeholder="Short title (e.g. shop GUI not opening)"
                className="rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <textarea
                required
                name="body"
                rows={5}
                placeholder="Steps to reproduce, coordinates, screenshots…"
                className="rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" className="bg-gradient-primary hover:opacity-90 shadow-pixel-primary border-2 border-slate-deep w-fit">
                Submit report <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="player" className="mt-6">
          <Card className="p-6 md:p-8 border-2 border-border shadow-soft">
            <h3 className="font-pixel text-base text-slate-deep">Report a player</h3>
            <p className="mt-3 text-sm text-slate-soft max-w-xl">
              Saw cheating, harassment, or rule-breaking? Send staff a detailed report — include the player's username, what happened, and any evidence (screenshots, coordinates, timestamps).
            </p>
            <form
              className="mt-6 grid gap-3 max-w-xl"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const data = new FormData(form);
                const webhook = import.meta.env.VITE_PLAYER_REPORT_WEBHOOK_URL;
                if (!webhook) {
                  toast.error("Reports not configured", { description: "VITE_PLAYER_REPORT_WEBHOOK_URL is missing." });
                  return;
                }
                try {
                  const reportContent = `**New Player Report Submitted!**\n\n**Reporter:** ${data.get("username")}\n**Reported Player:** ${data.get("reported")}\n**Details:**\n${data.get("body")}`;
                  const res = await fetch(webhook, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      username: "Player Report Tracker",
                      content: reportContent,
                    }),
                  });
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  toast.success("Report sent", { description: "Thanks — staff will review it shortly." });
                  form.reset();
                } catch (err) {
                  toast.error("Failed to send report", { description: (err as Error).message });
                }
              }}
            >
              <input required name="username" placeholder="Your in-game username" className="rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required name="reported" placeholder="Reported player's username" className="rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <textarea required name="body" rows={5} placeholder="What happened? Include evidence, coordinates, timestamps…" className="rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <Button type="submit" className="bg-gradient-primary hover:opacity-90 shadow-pixel-primary border-2 border-slate-deep w-fit">
                Submit report <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-slate-deep text-background">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="font-minecraft text-2xl text-shadow-minecraft">
            <span className="text-primary">W</span><span className="text-white text-shadow-minecraft">SMP</span>
          </div>
          <p className="mt-2 text-sm text-background/70">University Economy Survival Minecraft Server</p>
        </div>
        <div className="text-sm text-background/70">
          Join with IP: <span className="font-mono font-bold text-background">w-smp.org</span>
          <span className="mx-2">·</span>Java & Bedrock supported
        </div>
      </div>
    </footer>
  );
}

function SeasonCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = SEASON_START.getTime() - now;
  const live = diff <= 0;
  const d = Math.max(0, Math.floor(diff / 86400000));
  const h = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const m = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const s = Math.max(0, Math.floor((diff % 60000) / 1000));
  const tiles: [string, number][] = [["Days", d], ["Hours", h], ["Mins", m], ["Secs", s]];

  return (
    <section className="mx-auto max-w-5xl px-6 pt-12">
      <Card className="relative overflow-hidden p-6 md:p-8 border-2 border-primary/30 shadow-soft bg-gradient-to-br from-slate-deep to-primary/80 text-background text-center">
        <h2 className="font-minecraft text-2xl md:text-4xl text-shadow-minecraft">
          {live ? "SEASON 1 IS LIVE" : "Season 1 Starts Soon"}
        </h2>
        {!live ? (
          <div className="mt-5 grid grid-cols-4 gap-3 md:gap-4 max-w-2xl mx-auto">
            {tiles.map(([label, value], i) => (
              <div
                key={label}
                className={`rounded-lg border-2 border-background/20 bg-background/10 backdrop-blur p-3 md:p-4 shadow-pixel ${i === 3 ? "animate-pulse" : ""}`}
              >
                <div className="font-minecraft text-2xl md:text-4xl text-background text-shadow-minecraft tabular-nums">
                  {value.toString().padStart(2, "0")}
                </div>
                <div className="mt-1 text-[10px] md:text-xs uppercase tracking-widest text-background/70">{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 font-pixel text-base md:text-lg text-background">
            Jump in with IP <span className="font-mono text-primary-foreground">w-smp.org</span>
          </p>
        )}
      </Card>
    </section>
  );
}


function DiscordCard() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(DISCORD_INVITE);
      setCopied(true);
      toast.success("Discord link copied", { description: DISCORD_INVITE });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — long-press to copy manually");
    }
  };

  return (
    <section id="discord" className="mx-auto max-w-5xl px-6 pt-12 scroll-mt-20">
      <Card className="p-6 md:p-8 border-2 border-border shadow-soft bg-gradient-to-br from-card to-secondary">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-slate-soft">
              <MessageCircle className="h-3.5 w-3.5 text-primary" />
              Community
            </div>
            <h2 className="mt-4 font-pixel text-xl md:text-2xl text-slate-deep">Join the Discord</h2>
            <p className="mt-3 text-sm text-slate-soft">
              Chat with players, get announcements, and link your Minecraft account for in-game perks.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="bg-gradient-primary hover:opacity-90 shadow-pixel-primary border-2 border-slate-deep">
                <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> Join Discord
                </a>
              </Button>
              <Button variant="outline" onClick={copy} className="border-2 border-slate-deep">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy invite"}
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground font-mono">{DISCORD_INVITE}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-pixel text-sm text-slate-deep">Link your Minecraft account</h3>
            <ol className="mt-4 space-y-3">
              {[
                { t: "In Minecraft", d: <>Run <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-foreground">/discord link</code> in chat.</> },
                { t: "Copy the code", d: "You will be given a one-time number." },
                { t: "In Discord", d: <>Paste the code in <code className="font-mono bg-secondary px-1.5 py-0.5 rounded text-foreground">#mc-link</code>.</> },
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-pixel text-primary text-xs w-6 shrink-0">0{i + 1}</span>
                  <div className="text-sm">
                    <div className="font-semibold text-foreground">{step.t}</div>
                    <div className="text-slate-soft">{step.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Card>
    </section>
  );
}

export function IndexPage({ defaultTrailerOpen = false }: { defaultTrailerOpen?: boolean } = {}) {
  const search = useSearch({ strict: false }) as { tab?: typeof TAB_VALUES[number] };
  const tab = search.tab;
  const [activeTab, setActiveTab] = useState<string>(tab ?? "join");
  const [trailerOpen, setTrailerOpen] = useState(defaultTrailerOpen);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("tab=")) {
      requestAnimationFrame(() => {
        document.getElementById("info")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  const handleTrailerOpenChange = (open: boolean) => {
    setTrailerOpen(open);
    if (!open && typeof window !== "undefined" && window.location.pathname === "/video") {
      window.history.replaceState(null, "", "/");
    }
  };

  const handleNav = (target: "join" | "gameplay" | "discord") => {
    if (target === "discord") {
      document.getElementById("discord")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setActiveTab(target);
    requestAnimationFrame(() => {
      document.getElementById("info")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  return (
    <main className="min-h-screen">
      <Hero onNav={handleNav} trailerOpen={trailerOpen} onTrailerOpenChange={handleTrailerOpenChange} />
      <SeasonCountdown />
      <DiscordCard />
      <InfoTabs value={activeTab} onValueChange={setActiveTab} />
      <Footer />
      <Toaster />
    </main>
  );
}

function Index() {
  return <IndexPage />;
}

