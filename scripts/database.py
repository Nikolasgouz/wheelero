"""Consistent SQLite backup or restore into a NEW file; never overwrite a live database."""
import argparse
from pathlib import Path
import sqlite3

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("operation", choices=["backup", "restore"])
parser.add_argument("source", type=Path)
parser.add_argument("destination", type=Path)
args = parser.parse_args()
source = args.source.resolve(strict=True)
destination = args.destination.resolve()
if destination.exists():
    raise FileExistsError("Choose a new destination. Existing databases are never overwritten.")
with sqlite3.connect(source.as_uri() + "?mode=ro", uri=True) as original:
    if original.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
        raise ValueError("Source database failed integrity_check.")
    with sqlite3.connect(destination) as target:
        original.backup(target)
        if target.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            raise ValueError("Destination database failed integrity_check.")
print(f"{args.operation.capitalize()} verified: {destination}")
