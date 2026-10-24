# Data model

Workspace owns wheels; wheel owns ordered options, immutable results and share snapshots.
Revisions detect conflicting writes; UUID client identifiers make retries idempotent.
