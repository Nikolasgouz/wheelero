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
Draft wheels may be empty; draws require at least one active entry from 1–10,000 options.
A fresh one-entry wheel can draw without previous history; its result has index 0/count 1.
No-repeat exhausts that entry after one draw, and New round reactivates it.
Draws increment wheel revision even when
no-repeat is off, preventing a concurrent edit/draw from silently losing history.

Customization has schema version 2 and is part of the atomic revisioned snapshot.
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

Migration f03a5c9d124b and IndexedDB v6 localize the original Greek example wheels:
recognized default titles/entry labels/result labels and generated Copy suffixes become
English. This one-time data migration preserves IDs, positions, active flags, revisions
and source; custom labels remain unchanged. Published snapshots remain immutable.
Dirty local payloads changed by localization receive a fresh mutation ID.

Migration a14b6d0e235c removes center_image/center_size from wheels and shared snapshots,
and sets customization.version to 2. This explicit feature-removal upgrade preserves
IDs, revisions, results, wheel backgrounds and entry images. IndexedDB v7 mirrors it,
renewing dirty payload mutation IDs. Version 1 JSON backups are validated and migrated
once at import by customizationMigration.ts; the API accepts only version 2 settings.
