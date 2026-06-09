## Goal
Add an "Events" card to the homepage between `DiscordCard` and the "Get Started" (`InfoTabs`) section, styled to match the Discord card. The card has a button that links to a new `/events` route with three tabs: About, Duels, Builds (barebones).

## Changes

### 1. `src/routes/index.tsx`
- Add an `EventsCard` component just below `DiscordCard`, with the same outer layout (`section` + `Card` with `border-2`, `shadow-soft`, gradient bg, max-w-5xl, px-6 pt-12).
- Content: a "Community" / "Events" pill, heading "Server Events", short blurb, and a primary `Button asChild` linking via TanStack `<Link to="/events">` ("Browse Events" with `Calendar` icon + `ArrowRight`).
- Use the existing sequenced transition (like `handleOpenStats`) so navigation feels consistent — wrap the button in a click handler that calls `start(() => navigate({ to: "/events" }))`.
- Render `<EventsCard />` between `<DiscordCard />` and `<InfoTabs ... />` in `IndexPage`.
- Import `Calendar` from `lucide-react`.

### 2. `src/routes/events.tsx` (new file)
- `createFileRoute("/events")` with `head()` meta (title "Events — WSMP", description, og tags).
- Component renders a page consistent with other subpages (background, back link to `/`, heading).
- A `Tabs` component (shadcn) with three triggers: About, Duels, Builds. Each `TabsContent` shows a minimal `Card` with the tab name and a "Coming soon" placeholder line.
- Default tab: `about`.

### 3. `src/routes/__root.tsx`
- Add `/events` to the `bgFor` mapping if it currently switches background per route (mirroring how `/stats` is handled). If the file uses a default fallback that already works, no change needed — will verify on implementation.

## Out of scope
- No real event data, no backend, no per-event detail pages.
- No nav-header link (only the homepage card entry point, as requested).
