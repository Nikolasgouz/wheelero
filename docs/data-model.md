# Current browser data model

IndexedDB database name: gyrna (stable to preserve existing data), schema version **10**.
Object stores:

- state/current: version-1 SavedState.
- legacy-backup/previous: original pre-v10 record, retained for recovery on upgrade.

SavedState contains wheels, active wheel ID, tool_wheels route mappings, scheduled removals
and removed-entry snapshots with their original positions. Wheels contain ID/title, ordered
entries, result history, no_repeat, customization version 2 and updated_at. Entries carry
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

## Backups and links

JSON format gyrna/version 1 remains stable; validated imports create fresh wheel/result IDs.
Per-wheel payload limit is 8 MB, 10,000 entries/results; import allows up to 100 wheels and
100 MB per file. Browser quota can be lower than the combined application limits.

Fragment-share payload version 1 includes only title, ordered options, no_repeat and
customization, with results fixed to []. It excludes private wheel IDs, history and other
wheels. Link content is readable by its holder and cannot be recalled.

Historical SQLAlchemy models/Alembic migrations remain under backend/ for recovery only.
