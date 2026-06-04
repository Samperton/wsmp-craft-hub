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
        href: "https://fonts.cdnfonts.com/css/minecraft-4",
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

const FADE_OUT_MS = 600;
const BG_FADE_MS = 2200;
const FADE_IN_MS = 800;

type BgKind = "day" | "sunset";
const bgFor = (path: string): BgKind => (path.startsWith("/dashboard") ? "sunset" : "day");
const bgImage = (kind: BgKind) => (kind === "sunset" ? sunsetBg : heroBg);

function SequencedTransition() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [displayedPath, setDisplayedPath] = useState(pathname);
  const [currentBg, setCurrentBg] = useState<BgKind>(bgFor(pathname));
  const [prevBg, setPrevBg] = useState<BgKind>(bgFor(pathname));
  const [contentOpacity, setContentOpacity] = useState(1);
  const [contentDuration, setContentDuration] = useState(FADE_IN_MS);

  useEffect(() => {
    if (pathname === displayedPath) return;

    // Phase 1: fade old UI out
    setContentDuration(FADE_OUT_MS);
    setContentOpacity(0);

    const t1 = setTimeout(() => {
      // Phase 2: crossfade background (only if it actually changes)
      const nextBg = bgFor(pathname);
      setPrevBg(currentBg);
      setCurrentBg(nextBg);

      const t2 = setTimeout(() => {
        // Phase 3: swap content & fade new UI in
        setDisplayedPath(pathname);
        setContentDuration(FADE_IN_MS);
        setContentOpacity(1);
      }, BG_FADE_MS);

      (t1 as unknown as { _next?: ReturnType<typeof setTimeout> })._next = t2;
    }, FADE_OUT_MS);

    return () => {
      const next = (t1 as unknown as { _next?: ReturnType<typeof setTimeout> })._next;
      if (next) clearTimeout(next);
      clearTimeout(t1);
    };
  }, [pathname, displayedPath, currentBg]);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-50" aria-hidden>
        {/* Outgoing image stays fully opaque underneath so the midpoint never dips */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage(prevBg)})` }}
        />
        {/* Incoming image fades in on top */}
        <div
          key={`bg-${currentBg}`}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${bgImage(currentBg)})`,
            animation:
              currentBg === prevBg
                ? undefined
                : `bg-fade-in ${BG_FADE_MS}ms cubic-bezier(0.45, 0, 0.25, 1) both`,
          }}
        />
      </div>
      <div
        style={{
          opacity: contentOpacity,
          transition: `opacity ${contentDuration}ms ease-in-out`,
        }}
      >
        <RouteRenderer pathname={displayedPath} />
      </div>
    </>
  );
}

function RouteRenderer({ pathname }: { pathname: string }) {
  // Outlet always renders the current matched route. To delay the visual swap,
  // we wrap Outlet here; React still renders the live route, so this only
  // guarantees the fade-in animation key resets when displayedPath updates.
  return <div key={pathname}><Outlet /></div>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SequencedTransition />
    </QueryClientProvider>
  );
}
