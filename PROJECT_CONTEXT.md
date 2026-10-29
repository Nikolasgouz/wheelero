# Wheelero context

Updated: 2026-10-29. Current task: short spin labels and responsive sidebar actions.
Published and verified live: release 0bd30aa, successful Pages run 40928555868.
The user explicitly authorized this release through the existing main-branch workflow.

Latest controls follow-up, published: Wheel uses t.spinShort for visible Spin
(Greek Γύρνα) in all 14 languages, keeping t.spin as the descriptive aria-label. Center text
uses nowrap with a full-width grid track and width/height fitting. Sidebar action rows wrap
with intrinsic button widths and minimum 44px height. No wheel size/color/layout, field/tab,
SEO, URL, footer, Analytics or consent changes. Build/typecheck/lint, 31 unit tests and seven
targeted browser cases passed. Direct Chromium checked 360/390/768/1366/1920px in English and
Greek, all other short labels at 360px, and spin/shuffle/sort/clear/result export/keyboard.
All 22 views fit with no horizontal overflow. Desktop/mobile screenshots were reviewed:
artifacts/spin-controls-{local,live}-*.png. Live verification repeated all 22 views and
English/Greek interactions successfully, with no horizontal overflow. All 45 browser/PWA
cases, 31 unit tests, build/typecheck/lint and deployment passed in the final CI run.
Live metadata, six initial HTML routes, sitemap, 404, offline use and consent checks passed.
First CI run 40927758156 stopped on the existing number-generator dark-mode contrast test.
That test wrote data-theme directly while React retained a saved light preference. It now
switches through the actual theme button and asserts the resulting theme. Six repeated
cases passed. This changes test setup only, not site theme styling or the two-fix scope.
All 14 spinning-state translations also fit in the center at 360px.

Current follow-up: remove the homepage's extra SEO/ToolGuide panel, integrating unique
information in HomeInfo with the earlier aesthetic. Implemented: visible H1 in
the old heading style, Save/Open replacing the duplicate Customise feature card, next-task
example in everyday uses and six plain footer tool links. Five specialist guides remain.
Metadata/initial HTML/Analytics are preserved. Build/typecheck/lint and 31 unit tests passed.
All 13 targeted browser checks passed (SEO, Analytics, sharing and responsive accessibility).
Eight layout/theme views at 1366x768, 1440x900, 1920x1080 and 390x844 passed, with screenshots
visually reviewed on desktop/mobile. All 14 languages and keyboard footer links passed.
Published successfully after all 45 CI browser/PWA checks passed. Live verification repeated
the eight layout/theme views, keyboard links and 14 languages. Six initial HTML/client routes,
metadata/canonicals/sitemap/404, offline generation and absence of tracking before consent
or after rejection all passed. Screenshots: artifacts/home-integrated-{local,live}-*.png.

## Product and runtime

React/TypeScript + Bun/Vite static PWA, GitHub Pages at https://wheelero.com.
No active backend, accounts or cloud sync. Historical backend/SQLite sources stay untouched.
IndexedDB gyrna v14 stores wheels/images/history. localStorage stores preferences and small
editor drafts. Never downgrade/delete storage. v12 preserves pre-rollback v10/v11 recovery,
v14 seeds one main and two empty saved wheels only once. Classroom remains removed.
Save updates the same saved name atomically, while a different name creates a copy. Open
shows saved records only and opens working drafts. Preserve old duplicate-name records.

The centered wheel fits desktop width/height, Entries is on the right with internal scroll,
and the editable wheel title is on the left. Mobile scrolls naturally. Top actions remain
Customise/New/Save/Share/Open/Templates. No gear, AI ornaments or standard JSON import/export.
TXT results export, legacy recovery and snapshot-fragment sharing remain. Links contain
unencrypted copies, no history, and cannot be revoked. Entries textarea preserves stable
IDs/images/no-repeat state. Sound starts enabled each visit but does not autoplay. Explicit
previews bypass global mute. Twelve editable templates include Pick a number (1-10).

All UI/editorial changes use fourteen-language catalogs. Browser language selects the initial
locale unless a saved preference exists. User data is never translated. Static SEO is English.
The compact cookie modal uses the approved Help us improve Wheelero copy with no language
picker. The site is visible but inert until accept/reject, both granting full use. GA4
G-JB9ZRMKRKR loads only after acceptance, in production on wheelero.com, in an isolated frame.
Only safe route metadata/counts are tracked. No names/results/query/fragments. Contact sends
explicit messages via Formspree xljjlgrl with private provider-side recipient. No inbox in UI.

## Current SEO implementation

