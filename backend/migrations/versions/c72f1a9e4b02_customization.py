"""Versioned customization, embedded private images and 10,000 entries."""
import json
from alembic import op
import sqlalchemy as sa

revision = "c72f1a9e4b02"
down_revision = "5da8562261f3"
branch_labels = None
depends_on = None

DEFAULTS = json.loads('''{
  "version": 1,
  "spin_sound": "ticking",
  "spin_volume": 50,
  "show_duplicates": true,
  "slow_spin": false,
  "show_title": true,
  "duration": 10,
  "max_names": 1000,
  "result_sound": "applause",
  "result_volume": 50,
  "animate_winner": false,
  "confetti": true,
  "auto_remove": false,
  "popup": true,
  "popup_message": "\u0397 \u03a4\u03a5\u03a7\u0397 \u0394\u0399\u0391\u039b\u0395\u039e\u0395",
  "remove_button": true,
  "removal_sound": false,
  "mode": "colors",
  "palette": [
    {
      "color": "#ded2f6",
      "enabled": true
    },
    {
      "color": "#f6d5c4",
      "enabled": true
    },
    {
      "color": "#cbe5dc",
      "enabled": true
    },
    {
      "color": "#f4e6b7",
      "enabled": true
    },
    {
      "color": "#cddff2",
      "enabled": true
    },
    {
      "color": "#edcfe1",
      "enabled": true
    }
  ],
  "center_image": null,
  "center_size": "S",
  "wheel_image": null,
  "pointer_changes": true,
  "pointer_color": "#7650cc",
  "page_color": "#f8f7fc",
  "gradient": true,
  "text": "always",
  "borders": false,
  "shadow": true
}''')


def upgrade():
    op.add_column("wheels", sa.Column(
        "customization", sa.JSON(), nullable=False,
        server_default=sa.text("'" + json.dumps(DEFAULTS) + "'"),
    ))
    connection = op.get_bind()
    for table_name, old_check, new_check in (
        ("options", "position >= 0 AND position < 200", "position >= 0 AND position < 10000"),
        ("results", "choice_count BETWEEN 1 AND 200", "choice_count BETWEEN 1 AND 10000"),
    ):
        table = sa.Table(table_name, sa.MetaData(), autoload_with=connection)
        for constraint in table.constraints:
            if isinstance(constraint, sa.CheckConstraint) and str(constraint.sqltext) == old_check:
                constraint.name = "old_entry_limit"
        with op.batch_alter_table(table_name, copy_from=table) as batch:
            batch.drop_constraint("old_entry_limit", type_="check")
            batch.create_check_constraint("entry_limit", new_check)
            if table_name == "options":
                batch.add_column(sa.Column("image", sa.String(), nullable=True))
    shares = sa.table("shares", sa.column("token", sa.String()), sa.column("snapshot", sa.JSON()))
    for token, snapshot in connection.execute(sa.select(shares)):
        snapshot["customization"] = DEFAULTS
        for option in snapshot["options"]:
            option["image"] = None
        connection.execute(shares.update().where(shares.c.token == token).values(snapshot=snapshot))


def downgrade():
    raise RuntimeError("Restore a pre-migration backup; downgrade would lose customization data.")
