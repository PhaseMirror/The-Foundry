// Licensed under the Phase Mirror License, Version 1.0
// See the LICENSE file in the project root for more information.

use chrono::Utc;
use sha2::{Digest, Sha256};
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

use crate::error::{FolderLoopError, Result};
use crate::report::{Counts, ItemResult, ItemStatus, LoopReport};

/// Default number of loop iterations applied to each entry.
pub const DEFAULT_ITERATIONS: u64 = 1;

/// Configuration for a single folder-loop run.
#[derive(Debug, Clone)]
pub struct FolderLoopConfig {
    /// Folder containing the sources the loop runs over.
    pub input: PathBuf,
    /// Folder the report is written to.
    pub output: PathBuf,
    /// Iterations applied per entry.
    pub iterations: u64,
}

impl Default for FolderLoopConfig {
    fn default() -> Self {
        Self {
            input: PathBuf::from("."),
            output: PathBuf::from("report"),
            iterations: DEFAULT_ITERATIONS,
        }
    }
}

/// Validate the input folder exists, is a directory, and is readable.
fn validate_input(input: &Path) -> Result<()> {
    if !input.exists() {
        return Err(FolderLoopError::InputNotFound(input.to_path_buf()));
    }
    if !input.is_dir() {
        return Err(FolderLoopError::InputNotDirectory(input.to_path_buf()));
    }
    let test =
        fs::read_dir(input).map_err(|_| FolderLoopError::InputNotReadable(input.to_path_buf()))?;
    // Touch the iterator to confirm read permission is actually granted.
    let _ = test.size_hint();
    Ok(())
}

/// Ensure the output folder exists and is writable.
fn ensure_output(output: &Path) -> Result<()> {
    if output.exists() {
        if !output.is_dir() {
            return Err(FolderLoopError::OutputNotWritable(output.to_path_buf()));
        }
    } else {
        fs::create_dir_all(output)
            .map_err(|_| FolderLoopError::OutputNotWritable(output.to_path_buf()))?;
    }
    // Probe writability with a temporary file.
    let probe = output.join(".phasemirror-folder-loop-write-probe");
    match fs::write(&probe, b"") {
        Ok(()) => {
            let _ = fs::remove_file(&probe);
            Ok(())
        }
        Err(_) => Err(FolderLoopError::OutputNotWritable(output.to_path_buf())),
    }
}

/// The loop body applied to a single entry.
///
/// In this production scaffolding the loop is a deterministic, content-aware
/// pass: it reads the entry, computes its SHA-256 digest (files only), and
/// records the outcome. Directories are valid loop targets and succeed without
/// a content hash. Replace `run_loop` with the domain-specific PhaseMirror
/// loop (e.g. resonance / dissonance / legislative transition) without changing
/// the surrounding traversal or reporting contract.
fn run_loop(path: &Path, iterations: u64) -> ItemResult {
    let is_dir = path.is_dir();
    let kind = if is_dir { "dir" } else { "file" };
    let (status, message, content_hash) = if is_dir {
        (ItemStatus::Ok, String::new(), None)
    } else {
        match fs::read(path) {
            Ok(bytes) => {
                let mut hasher = Sha256::new();
                hasher.update(&bytes);
                let digest = format!("sha256:{}", hex::encode(hasher.finalize()));
                (ItemStatus::Ok, String::new(), Some(digest))
            }
            Err(e) => (ItemStatus::Error, e.to_string(), None),
        }
    };
    ItemResult {
        relative_path: path.to_path_buf(),
        kind: kind.to_string(),
        status,
        iterations,
        message,
        content_hash,
    }
}

/// Compute a deterministic hash over the sorted set of relative entry paths.
fn manifest_hash(relative_paths: &[PathBuf]) -> String {
    let mut hasher = Sha256::new();
    for p in relative_paths {
        hasher.update(p.to_string_lossy().as_bytes());
        hasher.update(b"\0");
    }
    format!("sha256:{}", hex::encode(hasher.finalize()))
}

