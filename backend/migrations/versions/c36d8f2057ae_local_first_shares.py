"""Allow explicitly published snapshots without uploading private wheel/history."""
from alembic import op
import sqlalchemy as sa

revision = "c36d8f2057ae"
down_revision = "b25c7e1f346d"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("shares") as batch:
        batch.add_column(sa.Column("workspace_id", sa.String(64), nullable=True))
        batch.add_column(sa.Column("client_wheel_id", sa.String(36), nullable=True))
        batch.add_column(sa.Column("request_id", sa.String(36), nullable=True))
    op.execute("UPDATE shares SET client_wheel_id=wheel_id, workspace_id="
               "(SELECT workspace_id FROM wheels WHERE wheels.id=shares.wheel_id)")
    with op.batch_alter_table("shares") as batch:
        batch.alter_column("workspace_id", nullable=False)
        batch.alter_column("client_wheel_id", nullable=False)
        batch.alter_column("wheel_id", existing_type=sa.String(36), nullable=True)
        batch.create_foreign_key("fk_shares_workspace", "workspaces", ["workspace_id"], ["id"])
        batch.create_index("ix_shares_workspace_id", ["workspace_id"])
        batch.create_index("ix_shares_client_wheel_id", ["client_wheel_id"])
        batch.create_unique_constraint("uq_shares_request", ["workspace_id", "request_id"])


def downgrade():
    raise RuntimeError("Restore a backup; standalone shared snapshots need the new schema.")
