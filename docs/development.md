# Development

Run commands from the directories in README. Use Bun for frontend packages/scripts and
retain `bun.lock`. Python inputs are in `requirements.in`; the pinned environment is
`requirements.lock` (`python -m pip freeze`). TypeScript is strict; Python lines <=100.

Windows users can double-click `START_GYRNA.bat` for the production preview on 4173.
It delegates to `scripts/start-gyrna.ps1`, always rebuilds, validates process ownership
on 8017/4173, restarts this project's servers, migrates and opens `/api/launch`.
This network-only HTML entry bypasses old PWA navigation caches at the same origin;
normal `/` and installed-PWA offline behavior remain unchanged. It does not delete
browser storage or force-reload existing tabs. Use `STOP_GYRNA.bat` to stop the hidden
servers. Logs are in ignored `artifacts/launcher-*.log`. `START_GYRNA.bat -NoBrowser`
performs the same startup without opening the user's browser, for automation.
Readiness probes use 127.0.0.1 to avoid Windows PowerShell localhost/IPv6 timeouts;
the browser URL stays localhost to retain the user's existing storage and cookies.

Daily checks: pytest, Alembic check, typecheck, lint, unit tests, build and E2E. Tests
were explicitly requested for initial implementation. Surface failures; no broad catches.
The process-restart persistence test preserves session cookies but creates a fresh HTTP
client for each server process; a keepalive connection cannot survive server termination.

Schema changes: edit models, generate and review a new Alembic migration, apply it to a
temporary DB and check drift. Never create tables during API startup. Do not edit released
migrations. Keep business logic independent of HTTP and wheel geometry independent of RNG.

API experimentation: use `/docs`; request `/api/session` first, keep its cookie and pass
`X-CSRF-Token` on writes. Atomic wheel PUT includes ordered options, title and settings.
Wrong-owner access returns 404. The server never accepts client results as server-certified.

Playwright uses Chromium and the built PWA. Its backend runner uses ignored `e2e.db`.
Do not reuse unrelated services on configured ports. Screenshots/traces remain untracked.
Emulation does not verify real Safari installation, OS audio or fullscreen support.
Customization regressions live in `e2e/customization.spec.ts`; they exercise the actual
audio graph, image uploads, all tabs, durable OK/cancel, legacy storage and timed removal.
In addition to bulk fills,
the typing regression inserts Greek text in the middle of both title and option inputs
and verifies caret position and persistence. SW update tests serve a changed worker file,
exercise its real waiting/activation lifecycle, then restore the original generated file.

Customization schemas must remain aligned in `backend/app/customization.py` and
`frontend/src/customization.ts`. Keep selection independent of `lib/presentation.ts`:
it projects eligible entries for rendering and must always retain the winning ID.
Change settings only through the modal draft and commit after uploads complete.
Generate the original bundled gallery with `bun scripts/generate-gallery.mjs`.
Run the build to completion before starting E2E; avoid concurrent Playwright runs because
they share the output directory. Current verified counts are in PROJECT_CONTEXT.md.

Git: focused local commits, no databases/secrets/dependencies/build artifacts; no push or
deployment without instruction. Update PROJECT_CONTEXT and relevant docs before handoff.

The UI, templates and API messages are English. Keep copy in the two i18n modules;
preserve user-authored content in any language. Keep bundled/API template lists aligned.
`state/wheel.ts` supplies the factory shared by the store and IndexedDB v3 migration.
Do not reset user wheels to change a starter example. Existing E2E locators use English;
Greek input fixtures intentionally remain to check Unicode editing and preservation.

The home sidebar uses the same `editWheel` path as the full editor. Keep its mutation
controls disabled during draws, preserve entry IDs/images, and keep its draft key/labels
distinct from the full editor. Lists are paged at 100 entries; Results selects automatically
after a completed draw. Presentation hides the sidebar; below 1024px it stacks under the wheel.
Keep the pre-draw sidebar snapshot until animation completion: subscribing directly to
the new store results would expose the winner and no-repeat marker before the wheel stops.
The wheel toolbar owns the Customize gear immediately after Pause. The Entries action
row holds Shuffle/Sort/Clear and hides on Results, which has its own Clear. Preserve option IDs,
active flags and images on reordering; sorting must retain duplicate entries. The full
editor remains reachable through More options; desktop navigation has no Entries button.
Keep Clear entries/history independent and locked during draws. History clearing is a
pending local mutation, not a local-only array reset. Preserve retry records server-side,
apply clear before new offline uploads, and never reactivate no-repeat entries implicitly.
IndexedDB v4 initializes the clear flag; new local wheels must initialize it as well.
