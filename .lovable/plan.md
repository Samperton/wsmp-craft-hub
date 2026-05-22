## Scope

Add five additions to the homepage (`src/routes/index.tsx`):

1. **Season countdown** — prominent banner/section counting down to Sept 4, 6pm CST (`2025-09-04T18:00:00-06:00`). Live updating days/hours/minutes/seconds. Placeholder note that the date is provisional.
2. **Discord join CTA + Minecraft link guide** — high-visibility card with big "Join Discord" button (`https://dsc.gg/w-smp`) and short 3-step linking instructions:
   - In-game: `/discord link`
   - Copy the code it gives you
   - Paste it in `#mc-link` on Discord
3. **Plugins list** — new tab in the existing `InfoTabs` ("Plugins"), rendering a list of plugin name + short description. Source: a JSON file at `/api/public/plugins` served via a TanStack server route, with data stored in `src/data/plugins.json` so you can edit it through the Cloudflare-backed code/deploy workflow.
4. **Gameplay changes list** — same pattern as plugins. New tab "Gameplay Changes" backed by `src/data/gameplay-changes.json` and `/api/public/gameplay-changes`.
5. **Player report form** — new tab "Report a Player" mirroring the bug report form (username, reported player, description). Posts to a **separate** Discord webhook via a new env var `VITE_PLAYER_REPORT_WEBHOOK_URL`.

## Layout changes on `/`

```text
Hero
Season Countdown (new)
Discord Join + Account Linking (new)
InfoTabs:
  How to Join | Server Rules | Plugins (new) | Gameplay Changes (new) |
  Staff Application | Report a Bug | Report a Player (new)
Footer
```

Tabs will switch to a horizontal scroll / wrap layout (`flex flex-wrap` instead of fixed grid-cols-4) to accommodate 7 tabs.

## Technical details

- **Countdown**: client component with `useEffect` + `setInterval(1000)`, target `new Date("2025-09-04T18:00:00-06:00")`. Renders 4 pixel-styled tiles (D/H/M/S). When elapsed, shows "Season live — jump in!".
- **Plugins/Gameplay data**: plain JSON files in `src/data/`. Each entry: `{ name, description, category? }`. Loaded via a `createServerFn` (`getPlugins`, `getGameplayChanges`) wired through `queryOptions` + `useSuspenseQuery` per the canonical loader pattern. Editing requires a code change + deploy, which matches the "editable through Cloudflare backend" workflow.
- **Discord card**: styled like existing `CopyIpButton` block; primary button links to `https://dsc.gg/w-smp` (opens new tab), secondary copy-to-clipboard for the link.
- **Player report webhook**: add a new env var `VITE_PLAYER_REPORT_WEBHOOK_URL`. Form posts JSON with fields: reporter username, reported player, description, optional evidence/coords. Reuses the same fetch/toast pattern as the existing bug form.
- All new UI uses existing design tokens (`bg-card`, `text-slate-soft`, `font-pixel`, `shadow-pixel`, `bg-gradient-primary`) — no new colors.

## Things I need from you before/after I build

- After implementation: add `VITE_PLAYER_REPORT_WEBHOOK_URL` in your env (same place as the existing `VITE_DISCORD_WEBHOOK_URL`). I'll wire the code to read it.
- Initial plugin + gameplay change entries — I'll seed the JSON files with a few placeholder rows; you can swap in the real list.
- Confirm the season target — I'll hardcode Sept 4, 2025 6pm CST and leave a `// TODO: update when finalized` comment.

## Out of scope

- No database / Lovable Cloud activation.
- No admin UI for editing lists (per your "edit through backend code" preference).
- No changes to the bug report flow.
