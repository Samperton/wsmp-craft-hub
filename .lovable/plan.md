## Goal
Replace the placeholder rows in the "Active Season" leaderboard on `/dashboard` with live data from `https://stats.w-smp.org/v1/players`, sorted by balance (desc). The Season 1 Archive tab keeps its placeholder.

## Data shape (confirmed via fetch)
Root: `{ data: PlayerItem[] }`. Per item we use only:
- `name` — HTML string like `<a class="link" href="...">Blumblor</a>` → strip tags to plain text
- `balance.v` — string numeric (sometimes scientific notation, e.g. `2.36119244E8`) → `Number(v)` for sort
- `balance.d` — pre-formatted display string
- `activePlaytime.d` — pre-formatted display string

No other fields (ping, geolocation, sessions, groups, username, etc.) are read or rendered.

## Implementation

### 1. New server function `src/lib/leaderboard.functions.ts`
A `createServerFn({ method: "GET" }).handler(...)` that:
- `fetch`es the endpoint server-side (avoids CORS, keeps the client bundle clean)
- Parses JSON, maps `data` to a serializable DTO `{ name: string; balanceDisplay: string; balanceValue: number; playtimeDisplay: string }[]`
- Strips anchor tags from `name` via a small regex (`/<[^>]+>/g`) and trims; falls back to the raw string if no tags
- Sorts by `balanceValue` desc
- Returns `{ players: [...] }`
- On fetch failure, throws so the route's `errorComponent` can render

Placed in `src/lib/` (client-safe path) per server-function authoring rules.

### 2. Route `src/routes/dashboard.tsx`
- Add a `queryOptions` (`["leaderboard"]`) wrapping the server fn, with `staleTime: 60_000`.
- Add a route `loader` that calls `context.queryClient.ensureQueryData(...)`.
- Add `errorComponent` and `notFoundComponent` (required when adding a loader).
- `LeaderboardsPanel` stays as-is structurally; the **Active Season** `TabsContent` now renders a new `<LiveLeaderboardTable />` that uses `useSuspenseQuery` to read the cached data and renders the existing `Table` markup with real rows. Rank = index + 1.
- Season 1 Archive tab keeps the existing placeholder `LeaderboardTable`.
- Caption under the live table: "Live standings — refreshed from stats.w-smp.org." Empty-state caption if `players.length === 0`.

### 3. Styling
Reuse the existing table classes (`font-pixel`, `text-primary`, `font-mono`, `text-slate-soft`, `bg-secondary/60`) — no new tokens. Balance cell uses `balanceDisplay`, right-aligned via `text-right` for numeric readability; header gets matching `text-right`. Playtime stays left/mono.

## Files touched
- **new** `src/lib/leaderboard.functions.ts`
- **edit** `src/routes/dashboard.tsx` — add queryOptions, loader, errorComponent, notFoundComponent, swap Active Season body for live table component

## Out of scope
- No changes to Season 1 archive, transitions, fonts, or other routes.
- No auth — endpoint is public.
- No client-side polling/refresh button (server-fn cache + 60s staleTime is enough for now; easy to add later).
