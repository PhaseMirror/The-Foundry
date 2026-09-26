"""Witness emission for CCRE accepted updates."""

from __future__ import annotations

import hashlib
import json
from typing import Dict


def emit_witness(transform_id: str, parameters: Dict[str, float]) -> Dict[str, str]:
    canonical = json.dumps(parameters, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return {
        "transform_id": transform_id,
        "parameters_hash": digest,
    }
