# Γύρνα. — context

Last updated: 2026-10-25. Customize gear beside Pause; Entries toolbar Shuffle/Sort/Clear.

## Product and current UI

English anonymous decision spinner, responsive installable PWA; Γύρνα. branding retained.
FastAPI/SQLAlchemy/Alembic/
SQLite backend; React/TypeScript/Vite/Bun frontend. Up to 10,000 entries, templates,
multiple wheels, history/no-repeat, JSON backups, revocable public snapshots, offline
editing/draws, conflict copies and uncertain-request recovery. No accounts or deployment.

New home example: Pick a name — Alex, Emma, James, Olivia, Noah, Sofia. Bundled/API
templates, Customize, errors, installation text and HTML/manifest language are English.
IndexedDB v3 adds this example once to existing installations, preserving old wheels,
settings, results and user-written messages. It selects the example unless a draw is
pending. Close old app tabs if an upgrade-blocked message appears. No SQLite shape change.

Home now has a wheel stage up to 960px and an Entries/Results sidebar on the right (>=1024px).
Desktop layout spans the viewport, with a 340px sidebar 16px from its right edge.
The wheel shifts toward the viewport center as available space allows. At 1440x900
its stage is 760px wide, centered at x=680 (previously 660px at x=532); at 1920x1080
it is 940px wide and centered at x=960.
The rim fills 96% of the stage with a thinner border. Short-list names use larger text,
shrinking for long labels; numbered large lists are unchanged.
Below 1024px the sidebar sits underneath; on phones the wheel section uses compact flow.
Entries support edit/add/delete with 100-row pagination, shared autosave and draw locks.
Click/focus or pencil selects a name for replacement; Enter finishes editing. Inputs
are 16px and focused rows are highlighted. The sidebar holds a pre-draw wheel snapshot
until the animation finishes, hiding the new result/count and no-repeat marker while
preserving previous history. Backend/IndexedDB persistence still happens immediately.
Results show source/time, recent/all history and become selected after a completed draw.
The winner popup offers only Close and Remove winner (unless removal is hidden in
Customize). It has no respin/copy/New round actions; these remain on the main screen.
Dialog's optional headerClose hides its duplicate close icon for this popup only.
Customize is a labeled gear icon immediately after Pause in the wheel toolbar. Entries
has Shuffle/Sort/Clear directly below the tabs; Results retains its own history Clear.
The entry toolbar is hidden while Results is selected. Shuffle and numeric,
case-insensitive A-Z sort preserve IDs, images, active flags and duplicates, autosave
and lock during draws. Desktop navigation is Wheel/My wheels. More options opens the
full editor (also reachable from mobile Entries) with sharing, templates and Customize.
Both entry editors use distinct labels/draft keys and preserve incomplete input while hidden.
Each sidebar tab has Clear. Entries removes options only; Results clears visible history
and pending result uploads only. Both cancel queued auto-removals and reset result UI.
Draw locks apply; no-repeat active flags survive history clearing. Empty lists can be saved.
`state/store.ts:clearWheel` uses the existing local transaction/outbox; IndexedDB v4 adds
`clear_history` to old wheels without duplicating the starter. Revisioned PUT clears
before uploading newer offline draws. Migration d81e3a7b902f adds `results.cleared`;
the server hides cleared rows but retains them for draw retry idempotency. This is not
physical deletion of retry records. Conflicts retain the existing remote/copy behavior.

Click to spin is a real center button (mouse/touch/Enter/Space), using the existing
guarded draw flow. Custom center images remain visible with a transparent hit area.
Visible wheels idle silently at one turn per 30 seconds before and after every draw,
including behind the result popup and during background sync. Pause/resume is in the
wheel toolbar; live reduced-motion changes disable idle animation. The wheel lands on
the winner before resuming decorative motion; stored results stay unchanged. No selection
occurs on idle. Hidden/share screens and uncertain pending draws still suspend idle.

