"""Refresh the exact original private-wheel palette; preserve custom colors and shares."""

import json

from alembic import op
import sqlalchemy as sa

revision = "b25c7e1f346d"
down_revision = "a14b6d0e235c"
branch_labels = None
depends_on = None


def upgrade():
    old = [
        {"color": color, "enabled": True}
        for color in ("#ded2f6", "#f6d5c4", "#cbe5dc", "#f4e6b7", "#cddff2", "#edcfe1")
    ]
    new = [
        {"color": color, "enabled": True}
        for color in ("#8b5cf6", "#ff5b6e", "#14c8a2", "#ffbf24", "#32b5ff", "#ed62d4")
    ]
    connection = op.get_bind()
    for wheel_id, raw in connection.execute(sa.text("SELECT id, customization FROM wheels")):
        config = json.loads(raw)
        if config["palette"] == old:
            config["palette"] = new
            connection.execute(sa.text(
                "UPDATE wheels SET customization=:config WHERE id=:id"
            ), {"config": json.dumps(config, ensure_ascii=False), "id": wheel_id})


def downgrade():
    raise RuntimeError("Restore a backup to recover the original default palettes.")
