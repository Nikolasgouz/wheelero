# Historical backend

The current Wheelero website does not use this backend. There are no frontend API
requests, server sessions or SQLite dependencies in the current runtime or deployment.
Wheels/images/results live in browser IndexedDB; small preferences use localStorage.

This directory, its migrations and any ignored local SQLite files are retained to avoid
deleting existing work or historical uploads. It is not copied into the production image
and the Windows launcher does not start it. Existing server-only snapshots are not
converted into the new self-contained fragment links. Existing browser data migrates
locally to IndexedDB v10, with a recovery copy of the previous record.

For historical SQLite recovery only, scripts/database.py supports consistent backup and
restore. Do not delete old databases until their owner has reviewed them. The active
architecture and deployment instructions are in the root README and docs/.