Customize has three transactional tabs: During spin / After spin / Appearance. Settings
include duration/visibility, 8 built-in spin sounds and 8 result sounds, volume/preview,
popup/confetti/winner actions, durable auto-removal, palettes/images/text/shadow/borders.
Global mute and reduced motion take precedence. Settings and private images survive
refresh, sharing, copies, JSON and offline sync. See docs/customization.md for parity.
App sound defaults to enabled on each load/refresh; manual mute is session-only.
Per-wheel No sound/volume settings still apply. Audio starts on spin or preview actions.
The 8 spin scores now emphasize suspense; click/rattle timing slows toward the end,
drum/pulse rhythms build speed/intensity and the riser raises pitch. Timing follows
spin duration, not individual sector crossings. The 8 result scores use stereo applause
and major-key victory melodies/brass/bells. Existing sound IDs/defaults stay unchanged;
new English labels describe the new scores. Preview uses the configured spin duration.
Color-mode sectors now use unique colors: enabled palette colors first (deduplicated),
then deterministic generated colors. Appending preserves existing positions' colors;
colors follow positions, not IDs on sort/removal. `lib/presentation.ts:sectorColors`
is shared by sector fills and animated pointer colors. No schema/data migration.

## Architecture and important files

- `START_GYRNA.bat`, `STOP_GYRNA.bat`, `scripts/start-gyrna.ps1`: always build, verify
  listener ownership, restart only this project, migrate and launch hidden servers.
  Open `/api/launch` (backend/app/main.py) for latest no-store HTML, bypassing stale PWA
  navigation caches on the same origin. No browser storage deletion or forced tab reload.
- `backend/app/routes.py`, `schemas.py`, `security.py`: revisioned API, validation,
  ownership/CSRF/Origin checks. `/docs` is generated OpenAPI documentation.
- `models.py`, `database.py`, `migrations/`: SQLite WAL/foreign keys, serialized writes;
  DB dependencies commit before success responses. No startup table creation.
- `customization.py`: version 1 configuration/raster validation. Migration c72f1a9e4b02
  preserves old wheels/results/shares. New sound enum values need no SQL/schema migration.
- `services.py`: secure server RNG and immutable result snapshots.
- `frontend/src/state/store.ts`, `storage.ts`: IndexedDB v4, revisions/UUID outbox,
  Web Locks/BroadcastChannel, conflict copies and durable ID-based winner removal.
  Removal jobs follow conflict/session-loss copies and share the manual removal path.
  `state/wheel.ts` supplies the shared wheel factory for creation and local migration.
- `lib/random.ts`, `geometry.ts`, `presentation.ts`: independent RNG, geometry and visual
  projection of at most 1,000 entries. All eligible entries retain their probability;
  the displayed wheel always contains the winning ID.
  RNG/shuffle bounds now match 10,000 entries (corrected the previous 200-entry limit).
- `lib/motion.ts`: capture the rendered angle and cancel idle animation before a draw.
  `components/Wheel.tsx` owns Web Animations idle motion; the center control does not rotate.
- `components/WheelSidebar.tsx`: home entries and history; `screens/Editor.tsx`: full editor.
- `components/Customize.tsx`, `ImagePicker.tsx`, `Wheel.tsx`: draft settings, bounded
  uploads and renderer. OK waits for uploads and local durable storage.
- `customization.ts`, `customization.i18n.ts`, `i18n.ts`: schemas/defaults and English labels.
- `lib/audio.ts`: original local sound scores, finished nodes released while looping.
  Duration-driven timeout scheduling, reusable percussion buffers, sustained brass and
  3.8-second stereo applause; cleanup uses cue length rather than a fixed cutoff.
  `scripts/generate-gallery.mjs`: three original bundled WebP images.
- `App.tsx`, `styles.css`: UI flow/layout; `vite.config.ts`: prompt-update PWA with
  shell/fonts/gallery precache. Private APIs never enter service-worker caches.

Private images are embedded PNG/JPEG/WebP or known gallery paths. Uploads <=10 MB become
<=1024px/512 KB; wheel schema <=8 MB UTF-8; archives <=100 MB. A fresh one-entry wheel
can spin online/offline (index 0/count 1), without prior history. No-repeat exhausts it
after one draw; New round works for a singleton. Empty lists stay disabled without the
old minimum-two-entry prompt. Eligibility checks live in App.tsx, store.ts and routes.py.
Client/imported results remain explicitly offline. Cookie loss copies local work to a
new isolated workspace; no cross-device recovery.

