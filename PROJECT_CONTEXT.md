# Wheelero context

Updated: 2026-10-27.

## Latest request and release scope

The user explicitly requested reverting the entire large commit 4f791de (wheel sizing,
Classroom, usability and bundled localization changes). The automatic-update follow-up
9e4744b had already been reverted by e84b89a. Restore b35e19f frontend behavior; do not
retain the Classroom UI, new navigation/paste dialog, responsive sizing or expanded copy
translations from 4f791de. Do not reintroduce these without a new request.

Use a new revert commit/push, not a force push or history rewrite. Publication on main is
authorized and triggers existing GitHub Pages CI. No purchases, DNS or hosting changes.
The only necessary code difference from b35e19f is safe IndexedDB rollback migration and
the existing migration test opening the current DB version. No user database is deleted.

## Runtime

React/TypeScript, Bun/Vite static PWA; no active backend/API/accounts/cloud synchronization.
Historical Python/FastAPI/SQLite files remain untouched for recovery. Web Crypto rejection
sampling chooses results; presentation always lands on the returned entry ID. Existing
1-10,000 entries, duplicates, editing/bulk paste, customization/images/audio, no-repeat,
history, restore entries, JSON/TXT exports, 12 templates and public tools remain.

The previous large-wheel layout and icon Customize are restored. Fourteen menu languages
remain, with their older translation coverage: public explanatory text is not fully
translated in this restored version. Manual Save & update is restored. PWA updates flush
writes and never interrupt a spin. Editor drafts/preferences remain in localStorage.

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
App.tsx/components/Wheel.tsx/styles.css: restored interface. locale.ts/locales: older menu
translations. components/PwaControls.tsx: manual update. site.ts/scripts/pages.tsx: static
SEO/tool pages. frontend/e2e/public-site.spec.ts: existing migration regression.

From frontend/: bun install --frozen-lockfile; bun run dev.
Checks: bun run typecheck; bun run lint; bun run test; bun run build; bun run e2e --workers=2.
Do not rebuild during the exclusive service-worker update test.
START_GYRNA.bat rebuilds/opens http://localhost:4173/launch.html; STOP_GYRNA.bat stops owned
listeners. The old public Cloudflare tunnel is stopped. No Python process is needed.

## Verification and next steps

Rollback checks passed: typecheck/lint/production build, 16 unit tests, all 36 Chromium E2E
tests (2 workers, 3.9 minutes), including the real manual-PWA-update regression. Separate
v10/v11 fixtures verified v12 migration, exact saved IDs/settings/history, duplicate names,
preserved older recovery records, draw/refresh and recovery-file download after a simulated
storage failure. Original attendance metadata survives in that recovery file. Ignored report:
artifacts/usability-rollback-storage.json. No new repository test cases were introduced.

Live site: https://wheelero.com; repository: github.com/Nikolasgouz/wheelero.
Before this request, e84b89a deployed successfully in run 40478773239. Check the workflow
for the new full rollback commit before reporting it live. CI uses four two-worker browser
shards, then one exclusive PWA-update job; failures block deployment. SSH keys are ignored.

Physical iOS/Android installs and human screen-reader checks remain unverified. Storage
quotas vary and clearing site data loses local wheels; JSON backups are necessary.
Native stores, accounts, live rooms, payments and AI suggestions remain separate future work.
