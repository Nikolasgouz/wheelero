# Wheelero context

Updated: 2026-10-27.

## Latest request and release scope

Current request: show the complete wheel and Entries in the first desktop viewport at
100% zoom, center the wheel on the screen (not the space left of the sidebar), and retain
the largest fitting diameter. This supersedes the prior rollback's sizing only. No
Classroom, navigation/paste features or translation changes are being reintroduced.
App.tsx adds wheel-viewport/wheel-area wrappers; styles.css uses a height-budgeted flex
layout, symmetric outer grid columns and CSS container units for diameter. Entries stays
at the right edge and scrolls internally. Narrow/short screens allow page scrolling.

Prior release 12ea1b5 reverted the large usability/Classroom/localization commit 4f791de.
Classroom, the new navigation/paste dialog and expanded translations remain absent. The
current sizing is a focused follow-up, not restoration of that whole commit. The rollback
included safe IndexedDB migration; no user database was deleted. PWA freshness was then
fixed independently. Preserve that fix and the storage migration.

Publication on main is authorized and triggers existing GitHub Pages CI. Use normal
commits/pushes, never a force push. No purchases, DNS or hosting changes.

## Runtime

React/TypeScript, Bun/Vite static PWA; no active backend/API/accounts/cloud synchronization.
Historical Python/FastAPI/SQLite files remain untouched for recovery. Web Crypto rejection
sampling chooses results; presentation always lands on the returned entry ID. Existing
1-10,000 entries, duplicates, editing/bulk paste, customization/images/audio, no-repeat,
history, restore entries, JSON/TXT exports, 12 templates and public tools remain.

The viewport-centered wheel layout and icon Customize are retained. Fourteen menu languages
remain, with their older translation coverage: public explanatory text is not fully
translated in this restored version. Normal public URLs now fetch HTML with HTTP
revalidation, a four-second timeout and precached offline fallbacks. New
workers activate automatically without reloading open pages. Save & update remains an
optional action for an already-open editor, flushes writes and is disabled during spins.
Controller changes expose this action after activation too. Editor drafts/preferences
remain in localStorage; no storage schema change accompanies the navigation fix.
Navigation uses NetworkOnly plus PrecacheFallbackPlugin, avoiding old runtime HTML that
could reference deleted bundles after worker activation. requestWillFetch sets no-cache
on the Request itself because Workbox ignores fetchOptions for navigation requests.

## Storage rollback

IndexedDB keeps the name gyrna and advances to v12. Opening v10 after v11 would throw a
VersionError, so never downgrade or clear it. v1-v9 follow historical migrations. v10/v11
retain a full state snapshot under legacy-backup/before-usability-rollback, then project
wheels to the original shape. IDs, labels, images, active flags, settings, history, tool
mappings and removal/restoration jobs survive. Former classes become normal saved wheels.
Their attendance metadata remains in the recovery snapshot. Older previous/before-classroom
backups are untouched. Recovery export prefers before-usability-rollback when present.

Writes use Web Locks and publish only after IndexedDB succeeds; BroadcastChannel handles
tabs. JSON version 1 remains the export/import format. Share fragments contain a validated
snapshot without uploads/history/other wheels; they are unencrypted and cannot be revoked.
Class links from the reverted release parse as normal wheels through the old schema.
Close old tabs if a DB upgrade is blocked; never clear browser data to update.

## Important files and commands

frontend/src/state/storage.ts: migration/recovery. store.ts: local writes/draw/removal.
types.ts: backup validation. lib/random.ts/geometry.ts: selection and pointer agreement.
App.tsx/components/Wheel.tsx/styles.css: centered responsive interface. locale.ts/locales: older menu
translations. components/PwaControls.tsx: manual update. site.ts/scripts/pages.tsx: static
SEO/tool pages. frontend/e2e/public-site.spec.ts: existing migration regression.