## Actual verification

Customize-gear follow-up: typecheck, lint, build and 6 relevant E2E passed (44.1s),
covering the adjacent Pause/Customize controls, draw locks, Shuffle/Sort, settings
cancel/save and accessibility at 360/390/768/1440px. Desktop/mobile screenshots inspected;
no horizontal overflow. Manual browser check exercised the relocated Clear and gear,
winner removal/persistence and hidden-remove setting. No backend/schema changes.

Result-popup follow-up: typecheck, lint, production build and 2 relevant E2E passed
(28.8s: no-repeat exhaustion, reduced motion/modal dismissal). Manual Chromium checks
at 360px verified exactly Close/Remove winner, focus/Enter/Escape, persisted winner
removal with history retained, and the hidden-remove setting. Screenshot inspected.
No backend/schema changes; pytest not rerun.

Suspense/celebration follow-up: typecheck, lint and production build passed. Three E2E
passed (15.2s: all 16 sounds/volume/mute, offline customization, reduced motion); the
audio E2E passed again after the final brass-envelope adjustment. OfflineAudioContext
rendered all 8 result cues with nonzero samples and peaks below clipping at 100% volume
(0.127–0.386). Real preview timing measured clicks slowing from ~71ms to ~374ms and
drumroll accelerating from ~151ms to ~63ms, with automatic stop. Browser playback verified
applause starts after the spin and mute releases nodes. Physical listening on speakers/
headphones was not performed. No backend/schema change; pytest not rerun.

Sound-default follow-up: typecheck, lint and production build passed. The existing
audio E2E passed (8.9s), checking default enabled state, all 16 sounds, stop/volume,
manual mute and enabled previews after refresh. No backend/schema changes.

Single-entry follow-up: 41 pytest tests (15.51s), typecheck, lint, 10 unit tests and
production build and 3 relevant E2E passed (54.4s). Chromium verified repeated single-entry server draws, index
0/count 1, refresh, no-repeat exhaustion/New round, offline draws after history clear,
resync and removal of the old minimum-entry prompt. Mobile screenshot inspected.
The launcher rebuilt and restarted this project's servers. No schema/migration change.

Clear actions follow-up: 41 pytest tests passed (16.68s), Alembic check clean, typecheck,
lint, 10 unit tests and production build passed. Full E2E: 28 passed, two exposed the
rotating SVG's horizontal overflow. After clipping the rim, all 6 targeted responsive,
reduced-motion and palette checks passed (27.3s), including both failed widths.
Manual Chromium checks passed for independent entries/results clearing, keyboard use,
draw locks, preserved no-repeat flags, online/offline refresh and clearing followed by
a new offline draw/resync. Desktop/mobile screenshots visually inspected. v3→v4 upgrade
keeps the active wheel without adding a starter. Isolated API checks verified migration
of existing results, owner/CSRF/revision checks, clear/draw retries and SQLite reopen.
The Windows launcher built, migrated and restarted this project's servers successfully.

Unique-color follow-up: typecheck, lint, 10 existing unit tests, production build and
6 relevant E2E passed (40.7s: four responsive/accessibility sizes, palette/center sizes,
1,000-entry winning projection). Direct checks verified 1,000 unique colors and stable
append prefixes for every theme, duplicate-color and single-color palettes. Chromium
verified 19 unique rendered fills, unchanged previous colors on append, online/offline
refresh persistence and mobile overflow; desktop screenshot visually inspected.
No backend changes; pytest not rerun. Build retains the two upstream Zod warnings.

Sidebar toolbar follow-up: typecheck, lint, 10 unit tests and production build passed.
Full E2E run: 29 passed; one navigation-helper race timed out after template selection.
After waiting for the local write/navigation in that helper, the failed no-repeat/bulk
scenario passed on rerun (25.7s). Responsive/accessibility checks passed at all four
360/390/768/1440px widths; desktop/mobile screenshots were visually inspected.
A separate 211-entry browser check verified shuffle/natural sort offline, refresh and
server resync, preserving IDs, duplicates, active flags and images. Unit checks cover
the 10,000-entry shuffle limit. Backend/schema unchanged; pytest not rerun this follow-up.

