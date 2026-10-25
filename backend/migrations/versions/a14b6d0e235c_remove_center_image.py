"""Remove center images from saved wheels and snapshots; customization version 2."""

from alembic import op
import sqlalchemy as sa

revision = "a14b6d0e235c"
down_revision = "f03a5c9d124b"
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE wheels SET customization = json_set(
            json_remove(customization, '$.center_image', '$.center_size'), '$.version', 2
        )
    """))
    connection.execute(sa.text("""
        UPDATE shares SET snapshot = json_set(snapshot, '$.customization',
            json_set(json_remove(json_extract(snapshot, '$.customization'),
                '$.center_image', '$.center_size'), '$.version', 2)
        )
    """))


def downgrade():
    raise RuntimeError("Restore a backup to recover removed center images.")
