# Wheelero context

Updated: 2026-10-29.

## Latest: required cookie choice

CookieGate wraps App in main.tsx. With no stored choice, show a native non-dismissible
modal and do not mount the interactive application. Both Accept cookies and Reject cookies
unlock all features. Existing choices stay valid. /privacy renders a restricted readable
information page before choice, with no wheel controls. Language selection works inside
the modal; Dialog now uses unique useId titles and LanguageMenu includes the visible language
in its accessible name. Theme is initialized before the gate mounts, preserving saved/system
dark mode before choosing. AnalyticsConsent explains cookies, purpose/lifetime and privacy in
all 14 languages. The old floating banner is removed. Consent/tracking semantics unchanged.
Lint/build/typecheck and 10 targeted E2E passed (analytics, required choice, shared links,
modal dismissal). Manual Chromium verified all 14 labels/mobile overflow, nested language
dialog and privacy access before consent. Screenshots: artifacts/cookie-gate-*.png (ignored).
Deployment of this follow-up is pending; the previous GA4 release below is already live.

## GA4 published and verified

Code 6bb5296 is live through successful run 40893717840. Typecheck/lint/build, 16 unit
tests, all 41 browser tests and the isolated real PWA-update case passed in GitHub Actions.
Direct live Chromium observed zero Google requests/cookies before consent, then HTTP204
collection responses for page_view and all four custom events with safe locations/counts.
The homepage emitted one page_view. Revoking removed GA cookies; a later draw/navigation
sent nothing. Debug events contain debug_mode. Contact-field sentinel values were absent
from actual-tag requests (that extra inspection intercepted collection, did not submit mail).
Google also produced a standard scroll event from its frame on some pages, with safe metadata.
No GA admin/Realtime/DebugView access is available. HTTP204 verifies transport acknowledgement,
not report ingestion or property configuration. Live evidence is ignored under artifacts/
live-analytics-verification.json. All 14 consent labels and mobile overflow were checked,
and the consent panel passed light/dark accessibility scans.

User authorized GA4 G-JB9ZRMKRKR and publication through the existing workflow. No prior
tag or consent controls existed. Added basic consent banner and persistent /cookies controls
in 14 languages. Consent gates the official tag inside analytics.html, a separate empty
frame so automatic measurement cannot observe the editor/contact DOM. Strict Zod message
schema accepts only known paths, static titles and numeric feature counts. No query, fragment,
referrer, wheel names/content/results/contact info is passed. Parent never loads Google code.
Production build flag + exact production origin + acceptance required. Revocation disables
and removes the frame/cookies across tabs without reloading or deleting wheels.
Events: completed spin, successful Save, link creation, valid team generation. Manual
page_view only; config automatic views are disabled. Temporary debug via sessionStorage,
never URL parameters or consent bypass. See docs/analytics.md for files/behavior/commands.
All seven focused E2E cases and four existing responsive/accessibility cases passed (11/11).
Lint, build/typecheck and 16 unit tests passed. The existing full suite also runs before Pages
publishes. Existing tests select a rejected localhost preference; dedicated analytics tests
start with no consent and intercept the production origin/Google queue explicitly.
Real Google tag requests were inspected with collection intercepted: one clean page_view
and spin event, no synthetic private markers. This is not proof of GA report ingestion.
Deployment is complete; the report-side verification limitation remains as described above.

## Published and verified

Code 54a537f is live at https://wheelero.com via successful GitHub run 40863773592.
Build/typecheck/lint, 16 unit tests, all 34 browser tests across four shards/eight workers,
the isolated real PWA-update regression and Pages deployment passed. Earlier failed-run
notes below are superseded. No storage/draw logic was changed while correcting stale tests.

Direct live Chromium verification passed for the editable left title and refresh persistence,
centered full desktop wheel/Entries at 1366x768 and 1440x900, mobile 390x844 without horizontal
overflow, removal of Draft/decorative star, spinning and offline reload/spin. Contact is
enabled with xljjlgrl; no recipient email occurs in the shipped JavaScript. No additional
live contact message was sent (real inbox delivery was already verified locally).
Production bundle: /assets/index-Sclm-nsn.js. Screenshots: ignored artifacts/live-release-*.png.
Physical-device installation remains untested. Final verification documentation is committed
separately with [skip ci], since only Markdown changes after the verified deployment.

