# IAG v0.1 Specification

## Purpose

IAG v0.1 turns a structured invariant specification into PIRTM-conformant scaffolding:

- a generated false_xi-style test harness,
- a generated XiOperator-style binding stub,
- a registry row for `pirtm/docs/PRIME_FREQUENCY_INTEGRITY_SUITE.md`-compatible tracking.

This is mechanical translation work and should not be performed by hand once the generator path exists.

## Input Contract

The invariant spec is JSON with the following fields:

```json
{
  "id": "INV-6",
  "name": "Sigma Channel Norm Bound",
  "statement": "||Sigma_p|| <= sqrt(p)",
  "prime_index": 7,
  "module": "pirtm/sigma",
  "tuning_fork_test": "compute sigma norm after 100-step iteration",
  "falsification": "norm exceeds sqrt(p)"
}
```

Required fields:

- `id`
- `name`
- `statement`
- `prime_index`
- `module`
- `tuning_fork_test`
- `falsification`

## Output Contract

Given the input above, `pirtm iag` writes:

- `pirtm/tests/test_<id>_<slug>.py`
- `pirtm/bindings/<slug>_stub.py`
- one registry row referencing those two paths
- one structured assembly record JSON document

When `--output-root` is provided, all generated paths are rooted under that directory.

When `--meta-ensemble-log` or `--assembly-record` is supplied, the generator updates those paths deterministically from the same invariant spec.

## CLI Shape

Direct generation:

One-line form:

```bash
pirtm iag --spec invariant.json --registry suite.md --output-root ./generated
```

```bash
pirtm iag \
  --spec invariant.json \
  --registry suite.md \
  --output-root ./generated \
  --meta-ensemble-log pirtm/docs/META_ENSEMBLE_LOG.md \
  --assembly-record pirtm/docs/meta_ensemble_records/inv-6.json
```

Integrated certification flow:

```bash
pirtm certify \
  --candidate path/to/candidate.py \
  --reference path/to/reference.py \
  --registry badges.json \
  --module xi_operator \
  --prime 17 \
  --issuer governance \
  --generate-invariant invariant.json \
  --iag-registry suite.md \
  --iag-output-root ./generated \
  --iag-meta-ensemble-log pirtm/docs/META_ENSEMBLE_LOG.md \
  --iag-assembly-record pirtm/docs/meta_ensemble_records/inv-6.json
```

## Certification Provenance Contract

For certify-integrated runs, the following provenance fields must agree across the certification artifacts:

- `assembly_record_path`
- `assembly_record_hash`
- `meta_ensemble_log_path`
- `generated_test_path`
- `generated_stub_path`
- `invariant_id`

The audit trace `generate_invariant` event and the issued badge metadata must reference the same exact `assembly_record_path` and `assembly_record_hash`.

## Determinism and Idempotence

- generated file names derive deterministically from invariant id and name,
- registry insertion is idempotent,
- a structured assembly record is emitted as JSON and contains assembly steps plus invariant coverage accounting,
- the structured assembly record has a deterministic SHA-256 fingerprint recorded as `assembly_record_hash`,
- the meta-ensemble markdown log is updated idempotently from that structured record,
- certify integration records a deterministic `generate_invariant` audit event,
- certify-integrated badge metadata carries the same `assembly_record_path` and `assembly_record_hash` as the audit event,
- strict mode compares existing audit traces against the deterministic expected output and reports the first difference.

## Reviewer Workflow

To verify badge metadata → audit trace → assembly record consistency:

1. Open the issued badge entry in the badge registry and read `metadata.meta_ensemble.assembly_record_path` plus `metadata.meta_ensemble.assembly_record_hash`.
2. Open the certification audit trace and locate the `generate_invariant` event.
3. Confirm the audit event carries the same `assembly_record_path` and `assembly_record_hash` as the badge metadata.
4. Open the assembly record JSON at `assembly_record_path`.
5. Recompute the SHA-256 hash of the canonical JSON payload and confirm it matches `assembly_record_hash`.
6. Confirm the record's `invariant_id`, generated paths, and log path match the badge metadata and audit event.

## Non-Goals for v0.1

- arbitrary code synthesis outside the false_xi harness and binding stub patterns,
- automatic acceptance of opaque assembly steps,
- skipping the integrity suite or certification pipeline.