Six task-specific routes: /, /random-name-picker, /random-number-generator,
/random-number-wheel, /yes-no-wheel, /random-team-generator. Twelve public routes total,
plus real 404/launch entry. Existing slashless routes keep working through Pages redirects.
Canonicals/sitemap use final trailing slashes. Unique titles/descriptions/H1, OG/Twitter and
accurate WebApplication JSON-LD. No fabricated ratings, lastmod, keyword metrics or claims.

ToolGuide/tool-content.ts supply instructions/examples/FAQs for the five specialist tools.
HomeInfo integrates homepage guidance without an extra box or duplicate instructions/FAQs.
The visible H1 is in its original information section below the wheel. site.ts/toolPaths
drives all six footer tool links. Both changes preserve the first-screen wheel size.
This latest request supersedes older removed-FAQ/Tools instructions. PageLoading shares
prerender/client loading copy and reserves tool space. React still mounts with createRoot,
not interactive hydration. English content matches before/after initialization.

NumberGenerator/lib/numbers.ts implements inclusive integer bounds +/-1e9, quantity 1-1000,
optional repeats, unique batches, validation, accessible results and clipboard copy. Web
Crypto rejection sampling plus sparse Fisher-Yates avoids bias and huge range allocations.
Results live only in component memory, reset on reload, and are never sent to Analytics.
Existing wheel/team selection and storage schema are unchanged. All new copy is translated.

## Important files

- src/site.ts, components/SiteContent.tsx: route metadata and information pages.
- src/tool-content.ts, components/ToolGuide.tsx: five specialist guides, links and FAQs.
- components/HomeInfo.tsx: integrated homepage guidance and its single visible H1.
- components/PageLoading.tsx, scripts/pages.tsx: initial HTML, sitemap/robots/metadata.
- components/NumberGenerator.tsx, lib/numbers.ts: instant random integers.
- App.tsx/styles.css/components/Wheel.tsx: main layout and spin behavior.
- components/WheelSidebar.tsx, lib/entries.ts, screens/Editor.tsx: stable entry editing.
- state/store.ts/storage.ts: serialized committed writes, cross-tab sync and migrations.
- lib/analytics.ts, analytics-message.ts, components/CookieGate.tsx: basic consent/safe events.
- vite.config.ts, components/PwaControls.tsx: PWA and safe update controls.
- docs/seo.md: keyword map, rationale, verification and Search Console checklist.

## Checks and next steps

Latest local typecheck/build/lint passed, all 31 unit tests passed. Targeted SEO/Analytics
cases passed after normalizing Windows clipboard CRLF in the assertion. Restarted an old
preview process to refresh its route map. Forty-eight viewport/theme/tool inspections passed
at 1366x768, 1440x900, 1920x1080 and 390x844: no overflow or browser errors, centered fitting
homepage wheel. Local unthrottled headless sample: max summed CLS 0.022, LCP 320 ms. These are
lab observations, not field performance. All 44 browser cases passed across runs. The full
local runs exposed an Analytics proxy teardown race (fixed by serving actual dist fixtures
directly) and a short-spin timing miss under eight-worker load (unchanged test passed with
two diagnostic workers). All seven Analytics cases passed after the fixture fix. Rendered
14-language x six-tool checks passed. The isolated PWA update passed, retaining saved and
unsubmitted editor work through a real worker replacement.

Final CI passed all 44 browser cases plus isolated PWA update, 31 unit tests, typecheck,
lint, build and deployment. Live Chromium verified six initial HTML/client pages, canonical
301 destinations, sitemap/robots, real 404, unique number batches, offline generation and
zero Google requests before consent/after rejection. All 48 layout views and 14-language x
six-route checks passed again live. No storage, wheel selection or customization regression.

Next: owner submits sitemap.xml and inspects the six canonical tool URLs in Search Console,
then monitors actual impressions/clicks. No connected Search Console access is available.
Indexing/rank changes, physical-device installation, human screen-reader/native-speaker review
and field performance remain unverified. This release did not retest GA report ingestion.
No known unfinished implementation work for this SEO request. See docs/seo.md for details.

## Commands and delivery

frontend/: bun install --frozen-lockfile; bun run dev.
Checks: bun run typecheck; bun run lint; bun run test; bun run build; bun run e2e.
SEO/Analytics tests need PUBLIC_URL=https://wheelero.com, PUBLIC_INDEXING=true,
VITE_ANALYTICS_ENABLED=true at build. Local origin remains untracked. Preview:
bun run preview --port 4173 --strictPort. START_GYRNA.bat rebuilds/opens local preview.
Do not build during the exclusive SW-update test. CI uses four 2-worker shards, then an
isolated PWA-update job and Pages deployment. Never stop unrelated processes/clear user data.
Normal navigation revalidates HTTP HTML with precached offline fallback. Workers activate
without forcing open pages to reload. Save & update flushes writes and is locked during spins.
Repo: git@github.com:Nikolasgouz/wheelero.git. Keys remain ignored. No force push/DNS changes.
