# Current browser data model

IndexedDB database name: gyrna (stable to preserve existing data), schema version **14**.
Object stores:

- state/current: version-1 SavedState.
- legacy-backup/previous: original pre-v10 record, retained for recovery on upgrade.
- legacy-backup/before-classroom: retained when present from the reverted v11 release.
- legacy-backup/before-usability-rollback: complete v10/v11 state before rollback migration.

SavedState contains wheels, active wheel ID, tool_wheels route mappings, scheduled removals
and removed-entry snapshots with their original positions. Wheels contain ID/title, ordered
entries, result history, no_repeat, customization version 2, updated_at and the local-only saved boolean. Entries carry
UUID/label/active/image; results retain UUID, chosen entry ID/label/index/count/date/source.

Each active entry has equal probability. Duplicate labels remain separate UUID entries.
Image data stays embedded in IndexedDB/exported wheel JSON. Local history retains old
source='server' values when migrating; new results use the stable source='offline' value
(displayed as Device draw / import, regardless of network availability).

## Migration

The v10 upgrade preserves the original record, applies existing v1-v9 data migrations,
then removes server-only metadata from active storage: revisions, mutations, outboxes,
workspace/session identifiers, sync flags and deletion tombstones. Active wheel IDs,
settings/images/results and removal jobs survive. The migration is one IndexedDB upgrade
transaction. Failure does not partially replace the old database.

An unfinished old server request cannot be recovered without that server; the upgrade
reports it without inventing a result. Its original record remains in the recovery copy.
Historical SQLite data is untouched, never silently fetched or erased.

The user reverted the complete usability/classroom release on 2026-10-27. Version 12
restores the pre-classroom wheel shape while retaining IDs, entries, images, active flags,
history, settings, saved wheels and removal/restoration data. Former classes become normal
wheels; attendance metadata remains in the complete recovery snapshot. Recovery export
prefers this latest snapshot. Older backups are untouched. Opening version 10 on an existing
version-11 browser would fail, so this is a forward migration, never a database downgrade.

## Backups and links

JSON format gyrna/version 1 remains stable; validated imports create fresh wheel/result IDs.
Per-wheel payload limit is 8 MB, 10,000 entries/results; import allows up to 100 wheels and
100 MB per file. Browser quota can be lower than the combined application limits.

Fragment-share payload version 1 includes only title, ordered options, no_repeat and
customization, with results fixed to []. It excludes private wheel IDs, history and other
wheels. Link content is readable by its holder and cannot be recalled.

Historical SQLAlchemy models/Alembic migrations remain under backend/ for recovery only.

## Explicit library save (v13)

New/default/template wheels start with saved=false. Their edits are still written to
IndexedDB for draft recovery, but Open and its JSON export list only saved=true wheels.
Save matches the exact saved title after the UI trims surrounding whitespace. It replaces
that record's contents while retaining its ID; an unused name creates a new saved record.
If old data has duplicate saved names, prefer the current saved record when it matches,
otherwise the last matching record in storage. Other duplicates are not deleted.
Saving a live starter/import/copy under a new name preserves the old saved record.
After Save, editing continues in a working draft; opening a library item also creates a
draft. Cancel leaves data untouched. Writes are atomic under Web Locks/IndexedDB.
Entries, settings and history are copied together. No schema or backup-format change.
Copies, imported backups and explicit shared-copy saves are already deliberate storage
actions and enter the library. Empty Open lists show a translated empty state, never
example cards. Deleting the last saved wheel leaves no library card for a fallback draft.

The v13 upgrade preserves all previous wheels/settings/IDs/results. Because pre-v13 had
no explicit-save flag, existing records become saved=true; no previous lists are hidden
or deleted. V10/v11 recovery snapshots and earlier migration logic are preserved. Older
unsaved drafts remain in local storage when starting another wheel; no automatic deletion
is introduced. JSON/share format stays version 1 and does not expose the saved flag.

## Starter library (v14)

Fresh installations start with three real saved records: the main wheel with the original
six names, plus two empty wheels (0 entries, 0 results). Empty titles use the current
language's Wheel label plus 2/3. All have independent IDs and normal edit/copy/delete support.
The v14 upgrade preserves all records and only fills libraries with fewer than three saved
wheels. If none are saved, it enrolls the active wheel first without changing its contents.
It does not trim larger libraries. Seeding happens once, so deletion survives refresh.
Later New/template wheels remain drafts until Save; import/copy behavior is unchanged.

Standard JSON file import/export controls were removed on 2026-10-29. Historical backup
schemas and legacy recovery data remain intact; shared links still validate wheel payloads.
