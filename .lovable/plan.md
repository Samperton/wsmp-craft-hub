## Make `/rules` open + scroll to the Rules tab

The `/rules` route already redirects to `/` with `?tab=rules`. We need the index page to read that param, switch tabs, and scroll down.

### Problem to fix first
Lines 16-20 of `src/routes/index.tsx` contain broken code added at module scope (hook calls and JSX outside any component). This will not compile. Remove it.

### Changes

**1. `src/routes/index.tsx`**
- Delete lines 16-20 (the stray `useSearch`/`activeTab`/`<Tabs>` block).
- Add `validateSearch` on the route so `?tab=...` is typed and validated:
  ```ts
  import { zodValidator, fallback } from "@tanstack/zod-adapter";
  import { z } from "zod";
  const searchSchema = z.object({
    tab: fallback(
      z.enum(["join","rules","plugins","gameplay","staff","bug","player"]),
      "join"
    ).default("join"),
  });
  // in createFileRoute("/")({ validateSearch: zodValidator(searchSchema), ... })
  ```
- In `Index`, read the param and use it as the initial tab + scroll to `#info` once on mount when a `tab` was supplied:
  ```ts
  const { tab } = Route.useSearch();
  const [activeTab, setActiveTab] = useState(tab);
  useEffect(() => {
    if (window.location.search.includes("tab=")) {
      // small delay so layout is mounted
      requestAnimationFrame(() =>
        document.getElementById("info")?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  }, []);
  ```
- Keep existing tab/scroll behavior for the hero cards unchanged.

**2. Install adapter (if missing)**
`bun add @tanstack/zod-adapter zod` — only if not already in `package.json`.

### Result
- Visiting `mc.w-smp.org/rules` redirects to `/?tab=rules`, the Rules tab is selected, and the page smoothly scrolls to the Get Started section.
- Other tab values (`gameplay`, `plugins`, etc.) work the same way for free.
- No backend/data changes.
