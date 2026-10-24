# Data model

Workspace owns wheels; wheel owns ordered options, immutable results and share snapshots.
Revisions detect conflicting writes; UUID client identifiers make retries idempotent.

Tables: workspaces (hashed bearer cookie + CSRF secret), wheels (owner/revision/title/
no_repeat/customization JSON/deleted tombstone), options (composite wheel+UUID key,
unique order, optional embedded raster image), results
(composite wheel+client UUID, label/index/count snapshot, source, request_revision),
mutations (composite wheel+UUID, payload digest), shares (random public token + JSON snapshot).
Results intentionally have no option FK: deleting an option preserves history.
Draft wheels may have 0–1 options; draws require a configured list of 2–10,000.
No-repeat may draw the last remaining option. Draws increment wheel revision even when
no-repeat is off, preventing a concurrent edit/draw from silently losing history.

Customization has schema version 1 and is part of the atomic revisioned snapshot.
Migration c72f1a9e4b02 preserves old data and public tokens, adds defaults to existing
wheels/shares, and increases option/result constraints. Private images are embedded
in the owner's snapshot; public snapshots explicitly copy them. No public upload store
or independent asset endpoint exists. See customization.md for limits and validation.
