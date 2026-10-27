# Architecture

Current stack: React/TypeScript, Bun/Vite and static file hosting. There is no application
backend. Python/FastAPI/SQLite code remains in backend/ solely as historical source/recovery.

## Data and drawing

UI -> state/store.ts -> IndexedDB v12. The version-1 saved record holds wheels, current ID,
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

## Sharing

lib/sharing.ts serializes a validated title/options/settings snapshot with empty history,
encodes UTF-8/base64url into /#wheel=..., and validates it on receipt. The recipient explicitly
saves a new copy. The fragment is not sent to the static host. It is not encrypted and cannot
be revoked. A 16,000-character encoded-payload limit bounds parsing/link size; use JSON
export for larger wheels/images. Old ?share= server links show an explanatory message.

## Static pages and PWA

App.tsx groups the intro and tool in wheel-viewport. On desktop, its flex layout assigns
the remaining viewport height to workspace. Equal outer grid columns keep the wheel
centered on the screen while Entries occupies the right column. wheel-area is a size
container: the diameter is min(100cqw,100cqh), capped by the central column, so both
available height and width matter without JavaScript resize observers. A minimum tool
height permits scrolling on short screens; mobile retains the existing single column.
The sidebar scrolls internally, title ellipsis retains full accessible text/title, and
expanded legends consume space before calculating the wheel's available height.

src/site.ts and SiteContent.tsx supply shared public content. scripts/pages.tsx pre-renders
seven routes and 404/launch HTML, robots and sitemap before Workbox precaching. PUBLIC_URL
and PUBLIC_INDEXING are build-time inputs. There is no runtime metadata templating service.

Vite preview serves real HTML routes and 404s with no API proxy. Production Caddy serves
the same dist directory. The service worker caches app files/assets, not user lists.
Known public-route navigations use NetworkOnly with a requestWillFetch plugin setting
cache:no-cache (HTTP revalidation), a four-second timeout and route-specific precached
offline fallbacks. Workbox fetchOptions alone does not apply to navigation requests.
Do not runtime-cache HTML: a new worker removes obsolete precached assets, so older runtime
HTML could reference missing bundles offline. Fallback HTML belongs to the installed bundle.
Disabling precache directory-index matching prevents `/` from bypassing that network rule.
Unknown paths retain genuine network 404s. Hashed assets first seen with newer HTML have
a bounded runtime cache so they remain available offline before the next worker installs.
New workers skip waiting but do not force page reloads; an open editor reloads only after
this tab's explicit action and completed writes. Controller changes expose that optional
action even when activation has already completed. No IndexedDB/localStorage data is cleared.

## Storage persistence

IndexedDB quota depends on browser/device. navigator.storage.persist() is requested only
when the user presses Protect local storage; browser refusal is explained honestly.
Neither persistent storage nor PWA installation replaces JSON backups. Data is per-origin
and does not automatically move from a temporary preview URL to wheelero.com.
