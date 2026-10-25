"""Update the default winner message without changing user-authored messages."""

from alembic import op
import sqlalchemy as sa

revision = "e92f4b8c013a"
down_revision = "d81e3a7b902f"
branch_labels = None
depends_on = None


def upgrade():
    # Copy-only public snapshots remain immutable. Revisions track user edits;
    # this default-copy update is mirrored by the IndexedDB v5 migration.
    op.get_bind().execute(sa.text("""
        UPDATE wheels
        SET customization = json_set(customization, '$.popup_message', :message)
        WHERE json_extract(customization, '$.popup_message') IN (:english, :greek)
    """), {
        "message": "And The Winner is...",
        "english": "WE HAVE A WINNER",
        "greek": "Η ΤΥΧΗ ΔΙΑΛΕΞΕ",
    })


def downgrade():
    raise RuntimeError("Restore a pre-migration backup to recover the previous winner messages.")
