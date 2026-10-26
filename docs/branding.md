# Wheelero identity

The original Wheelero mark combines a white W, an open circular wheel and a coral
pointer on the app's purple background. It uses a few bold shapes so the same mark
works in the header, browser tab and installed app. The existing tagline remains
**One spin, one decision.** No external artwork or fonts are embedded in the mark.

`frontend/public/wheelero.svg` is the single vector source. The header and favicon
both use that exact file. Run `bun scripts/icons.mjs` from `frontend/` after changing
it to regenerate the committed 180px Apple touch icon and 192/512px PWA PNGs.
The letter, ring and pointer fit inside the maskable icon's central 80% safe circle.
Keep the purple tile behind the mark on both light and dark interfaces.

Icon filenames changed from the old generic names so browsers can request the new
identity. Vite precaches all variants for offline use. Installed app icon refresh is
controlled by the browser/OS; changing artwork must never clear saved wheel data.
The header image has empty alt text because its enclosing link already says Wheelero.
