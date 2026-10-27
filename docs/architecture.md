# Architecture

Current stack: React/TypeScript, Bun/Vite and static file hosting. There is no application
backend. Python/FastAPI/SQLite code remains in backend/ solely as historical source/recovery.

## Data and drawing

UI -> state/store.ts -> IndexedDB v11. The version-1 saved record holds wheels, current ID,
tool-page mappings, timed removals and removed-entry restoration data. No API client remains.
Templates are bundled. localStorage stores preferences/editor drafts, not the wheel database.

Web Locks serialize read-modify-write operations across tabs; BroadcastChannel refreshes
other views. The store publishes committed changes only after IndexedDB writes succeed.
Quota failures report an error and preserve the previous saved state. Text inputs keep a
temporary optimistic overlay for caret stability and revert it on failed writes.

Web Crypto rejection sampling determines the result independently of animation/display
projection. Duplicate entries retain separate chances. Geometry lands on the winning ID.
No-repeat, auto-removal and manual removal retain their existing behavior; removal jobs
identify their original wheel/entry/result and do not affect copies.

Classroom uses the same wheel model, with nullable classroom metadata holding absent UUIDs.
state/wheel.ts filters absent IDs and (when no_repeat is enabled) inactive entries before
the unchanged RNG runs. Starting a round restores active flags, not attendance. Bulk paste
parses spreadsheet cells through lib/entries.ts and commits add/replace in one transaction.
Replace creates fresh entry IDs and clears attendance/restoration jobs, retaining history.

## Sharing

lib/sharing.ts serializes a validated title/options/settings snapshot with empty history,
encodes UTF-8/base64url into /#wheel=..., and validates it on receipt. The recipient explicitly
saves a new copy. The fragment is not sent to the static host. It is not encrypted and cannot
be revoked. A 16,000-character encoded-payload limit bounds parsing/link size; use JSON
export for larger wheels/images. Old ?share= server links show an explanatory message.
Class snapshots share the entire roster, with empty absent_ids and active entries; the UI
discloses this before creation. JSON backups and local copies retain attendance/progress.

## Workspace

Workspace.tsx measures actual translated header/toolbar/footer-of-wheel heights with
ResizeObserver and viewport resize events. Desktop CSS caps diameter by both remaining
height and column width. Minimum usable sizes allow document scrolling in short windows
instead of clipping; mobile uses one column and natural scroll. Sidebar lists retain their
own scroll/pagination. ToolNavigation uses existing real routes with aria-current.
PasteList/Classroom/Attendance reuse native Dialog for modal focus and Escape handling.

## Static pages and PWA

src/site.ts and SiteContent.tsx supply shared public content. scripts/pages.tsx pre-renders
seven routes and 404/launch HTML, robots and sitemap before Workbox precaching. PUBLIC_URL
and PUBLIC_INDEXING are build-time inputs. There is no runtime metadata templating service.
Static HTML defaults to English. The selected browser language translates public copy,
tools, templates, messages and runtime metadata. Catalogs are precached with the app;
user-authored wheel content is not translated. See localization.md for boundaries.

Vite preview serves real HTML routes and 404s with no API proxy. Production Caddy serves
the same dist directory. The service worker caches app files/assets, not user lists.
VitePWA autoUpdate activates new workers immediately; onNeedReload intercepts the library's
default reload. Each tab flushes writes and reloads only after three quiet seconds with no
spin/operation, dialog, focused editor, fullscreen or application error. Visibility/online/
focus events and a one-minute visible-online timer discover updates in long-lived tabs.
Updating a worker never directly reloads another tab. Its own safety gate applies there.
The transient view marker in sessionStorage restores the current screen once after an
automatic reload. Team results/count and number-range drafts also use per-tab sessionStorage;
existing editor/new-entry drafts and team names retain their existing localStorage keys.

## Storage persistence

IndexedDB quota depends on browser/device. navigator.storage.persist() is requested only
when the user presses Protect local storage; browser refusal is explained honestly.
Neither persistent storage nor PWA installation replaces JSON backups. Data is per-origin
and does not automatically move from a temporary preview URL to wheelero.com.