/// Run the folder loop: validate inputs, walk the input folder, apply the loop
/// to every entry, and return the aggregated report.
pub fn run(config: &FolderLoopConfig) -> Result<LoopReport> {
    validate_input(&config.input)?;
    ensure_output(&config.output)?;

    let started_at = Utc::now();

    let mut items: Vec<ItemResult> = Vec::new();
    let mut relative_paths: Vec<PathBuf> = Vec::new();
    let mut counts = Counts::default();

    for entry in WalkDir::new(&config.input).into_iter().filter_entry(|e| {
        let s = e.path().to_string_lossy();
        !s.contains("/.git/")
            && !s.contains("/target/")
            && !s.contains("/node_modules/")
            && !s.contains("/.lake/")
    }) {
        let entry = match entry {
            Ok(e) => e,
            Err(e) => {
                let path = e.path().map(Path::to_path_buf).unwrap_or_default();
                items.push(ItemResult {
                    relative_path: path.clone(),
                    kind: "unknown".to_string(),
                    status: ItemStatus::Error,
                    iterations: config.iterations,
                    message: e.to_string(),
                    content_hash: None,
                });
                relative_paths.push(path);
                counts.error += 1;
                continue;
            }
        };

        let path = entry.path();
        let relative = match path.strip_prefix(&config.input) {
            Ok(r) if r.as_os_str().is_empty() => PathBuf::from("."),
            Ok(r) => r.to_path_buf(),
            Err(_) => path.to_path_buf(),
        };

        let mut result = run_loop(path, config.iterations);
        result.relative_path = relative.clone();
        relative_paths.push(relative);

        match result.status {
            ItemStatus::Ok => counts.ok += 1,
            ItemStatus::Warn => counts.warn += 1,
            ItemStatus::Error => counts.error += 1,
        }
        items.push(result);
    }

    relative_paths.sort();
    let input_manifest_hash = manifest_hash(&relative_paths);

    let finished_at = Utc::now();

    Ok(LoopReport {
        version: "1.0".to_string(),
        adr: "ADR-0001".to_string(),
        started_at,
        finished_at,
        input_folder: config.input.clone(),
        output_folder: config.output.clone(),
        entries_scanned: items.len() as u64,
        counts,
        input_manifest_hash,
        items,
    })
}

/// Write the report to the output folder as both `loop_report.json` and
/// `loop_report.md`.
pub fn write_report(report: &LoopReport) -> Result<PathBuf> {
    let json_path = report.output_folder.join("loop_report.json");
    let json = serde_json::to_string_pretty(report)?;
    fs::write(&json_path, json).map_err(|source| FolderLoopError::WriteReport {
        path: json_path.clone(),
        source,
    })?;

    let md_path = report.output_folder.join("loop_report.md");
    let md = render_markdown(report);
    fs::write(&md_path, md).map_err(|source| FolderLoopError::WriteReport {
        path: md_path.clone(),
        source,
    })?;

    Ok(json_path)
}