## Delivery authorization

First deployment attempt 40862741591 stopped at browser checks. Existing tests still
expected the removed Draft badge/heading, selected both hidden and visible title inputs,
and read the first saved snapshot instead of the active working wheel after Save. Updated
the existing checks to use visible textboxes, actual persisted saved data and active IDs.
No draw/storage behavior was changed to accommodate tests. Full verification is in progress.
The corrected local browser run passed 33/34 with eight workers; the 1007-name paste
hit its 15-second action budget on Windows (the entries were rendered). Allow 60 seconds
for that large paste only, retaining every count/projection assertion. Typecheck/lint pass.

The user subsequently authorized push and deployment to wheelero.com. Deployment is now
in progress via the existing main-branch Pages workflow. The workflow uses the verified
public Formspree ID xljjlgrl as its default, overridable by CONTACT_FORM_ID. No private
recipient address or credentials are included. Verify the workflow and live site before
claiming this release is published. This supersedes the previous local-only instruction.

The user now requested a Git commit of the accumulated local changes. Earlier no-commit
notes below describe the previous review phase. This delivery is a local commit only,
with no push or production deployment. Root .env, credentials, screenshots and builds
remain ignored. Formspree's deployment variable still needs configuration before a future
authorized publication. Latest build/typecheck/lint and four responsive E2E cases passed,
with a separate browser check of the final Draft-label removal.
Before committing, bun run test passed all 16 tests in 3 files. The full E2E suite was
not rerun for the commit-only request.

## Latest: editable title on the left

Latest follow-up: removed the Draft indicator from the More options save bar in App.tsx
for every language. Save and saved-wheel status remain. No storage behavior changed.
Build/typecheck and lint passed after this follow-up. Chromium confirmed a new wheel's
More options shows Save enabled with no Draft label.

App.tsx renders a native title input in the free desktop left column, using existing
translated t.title/t.placeholder strings. Uses the existing edit/store flow, 120-character
limit, empty-on-blur fallback and draw lock. Enter blurs. show_title still applies,
presentation keeps its heading, and mobile places the input above the wheel.
styles.css removes the desktop title row and reduces padding/gaps: centered wheel stage
688px at 1366x768, 779px at 1440x900, 960px at 1920x1080. Entries grows in height too.
Direct Chromium checks confirmed desktop fit/centering, no horizontal overflow at those
sizes and 390x844, and title persistence after refresh. Screenshots in ignored artifacts/
title-left-*.png. Build/typecheck and lint passed. No new test cases or data migrations.
Four existing responsive/keyboard/accessibility E2E cases passed (360/390/768/1440px,
including light/dark). Follow-up removes the decorative star from the More options
editor heading and its unused .tiny-wheel CSS, across all languages.
Final build/typecheck/lint passed after removal. Chromium confirmed no decorative star
in More options, one detailed-editor title input, and correct title labels in all 14 locales.
No commit, push or deployment. Preview: http://localhost:4173/.

## Contact form: local sending verified

The user supplied Formspree integration page /forms/xljjlgrl/integration. Actual submission
endpoint is https://formspree.io/f/xljjlgrl. Root .env (git-ignored) now sets
VITE_CONTACT_FORM_ID=xljjlgrl. The recipient is the existing connected Gmail inbox chosen
by the user, configured privately in Formspree. Neither the recipient address nor mailto
links are included in source/build output. Tools remains removed. No backend/cloud wheel
sync was added. Explicit contact submissions are the only third-party data submission.

ContactForm posts email/message/_gotcha with a 20-second timeout, single-flight guard,
input validation and localized feedback. HTTP errors, rate limits and uncertain network
responses retain input. Formspree's documented HTTP success clears the form. All 14
languages use Formspree wording, and Privacy discloses the provider/data sent. Inputs are
kept in memory, not persisted or queued offline. SiteDetails receives the public form ID
in both App and prerendering. Vite envDir is root.

