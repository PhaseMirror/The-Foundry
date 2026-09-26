#!/usr/bin/env python3
"""Bootstrap script to initialize governance Merkle root.

Run once during system initialization to establish the root of trust.
After running, GOVERNANCE_MERKLE_ROOT_TX_ID in constants.py will be set to 1.

Usage:
    python -m daemon.bootstrap_governance_root

Output:
    Prints status and creates ledger entry at governance/ledger.json
"""

from __future__ import annotations

import sys
from pathlib import Path

# Add system site-packages and parent directory to path for imports
sys.path.insert(0, '/usr/lib/python3/dist-packages')
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from contracts.shared.merkle_root import compute_governance_root
from contracts.shared.constants import GOVERNANCE_MERKLE_ROOT_TX_ID
from daemon.startup_verification import (
    clear_bootstrap_sentinel,
    load_governance_verification_files,
    write_bootstrap_sentinel,
)
from governance.ledger import LedgerStore, create_governance_root_commit


def bootstrap_governance_root(
    ledger_path: Path | None = None,
    skip_const_update: bool = False,
    signed_by: str = "bootstrap",
    sentinel_path: Path | None = None,
    allow_rebootstrap: bool = False,
) -> tuple[bool, str]:
    """Initialize governance Merkle root.
    
    Args:
        ledger_path: Optional path for ledger storage. Defaults to governance/ledger.json
        skip_const_update: If True, don't print update instructions for constants.py
        
    Returns:
        (success: bool, message: str)
    """
    
    print("=" * 70)
    print("ADR-012 Governance Root Bootstrap")
    print("=" * 70)
    
    # Check if already initialized
    if GOVERNANCE_MERKLE_ROOT_TX_ID != 0 and not allow_rebootstrap:
        msg = (
            f"Governance root already initialized (tx_id={GOVERNANCE_MERKLE_ROOT_TX_ID}). "
            f"Use allow_rebootstrap=True to rotate the root with a new ledger transaction."
        )
        print(f"⚠ {msg}")
        return (False, msg)

    if GOVERNANCE_MERKLE_ROOT_TX_ID != 0 and allow_rebootstrap:
        print(
            "\n⚠ Rebootstrap enabled: a new governance root commit will be appended and "
            "constants.py must be updated to the new tx_id."
        )

    if not signed_by.strip():
        msg = "signed_by must be non-empty for governance bootstrap"
        print(f"   ✗ {msg}")
        return (False, msg)

    sentinel = write_bootstrap_sentinel(
        sentinel_path=sentinel_path,
        reason="governance_bootstrap_in_progress",
    )
    print(f"\n0. Wrote bootstrap sentinel: {sentinel}")
    
    print("\n1. Loading governance verification files...")
    try:
        immutable_files, governance_critical_tools = load_governance_verification_files()
        print(
            f"   ✓ Loaded {len(immutable_files)} immutable files and "
            f"{len(governance_critical_tools)} governance-critical tools"
        )
        for f in immutable_files:
            print(f"     - {f}")
        for f in governance_critical_tools:
            print(f"     - {f}")
    except Exception as e:
        msg = f"Failed to load governance verification files: {e}"
        print(f"   ✗ {msg}")
        return (False, msg)
    
    print("\n2. Computing Merkle root...")
    try:
        merkle_root = compute_governance_root(immutable_files, governance_critical_tools)
        print(f"   ✓ Computed root: {merkle_root[:32]}...")
    except Exception as e:
        msg = f"Failed to compute Merkle root: {e}"
        print(f"   ✗ {msg}")
        return (False, msg)
    
    print("\n3. Creating governance root commit...")
    try:
        commit = create_governance_root_commit(
            merkle_root=merkle_root,
            immutable_files=immutable_files,
            governance_critical_tools=governance_critical_tools,
            governance_version="v0.1.0",
            signed_by=signed_by,
            notes="Initial governance root establishment",
        )
        print(f"   ✓ Created commit entry")
    except Exception as e:
        msg = f"Failed to create commit: {e}"
        print(f"   ✗ {msg}")
        return (False, msg)
    
    print("\n4. Storing in governance ledger...")
    try:
        if ledger_path is None:
            ledger_path = Path("governance/ledger.json")
        
        ledger = LedgerStore(storage_path=ledger_path)
        latest_commit = ledger.get_latest_root_commit()
        if latest_commit is not None:
            tx_id_prev, _ = latest_commit
            commit.previous_root_tx_id = tx_id_prev
        tx_id = ledger.create_entry(commit)
        print(f"   ✓ Stored in ledger at tx_id={tx_id}")
        print(f"   ✓ Ledger file: {ledger_path.resolve()}")
    except Exception as e:
        msg = f"Failed to store in ledger: {e}"
        print(f"   ✗ {msg}")
        return (False, msg)
    
    print("\n" + "=" * 70)
    print("BOOTSTRAP COMPLETE ✓")
    print("=" * 70)

    clear_bootstrap_sentinel(sentinel_path=sentinel_path)
    print("\n✓ Cleared bootstrap sentinel")
    
    if not skip_const_update:
        print("\n⚠ NEXT STEP: Update constants.py")
        print("   Edit contracts/shared/constants.py and set:")
        print(f"   GOVERNANCE_MERKLE_ROOT_TX_ID: int = {tx_id}")
        print("\n   Then verify immutability with:")
        print("   python -m daemon once")
    
    return (True, f"Governance root initialized at tx_id={tx_id}")


if __name__ == "__main__":
    success, message = bootstrap_governance_root()
    if not success:
        print(f"\nFATAL: {message}")
        sys.exit(1)
    sys.exit(0)
