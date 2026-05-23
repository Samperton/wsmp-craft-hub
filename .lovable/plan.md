## Make PLAY / BUILD / CONNECT cards interactive

In `src/routes/index.tsx`:

1. **Lift tab state**: Convert `InfoTabs` from `defaultValue="join"` to controlled `value`/`onValueChange`. Move the active-tab state up to the `Home` component (or use a small shared store via `useState` + props) so the hero cards can change it.
2. **Add an id to the Discord section**: Give the `DiscordCard` section wrapper `id="discord"` for anchor scrolling.
3. **Make the 3 cards buttons**:
   - `PLAY` → sets active tab to `"join"` and smooth-scrolls to `#info`.
   - `BUILD` → sets active tab to `"gameplay"` and smooth-scrolls to `#info`.
   - `CONNECT` → smooth-scrolls to `#discord` (no tab change).
   - Render each card as a `<button>` with the same visual styling (rounded card, border, hover state added — subtle lift / border-primary on hover, focus-visible ring), preserving the existing label + desc layout.
4. **Scrolling**: Use `document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })` in the click handler.

No data, routing, or backend changes. Pure presentational + local state.