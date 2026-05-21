import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Check, Users, Server, Shield, Bug, UserPlus, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/")({
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

function Logo() {
  return (
    <div className="font-minecraft text-2xl md:text-3xl tracking-tight flex items-center text-shadow-minecraft">
      <span className="text-primary">W</span>
      <span className="text-white text-shadow-minecraft">SMP</span>
    </div>
  );
}

function PlayerCounter() {
  // Live counter slot — wire to a status API later
  const [count, setCount] = useState<number | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Placeholder simulation for the "slot". Replace with real API call.
    const tick = () => setCount(Math.floor(18 + Math.random() * 14));
    tick();
    const id = setInterval(tick, 5000);
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
        {count ?? "—"} <span className="text-muted-foreground font-normal">players online</span>
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

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/55 to-background" aria-hidden />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
        <Logo />
        <div className="hidden md:block">
          <PlayerCounter />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pt-20 pb-28 md:pt-28 md:pb-36 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-slate-soft backdrop-blur">
          <Server className="h-3.5 w-3.5 text-primary" />
          University Economy Survival · Java & Bedrock
        </div>

        <h1 className="mt-6 font-minecraft text-5xl md:text-7xl leading-[1.15] text-shadow-minecraft">
          <span className="text-primary">W</span><span className="text-white text-shadow-minecraft">SMP</span>
        </h1>
        <p className="mt-6 mx-auto max-w-2xl text-lg md:text-xl text-slate-soft">
          Whether you enjoy competing for economic advantage or casual Minecraft play,
          we'd love you to be part of the WSMP community.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <CopyIpButton />
          <div className="md:hidden">
            <PlayerCounter />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
          {[
            { label: "PLAY", desc: "Economy Survival" },
            { label: "BUILD", desc: "Easy Land Claims" },
            { label: "CONNECT", desc: "Linked Discord" },
          ].map((f) => (
            <div key={f.label} className="rounded-xl border border-border bg-card/85 backdrop-blur p-4">
              <div className="font-minecraft text-lg md:text-xl text-primary">{f.label}</div>
              <div className="mt-2 text-xs md:text-sm text-slate-soft">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoTabs() {
  return (
    <section id="info" className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center mb-10">
        <h2 className="font-pixel text-xl md:text-2xl text-slate-deep">Get Started</h2>
        <p className="mt-3 text-slate-soft">Everything you need to jump in, follow the rules, or help run the server.</p>
      </div>

      <Tabs defaultValue="join" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto bg-secondary p-1 rounded-xl">
          <TabsTrigger value="join" className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary py-2.5">
            <BookOpen className="h-4 w-4 mr-2" /> How to Join
          </TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary py-2.5">
            <Shield className="h-4 w-4 mr-2" /> Server Rules
          </TabsTrigger>
          <TabsTrigger value="staff" className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary py-2.5">
            <UserPlus className="h-4 w-4 mr-2" /> Staff Application
          </TabsTrigger>
          <TabsTrigger value="bug" className="data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary py-2.5">
            <Bug className="h-4 w-4 mr-2" /> Report a Bug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="join" className="mt-6">
          <Card className="p-6 md:p-8 border-2 border-border shadow-soft">
            <h3 className="font-pixel text-base text-slate-deep">Join in 3 steps</h3>
            <ol className="mt-5 space-y-4">
              {[
                { t: "Launch Minecraft", d: "Open Java Edition 1.21+ or Bedrock Edition on any platform." },
                { t: "Add the server", d: "Use IP w-smp.org — Bedrock players use the same address with default port." },
                { t: "Hit play", d: "Spawn into the Social Hub, grab a starter kit, and meet the community." },
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
              detail as possible — coordinates, screenshots, and steps to reproduce help us fix things fast.
            </p>
            <form
              className="mt-6 grid gap-3 max-w-xl"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Bug report sent", { description: "Thanks — staff will review it shortly." });
                (e.target as HTMLFormElement).reset();
              }}
            >
              <input
                required
                placeholder="In-game username"
                className="rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                required
                placeholder="Short title (e.g. shop GUI not opening)"
                className="rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <textarea
                required
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

function Index() {
  return (
    <main className="min-h-screen">
      <Hero />
      <InfoTabs />
      <Footer />
      <Toaster />
    </main>
  );
}
