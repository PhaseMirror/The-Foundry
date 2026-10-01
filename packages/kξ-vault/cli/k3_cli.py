import os
import json
import hashlib
import click
from pathlib import Path

# Base directory for stored objects
BASE_DIR = Path(__file__).resolve().parent.parent / "assets" / "k3"
METADATA_FILE = BASE_DIR / "metadata.json"

def _load_metadata():
    if METADATA_FILE.exists():
        return json.loads(METADATA_FILE.read_text())
    return {}

def _save_metadata(data):
    METADATA_FILE.write_text(json.dumps(data, indent=2))

def _cid_from_bytes(data: bytes) -> str:
    # Simple CID placeholder: SHA256 hex prefixed with "cid-"
    return "cid-" + hashlib.sha256(data).hexdigest()

@click.group()
def cli():
    """K3 data‑plane CLI – ingest, retrieve, pin, unpin objects."""
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    if not METADATA_FILE.exists():
        _save_metadata({})

@cli.command()
@click.argument('filepath', type=click.Path(exists=True))
@click.option('--pin', is_flag=True, help='Set pin flag on ingest')
def ingest(filepath, pin):
    """Ingest a file into the K3 store.

    The file is copied into the store directory under its CID name.
    A JSON metadata entry records the original name, size, CID and pin flag.
    """
    src = Path(filepath)
    data = src.read_bytes()
    cid = _cid_from_bytes(data)
    dest = BASE_DIR / cid
    dest.write_bytes(data)
    meta = _load_metadata()
    meta[cid] = {
        "original_name": src.name,
        "size": len(data),
        "pin": pin,
        "timestamp": click.format_filename(click.get_current_context().obj.get('timestamp', ''))
    }
    _save_metadata(meta)
    click.echo(f"Ingested {src} -> CID {cid} (pin={pin})")

@cli.command()
@click.argument('cid')
@click.option('--out', type=click.Path(), help='Write to file instead of stdout')
def retrieve(cid, out):
    """Retrieve an object by its CID.

    By default the raw bytes are written to stdout; use --out to save to a file.
    """
    obj_path = BASE_DIR / cid
    if not obj_path.exists():
        raise click.ClickException(f"CID {cid} not found in store")
    data = obj_path.read_bytes()
    if out:
        Path(out).write_bytes(data)
        click.echo(f"Saved CID {cid} to {out}")
    else:
        click.echo(data)

@cli.command()
@click.argument('cid')
def pin(cid):
    """Set the pin flag for a stored CID."""
    meta = _load_metadata()
    if cid not in meta:
        raise click.ClickException(f"CID {cid} not found")
    meta[cid]["pin"] = True
    _save_metadata(meta)
    click.echo(f"Pinned CID {cid}")

@cli.command()
@click.argument('cid')
def unpin(cid):
    """Clear the pin flag for a stored CID."""
    meta = _load_metadata()
    if cid not in meta:
        raise click.ClickException(f"CID {cid} not found")
    meta[cid]["pin"] = False
    _save_metadata(meta)
    click.echo(f"Unpinned CID {cid}")

@cli.command()
def list():
    """List all stored objects with basic metadata."""
    meta = _load_metadata()
    for cid, info in meta.items():
        click.echo(f"{cid}\t{info['original_name']}\t{info['size']}B\tpin={info['pin']}")

if __name__ == '__main__':
    cli()