From frontend/: bun install --frozen-lockfile; bun run dev.
Checks: bun run typecheck; bun run lint; bun run test; bun run build; bun run e2e --workers=2.
Do not rebuild during the exclusive service-worker update test.
START_GYRNA.bat rebuilds/opens http://localhost:4173/launch.html; STOP_GYRNA.bat stops owned
listeners. The old public Cloudflare tunnel is stopped. No Python process is needed.

## Verification and next steps

Current layout: production build/typecheck/lint and 16 unit tests passed. Isolated Chromium
measurements/screenshots at 1366x768, 1440x900, 1920x1080, 1024x768, 1280x600, 768x1024,
390x844 and 683x384 in light/dark show no horizontal overflow. The three principal desktop
sizes have centered diameters of approximately 547/679/859 CSS px and wheel/sidebar bottom
16px above the viewport bottom. Narrow screens scroll normally (683x384 approximates the
CSS viewport at 200% desktop zoom, not a physical zoom test). Artifacts are ignored under
artifacts/centered-viewport-*.png and centered-viewport-report.json. An isolated 200-entry
fixture with a long title and expanded legend passed internal-scroll/centering/fit checks.
The old responsive test's >800px assertion conflicted with fitting and true centering;
it now checks exact centering, viewport containment and maximum available diameter.
No new repository test cases were added. All 36 E2E checks passed (2 workers, 2.7 minutes),
including keyboard/axe checks, mobile/customization and real service-worker updates.
Layout code 20c1fa2 deployed successfully in GitHub run 40488853315. Live Chromium checks
on the normal https://wheelero.com URL passed at all eight viewport sizes in light/dark,
matching local measurements. Desktop wheel and Entries fit above the fold and the wheel
center differs from the viewport center by less than 1 CSS px. Ignored live screenshots
and report: artifacts/live-centered-viewport-*.png and live-centered-viewport-report.json.
Physical-device/browser-zoom testing remains unverified. This handoff commit is docs-only.

Rollback checks passed: typecheck/lint/production build, 16 unit tests, all 36 Chromium E2E
tests (2 workers, 3.9 minutes), including the real manual-PWA-update regression. Separate
v10/v11 fixtures verified v12 migration, exact saved IDs/settings/history, duplicate names,
preserved older recovery records, draw/refresh and recovery-file download after a simulated
storage failure. Original attendance metadata survives in that recovery file. Ignored report:
artifacts/usability-rollback-storage.json. No new repository test cases were introduced.

Live site: https://wheelero.com; repository: github.com/Nikolasgouz/wheelero.
Full rollback 12ea1b5 deployed successfully in run 40481024919. Live v10/v11 fixtures
verified preservation of names/settings/history and recovery export. The initial live
waiting-worker check timed out; the follow-up navigation fix addresses cache-first HTML
and workers waiting indefinitely for activation. Its build/typecheck/lint, 16 unit tests
and all 36 E2E tests passed again after the final navigation fix (2 workers, 2.9 minutes).
The existing lifecycle test verifies fresh normal-URL HTML, automatic activation during
a spin without a forced reload, and saved wheel/editor draft preservation. No new test
cases were added. The first live transition exposed stale HTTP cache because Workbox
ignores fetchOptions on navigation; the final requestWillFetch plugin fixes that.
Final code cea2c88 deployed successfully in run 40485652554. An actual production browser
with the preceding worker then verified automatic activation, fresh normal-URL navigation,
no forced reload, unchanged saved wheel/unsubmitted draft and offline reload. All passed;
ignored report: artifacts/live-navigation-update.json. No cache-reset link or deletion of
site data was used. This final handoff update changes documentation only.
CI uses four two-worker browser shards, then one exclusive PWA-update job; failures block
deployment. SSH keys are ignored. Retain this policy and the restored non-Classroom UI.

Physical iOS/Android installs and human screen-reader checks remain unverified. Storage
quotas vary and clearing site data loses local wheels; JSON backups are necessary.
Native stores, accounts, live rooms, payments and AI suggestions remain separate future work.
