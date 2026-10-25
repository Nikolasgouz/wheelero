# Data model

Workspace owns wheels; wheel owns ordered options, immutable results and share snapshots.
Revisions detect conflicting writes; UUID client identifiers make retries idempotent.

Tables: workspaces (hashed bearer cookie + CSRF secret), wheels (owner/revision/title/
no_repeat/customization JSON/deleted tombstone), options (composite wheel+UUID key,
unique order, optional embedded raster image), results
(composite wheel+client UUID, label/index/count snapshot, source, request_revision),
mutations (composite wheel+UUID, payload digest), shares (random public token + JSON snapshot).
Results intentionally have no option FK: deleting an option preserves history.
Migration d81e3a7b902f adds `results.cleared` (false for existing rows). Clearing history
marks rows instead of deleting retry records: the original draw UUID still returns its
original result, without restoring it to visible history. History/export responses exclude
cleared rows. This is a visible-history reset, not permanent erasure of SQLite records.
`PUT /api/wheels/{id}` accepts `clear_history`: after ownership/revision/idempotency checks,
it marks existing history before ingesting the request's new offline results. Retrying the
same mutation cannot erase later draws. A conflicting revision follows the existing copy flow.
Draft wheels may have 0–1 options; draws require a configured list of 2–10,000.
No-repeat may draw the last remaining option, including a one-entry list left by winner
removals when the wheel already has history. A new one-entry draft cannot draw.
Draws increment wheel revision even when
no-repeat is off, preventing a concurrent edit/draw from silently losing history.

Customization has schema version 1 and is part of the atomic revisioned snapshot.
Migration c72f1a9e4b02 preserves old data and public tokens, adds defaults to existing
wheels/shares, and increases option/result constraints. Private images are embedded
in the owner's snapshot; public snapshots explicitly copy them. No public upload store
or independent asset endpoint exists. See customization.md for limits and validation.

English UI/default messages do not change the SQLite schema or rewrite user content.
IndexedDB v3 adds a new local names starter once when upgrading existing v1/v2 state;
it is uploaded through the normal revisioned API. Existing IDs, settings, history and
pending operations remain intact. A pending draw keeps its current active wheel.
IndexedDB v4 initializes each wheel's pending `clear_history` flag to false; v3 upgrades
do not add another starter. Clears cancel that wheel's queued auto-removals. Clearing
entries preserves history; clearing results preserves entries and no-repeat active flags.