Real test through localhost:4173/contact returned HTTP200 {ok:true}. Marker
WHEELERO-DELIVERY-1793269933296 was received in INBOX (Gmail message 1a18737b0cf2a439), subject
New submission from WHEELERO. Reply-To matched wheelero-test@example.com. No customer or
wheel data was used. This is verified delivery, not only mocked provider behavior.
Lint/build/typecheck and two existing E2E cases passed (390px accessibility and 11-route
metadata/404). All generated HTML/JS scanned clean of both recipient addresses/mailto.
Full suite and worker-update regression were not rerun. Earlier mocked failure checks
are described in docs/contact-form.md, not counted as real delivery tests.

No commit, push or deployment authorized/performed. Public wheelero.com has not been
updated. Future authorized deployment must set GitHub repository variable CONTACT_FORM_ID
(xljjlgrl), used by the local workflow edit. No remote variable was set. Current free
Formspree plan allows 50 submissions/month. No paid plan selected. Do not expose SMTP or
account passwords in client variables.

FormSubmit outage and old CAPTCHA blockers are superseded. Ignore the earlier generated
registration credential under artifacts/formspree-account.json (it was rejected). Private
browser/session/verification artifacts are git-ignored and must never be published.
No password resets were performed. See docs/contact-form.md for current handoff.

## Latest footer and information-page polish

site.ts/footerGroups groups the six footer links under Help & information and Privacy &
terms. Existing logo and Tools menu remain, with aria-current for the active route via
SiteFooter's required path prop (client and prerender). Labels are now Help & FAQ and
Contact & support. Every changed string is translated in all 14 languages.

Information pages have a return link, narrower reading width, bordered panels and clearer
headings. FAQ uses native expandable answers. Contact/Privacy show the email in a tinted
panel, wrapping at @ on narrow screens while keeping the address unchanged. Informational
pages no longer inherit the wheel viewport's minimum main height. Wheel layout unchanged.
Rewrote intros/About/report guidance and removed obsolete server-migration prose from
Privacy. No storage, draw algorithm, email-sending service or new legal assurances.

Validation: lint, build/typecheck and two existing E2E
checks (390px keyboard/accessibility and 11-route prerendered metadata/404) passed.
Direct Chromium checks passed in all 14 languages for copy coverage, six links, active
route, Tools Enter/Escape, FAQ Enter/Space and no mobile overflow. English/Greek desktop,
mobile and dark screenshots are in artifacts/professional-*.png. No new test cases.
After final spacing adjustments, lint/build and both E2E checks passed again. Chromium
confirmed contact padding, unchanged email text/link and no overflow at 360/390/1440px,
with explicit dark mode. Final screenshots refreshed and Greek mobile inspected.
Full suite, native mail clients and worker-update regression were not rerun.
Changes remain local, with no commit, push or deployment.

## Latest contact email

The user supplied customerservicewheelero@gmail.com, superseding the earlier request
to omit contact details. site.ts exports contactEmail. SiteDetails shows an email link
on Contact and Privacy, including in prerendered HTML. The mailto link opens the user's
email app, with no automatic sending or in-site form. Removed unavailable-contact copy
and translated the new text in all 14 languages. Long addresses wrap on narrow screens.
Operator identity remains unspecified. Changes remain local, with no commit or deployment.
Validation: lint and production build/typecheck passed. Direct Chromium verified both
email links and contact translations in all 14 languages, keyboard focus and no overflow
at 360px. Generated Contact/Privacy HTML contains the correct mailto link and no obsolete
unavailable-contact message. No email was sent. Native email clients and the full E2E
suite were not tested for this copy/link change.

## Latest six footer information links

Footer now links to /how-to-use (separate instructions/FAQ), /about, /contact, /privacy,
/terms and /cookies, alongside Tools and Install app. SiteDetails uses the information
map in site.ts. Four new routes join prerendering, sitemap and offline precaching through
the existing pages map. The homepage FAQ remains removed. All visible copy is translated
in 14 languages. No storage/draw changes.

Initially contact details were omitted, since superseded by the email update above.
There is still no in-site submission form. About describes the tool without invented
operator details. Cookie settings describes IndexedDB/localStorage/offline cache and
the absence of optional tracking settings. Terms are practical usage rules, not a claim
of complete legal compliance. See docs/public-pages.md for publication limitations.

