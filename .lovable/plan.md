## Goal

Keep the countdown in its current spot, but turn it into a large, dominant live countdown to **Season 1 — Sept 4, 2026 at 7:00 PM CST**.

## Changes in `src/routes/index.tsx`

1. **Update `SEASON_START`** to `new Date("2026-09-04T19:00:00-05:00")` (7 PM CST, post-Season-0).
2. **Rework `SeasonCountdown` visuals** (same component, same placement):
   - Widen container to `max-w-6xl`, increase vertical padding (`pt-20`, card `p-10 md:p-14`).
   - Stronger card: `bg-gradient-to-br from-slate-deep to-primary/80` with light text, subtle glow border.
   - Replace the small "Next Season" chip with a large eyebrow: `font-pixel text-sm uppercase tracking-[0.3em]` reading "Season 1 begins in".
   - Main headline: `font-minecraft text-4xl md:text-6xl text-shadow-minecraft` showing the target date line.
   - Countdown tiles become the focal point: 4 large tiles, `text-6xl md:text-8xl` numbers in `font-minecraft`, each tile `p-6 md:p-8`, thicker `border-4 border-background/20 shadow-pixel`, on a translucent background. Labels in larger uppercase text below each number.
   - Add a subtle animated pulse (`animate-pulse`) on the seconds tile only, for liveness.
   - When `live` is true: replace tiles with a giant "SEASON 1 IS LIVE" banner and a "Join now" link to the IP copy button anchor.
3. **No changes** to other sections, data files, tabs, or Discord/report logic.

## Technical notes

- All colors via existing tokens (`slate-deep`, `primary`, `background`, `border`). No new CSS variables.
- Pure presentational change inside `SeasonCountdown` + one date constant update — no new deps, no layout reshuffle elsewhere.
