# Development

Run commands from the directories in README. Use Bun for frontend packages/scripts and
retain `bun.lock`. Python inputs are in `requirements.in`; the pinned environment is
`requirements.lock` (`python -m pip freeze`). TypeScript is strict; Python lines <=100.

Windows users can double-click `START_GYRNA.bat` for the production preview on 4173.
It runs migrations and builds only when `dist/index.html` is absent. For code changes,
use Vite development mode or run `bun run build` before relaunching the preview.

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