Checks: lint, build/typecheck passed. Two existing E2E cases passed, with the metadata
case extended to all 11 routes plus 404. Direct Chromium checked all six footer links
and headings in 14 languages at 390px, no overflow, no cookies, no contact form or fake
cookie switches. All page text keys exist in every catalog. All six pages loaded offline
after first precaching. Inspected mobile and desktop screenshots, then explicitly
verified dark theme via data-theme (system preference alone is overridden by saved theme).
Artifacts: info-footer-{en,el}-mobile.png and privacy-{en,el}-desktop-dark.png.
Preview restarted to load new routes: http://localhost:4173/. No commit/push/deployment.
Full E2E, SW-update regression, native installs and native-speaker review were not rerun.

## Latest compact footer and punctuation

SiteFooter groups the five existing tool links in a native Tools disclosure (keyboard
Enter/Space, Escape closes and restores focus). About and Privacy remain visible.
PwaControls labels both native installation and fallback instructions Install app.
The existing update lifecycle is unchanged: Save & update only renders for a detected
waiting/activated update, remains locked during draws and flushes storage before reload.
Tools is translated in all 14 languages. Editorial semicolons became separate sentences,
and Greek question punctuation uses ?. User entries/titles, historical lookup keys,
code delimiters and data/MIME formats are unchanged.

Checks: lint and production build/typecheck passed. Two existing E2E cases passed
(390px keyboard/accessibility, public HTML metadata/404). Direct Chromium checks passed
for footer labels, five links, keyboard open/Escape close, install instructions, update
absence on a fresh load, punctuation and mobile overflow in all 14 languages. Confirmed
an entry containing a semicolon survives refresh. Inspected mobile screenshot, also
captured desktop dark mode: artifacts/footer-mobile.png and footer-desktop-dark.png.
Native OS installation and real service-worker update regression were not rerun.
No new test cases, commit, push or deployment. Preview: http://localhost:4173/.

## Latest FAQ removal and header Share

Removed Questions & answers from client and prerendered tool pages, plus its unused
source data/heading translations. About/Privacy remain. Share moved from the detailed
editor to the top menu after Save, using the existing disclosure/link dialog and locking
during spins. No new sharing logic or storage changes. Mobile menu has 3 columns below
481px (6 otherwise); small desktop menus stack icon/label to prevent translated overflow.
Source scan found no remaining AI-service branding or sparkle icons to remove; existing
Wheelero logo and functional icons are retained. No claim of additional icon removal.

Build/typecheck/lint passed. Direct Chromium checked all 14 languages, header link creation,
Escape closing, FAQ removal and six viewport widths (360/390/768/1024/1366/1440). Existing
E2E passed for main spin/library including disabled Share, fragment sharing, mobile
keyboard/accessibility and prerendered metadata/404 (4/4). Final two-row mobile header passed direct checks in all 14 languages: touch targets
are at least 44px, with no horizontal overflow. Screenshot: artifacts/share-menu-mobile.png. No new tests, commit, push or deployment.


## Latest full public-copy refresh

Rewrote homepage explanations/steps/FAQ, tool introductions, About and Privacy to current
behavior: direct Entries paste, New defaults, explicit Save/Open, same-name updates vs
new-name copies, results after animation, TXT results export, local sharing without
revocation, offline-ready status, and explicit previews bypassing wheel mute. No removed
Save dialog notices or JSON controls were restored. The homepage marketing H1 remains
hidden; the layout and stored user content are unchanged.

HomeInfo, SiteContent, template display titles/categories and number/team controls now
use all 14 locales. Source copy remains in i18n.ts/site.ts, shared-link disclosure is a
single site.ts constant reused in FAQ/Privacy/dialog. Client document language, title
and description follow selection; default prerendered SEO stays English. Existing wheel
titles/entries and editable winner messages remain user data, including template entries.
No storage/schema or selection algorithm changes. The old operator/contact placeholder
is still factual: details have not been supplied. Native-speaker review remains useful.

Checks: lint, typecheck/production build and 16 unit tests passed. Six existing E2E cases
passed: main spin/library, mobile keyboard/accessibility, actual audio previews, local
restore/share, distinct tools offline and public HTML/metadata/404. Catalog audit covered
118 required public-copy keys in all 13 non-English catalogs. Chromium checked all 14
languages with live switching (entries preserved), localized homepage/FAQ/templates and
seven other routes, functioning team generation and no overflow at 390px. Desktop/mobile
screenshots: artifacts/public-copy-{en,el}-{desktop,mobile}.png; Greek desktop inspected.
No full E2E/PWA-update rerun, physical-device or native-speaker review. No new test cases.
All changes remain local: no commit, push or deployment.