Idle speed follow-up: lint and production build (including TypeScript) passed.
Chromium verified a 30,000ms idle animation and measured 11.99 degrees/second.

Continuous-idle follow-up: typecheck, lint, build and 5 relevant E2E passed (1.1min).
Verified post-result idle restart, pause/resume, landing agreement, reduced motion,
offline draws, no-repeat exhaustion and 1,000-entry projection. A separate two-spin
online/offline browser check confirmed idle movement after each result while history
stays unchanged and the next result still waits until spin completion.

Inline-edit/result-reveal follow-up: typecheck, lint and production build passed;
9 relevant E2E passed (1.1min), including pencil replacement/persistence and a stored
server result remaining absent from Results/count during animation. Direct name-click
replacement and refresh were also checked in Chromium. Online/offline checks with
popup disabled and no-repeat enabled verified previous history stays visible while
the new result, counter and used-entry marker wait until completion. Four viewport
accessibility checks passed; mobile screenshot inspected. No backend/schema changes.

Center-spin/idle release: TypeScript, ESLint, 10 unit tests and production build passed.
All 30 E2E passed (3.2min). After making the center-image hit area transparent, all 4
image/palette/copy/offline checks passed again. The final build precaches 24 assets.
Browser inspection verified idle/pause/resume, live reduced-motion changes, a continuous
start from the current angle, a real 10-second transition, one draw request and an
actual rendered pointer matching the winner on landing. Enter and Space both work.
An XS center image stays visible even on hover, with its button label below it.
Responsive/accessibility checks passed at 360/390/768/1440px; manual layout measurements
also passed at 1024/1366/1920px. Desktop/mobile screenshots visually inspected, no
horizontal overflow. No backend, data schema or saved-customization changes.

English/names release (2026-10-25): TypeScript, ESLint, 10 unit tests, 41 pytest tests
(19.17s), production build and all 30 E2E tests passed (2.7min). PWA precaches 24 assets.
Windows launcher rebuilt, migrated SQLite and restarted only this project's servers.
E2E covers English navigation/Customize, draws/pointer agreement, sharing, refresh,
Unicode editing, offline resync, conflict handling and real service-worker updates.
Existing legacy-v1 E2E verifies preserved entries and a single names starter after refresh.
A separate browser check verified v2 upgrade preserving entries/custom settings, one-time
starter creation and recovery after closing an old tab that blocked the upgrade.
English screenshots captured at 360/390/768/1440px, with no horizontal overflow;
390/1440px visually inspected. Automated accessibility/keyboard checks passed at all four
sizes, including Customize; reduced-motion behavior passed.

Backend coverage includes ownership, validation, old migration, process restart,
idempotency/shares, 10,000-entry eligibility and no-repeat exhaustion. Unit coverage
includes 6,600 projection and 20,100 geometry cases. Existing Alembic check passed before
this release; SQLite models/schema were unchanged by localization.
Launcher uses `/api/launch` to bypass stale cached HTML without deleting private data.
Physical Windows double-click/browser-profile behavior is not automated.

## Limits and next steps

Smaller original sound/image/theme collections than Wheel of Names; no Unsplash.
Duplicate collapse affects display only. Above 48 entries use numbered sectors and a
full-name legend. Animation/size proportions and native color picker are ours.
Human listening, real screen-reader use and physical iOS/Android installation/keyboard/
safe-area checks remain next. Large archives load in memory; history quotas/pagination
remain future work. Starlette/httpx and two Rollup/Zod annotation warnings are upstream.
Before public hosting: HTTPS/Secure cookie, exact origins, persistent SQLite, backups and
hosting rate limits. Accounts/live rooms/payments/AI/app stores stay outside this version.

## Run and continue

Double-click START_GYRNA.bat; STOP_GYRNA.bat stops its hidden servers. Logs are in ignored
artifacts/launcher-*.log. Latest-build URL: http://localhost:4173/api/launch.
Normal PWA entry: http://localhost:4173. Backend port 8017 (8000 is another project), dev
frontend 5173. No Windows service, remote push or public deployment was installed.
Keep schemas aligned, add migrations for structural changes and update docs with actual
results. AGENTS.md and README contain stable conventions and exact commands.
