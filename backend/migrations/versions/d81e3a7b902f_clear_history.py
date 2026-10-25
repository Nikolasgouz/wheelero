"""Keep draw retry records when clearing visible history."""
from alembic import op
import sqlalchemy as sa

revision = "d81e3a7b902f"
down_revision = "c72f1a9e4b02"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("results", sa.Column(
        "cleared", sa.Boolean(), nullable=False, server_default="0",
    ))


def downgrade():
    raise RuntimeError("Restore a backup; downgrade would expose cleared history again.")