## Latest Wheel features correction

Replaced the description-less Save feature card with Templates. All six feature cards
(Customise, Templates, No repeats, Results, Share, Offline use), the section heading and
intro now use the existing translation system in all 14 languages. Descriptions match
current functionality: results export is TXT and sharing uses links, with no wheel JSON
controls. The removed Save explanation stays removed. Section lang follows the selected
language; the subsequent full-copy refresh also localizes the other editorial sections. Existing card layout
and purple icon style are unchanged. Lint and production build/typecheck passed. Chromium
checks passed for 6 complete cards in all 14 languages and no mobile overflow (390px).
Inspected desktop screenshot (1440px); artifacts/features-desktop.png and features-mobile.png.
No new tests, full E2E rerun, commit or deployment.


## Latest cleanup and audio preview behavior

Removed Customize global-mute/fairness notices and the redundant Templates heading plus
inspiration subtitle across languages. Library JSON export/import UI and handlers are
removed; TXT result export and legacy migration recovery remain. Updated user-facing
copy/oversized-share errors to stop recommending JSON controls. Backup schemas remain
for shared-link validation and historical format compatibility; no storage migration.
Customize no longer accepts a muted prop: explicit Play bypasses wheel mute without
changing that preference; Stop, volume 0, No sound and modal/tab cleanup still apply.
Existing tests adapted: removed obsolete import-only E2E, retained large IndexedDB test
using an existing-library IndexedDB fixture, and updated audio graph coverage for muted
previews. Filling a 1.5 MB textarea in Playwright stalled, so that attempted setup was
stopped; the capacity test now seeds the library directly, as it targets storage.
Validation: lint, build/typecheck and all 16 unit tests passed. Five existing E2E cases
passed across two runs: main spin/library, customization/assets/share, real audio graph,
large IndexedDB persistence and local/no-upload/restore/share. Mobile Chromium verified
removed notices and JSON controls, a single Templates heading and no horizontal overflow.
The audio graph check observes actual starts/stops/volume while wheel mute stays enabled.
No physical-speaker check or full E2E/PWA-update rerun. No new test cases, commit or deployment.


Latest UI follow-up: removed the explanatory paragraph below the Save dialog heading
in every language. The title input, Cancel/Save actions and error feedback remain.
The same-name update/new-name copy behavior is unchanged. The follow-up also removes
the Save explanation from the features card, including its translated catalog entries.
The later Wheel features correction replaces that empty card with Templates.
Lint and production build/typecheck passed; Chromium confirmed the paragraph is absent
and the title input remains visible. A further build/lint/browser check confirmed the
features card also has no paragraph. No new tests, commit or deployment.

## Latest visual cleanup

Removed the remaining decorative sparkle from the winner popup and its unused CSS.
The evening-plans template now uses a moon instead of sparkle emoji. These shared
components apply to all languages; no copy or saved user content changed. Wheelero
branding, configured confetti and sound choices remain intact. Source inspection found
no visible AI-service branding. Lint and production build/typecheck passed; Chromium
confirmed the updated template icon and a working winner popup without the sparkle.
Screenshot: artifacts/winner-without-sparkle.png. No new test cases, commit or deployment.

## Current work and authorization

Keep all current edits local. The user explicitly forbids commits, pushes and deployment
until asked again. HEAD remains 4712cef. The public site at https://wheelero.com still
runs the previously published centered layout (code 20c1fa2, successful run 40488853315).
Do not restore Classroom or the rejected large usability/localization release.

Uncommitted changes preserve the centered wheel/Entries layout and remove the homepage
slogan/explanatory paragraphs and the wheel's decorative stars/dots. The homepage H1 stays visually hidden; the actual wheel title has been restored above
the wheel. Both normal and presentation views honor show_title. The latest request replaces per-name sidebar inputs with a large
Entries textarea like the Wheel of Names basic editor. Real reference inspection and
intentional differences are documented in docs/entries.md; no code/assets were copied.

