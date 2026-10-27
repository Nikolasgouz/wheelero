# Wheelero context

Updated: 2026-10-27.

## Current authorization

Latest request, 2026-10-27: undo the last automatic-PWA-update change (9e4744b) and restore
the previous website release (4f791de). This rollback uses a new revert commit, not a history
rewrite. Frontend source/config/tests exactly match 4f791de. Localization, Classroom and
usability remain; manual Save & update is restored. No database/data reset or downgrade.
Do not reintroduce automatic reload without a new user request. Verify the rollback workflow
before claiming the public website has reverted.
Rollback checks: frontend matches 4f791de exactly; fresh lint, 20 unit tests and production
build/typecheck passed. Existing auto-update clients may need all Wheelero tabs closed and
reopened to let the restored prompt-mode worker activate. Do not clear browser data.

The latest request adds focused usability: viewport-fitting wheel, visible Customize/paste,
compact tool navigation, shorter translated intro, and a reusable Classroom workflow.
On 2026-10-27 the user explicitly approved committing and pushing the reviewed usability
and prior localization/center-label changes to GitHub. This supersedes the preview-only
restriction. Pushes to main invoke the existing CI/deployment workflow; its success must
be verified separately. The public Cloudflare preview remains stopped. Local preview runs at
http://localhost:4173/launch.html; START_GYRNA.bat rebuilds/opens it.

## Product and architecture

Existing React/TypeScript/Bun/Vite static PWA. No active backend, API calls, accounts or
server synchronization. Historical Python/FastAPI/SQLite files remain untouched for recovery.
IndexedDB v11 (gyrna) stores wheels/images/settings/results/removals/class attendance. Old
records survive in legacy-backup/previous and before-classroom. localStorage holds preferences
and editor drafts. Do not rename
storage keys or reset data. JSON is the backup/device/domain transfer mechanism.

Web Crypto rejection sampling selects winners; display projection/animation do not alter
probabilities. Transactions use Web Locks; BroadcastChannel updates tabs. Publish after
successful writes, preserve previous data on quota failure. PWA updates require explicit
consent, flush writes, and never interrupt a draw. navigator.storage.persist() may refuse.

Implemented: 1-10,000 entries, inline/bulk/Excel editing, 12 templates, themes/images/sounds,
no-repeat/restoration, history, TXT/JSON exports, fullscreen, offline installation, name,
yes/no, number and team tools, About/Privacy/FAQ/404 and static SEO. Share links contain
validated UTF-8 snapshots in /#wheel= with no uploads/history/other wheels; copies cannot
be revoked and are not encrypted. Above 16,000 encoded characters use JSON.

## Release changes

- All 14 languages now cover public copy, FAQ/About/Privacy/404, tools, templates,
  themes/gallery, storage/sharing/validation messages and runtime page metadata.
- Thirteen translated catalogs have 464 common keys; pl/ru/ro add plural forms. No remote
  translation service. Catalogs remain in the precache for offline switching.
- Existing user titles/names/results/custom messages are never rewritten on language
  changes. New templates/tools localize at creation. Exact default winner text localizes
  in the popup and Customize input without changing its stored value. Gallery labels
  refresh when the language changes. Application error state retains source keys.
- Removed decorative sparkle/asterisk marks from wheel, result and editor; brand retained.
  Center label uses container-relative type size, balanced wrapping and circular margins.
  Greek CTA is now "Turn the wheel" in Greek to avoid a broken long word on small screens.
- Malformed share links show a localized validation error.
- Workspace measures actual header/tool chrome and limits desktop diameter by height AND
  width. Mobile stacks naturally; short windows scroll. Sidebar lists stay bounded.
- Visible Customize opens unchanged settings; Paste a list previews counts, trims blanks,
  keeps duplicates, and commits add/replace atomically. Cancel is inert. Replace clears
  attendance/round/restoration jobs but retains history; Add preserves existing IDs/progress.
- Tool navigation uses actual routes/aria-current; Classroom is an optional local workflow.
  A class is a wheel with classroom.absent_ids, independent of no-repeat active flags.
  Stable IDs distinguish duplicate students. New rounds restore active flags and cancel
  pending removals without resetting attendance. All-absent/exhausted messages are distinct.
