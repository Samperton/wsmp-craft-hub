import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";


import appCss from "../styles.css?url";
import heroBg from "@/assets/hero-bg.jpg";
import sunsetBg from "@/assets/sunset-bg.png";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "WSMP" },
      { name: "description", content: "Join the WSMP, a Winona State Economy Survival Minecraft Server!" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "WSMP" },
      { property: "og:description", content: "Join the WSMP, a Winona State Economy Survival Minecraft Server!" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "WSMP" },
      { name: "twitter:description", content: "Join the WSMP, a Winona State Economy Survival Minecraft Server!" },
      { property: "og:image", content: "https://mc.w-smp.org/embed-preview.png" },
      { name: "twitter:image", content: "https://mc.w-smp.org/embed-preview.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const FADE_OUT_MS = 350;
const BG_FADE_MS = 1100;
const FADE_IN_MS = 500;

type BgKind = "day" | "sunset";
const bgFor = (path: string): BgKind =>
  path.startsWith("/stats") || path.startsWith("/events") || path.startsWith("/modpack") || path.startsWith("/map") ? "sunset" : "day";

const bgImage = (kind: BgKind) => (kind === "sunset" ? sunsetBg : heroBg);

type TransitionCtx = { start: (action: () => void) => void };
const TransitionContext = createContext<TransitionCtx>({ start: (a) => a() });
export const useSequencedTransition = () => useContext(TransitionContext);

function SequencedTransition() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [currentBg, setCurrentBg] = useState<BgKind>(bgFor(pathname));
  const [prevBg, setPrevBg] = useState<BgKind>(bgFor(pathname));
  const [bgAnimKey, setBgAnimKey] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [opacityDur, setOpacityDur] = useState(0);

  const lastPathRef = useRef(pathname);
  const pendingRef = useRef(false);
  const currentBgRef = useRef(currentBg);
  currentBgRef.current = currentBg;

  const start = useCallback((action: () => void) => {
    pendingRef.current = true;
    setOpacityDur(FADE_OUT_MS);
    setOpacity(0);
    window.setTimeout(action, FADE_OUT_MS);
  }, []);

  useEffect(() => {
    if (pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;

    const nextBg = bgFor(pathname);

    const runBgAndFadeIn = () => {
      // Phase 2: crossfade background
      setPrevBg(currentBgRef.current);
      setCurrentBg(nextBg);
      setBgAnimKey((k) => k + 1);
      // Phase 3: fade new content in after the background has settled
      window.setTimeout(() => {
        setOpacityDur(FADE_IN_MS);
        setOpacity(1);
      }, BG_FADE_MS);
    };

    if (pendingRef.current) {
      // Fade-out already ran via the trigger; jump straight to bg crossfade.
      pendingRef.current = false;
      runBgAndFadeIn();
    } else {
      // Untriggered nav (e.g. browser back): fade out first, then continue.
      setOpacityDur(FADE_OUT_MS);
      setOpacity(0);
      window.setTimeout(runBgAndFadeIn, FADE_OUT_MS);
    }
  }, [pathname]);

  const bgChanged = currentBg !== prevBg;

  return (
    <TransitionContext.Provider value={{ start }}>
      <div className="pointer-events-none fixed inset-0 -z-50" aria-hidden>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage(prevBg)})` }}
        />
        <div
          key={`bg-${bgAnimKey}`}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${bgImage(currentBg)})`,
            animation: bgChanged
              ? `bg-fade-in ${BG_FADE_MS}ms linear both`
              : undefined,
          }}
        />
      </div>
      <div
        style={{
          opacity,
          transition: `opacity ${opacityDur}ms ease-in-out`,
        }}
      >
        <Outlet />
      </div>
    </TransitionContext.Provider>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SequencedTransition />
    </QueryClientProvider>
  );
}