## Latest follow-ups: simple editor and Save copies

Removed Add multiple entries and its bulk panel from More options in all languages.
Main Entries textarea still handles line/Excel paste. The detailed editor keeps the
single-entry draft input, images, ordering and no-repeat. Its localStorage record stays
at draft:<wheel ID>; existing extra fields are retained when editing the single-entry
draft, so old unsubmitted bulk data is not erased, but the removed panel is not shown.
Existing bulk-input E2E flows now use Entries; the SW-update draft assertion uses the
remaining single-entry input. No new test cases.

Latest Save behavior supersedes always-append versions: the exact same saved name is
updated in place, retaining its ID; a new name creates an independent copy. Existing
duplicate names are preserved: update the current saved record if it matches, otherwise
the last matching saved record. Save and Open use working drafts so later editing does
not silently mutate the saved version. Saving an initially active saved wheel with a
new name preserves the old record. The subsequent UI cleanup removes Save explanations in every language.
No schema migration or backup-format change. Existing E2E counts were adjusted; no new
cases added. Build/typecheck and lint passed. Direct Chromium verification passed for
same-name updates, different-name copies, original starter preservation, Open/edit/save
ID retention and refresh persistence. The existing main edit/spin/pointer/backup/library
E2E passed (1/1). Full E2E/PWA-update regression not rerun.
No commit, push or deployment.

## Latest starter library

User now requests three available wheels in Open initially: the main default wheel plus
two empty wheels. Fresh initialization creates three real saved records with independent
IDs. Empty wheels use the localized Wheel label plus 2/3 and have zero entries/results.
IndexedDB v14 migrates once: preserve all records, fill libraries below three saved wheels,
and enroll the active wheel first only if no saved wheels exist. Larger libraries are not
trimmed. Deleting starters persists; refresh does not recreate them. New/template actions
still create drafts until Save. This supersedes the earlier initially-empty Open behavior.
Existing count/import assertions were updated; no new test cases were added.
Validation: build/typecheck/lint and 16 unit tests passed. Two existing E2E cases passed
(main edit/spin/backup/library flow and v9 migration). Direct Chromium verification passed
for three unique initial records, 6/0/0 entries, zero results, editing an empty wheel,
refresh persistence and deletion without reseeding. V13 migrations with 0, 1, 2 and 4
saved wheels preserved old content/IDs, filled only below three and did not duplicate on
reload. Screenshot: artifacts/open-three-wheels.png. Full E2E suite was not rerun.
No commit, push or deployment.

## Latest title restoration

The user restored the actual wheel name above the wheel. App again honors show_title
in normal and presentation views. The homepage marketing H1 stays visually hidden.
Desktop uses a compact 44px title/control row above the wheel, centered on the viewport;
long titles ellipsize with the full title available on hover. Mobile titles wrap. Stored
names, Save/Open and translations are unchanged. This supersedes normal-title hiding
in the earlier layout change below. No commit or publishing is authorized.
Build/typecheck and lint passed. Existing 8-viewport light/dark inspection passed with
no horizontal overflow and desktop wheel/sidebar fitting. Direct Chromium checks confirmed
the title sits above and centered on the wheel at 1366px/390px and updates when opening
Wheel 2. Current diameter at 1366x768 is 628px; mobile 390px remains 370px. No new tests;
the full E2E suite was not rerun for this title-only change.

## Earlier larger wheel layout

User requested removal of the visible homepage H1 and Pick a name title, with a larger
proportionate wheel. SiteIntro returns a visually hidden homepage H1. App hides normal
wheel headings but preserves presentation-title controls. Desktop controls now overlay
upper corners; the wheel uses the freed height. Symmetric columns preserve viewport
centering; Entries stays far right at clamp(260px,21vw,320px). Mobile gains 8px per side
inside existing page margins. At tablet widths the top menu wraps to its own row to
avoid overflow. No storage changes or new text requiring translations.

