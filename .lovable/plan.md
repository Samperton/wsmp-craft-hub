## Goal
Replace the placeholder in the "3D World Map" view on `/dashboard` with the live map hosted at `https://map.w-smp.org`, and give users a way to view it fullscreen.

## Implementation

### `src/components/dashboard/WorldMapPanel.tsx` (rewrite)
- Drop the placeholder block.
- Render an `<iframe src="https://map.w-smp.org">` inside a responsive container:
  - Default: aspect-video (16:9), rounded, bordered, matches the existing card styling.
  - `title="WSMP Live World Map"`, `loading="lazy"`, `allow="fullscreen"`, `allowFullScreen`.
- Header row keeps the `Globe2` icon + "3D World Map" heading and adds two buttons on the right:
  - **Open in new tab** — anchor to `https://map.w-smp.org` with `target="_blank" rel="noopener noreferrer"` (fallback if the browser blocks iframe fullscreen).
  - **Fullscreen** — toggles browser Fullscreen API on a wrapper `div` around the iframe via a ref (`requestFullscreen` / `document.exitFullscreen`). Button label/icon swaps between `Maximize2` / `Minimize2` based on a `fullscreenchange` listener.
- When fullscreen is active, the wrapper gets `bg-background` and the iframe fills `100%` width/height so it looks right outside the card.
- Caption below: short note that the map is live from `map.w-smp.org`.

### No other files change
- `src/routes/dashboard.tsx` already lazy-loads `WorldMapPanel`; no route changes.
- No new dependencies (lucide icons `Maximize2` / `Minimize2` / `ExternalLink` are already available from `lucide-react`).

## Out of scope
- No auth, no data fetching, no styling overhaul of the dashboard.
- No changes to leaderboards or other routes.
