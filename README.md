# Wheelero

Latest release verified live on 2026-10-29: [wheelero.com](https://wheelero.com), code
6129dc3. All CI checks and deployment passed. Wheel sound starts enabled on every page load.
New visitors see the site behind a compact
cookie dialog and must accept or reject before using the tool. Optional GA4 requires consent, with safe page
views and feature counts. Live collection requests received HTTP204; GA report ingestion
could not be checked without property access. See [analytics verification](docs/analytics.md).

The footer groups its six information links into
**Help & information** and **Privacy & terms**. **Help & FAQ**, **About Wheelero**,
**Contact & support**, **Privacy Policy**, **Terms of Use** and **Cookie settings** open
dedicated pages. The current page is highlighted. **Install app** remains available.
Help answers expand individually, and information pages include a return-to-wheel link.
Contact contains a reply-email field and message box. The support inbox address is not
included in the website. Submission uses a Formspree form ID configured as
`VITE_CONTACT_FORM_ID` in the root `.env` or build environment. **Local sending is active
and verified** with form ID `xljjlgrl`. The recipient is configured privately at Formspree.
The connected Gmail inbox received the real production-preview test. The Pages build uses
this public form ID by default; GitHub variable `CONTACT_FORM_ID` can override it.
See [contact setup](docs/contact-form.md) for the activation and delivery verification steps.
Cookie settings explains browser storage and allows accepting or rejecting optional Analytics
at any time. Before acceptance, no Google Analytics script or request is loaded.
New visitors must choose **Accept cookies** or **Reject cookies** before using the app.
Both choices give full access. The site is visible behind the dialog but cannot receive
clicks or keyboard focus until a choice. The "Help us improve Wheelero" dialog uses the
approved concise explanation, with no separate language picker, and links to a privacy
view readable before choosing. Existing choices are remembered.
On first visit, the site and cookie dialog follow the browser's preferred supported language.
An explicitly selected language takes priority on later visits. Unsupported languages fall
back to English; no location lookup is used. All 14 supported languages include cookie copy.
See [public pages](docs/public-pages.md) for routes and publication limitations.
Install app opens the browser's installation prompt when
available or shows installation instructions. **Save & update** appears only when a new
version has been detected. Interface labels follow the selected language.

**One spin, one decision.** A static React/TypeScript/Bun/Vite website and offline PWA.
The wheel has **no backend, server sessions or SQLite dependency**. Wheel data stays local.
The contact form sends explicit messages to Formspree. Optional GA4 runs only after analytics
consent on the production origin. See [Analytics and consent](docs/analytics.md).

Live website: **https://wheelero.com** (GitHub Pages). HTTPS, local draws/sharing and
offline use were verified on the public domain on 2026-10-26.

The 2026-10-27 release reverts the entire usability/Classroom commit to the preceding
interface. Existing classes remain as ordinary saved wheels. The latest local copy refresh
adds fourteen-language public content without restoring Classroom.
The subsequent desktop layout keeps the wheel centered on the screen, with Entries on the
right. At normal desktop sizes the whole tool fits above the fold; large lists scroll inside
their panel. Narrow screens and high zoom retain natural page scrolling.
The local homepage has a directly editable wheel title on the left on desktop (above the
wheel on mobile). The freed desktop title row lets the centered wheel grow, with a taller
Entries panel. The marketing H1 stays visually hidden; the wheel's decorative
stars and dots have been removed. These latest edits are awaiting user approval to commit.
Entries now uses a single text area: type or paste one name per line, press Enter to add
another, and edit/delete text directly. Shuffle, Sort and Clear remain above it; More
options opens the detailed editor; bulk paste is available directly in Entries, without
a separate Add multiple entries control. See [Entries editor](docs/entries.md).
The homepage opens directly on a large centered wheel. Its own title appears above it;
the introductory heading stays hidden. Names remain editable in Save and the detailed editor. The center
spin label wraps inside its button in all supported menu languages.
The top menu offers Customise, New, Save, Share, Open (saved wheels), and Templates.
New starts a draft with the original six names and default settings. Save names the wheel
and updates the saved wheel with that name. A new name creates an independent copy in Open,
keeping the previous wheel. Templates also start drafts.
Open initially contains three saved wheels: Pick a name with the six default names,
plus Wheel 2 and Wheel 3 with zero entries/results. These are editable, real stored wheels.
Later New/template drafts appear in Open only after Save. Imported/copied wheels and
older lists remain available. Deleting a starter wheel does not recreate it on refresh.
Drafts recover after refresh but stay out of Open. Opening a saved copy creates a working draft, so later edits preserve the saved version.
IndexedDB v12 safely preserves data from the intervening v11 release; no database reset.

## Local storage

Wheels, images, customization, results and removed entries live in **IndexedDB** on the
user's device. This offers substantially more capacity than localStorage; the actual quota
depends on the browser/device. localStorage holds small preferences and editor drafts.
Open shows saved wheels directly, without the former storage-information panel.
Clearing browser storage deletes local wheels. JSON import/export controls are no longer offered.

Old browser databases migrate to IndexedDB v14. The migration retains a recovery copy of
the previous record. No names are uploaded. Existing server-only records are not fetched
or erased. The historical backend and ignored SQLite files remain on disk for recovery.

TXT result export remains available and works in Notepad. Standard wheel JSON import/export
was removed at the user's request; migration-recovery export is retained only for old data.

## Features

Home explanations, instructions, features, About/Privacy, tool introductions/controls,
footer links and template display names follow the selected language (14 languages).
Copy describes the current Save/Open, in-place Entries editing, TXT result export, local
share links and explicit sound previews. User-entered wheel data is never translated.
Default pre-rendered SEO remains English; client title/description follow the language.

- 1-10,000 entries per wheel, inline editing, Excel/line paste, shuffle/sort, duplicates,
  templates, saved wheels, no-repeat rounds, result history and restoration of winners.
  The 12 editable templates include Pick a number (1–10), replacing Who goes first.
- Unbiased Web Crypto selection, pointer/result agreement, optional sound, themes/images,
  customizable duration, fullscreen, keyboard support and reduced motion. Customize Play
  previews bypass the wheel mute switch; selected volume and No sound still apply.
  Wheel sound starts on at every page load. Mute applies until the next reload or full
  navigation, while the wheel's selected sounds and volumes remain saved.
- Name picker, yes/no, number-range and balanced-team tools, plus About and Privacy. The Questions & answers section has been removed.
- Share a copy in a URL fragment, without uploading it. History/other wheels are excluded.
  Links cannot be revoked. Wheels exceeding the 16,000-character payload limit cannot be
  shared by link. Some messaging apps may truncate long links.
- Pre-rendered HTML, canonical/OG metadata, robots, sitemap, original icons/social image,
  actual 404 handling and installable/offline PWA.

## Install and run

Requires Bun 1.4.2+ and a modern browser. Python is not needed for the current app.

```powershell
cd frontend
bun install --frozen-lockfile
bun run dev
```

Development URL: http://localhost:5173. For the production-style local preview, double-click
**START_GYRNA.bat** in the project root. It builds and starts only the static frontend on
http://localhost:4173/launch.html. STOP_GYRNA.bat stops its owned processes. Existing filenames
and browser origin stay unchanged to preserve shortcuts and local data. The launcher also
stops the old project backend if it is still listening on 8017; it never restarts Python.

Manual preview:

```powershell
cd frontend
bun run build
bun run preview --port 4173 --strictPort
```

Normal browsing/PWA start uses `/`. Online navigation revalidates the page with the host;
offline navigation uses cached pages. Close old tabs if a storage upgrade requests it.

## Static production build

Only copy `.env.example` to `.env` if no local configuration exists. Build settings:

| Variable | Purpose |
| --- | --- |
| PUBLIC_URL | Final HTTPS origin, used at build time for canonical URLs/OG/sitemap |
| PUBLIC_INDEXING | false for previews, true after final domain verification |
| SITE_HOST | Optional Docker/Caddy hostname; must match PUBLIC_URL |

```powershell
$env:PUBLIC_URL = 'https://wheelero.com'
$env:PUBLIC_INDEXING = 'true'
cd frontend
bun run build
```

Use wheelero.com only after confirming ownership/DNS. Upload **frontend/dist/** to static
hosting. No secrets belong in build variables. Static hosting can replace a Droplet entirely.
Alternatively, the included Docker/Caddy deployment serves files and HTTPS only; it contains
no Python process or application database. See [deployment](docs/deployment.md).

Source: [Nikolasgouz/wheelero](https://github.com/Nikolasgouz/wheelero). The GitHub Actions
workflow automatically checks, builds and deploys after each push to `main`, including
merged pull requests. Failed checks prevent deployment; pull requests only run checks.
No `PAGES_ENABLED` variable or manual workflow run is required. A local commit must be
pushed to GitHub to trigger deployment. The owner must first enable GitHub Pages with
GitHub Actions and set its custom domain to wheelero.com. Exact steps and Papaki DNS
records are in the deployment guide. SSH access alone cannot configure Pages or DNS.

## PWA

Use Install when offered, or the browser install menu. On iPhone/iPad: Safari > Share >
Add to Home Screen. Wait for Ready to use offline before testing without internet.
New workers activate automatically without reloading open editors. Opening/reloading the
normal URL requests current HTML, with a four-second network timeout and cached/preloaded
offline fallbacks. Save & update is optional for an already-open page: it waits for local
writes and is disabled during spins. This is not App Store/Google Play publication.

## Checks

```powershell
cd frontend
bun run typecheck
bun run lint
bun run test
bun run build
bun run e2e
```

Install Chromium if needed with `bunx playwright install chromium`. E2E starts only the
static preview. Independent E2E tests run with 8 workers. The @exclusive service-worker
update test runs alone after they pass, because it temporarily modifies dist/sw.js.
Do not build during E2E. Override locally with `bun run e2e --workers=2` when needed.
GitHub uses four parallel shards with two workers each (eight total), then the isolated
PWA update check. Deployment waits for all checks; failures include annotations/traces.
Actual results/limitations are in [PROJECT_CONTEXT](PROJECT_CONTEXT.md).

## Public preview

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/public-preview.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/public-preview.ps1 -Stop
```

The temporary Cloudflare URL requires this PC awake/online. Its state is in ignored
artifacts/public-preview.json. No database is created. Restarting the tunnel changes the
origin; locally saved wheels do not move between origins.

The `backend/` folder is historical and excluded from deployment. Its old tests and SQLite
backup script are retained for recovery; they are not part of the current runtime checks.
GitHub publication setup and domain requirements are documented in docs/deployment.md.