Latest layout verification: build/typecheck and lint passed. All four existing responsive/
keyboard/axe E2E cases passed (360, 390, 768, 1440px). No new test cases were added;
full-suite and physical-device tests were not rerun for these CSS/layout edits. Existing visual check passed
at 1366x768, 1440x900, 1920x1080, 1024x768, 1280x600, 768x1024, 390x844 and 683x384 in
light/dark: no horizontal overflow, viewport-centered desktop wheel, wheel/Entries fit
normal desktop viewports. Diameter before->after: 1366x768 591.5->672px; 1440x900
713.6->771.2px; 1920x1080 903.5->960px; 390px mobile 354->370px. Screenshots/reports:
artifacts/centered-viewport-*.png and centered-viewport-report.json.

## Center spin label

The center button now sizes its text relative to the button itself (CSS container units),
with a 68% inner safe area, balanced wrapping and long-word wrapping. Wheel.tsx measures
label height and reduces its font when needed, including after font loads, resizes and
label changes. ResizeObserver/font listeners are cleaned up on unmount. Full translated
idle/spinning labels remain visible; no clipping or ellipsis, accessible names unchanged.
Chromium layout measurements checked both labels in all 14 languages at 360, 390, 768,
1366 and 1920px: all 140 combinations stayed inside the circle. Greek mobile/desktop
screenshots are under artifacts/center-label-el-*.png. New/Open encoding errors introduced
in the preceding menu change were also corrected in seven translation catalogs.
All future UI copy changes must cover all 14 languages (also recorded in AGENTS.md).
Final verification: 14 rendered menus contain correct Unicode, 140 loaded-font label
layouts fit inside the border, actual spin completes, build/typecheck/lint pass. No new
repository tests, commit, push or deployment. These are Chromium checks, not device tests.

## Open screen cleanup

The user removed the entire Stored in your browser panel from Open, including its
Protect local storage button. Unused message state and panel CSS were removed. This
only removes that UI; IndexedDB data, Save/Open and JSON import/export remain unchanged.
Build/typecheck, lint and the Chromium Open-screen check passed; the removed heading/button are absent
and the library/import controls remain available. No new tests or commits.

## Current top menu and explicit Save

Top menu: Customise, New, Save, Open, Templates. The duplicate wheel gear is removed.
Changed help paragraphs refer to Customise and Save/Open and are translated in all 14
languages. HomeInfo marks those translated blocks with the actual selected language.
New/New wheel and Templates create drafts with default settings (New uses the six names).
SaveWheel.tsx opens a named-save dialog with Cancel, validation and visible storage errors.
Save now appends a new saved copy atomically on every click (supersedes same-ID saves).
Editor Save uses the same behavior. Open filters to saved records, shows a real empty state, and disables
empty JSON export. Imports/copies/explicit shared-copy saves are deliberate saved records.
Draft edits still persist after refresh but do not appear in Open; opening saved copies creates separate drafts for subsequent edits. Old drafts remain stored internally when starting another wheel.

IndexedDB v13 adds LocalWheel.saved. Pre-v13 records become saved=true because no explicit
save metadata existed, preserving access to every old list. Historical recovery snapshots
stay intact. See docs/data-model.md. No backup/share schema change. Existing E2E selectors
and explicit-save setup updated; no new test cases.

Latest Save/Open validation: build/typecheck/lint and all 16 unit tests passed. Three
existing E2E cases passed across runs: main edit/spin/pointer/backup flow, 390px keyboard/
axe accessibility, and v9 migration. Obsolete gear expectations were updated; a top-menu
contrast issue was corrected. Direct Chromium checks passed for Cancel, named/repeated
Save, draft/template filtering, saved-only export, refresh/Open, all 14 changed-copy/menu
translations on mobile, and desktop/mobile overflow. V12->v13 preserved wheel contents,
IDs and recovery snapshot. Production offline Save/refresh/Open, last-saved-wheel deletion
and simulated quota failure without library enrollment passed. Screenshots:
artifacts/save-menu-390.png and save-menu-1366.png. Full suite/exclusive SW update and
physical devices were not rerun. No commit, push or deployment.

## Current Entries behavior

Type/paste one name per line; Enter adds a line. Changes update the wheel/count immediately
and save through the existing IndexedDB store. Shuffle/Sort/Clear and the Results toolbar
remain functional. More options opens the detailed editor with images/no-repeat controls;
there is no inline rich-text image editor or weighted Advanced mode.