- v11 migration adds classroom:null to old wheels, preserving a v10 recovery record. Version-1
  JSON/old links remain valid. JSON/local copies preserve attendance; class share links expose
  all names but omit attendance/progress (explicit disclosure). No RNG/network changes.

## Important files

frontend/src/locale.ts, locales/*.json: selection/catalogs. i18n.ts and customization.i18n.ts:
interface keys. site.ts, HomeInfo/SiteContent/Tools components: public content and tools.
App.tsx: translated status/templates/metadata and spin coordination. Wheel.tsx/styles.css:
wheel center and appearance. Customize/ImagePicker: temporary settings and localized gallery.
state/store.ts: persistence and localized creation; state/storage.ts: migration/recovery.
lib/sharing.ts: bounded snapshot validation. scripts/pages.tsx/vite.config.ts: static SEO/PWA.
docs/localization.md documents content boundaries and verification.
Workspace/ToolNavigation/PasteList/Classroom components implement the new flows; state/wheel.ts
owns eligibility/new-round logic, store.ts commits mutations, types.ts validates metadata.
See docs/usability.md and data-model.md. Tests: lib/classroom.test.ts, e2e/usability.spec.ts.

## Earlier localization verification, 2026-10-27

Before the usability work, all 14 languages passed public-route, Customize/gallery/template,
library, refresh, draw and offline checks. User content/drafts remained unchanged. Center
idle/spinning labels fit at 360/390/768/1440px (112 measurements). Greek/German/Japanese
dialogs passed axe; native-speaker and physical-device checks remain outstanding.

## Current usability verification

- Typecheck, ESLint, production build and 20/20 unit tests passed. Full Chromium E2E:
  40/40 passed, two local workers, 2.9 minutes, including the exclusive real PWA update.
- Final attendance-reference filtering/legacy-share assertions were followed by fresh
  lint/build/20 unit tests and all four usability E2E tests passing (17.2 seconds).
- Paste preview/cancel/replace/add/refresh, duplicate IDs, absence, no-repeat/exhaustion,
  offline round restart, v10-to-v11 recovery and older storage migrations passed.
- Desktop 1366x768, 1440x900, 1920x1080 and mobile 390x844 passed no-overflow, keyboard,
  modal Escape/focus and light/dark axe checks; screenshots visually inspected. Effective
  small/zoomed viewport 683x384 retains scrolling/access to spin (not physical browser zoom).
- All 14 languages passed desktop fit and mobile paste/create-class/attendance; no browser
  errors or horizontal overflow. English/Greek new dialogs passed full axe scans. Source-key
  and placeholder audit passed for all catalogs. Paste Escape restores focus to its opener.
- Artifacts: usability-{1366,1440,1920,390}-{light,dark}.png, usability-classroom.png,
  usability-attendance-el-mobile.png and usability-locales.json, all ignored in artifacts/.
- Workbox precaches 59 files (~2.74 MiB). Nonfatal build warnings: upstream Zod annotations
  and translated-catalog chunk slightly above 500 kB. These are local verification results.

## Hosting and next steps

Previously deployed site: https://wheelero.com on GitHub Pages. Repo:
https://github.com/Nikolasgouz/wheelero. Last verified deployment run 40383010819, code 75228a6;
b35e19f documented that deployment. This release is approved for push; check the workflow
for the new commit before claiming the live site has updated.
GitHub Actions checks every push to main then deploys. CI uses four shards x two workers
(eight total), followed by one exclusive PWA update job. Keep that topology and the pinned
Playwright image aligned with bun.lock. No apt/browser downloads inside CI containers.
Bun is bootstrapped by npm inside the container; dependencies/scripts still use Bun.

Domain DNS: Papaki dns1.papaki.gr/dns2.papaki.gr; four GitHub Pages A records and www CNAME
nikolasgouz.github.io. HTTPS/www redirects were verified previously. No DNS change this
session. SSH keys remain ignored; SSH alone cannot administer Pages/DNS. No API token.

Next: verify the GitHub workflow for this release. Native-speaker
review, physical iOS/Android installation and human screen-reader checks remain. Operator
identity/privacy contact are still needed for permanent publication. Browser storage varies
and can be erased; maintain JSON backups. Store publishing (Android TWA/Bubblewrap or iOS
Capacitor), accounts, live rooms, payments and AI suggestions remain separate future work.
