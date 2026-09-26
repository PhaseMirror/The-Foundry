"""Daemon Startup Immutability Verification.

Per ADR-012, daemon startup must verify that all immutable files match the
governance Merkle root before proceeding with any operations.

This is called early in the daemon startup sequence, before any upgrades or
modifications to system state.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Optional

# Ensure system site-packages are available (contains PyYAML)
if '/usr/lib/python3/dist-packages' not in sys.path:
    sys.path.insert(0, '/usr/lib/python3/dist-packages')

from contracts.shared.constants import GOVERNANCE_MERKLE_ROOT_TX_ID
from contracts.shared.merkle_root import compute_governance_root
from governance.ledger import LedgerStore


BOOTSTRAP_SENTINEL_PATH = Path("state/governance_bootstrap.sentinel")


def load_system_invariants(invariants_path: Optional[Path] = None) -> dict[str, object]:
    """Load the system invariants document."""
    import yaml

    resolved_path = invariants_path or Path("contracts/system_invariants.yaml")
    if not resolved_path.exists():
        raise FileNotFoundError(f"System invariants not found: {resolved_path}")

    try:
        with open(resolved_path) as f:
            data = yaml.safe_load(f)
    except Exception as e:
        raise RuntimeError(f"Failed to load system invariants: {e}") from e

    if not isinstance(data, dict):
        raise ValueError(f"System invariants at {resolved_path} must deserialize to a mapping")
    return data


def load_immutable_files_list(invariants_path: Optional[Path] = None) -> list[Path]:
    """Load list of immutable files from system_invariants.yaml.
    
    Returns:
        List of Path objects for immutable files
        
    Raises:
        FileNotFoundError: If system_invariants.yaml not found
    """
    data = load_system_invariants(invariants_path=invariants_path)
    if "immutable_files" not in data:
        raise ValueError("No immutable_files list in system_invariants.yaml")
    raw_files = data["immutable_files"]
    if not isinstance(raw_files, list):
        raise ValueError("immutable_files must be a list in system_invariants.yaml")
    return [Path(file_path) for file_path in raw_files]


def load_governance_critical_tool_files(invariants_path: Optional[Path] = None) -> list[Path]:
    """Load governance-critical tool files from system_invariants.yaml."""
    data = load_system_invariants(invariants_path=invariants_path)
    raw_files = data.get("governance_critical_tools", [])
    if not isinstance(raw_files, list):
        raise ValueError("governance_critical_tools must be a list in system_invariants.yaml")
    return [Path(file_path) for file_path in raw_files]


def load_governance_verification_files(invariants_path: Optional[Path] = None) -> tuple[list[Path], list[Path]]:
    """Return immutable files and governance-critical tools used in root verification."""
    return (
        load_immutable_files_list(invariants_path=invariants_path),
        load_governance_critical_tool_files(invariants_path=invariants_path),
    )


def bootstrap_sentinel_exists(sentinel_path: Optional[Path] = None) -> bool:
    """Return True when bootstrap sentinel exists (bootstrap is incomplete)."""

    return (sentinel_path or BOOTSTRAP_SENTINEL_PATH).exists()


def write_bootstrap_sentinel(
    *,
    sentinel_path: Optional[Path] = None,
    reason: str = "governance_bootstrap_in_progress",
) -> Path:
    """Create or overwrite the bootstrap sentinel."""

    target = sentinel_path or BOOTSTRAP_SENTINEL_PATH
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(reason + "\n", encoding="utf-8")
    return target


def clear_bootstrap_sentinel(sentinel_path: Optional[Path] = None) -> None:
    """Clear bootstrap sentinel if present."""

    target = sentinel_path or BOOTSTRAP_SENTINEL_PATH
    if target.exists():
        target.unlink()


def verify_immutability_at_startup(
    ledger: Optional[LedgerStore] = None,
) -> tuple[bool, str]:
    """Verify all immutable files match governance root.
    
    Called early in daemon startup, before any upgrades or modifications.
    
    Args:
        ledger: Optional pre-initialized LedgerStore. If None, creates new instance
                with default storage path (governance/ledger.json).
        
    Returns:
        (success: bool, message: str)
        - (True, "message"): Verification passed
        - (False, "message"): Verification failed; should engage kill-switch
    """
    
    # Check if governance root has been established
    if GOVERNANCE_MERKLE_ROOT_TX_ID == 0:
        return (True, "Governance root not yet established (tx_id=0); skipping verification")
    
    # Initialize ledger if not provided
    if ledger is None:
        ledger_path = Path("governance/ledger.json")
        ledger = LedgerStore(storage_path=ledger_path)
    
    # Fetch governance root from ledger
    try:
        root_entry = ledger.get_entry(GOVERNANCE_MERKLE_ROOT_TX_ID)
        if root_entry is None:
            return (
                False,
                f"Governance root entry not found in ledger (tx_id={GOVERNANCE_MERKLE_ROOT_TX_ID})",
            )
        expected_root = root_entry.merkle_root
    except Exception as e:
        return (False, f"Failed to fetch governance root from ledger: {e}")
    
    # Load immutable files
    try:
        immutable_files, governance_critical_tools = load_governance_verification_files()
    except Exception as e:
        return (False, f"Failed to load immutable files list: {e}")
    
    # Compute live Merkle root
    try:
        live_root = compute_governance_root(immutable_files, governance_critical_tools)
    except Exception as e:
        return (False, f"Failed to compute live Merkle root: {e}")
    
    # Verify
    if live_root == expected_root:
        message = (
            f"✓ Immutability verified (root: {expected_root[:16]}..., "
            f"files: {len(immutable_files) + len(governance_critical_tools)})"
        )
        return (True, message)
    else:
        message = (
            f"IMMUTABILITY VIOLATION\n"
            f"  Expected root: {expected_root}\n"
            f"  Got root:      {live_root}\n"
            f"  Files:         {len(immutable_files) + len(governance_critical_tools)}\n"
            f"  Governance tx: {GOVERNANCE_MERKLE_ROOT_TX_ID}"
        )
        return (False, message)


def startup_verification_gate(
    ledger: Optional[LedgerStore] = None,
    engage_kill_switch: bool = True,
) -> bool:
    """Gate that ensures immutability before daemon proceeds.
    
    Per ADR-012: If verification fails, immediately engage kill-switch.
    
    Args:
        ledger: Optional pre-initialized LedgerStore
        engage_kill_switch: If True, call KillSwitch.engage() on mismatch
        
    Returns:
        True if verification passed, False otherwise
        
    Side effects:
        - If verification fails and engage_kill_switch is True,
          calls KillSwitch.engage() before returning
    """
    success, message = verify_immutability_at_startup(ledger=ledger)
    
    if success:
        print(message)
        return True
    else:
        print(f"ERROR: {message}")
        
        if engage_kill_switch:
            try:
                # Engage kill-switch as security measure
                from rollback.kill_switch import KillSwitch
                kill_switch = KillSwitch()
                result = kill_switch.engage(
                    trigger="immutability_verification_failed",
                    reason=message,
                )
                print(f"Kill-switch engaged: {result}")
            except Exception as e:
                print(f"WARNING: Failed to engage kill-switch: {e}")
        
        return False


def verify_server_startup_gate(
    *,
    ledger: Optional[LedgerStore] = None,
    sentinel_path: Optional[Path] = None,
    governance_tx_id: Optional[int] = None,
) -> tuple[bool, str]:
    """Strict startup gate for server processes.

    Unlike daemon verification, this gate fails closed if root tx_id is unset.
    """

    if bootstrap_sentinel_exists(sentinel_path=sentinel_path):
        return (False, "Bootstrap sentinel present; governance bootstrap is incomplete")

    resolved_tx_id = GOVERNANCE_MERKLE_ROOT_TX_ID if governance_tx_id is None else governance_tx_id
    if resolved_tx_id == 0:
        return (False, "Governance Merkle root tx_id is unset; bootstrap required before startup")

    success, message = verify_immutability_at_startup(ledger=ledger)
    if not success:
        return (False, message)
    return (True, message)