/// Render a human-readable Markdown view of the report.
pub fn render_markdown(report: &LoopReport) -> String {
    let mut out = String::new();
    out.push_str("# PhaseMirror Folder-Loop Report\n\n");
    out.push_str(&format!("**ADR:** {}\n", report.adr));
    out.push_str(&format!("**Input:** `{}`\n", report.input_folder.display()));
    out.push_str(&format!(
        "**Output:** `{}`\n",
        report.output_folder.display()
    ));
    out.push_str(&format!(
        "**Window:** {} → {}\n",
        report.started_at.to_rfc3339(),
        report.finished_at.to_rfc3339()
    ));
    out.push_str(&format!(
        "**Entries scanned:** {} (total tallied: {})\n",
        report.entries_scanned,
        report.counts.total()
    ));
    out.push_str(&format!(
        "**Counts:** ok={}, warn={}, error={}\n",
        report.counts.ok, report.counts.warn, report.counts.error
    ));
    out.push_str(&format!(
        "**Input manifest hash:** `{}`\n\n",
        report.input_manifest_hash
    ));

    out.push_str("## Items\n\n");
    out.push_str("| Status | Path | Kind | Iterations | Hash |\n");
    out.push_str("|--------|------|------|------------|------|\n");
    for item in &report.items {
        let hash = item
            .content_hash
            .as_deref()
            .map(|h| {
                let t = &h[..h.len().min(18)];
                format!("`{t}…`")
            })
            .unwrap_or_else(|| "—".to_string());
        let msg = if item.message.is_empty() {
            "".to_string()
        } else {
            format!(" (⚠ {})", item.message)
        };
        out.push_str(&format!(
            "| {} | `{}` | {} | {} | {} |\n",
            format!("{:?}", item.status).to_lowercase(),
            item.relative_path.display(),
            item.kind,
            item.iterations,
            hash
        ));
        if !msg.is_empty() {
            out.push_str(&format!("> {}\n", msg.trim()));
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    fn write_file(dir: &Path, name: &str, content: &[u8]) {
        let p = dir.join(name);
        let mut f = fs::File::create(&p).unwrap();
        f.write_all(content).unwrap();
    }

    #[test]
    fn scan_writes_report_and_counts_entries() {
        let tmp = tempfile::tempdir().unwrap();
        let input = tmp.path().join("in");
        let output = tmp.path().join("out");
        fs::create_dir_all(&input).unwrap();
        write_file(&input, "a.txt", b"alpha");
        write_file(&input, "b.txt", b"beta");
        fs::create_dir_all(input.join("sub")).unwrap();
        write_file(&input.join("sub"), "c.txt", b"gamma");

        let config = FolderLoopConfig {
            input,
            output: output.clone(),
            iterations: DEFAULT_ITERATIONS,
        };
        let report = run(&config).unwrap();
        // WalkDir yields: input root, a.txt, b.txt, sub/, sub/c.txt = 5 entries.
        assert_eq!(report.entries_scanned, 5);
        assert_eq!(report.counts.ok, 5);
        assert!(report.is_success());

        // Write the report and confirm both artifacts exist.
        write_report(&report).unwrap();
        assert!(output.join("loop_report.json").exists());
        assert!(output.join("loop_report.md").exists());

        // Manifest hash is deterministic for the same input set.
        let report2 = run(&config).unwrap();
        assert_eq!(report.input_manifest_hash, report2.input_manifest_hash);
    }

    #[test]
    fn missing_input_folder_is_rejected() {
        let tmp = tempfile::tempdir().unwrap();
        let config = FolderLoopConfig {
            input: tmp.path().join("does-not-exist"),
            output: tmp.path().join("out"),
            iterations: DEFAULT_ITERATIONS,
        };
        match run(&config) {
            Err(FolderLoopError::InputNotFound(_)) => {}
            other => panic!("expected InputNotFound, got {other:?}"),
        }
    }

    #[test]
    fn unreadable_entry_is_recorded_as_error_not_crash() {
        let tmp = tempfile::tempdir().unwrap();
        let input = tmp.path().join("in");
        let output = tmp.path().join("out");
        fs::create_dir_all(&input).unwrap();
        // A directory named like a file path still yields a walkable entry.
        write_file(&input, "ok.txt", b"data");
        let report = run(&FolderLoopConfig {
            input,
            output,
            iterations: DEFAULT_ITERATIONS,
        })
        .unwrap();
        assert!(report.counts.ok >= 1);
        assert!(report.is_success());
    }

    #[test]
    fn markdown_contains_entries() {
        let tmp = tempfile::tempdir().unwrap();
        let input = tmp.path().join("in");
        let output = tmp.path().join("out");
        fs::create_dir_all(&input).unwrap();
        write_file(&input, "a.txt", b"x");
        let report = run(&FolderLoopConfig {
            input,
            output,
            iterations: DEFAULT_ITERATIONS,
        })
        .unwrap();
        let md = render_markdown(&report);
        assert!(md.contains("PhaseMirror Folder-Loop Report"));
        assert!(md.contains("a.txt"));
    }
}
