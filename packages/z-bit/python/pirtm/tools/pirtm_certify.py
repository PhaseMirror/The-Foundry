#!/usr/bin/env python3
"""PIRTM Certification Pipeline Tool

Usage:
  pirtm certify \
    --candidate <path> --reference <path> \
    [--audit-trace <path>] --registry <path> \
    --module <name> --prime <p> --issuer <name>

This tool automates the full certification pipeline:
1) Run clone-check on candidate vs reference
2) Generate or verify audit trace
3) Issue a badge in the registry (ADR-025)

The tool enforces that certification only happens on a PASS clone-check.
"""

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import numpy as np
from meta_ensembles.core import EnsembleLedger

from pirtm.bindings.xi_operator import XiOperator
from pirtm.core.attestation import PIRTMAttestation, SignedPIRTMAttestation
from pirtm.governance.audit_trail import AuditEvent, AuditTrail, reset_audit_trail
from pirtm.governance.badge_registry import BadgeRegistry
from pirtm.governance.clone_check import clone_check_files
from pirtm.tools import pirtm_iag


def _file_hash(path: Path) -> str:
    """Compute SHA-256 hash of a file (hex)."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


def _deterministic_seed(candidate: Path, reference: Path, module: str, prime: int, issuer: str) -> int:
    """Compute a deterministic RNG seed based on inputs and source hashes."""
    h = hashlib.sha256()
    h.update(candidate.read_bytes())
    h.update(b"\0")
    h.update(reference.read_bytes())
    h.update(b"\0")
    h.update(module.encode("utf-8"))
    h.update(b"\0")
    h.update(str(prime).encode("utf-8"))
    h.update(b"\0")
    h.update(issuer.encode("utf-8"))
    # Use first 8 bytes for RNG seed
    return int.from_bytes(h.digest()[:8], "big")


def _deterministic_timestamp(seed: int, offset_seconds: int = 0) -> str:
    """Deterministically generate an ISO timestamp from a seed."""
    base = datetime(2026, 1, 1, tzinfo=timezone.utc)
    # keep it stable within a reasonable range
    delta = timedelta(seconds=(seed % 31_536_000) + offset_seconds)
    return (base + delta).isoformat()


def _make_audit_event(
    timestamp: str,
    stage: str,
    component: str,
    event: str,
    details: dict,
) -> AuditEvent:
    """Create an AuditEvent with a deterministic timestamp."""
    return AuditEvent(
        timestamp=timestamp,
        stage=stage,
        component=component,
        event=event,
        details=details,
    )


def _audit_lines_for_run(
    candidate: Path,
    reference: Path,
    module: str,
    prime: int,
    issuer: str,
    certificate_id: str,
    seed: int,
    iag_details: dict | None = None,
    meta_ensemble_details: dict | None = None,
) -> list[str]:
    """Generate audit trace lines (JSONL) deterministically."""
    # Reset in-memory trace
    reset_audit_trail()

    ts0 = _deterministic_timestamp(seed, offset_seconds=0)
    ts_step = 1

    # Start event (certify run)
    start = _make_audit_event(
        timestamp=ts0,
        stage="certify",
        component="pirtm_certify",
        event="certify_start",
        details={
            "module": module,
            "prime_index": prime,
            "issuer": issuer,
            "certificate_id": certificate_id,
            "candidate_hash": _file_hash(candidate),
            "reference_hash": _file_hash(reference),
        },
    )
    AuditTrail.get()._events.append(start)

    if iag_details is not None:
        iag_event = _make_audit_event(
            timestamp=_deterministic_timestamp(seed, offset_seconds=ts_step),
            stage="certify",
            component="pirtm_iag",
            event="generate_invariant",
            details=iag_details,
        )
        AuditTrail.get()._events.append(iag_event)
        ts_step += 1

    if meta_ensemble_details is not None:
        meta_event = _make_audit_event(
            timestamp=_deterministic_timestamp(seed, offset_seconds=ts_step),
            stage="certify",
            component="meta_ensembles",
            event="meta_ensemble_provenance",
            details=meta_ensemble_details,
        )
        AuditTrail.get()._events.append(meta_event)
        ts_step += 1

    # XiOperator events
    xi = XiOperator(prime)
    rng = np.random.default_rng(seed)
    psi = rng.standard_normal(prime)

    for t in [0.1, 0.5, 1.0]:
        out = xi.evolve(psi, t)
        result = xi.false_xi_test(psi, t)
        result_clean = {k: bool(v) if isinstance(v, (np.bool_,)) else v for k, v in result.items()}

        evt = _make_audit_event(
            timestamp=_deterministic_timestamp(seed, offset_seconds=ts_step),
            stage="runtime",
            component="xi_operator",
            event="false_xi_test",
            details={
                "prime_index": prime,
                "t": float(t),
                "psi_norm": float(np.linalg.norm(psi)),
                "out_norm": float(np.linalg.norm(out)),
                "pass": bool(result.get("PASS")),
                "details": result_clean,
            },
        )
        AuditTrail.get()._events.append(evt)
        ts_step += 1

    # End event
    end = _make_audit_event(
        timestamp=_deterministic_timestamp(seed, offset_seconds=ts_step),
        stage="certify",
        component="pirtm_certify",
        event="certify_end",
        details={
            "module": module,
            "prime_index": prime,
            "issuer": issuer,
            "certificate_id": certificate_id,
            "status": "COMPLETE",
        },
    )
    AuditTrail.get()._events.append(end)

    # Return JSONL lines
    return [e.to_json() for e in AuditTrail.get().snapshot()]


def _write_audit_trace(path: Path, lines: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for line in lines:
            f.write(line + "\n")


def _sha256_text(payload: str) -> str:
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _build_native_attestation(
    *,
    candidate: Path,
    reference: Path,
    module: str,
    prime: int,
    issuer: str,
    certificate_id: str,
    audit_path: Path,
    audit_lines: list[str],
    seed: int,
    metadata: dict,
) -> PIRTMAttestation:
    candidate_hash = _file_hash(candidate)
    reference_hash = _file_hash(reference)
    audit_trace_hash = _sha256_text("\n".join(audit_lines))
    proof_hash = _sha256_text(
        "\0".join([certificate_id, module, issuer, candidate_hash, reference_hash])
    )
    witness_commitment = _sha256_text(
        json.dumps(
            {
                "candidate_hash": candidate_hash,
                "reference_hash": reference_hash,
                "module": module,
                "prime_index": prime,
                "issuer": issuer,
            },
            sort_keys=True,
            separators=(",", ":"),
        )
    )
    identity_binding = _sha256_text(f"{issuer}\0{module}\0{prime}")

    attestation_metadata = {
        "certificate_id": certificate_id,
        "audit_trace": str(audit_path),
        "candidate_hash": candidate_hash,
        "reference_hash": reference_hash,
        "registry_metadata_keys": sorted(metadata.keys()),
    }

    return PIRTMAttestation(
        proof_hash=proof_hash,
        witness_commitment=witness_commitment,
        trace_hash=audit_trace_hash,
        certificate_kind="module",
        issued_at_epoch=seed,
        verification_result=True,
        prime_index=prime,
        identity_binding=identity_binding,
        metadata=attestation_metadata,
    )


def _build_badge_metadata(
    raw_metadata: str | None,
    iag_details: dict | None,
    meta_ensemble_details: dict | None = None,
    pirtm_attestation: PIRTMAttestation | None = None,
    signed_pirtm_attestation: SignedPIRTMAttestation | None = None,
) -> dict:
    metadata = json.loads(raw_metadata) if raw_metadata else {}
    if (
        iag_details is None
        and meta_ensemble_details is None
        and pirtm_attestation is None
        and signed_pirtm_attestation is None
    ):
        return metadata

    metadata = dict(metadata)
    meta_ensemble = dict(metadata.get("meta_ensemble", {}))
    if iag_details is not None:
        meta_ensemble.update({
            "invariant_id": iag_details["invariant_id"],
            "spec_path": iag_details["spec_path"],
            "generated_test_path": iag_details["generated_test_path"],
            "generated_stub_path": iag_details["generated_stub_path"],
            "meta_ensemble_log_path": iag_details["meta_ensemble_log_path"],
            "assembly_record_path": iag_details["assembly_record_path"],
            "assembly_record_hash": iag_details["assembly_record_hash"],
        })
    if meta_ensemble_details is not None:
        meta_ensemble.update(meta_ensemble_details)
    metadata["meta_ensemble"] = meta_ensemble
    if pirtm_attestation is not None:
        metadata["pirtm_attestation"] = pirtm_attestation.to_dict()
    if signed_pirtm_attestation is not None:
        metadata["signed_pirtm_attestation"] = signed_pirtm_attestation.to_dict()
    return metadata


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="PIRTM certification pipeline (clone-check + audit trace + badge issuance)"
    )
    parser.add_argument("--candidate", required=True, help="Candidate source file")
    parser.add_argument("--reference", required=True, help="Reference source file")
    parser.add_argument(
        "--audit-trace",
        required=False,
        help="Optional path to audit trace JSONL (auto-generated if omitted)",
    )
    parser.add_argument("--strict", action="store_true", help="Fail if an existing audit trace mismatches expected deterministic trace")
    parser.add_argument("--registry", required=True, help="Badge registry JSON path")
    parser.add_argument("--module", required=True, help="Module name for badge")
    parser.add_argument("--prime", type=int, required=True, help="Prime index for badge")
    parser.add_argument("--issuer", required=True, help="Issuer identity")
    parser.add_argument("--certificate-id", help="Optional certificate ID")
    parser.add_argument("--metadata", help="Optional JSON metadata")
    parser.add_argument(
        "--generate-invariant",
        help="Optional invariant spec JSON to pass through pirtm iag as part of certification",
    )
    parser.add_argument(
        "--iag-registry",
        default="pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md",
        help="Registry markdown path used when generating an invariant",
    )
    parser.add_argument(
        "--iag-output-root",
        default=".",
        help="Output root under which pirtm iag writes generated artifacts",
    )
    parser.add_argument(
        "--iag-meta-ensemble-log",
        default="pirtm/docs/META_ENSEMBLE_LOG.md",
        help="Meta-ensemble markdown log path used when generating an invariant",
    )
    parser.add_argument(
        "--iag-assembly-record",
        help="Optional structured assembly record path used when generating an invariant",
    )
    parser.add_argument(
        "--meta-ensemble-ledger",
        help="Optional ensemble ledger SQLite path used to emit fold/retract provenance sidecars",
    )
    parser.add_argument(
        "--meta-ensemble-sidecar-dir",
        help="Optional directory for emitted fold/retract provenance sidecars",
    )

    args = parser.parse_args(argv)

    # 1) Clone-check
    result = clone_check_files(args.candidate, args.reference)
    if result.status != "PASS":
        print(f"Error: clone-check did not PASS (status={result.status})", file=sys.stderr)
        return 1

    # 2) Audit trace: generate if missing, or validate if strict
    if args.audit_trace:
        audit_path = Path(args.audit_trace)
    else:
        audit_path = Path(args.registry).with_suffix(".audit.jsonl")

    seed = _deterministic_seed(
        Path(args.candidate),
        Path(args.reference),
        args.module,
        args.prime,
        args.issuer,
    )

    iag_details = None
    if args.generate_invariant:
        invariant_spec = pirtm_iag._load_spec(Path(args.generate_invariant))
        planned = pirtm_iag.planned_artifact_paths(
            invariant_spec,
            Path(args.iag_output_root),
            args.iag_registry,
        )
        planned_records = pirtm_iag.planned_record_paths(
            invariant_spec,
            Path(args.iag_output_root),
            args.iag_meta_ensemble_log,
            args.iag_assembly_record,
        )
        planned_record = pirtm_iag._build_assembly_record(
            invariant_spec,
            planned,
            planned_records,
            Path(args.iag_output_root),
        )
        pirtm_iag._validate_assembly_record(planned_record)
        planned_record_hash = pirtm_iag.assembly_record_hash(planned_record)
        iag_details = {
            "spec_path": str(Path(args.generate_invariant)),
            "registry_path": str(planned["registry_path"]),
            "output_root": str(Path(args.iag_output_root)),
            "generated_test_path": str(planned["test_path"]),
            "generated_stub_path": str(planned["stub_path"]),
            "meta_ensemble_log_path": str(planned_records["meta_log_path"]),
            "assembly_record_path": str(planned_records["assembly_record_path"]),
            "assembly_record_hash": planned_record_hash,
            "invariant_id": invariant_spec["id"],
        }

    meta_ensemble_details = None
    if args.meta_ensemble_ledger:
        sidecar_dir = Path(args.meta_ensemble_sidecar_dir) if args.meta_ensemble_sidecar_dir else Path(args.registry).parent / "meta_ensemble_sidecars"
        ledger = EnsembleLedger(args.meta_ensemble_ledger)
        sidecars = ledger.emit_provenance_sidecars(
            sidecar_dir,
            prefix=f"{args.module}_p{args.prime}",
        )
        meta_ensemble_details = {
            "ledger_path": str(Path(args.meta_ensemble_ledger).resolve()),
            **sidecars,
        }

    expected_lines = _audit_lines_for_run(
        Path(args.candidate),
        Path(args.reference),
        args.module,
        args.prime,
        args.issuer,
        args.certificate_id or result.fingerprint,
        seed,
        iag_details=iag_details,
        meta_ensemble_details=meta_ensemble_details,
    )

    if audit_path.exists():
        if args.strict:
            with open(audit_path, "r", encoding="utf-8") as f:
                existing = [l.rstrip("\n") for l in f if l.strip()]
            if existing != expected_lines:
                # Find first differing line for easier debugging
                first_diff = None
                for i, (exp, act) in enumerate(zip(expected_lines, existing)):
                    if exp != act:
                        first_diff = (i + 1, exp, act)
                        break
                if first_diff is None and len(expected_lines) != len(existing):
                    i = min(len(expected_lines), len(existing)) + 1
                    exp = expected_lines[i - 1] if i - 1 < len(expected_lines) else "<missing>"
                    act = existing[i - 1] if i - 1 < len(existing) else "<missing>"
                    first_diff = (i, exp, act)

                if first_diff:
                    line_no, exp, act = first_diff
                    print("Error: existing audit trace does not match expected deterministic trace", file=sys.stderr)
                    print(f"Diff at line {line_no}:", file=sys.stderr)
                    print(f"  expected: {exp}", file=sys.stderr)
                    print(f"  actual:   {act}", file=sys.stderr)
                else:
                    print("Error: existing audit trace does not match expected deterministic trace", file=sys.stderr)
                return 1
        # If not strict, accept existing file
    else:
        _write_audit_trace(audit_path, expected_lines)

    # 3) Optionally generate invariant artifacts before badge acceptance
    if args.generate_invariant:
        iag_result = pirtm_iag.main([
            "--spec",
            args.generate_invariant,
            "--registry",
            args.iag_registry,
            "--output-root",
            args.iag_output_root,
            "--meta-ensemble-log",
            args.iag_meta_ensemble_log,
            *( ["--assembly-record", args.iag_assembly_record] if args.iag_assembly_record else []),
        ])
        if iag_result != 0:
            return iag_result

        actual_record_path = Path(iag_details["assembly_record_path"])
        actual_record = json.loads(actual_record_path.read_text(encoding="utf-8"))
        actual_record_hash = pirtm_iag.assembly_record_hash(actual_record)
        if actual_record_hash != iag_details["assembly_record_hash"]:
            print(
                "Error: generated assembly record does not match expected deterministic record",
                file=sys.stderr,
            )
            return 1
        iag_details["assembly_record_hash"] = actual_record_hash

    # 4) Issue badge only after the optional IAG path succeeds
    raw_badge_metadata = json.loads(args.metadata) if args.metadata else {}
    native_attestation = _build_native_attestation(
        candidate=Path(args.candidate),
        reference=Path(args.reference),
        module=args.module,
        prime=args.prime,
        issuer=args.issuer,
        certificate_id=args.certificate_id or result.fingerprint,
        audit_path=audit_path,
        audit_lines=expected_lines,
        seed=seed,
        metadata=raw_badge_metadata,
    )
    signing_seed = os.environ.get("PIRTM_ATTESTATION_SIGNING_SEED") or (
        f"{args.issuer}\0{args.module}\0{args.prime}\0{args.certificate_id or result.fingerprint}"
    )
    signed_native_attestation = native_attestation.sign(
        seed=signing_seed,
        key_id=f"{args.issuer}:{args.module}:{args.prime}",
    )
    badge_metadata = _build_badge_metadata(
        args.metadata,
        iag_details,
        meta_ensemble_details,
        native_attestation,
        signed_native_attestation,
    )

    registry = BadgeRegistry.load(Path(args.registry))
    entry = registry.issue_badge(
        module_name=args.module,
        prime_index=args.prime,
        issued_by=args.issuer,
        certificate_id=args.certificate_id,
        clone_check_id=result.fingerprint,
        audit_trace=str(audit_path),
        metadata=badge_metadata,
    )
    registry.save(Path(args.registry))

    print(json.dumps(entry.to_dict(), indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main())


