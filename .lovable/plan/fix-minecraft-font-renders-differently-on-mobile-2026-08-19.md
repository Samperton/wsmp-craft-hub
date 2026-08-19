# Fix: Minecraft font renders differently on mobile

## What's happening

The Minecraft font is loaded from a third-party CDN stylesheet (`fonts.cdnfonts.com/css/minecraft-4`) linked in the root route. That stylesheet declares:

```text
src: local('Minecraft'), url('https://fonts.cdnfonts.com/s/36662/MinecraftTen-VGORe.woff')
```

Two properties of this setup make rendering device-dependent:

1. `local('Minecraft')` is tried first — any device that has a font named "Minecraft" installed uses that one instead of the downloaded webfont. Desktops with Minecraft-related fonts installed get a different typeface than phones, which have none.
2. Only a single legacy `.woff` file is offered, from a CDN that can be slow, blocked by mobile content blockers, or rate-limited. When it fails, text silently falls back to the next family in the stack (`JetBrains Mono`), which is exactly the "wrong font on mobile" symptom.

Emulated desktop/mobile in the sandbox both loaded the CDN font, so the divergence comes from the real device environment (installed local font and/or CDN fetch failure) — not from any responsive CSS in the project. There are no mobile-specific font rules anywhere in the codebase.

## The fix

Make font delivery deterministic and identical on every device, without changing what desktop currently shows.

1. Download the Minecraft webfont file used today and self-host it in `src/assets/fonts/` so it ships with the app instead of being fetched from a third-party CDN.
2. Declare `@font-face` for `Minecraft` directly in `src/styles.css`, pointing only at the local bundled file — no `local()` lookup, so an installed system font can never override it — with `font-display: swap`.
3. Remove the `fonts.cdnfonts.com` `<link>` from `src/routes/__root.tsx` so there's only one source of truth for the family.
4. Leave `--font-minecraft`, `.font-minecraft`, `.text-shadow-minecraft`, and every usage site untouched, so desktop appearance stays as-is.

## Verification

Load the page at desktop and mobile viewports and confirm the `Minecraft` face resolves from the bundled file in both, with matching glyph shapes and text widths.

## One thing to confirm

If your desktop currently shows the *classic blocky Minecraft* letterforms while mobile shows something rounder/taller, your desktop is using a locally installed font and the CDN one (MinecraftTen) is a different design. In that case I'd bundle the classic "Minecraft Regular" webfont instead so both platforms match the desktop look — tell me which look is the correct one if it doesn't match after the change.
