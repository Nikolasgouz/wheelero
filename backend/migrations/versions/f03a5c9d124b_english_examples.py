"""Translate legacy bundled examples and generated copy suffixes to English."""

from alembic import op
import sqlalchemy as sa

revision = "f03a5c9d124b"
down_revision = "e92f4b8c013a"
branch_labels = None
depends_on = None

EXAMPLES = {
    "Τι θα φάμε;": ("What should we eat?", {
        "Πίτσα 🍕": "Pizza 🍕", "Σουβλάκι 🥙": "Souvlaki 🥙",
        "Μακαρόνια 🍝": "Pasta 🍝", "Σαλάτα 🥗": "Salad 🥗",
    }),
    "Τι κάνουμε απόψε;": ("What should we do tonight?", {
        "Σινεμά 🎬": "Cinema 🎬", "Επιτραπέζια 🎲": "Board games 🎲",
        "Μια βόλτα 🌙": "A walk 🌙", "Ποτό 🍹": "Drinks 🍹", "Σπίτι 🛋️": "Stay home 🛋️",
    }),
    "Ναι ή όχι;": ("Yes or no?", {"Ναι": "Yes", "Όχι": "No"}),
    "Ποιος ξεκινάει;": ("Who goes first?", {
        "Άννα": "Anna", "Νίκος": "Nikos", "Μαρία": "Maria", "Γιάννης": "John",
    }),
    "Ο νέος μου τροχός": ("My new wheel", {}),
}


def upgrade():
    connection = op.get_bind()
    # Mirrored by IndexedDB v6. IDs, user-edit revisions and public snapshots stay stable.
    for wheel_id, original in connection.execute(sa.text("SELECT id, title FROM wheels")):
        title, *suffixes = original.split(" · ")
        if any(suffix not in ("Αντίγραφο", "Copy") for suffix in suffixes):
            continue
        translated, labels = EXAMPLES.get(title, (title, {}))
        translated = " · ".join([translated, *["Copy" for _ in suffixes]])
        if translated != original:
            connection.execute(sa.text("UPDATE wheels SET title=:title WHERE id=:id"), {
                "title": translated, "id": wheel_id,
            })
        for before, after in labels.items():
            for table in ("options", "results"):
                connection.execute(sa.text(
                    f"UPDATE {table} SET label=:after WHERE wheel_id=:id AND label=:before"
                ), {"id": wheel_id, "before": before, "after": after})


def downgrade():
    raise RuntimeError("Restore a backup to recover the original example language.")