parseEntries handles newlines/spreadsheet tabs, trims outer whitespace, ignores blanks and
preserves duplicates. Limits remain 10,000 entries and 160 characters per entry. Invalid
edits are rejected with the translated limit message. Editing stays locked during draws.
reconcileEntries preserves IDs/images/active flags for retained entries and unambiguous
renames; caret position distinguishes deletion of adjacent duplicate names. Unmatched
replacements receive new IDs. Plain-text undo is not metadata history. The local typing
buffer preserves whitespace/caret while editing; refresh restores saved entries. Lists
are not duplicated into localStorage. No storage schema change was needed.

## Runtime and important files

React/TypeScript + Bun/Vite static PWA. No active backend/API/accounts/cloud sync.
Historical backend/Python/FastAPI/SQLite files remain untouched for recovery. IndexedDB
holds wheels, images, results and restore/removal jobs; localStorage holds small preferences
and the detailed editor's unsubmitted drafts. UI and public explanatory content use
fourteen languages; static pre-rendered metadata uses English by default.

- components/WheelSidebar.tsx: basic Entries textarea and Results.
- lib/entries.ts: parsing and stable-ID reconciliation; screens/Editor.tsx: detailed editing.
- App.tsx/styles.css: wheel-viewport and wheel-area containers, symmetric desktop columns,
  viewport-fitting diameter and internally scrolling sidebar. Narrow/short screens scroll.
- components/Wheel.tsx: drawing/animation, without the removed decorations.
- components/SiteContent.tsx and site.ts: shared public content and homepage-only intro removal.
- state/store.ts: sole writer, Web Locks, pending edits and BroadcastChannel coordination.
- state/storage.ts: IndexedDB gyrna v14, rollback migration and recovery export.
- lib/random.ts/geometry.ts: Web Crypto sampling and pointer agreement, unchanged.
- vite.config.ts/components/PwaControls.tsx: PWA policy, unchanged by Entries work.

IndexedDB v12 preserves a complete v10/v11 snapshot at legacy-backup/before-usability-rollback
and projects wheels to the pre-Classroom shape. IDs/settings/history and older recovery
records survive; former classes become ordinary wheels. Never downgrade or clear the DB.

PWA normal public URLs use NetworkOnly + PrecacheFallbackPlugin. requestWillFetch sets
cache:no-cache and a four-second abort on the Request itself; Workbox fetchOptions does
not revalidate navigation requests. Offline HTML comes from the installed bundle, avoiding
mixed-version runtime HTML. Workers activate automatically without forcing open editors
to reload; Save & update flushes writes and is disabled while spinning. Preserve this fix.

## Running and checks

From frontend/: bun install --frozen-lockfile; bun run dev.
Production: bun run build; bun run preview --port 4173 --strictPort.
Local preview currently runs at http://localhost:4173/. START_GYRNA.bat rebuilds/opens it;
STOP_GYRNA.bat stops owned listeners. Never stop unrelated processes or clear browser data.
Checks: bun run typecheck; bun run lint; bun run test; bun run e2e.
Do not build while the exclusive service-worker E2E is running. CI retains four shards
with two workers each, then the exclusive PWA job. No CI changes were made.

Latest Entries checks: typecheck/build/lint and 16 unit tests passed. Seventeen distinct
existing E2E cases passed across runs, including typing/ID persistence, spin locking,
refresh/backups, keyboard/axe at four widths, images/customization, local-only safety,
public tools offline and legacy migration. The full 36-case run was interrupted after
severe local slowdown; remaining cases and the exclusive worker-update case were not
completed for these edits. An interrupted audio check passed when rerun with one worker.
No new repository test cases were added; existing sidebar selectors/assertions were updated.

Direct reconciliation checks passed for deleting either duplicate, preserving image and
eligibility on rename, insertion, blank/spreadsheet parsing and 10,000 names. The existing
8-viewport light/dark inspection passed: no horizontal overflow, desktop wheel centered
and fitted. The earlier Entries layout was about 592px at 1366x768; current layout measurements are above. Ignored screenshots/reports are under
artifacts/centered-viewport-*.png and centered-viewport-report.json. Physical-device,
physical browser zoom and human screen-reader checks remain unverified.

Next: user reviews the larger local wheel and compact homepage. Finish the remaining E2E coverage on a less busy
machine before any subsequently authorized release. Do not commit or publish proactively.
