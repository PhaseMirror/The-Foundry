# Folder-Loop Design Spec (ADR-0001)

This document is the human-readable companion to the formal Lean 4 artifact
`ADR-0001` (`Prime/lean/adr-governance/ADR/FolderLoop/ADR0001.lean`). It
describes the production implementation delivered in
`phase-mirror-cli/phasemirror-folder-loop`.

## Purpose

Provide a reusable entry point that runs the PhaseMirror loop over a
user-specified **input folder** and writes a structured **report** to a
user-specified **output folder**, without hard-coding paths into the binary.

## Contract

```
phasemirror-folder-loop --input <DIR> --output <DIR> [--iterations N]
```

| Flag           | Default   | Meaning                                              |
|----------------|-----------|------------------------------------------------------|
| `--input`      | `.`       | Folder the loop runs over (must exist & be readable).|
| `--output`     | `report`  | Folder the report is written to (created if absent). |
| `--iterations` | `1`       | Loop iterations applied per entry.                   |

Exit codes (fail-closed):

- `0` — run completed, no errors.
- `1` — loop or report-write failure, or at least one entry errored.
- `2` — configuration failure (missing/unreadable input, unwritable output).

## Behavior

1. **Validate input.** Reject (exit 2) if the input folder does not exist, is
   not a directory, or is not readable. Satisfies ADR-0001 consequence
   *"validate that the input folder exists and is readable before looping."*
2. **Ensure output.** Create the output folder if absent; probe writability.
3. **Walk.** Recursively traverse the input folder, skipping `.git/`,
   `target/`, `node_modules/`, `.lake/`.
4. **Loop.** Apply `run_loop` to each entry: files are read and SHA-256
   digested; directories are valid loop targets that succeed without a digest.
   Replace `run_loop` with the domain-specific PhaseMirror loop (resonance /
   dissonance / legislative transition) without altering traversal or
   reporting.
5. **Report.** Emit `loop_report.json` (machine-readable) and `loop_report.md`
   (human-readable) into the output folder. Compute a deterministic
   `input_manifest_hash` over the sorted relative entry paths as a
   tamper-evident witness of the input set.

## Report Schema

```jsonc
{
  "version": "1.0",
  "adr": "ADR-0001",
  "started_at": "<RFC3339>",
  "finished_at": "<RFC3339>",
  "input_folder": "src",
  "output_folder": "/tmp/out",
  "entries_scanned": 6,
  "counts": { "ok": 6, "warn": 0, "error": 0 },
  "input_manifest_hash": "sha256:…",
  "items": [
    {
      "relative_path": ".",
      "kind": "dir",
      "status": "ok",
      "iterations": 1
    },
    {
      "relative_path": "engine.rs",
      "kind": "file",
      "status": "ok",
      "iterations": 1,
      "content_hash": "sha256:…"
    }
  ]
}
```

## Module Layout

```
phasemirror-folder-loop/
├── Cargo.toml
├── src/
│   ├── main.rs      # CLI parsing, fail-closed exit codes
│   ├── lib.rs       # Public API surface
│   ├── error.rs     # FolderLoopError / Result
│   ├── report.rs    # LoopReport / ItemResult / Counts
│   └── engine.rs    # validation, traversal, loop body, export
└── tests (inline in engine.rs)
```

## Verification

```bash
cd phase-mirror-cli/phasemirror-folder-loop
cargo build
cargo test
cargo clippy --all-targets
cargo fmt --check
```
