# Add Trailer Access to Hero

## Goal
Surface the existing `ServerTrailer` video on the opening screen without changing the current hero layout (Season 1 countdown, IP copy button, PLAY/BUILD/CONNECT cards stay exactly where they are).

## Approach
Add a small secondary "Watch Trailer" button next to the existing `CopyIpButton` in the hero. Clicking it opens a centered modal dialog (using the existing shadcn `Dialog` component) that renders the `ServerTrailer` iframe at a comfortable size. Closing the dialog stops playback (iframe unmounts).

This keeps the hero hierarchy intact — IP copy stays the primary CTA, trailer is an optional one-click reveal.

## Changes
**`src/routes/index.tsx`**
1. Import `Dialog`, `DialogContent`, `DialogTrigger`, `DialogTitle` from `@/components/ui/dialog`, plus a `PlayCircle` icon from lucide-react.
2. In the `Hero` component, wrap a new ghost/outline `Button` ("Watch Trailer") in a `DialogTrigger`, placed in the same flex row as `CopyIpButton` (or directly below it on mobile).
3. `DialogContent` renders the existing `ServerTrailer` iframe inside a `max-w-3xl` container with a visually hidden `DialogTitle` for accessibility.

## Alternatives considered
- **Inline collapsible accordion** below the CTAs — adds vertical bulk to the hero, pushes the PLAY/BUILD/CONNECT cards down. Rejected to preserve current layout.
- **Link to a separate `/trailer` route** — extra navigation friction for a short explainer video. Rejected.

A modal keeps the homepage compact and lets the video take full attention when opened.
