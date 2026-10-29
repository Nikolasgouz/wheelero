# Working in Wheelero

Latest delivery instruction (2026-10-29): after committing the accumulated local changes,
the user authorized pushing and deploying them to wheelero.com through the existing
main-branch GitHub Pages workflow. This supersedes earlier no-commit/no-deploy notes for
this delivery. Keep credentials and local data ignored. Verify the workflow and live site.

The user chose local browser storage and no backend. Keep React/TypeScript, Bun/Vite and
the existing design. Wheels/images/results use IndexedDB v14; small preferences/drafts
use localStorage. No wheel network APIs/cloud sync. Explicit contact submissions and
consent-gated analytics counts are exceptions documented below. Historical backend/SQLite files stay intact
for recovery and are excluded from deployment.

Keep code simple, readable and focused. No broad exception handlers, silent failures,
unnecessary normalization/type guards, compatibility shims or speculative parameters.
Validate external inputs at boundaries; keep internal invariants explicit. Inline trivial
single-use helpers. Python lines <=100 chars if modifying historical tooling.
Do not add tests unless requested; storage/draw/import tests were explicitly requested
for this project. Update obsolete API expectations to actual local behavior.

Fourteen-language UI and public copy (locale.ts/locales/*.json). Use an explicitly saved
language first, then the first supported navigator.languages preference (regional tags map
to their base language), then English. Prerendering remains English. Do not persist automatic
detection as a manual preference or use IP geolocation. Preserve Wheelero
branding, user content and local asset licenses. Editorial content is in src/site.ts.
Keep one H1 and meaningful functionality per public page. The user authorized optional GA4
G-JB9ZRMKRKR on 2026-10-29 with basic consent. No Google requests before acceptance.
Use the analytics iframe and strict message schema, never load gtag in the editor DOM.
Only allowed page paths/static titles and numeric feature counts may cross that boundary.
No names, results, emails, links, query strings or fragments. No advertising features.
Consent can be changed at /cookies. Revocation removes the frame and GA cookies immediately,
including across tabs, without deleting wheels. See docs/analytics.md for tests and debug.
Latest consent UX: mount App visibly behind the cookie modal, but keep its wrapper inert and
aria-hidden until Accept cookies or Reject cookies. Both choices give full access. Defer the
shared-wheel dialog until a choice, so it cannot cover the gate. The cookie modal cannot be
dismissed; privacy remains readable. Preserve existing choices. Keep its explanation short
in all 14 locales, with full details on the privacy and cookie settings pages.

## Commands

From frontend/: bun install --frozen-lockfile; bun run dev.
Checks: bun run typecheck; bun run lint; bun run test; bun run build; bun run e2e.
Production preview: bun run preview --port 4173 --strictPort.
START_GYRNA.bat builds/opens localhost:4173/launch.html without Python. STOP_GYRNA.bat
stops verified owned processes. Legacy 8017 listeners are stopped, never restarted.
Do not kill unrelated processes or clear browser data to update.

## Storage/PWA invariants

Keep IndexedDB name gyrna. Schema changes need versioned migrations and recovery data.
Commit writes before publishing success; quota errors must retain previous data. Use
Web Locks/BroadcastChannel for multiple tabs. Never invent old pending server results.
Web Crypto chooses winners without bias. Display projection never changes eligibility;
land on the winning entry ID and reveal results only after animation. Lock editing,
customization/sound/fullscreen during draws. Respect reduced motion. Wheel mute controls
spin/result sounds; explicit Customize Play previews bypass it without changing that preference.
Customization drafts save only on OK; timed removals use IDs. New PWA workers activate
automatically without reloading open pages. Reloading an open editor requires this tab's
action and completed writes; never interrupt a spin. Normal navigation fetches HTML with
HTTP revalidation and precached offline fallbacks, not a permanently cached homepage.

Share links embed unencrypted snapshots in fragments, excluding history/other wheels.
Validate/cap payloads and explain no revocation. Oversized links fail with a clear error. Preserve backup
identifiers/versions. Keep source='server' on historical results; new draws are local.

## Delivery

scripts/pages.tsx emits HTML/robots/sitemap/404 before Workbox. PUBLIC_URL/PUBLIC_INDEXING
are build-time settings; previews are noindex. Do not assume domain ownership. Docker/
Caddy serves static files only. Do not build during E2E's worker-update regression.
Keep lockfiles and .env.example; never commit secrets, databases, dependencies, builds
or screenshots. The user authorized setup/push to Nikolasgouz/wheelero and preparation
for wheelero.com on 2026-10-26. Keep SSH keys ignored; never commit credentials or change
repository visibility without authorization. Hosting/DNS access must be verified.
Existing preview management is documented in docs/deployment.md.
Update README/PROJECT_CONTEXT/docs before handoff. Remove unnecessary defensive code,
trivial helpers and unused parameters before finishing.

Latest user request (2026-10-27): revert the whole usability/classroom/localization commit
4f791de to b35e19f behavior, including the earlier wheel layout. Do not keep Classroom or
expanded public-copy translations from that commit. Preserve browser data via IndexedDB
v12 migration: snapshot v10/v11 before restoring the original wheel shape. Do not reopen
v10 on an upgraded v11 database. Do not reset/delete existing user data. Commit/push this
rollback using the existing main-branch deployment workflow; no force push or DNS changes.
Follow-up: fix stale normal-URL navigation while retaining that rollback and all local data.
Latest follow-up: fit the wheel and Entries in the first desktop viewport at 100% zoom.
Keep the wheel centered on the viewport, Entries on the right and the largest fitting
diameter. This supersedes only the rollback's wheel sizing, not its removal of Classroom.
Use the CSS wheel-viewport/wheel-area layout; preserve scrolling on narrow/short screens.
Latest instruction: keep subsequent edits local. Do not commit, push or deploy unless
the user explicitly asks again. Remove the homepage intro/slogan and wheel ornaments.
The current Entries UI is a single textarea modeled on the reference's basic editor.
Keep duplicate identities/images/no-repeat flags on edits; see docs/entries.md. Do not
restore the old per-name input/pencil/delete list in the main sidebar without a request.

All new or changed UI copy must be updated across every supported language. Verify rendered
Unicode text, especially menu labels; never ship question-mark replacements from shell encoding.
Use Unicode-safe patches or escaped text when scripting translation updates on Windows.

New/template wheels are drafts (saved=false). Save updates a saved wheel with the exact same name; a new name creates a copy. The initial
library is the explicit exception: one default main wheel and two empty saved wheels.
Never show unsaved draft cards in Open. Preserve pre-v13 records as saved on migration;
backup/share payloads keep version 1 and omit this local-only flag. No gear beside the
wheel: Customise is in the top menu. Keep named saves atomic and error feedback visible. Same-name updates preserve the saved ID; new names get fresh IDs.
Open saved records as working drafts before editing. Do not delete pre-existing duplicate names.

Latest layout request: the homepage marketing heading stays visually hidden. The wheel
title is directly editable in the free left desktop column, with the existing title label
translated in all languages. On narrow screens it stays above the wheel. Respect show_title,
keep the presentation heading, and lock edits during spins. Removing the desktop title row
and reducing outer gaps gives the centered wheel and Entries more room. No commit is authorized.

IndexedDB v14 seeds the starter library once. Preserve all existing records; on upgrade
only fill a library smaller than three, promoting the active wheel if there are no saved
wheels. Never recreate deleted starters on refresh. New wheel still uses the default names.

More options no longer includes Add multiple entries. Bulk paste belongs in the main
Entries textarea. Keep the single-entry draft field and its refresh/PWA persistence.

No standard wheel JSON import/export controls. Keep TXT result export and legacy-data
recovery intact. Customize has no global-mute/fairness notices; Templates has one heading
and no inspiration subtitle. Explicit audio previews still respect volume and No sound.

Latest copy refresh supersedes the earlier English-only editorial coverage. Translate
HomeInfo, SiteContent, tool controls and template display names using locale.ts catalogs.
Keep saved wheel titles/entries and editable winner messages as user data. English
pre-rendered HTML/SEO stays the default; selected-language headings/title/description
update in the client. Do not restore removed Save notices or the old JSON import/export UI.

The homepage Questions & answers section stays removed. Help/FAQ now has its own
/how-to-use page, linked in the footer. Share is a top-menu action (not duplicated in the detailed editor); lock
it during spins. No AI/sparkle ornaments; keep Wheelero branding and functional icons.

Tools is removed. Keep six information links (Help & FAQ,
About Wheelero, Contact & support, Privacy Policy, Terms of Use, Cookie settings)
and Install app visible. The recipient must never be included in browser assets, HTML,
URLs or mailto links. ContactForm now uses a public Formspree form ID, with the recipient
configured privately at the provider. The user chose the existing connected Gmail inbox
instead of the previous support inbox. Form ID xljjlgrl is configured in local .env and
real delivery to the selected inbox was verified. Keep only the public ID in client config.
Future authorized deployment needs repository variable CONTACT_FORM_ID. No deploy yet.
Do not invent operator identity. Cookie settings describes local storage with no fake toggles.
Preserve
native keyboard navigation and conditional Save & update behavior. Editorial text avoids
semicolons in every language, including Greek question punctuation (use ?). Preserve
user-entered text, historical lookup keys and code/MIME delimiters.

Footer links use Help & information and Privacy & terms groups from site.ts/footerGroups.
Pass the current SitePath to SiteFooter for aria-current in both client and prerender.
Information pages have a return-to-wheel link, readable content panels and native FAQ
details/summary controls. Contact sends only the explicit reply email/message and honeypot.
This is the user-authorized exception to no network submissions, not wheel cloud sync.
Only Formspree's successful HTTP response clears the form. Preserve input on
errors/timeouts. Do not retry automatically. Keep drafts in memory only and never log them.
Do not reintroduce the old server-migration paragraph in public privacy copy.
