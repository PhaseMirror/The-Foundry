use crate::envelope::{CrmfEnvelope, GENESIS_STATE_HASH};
use std::fs::{File, OpenOptions};
use std::io::{self, BufRead, BufReader, Write};
use std::path::{Path, PathBuf};

/// One entry in the append-only ledger.
#[derive(Debug, Clone)]
pub struct LedgerEntry {
    /// 1-based line position; strictly increasing over the file's lifetime.
    pub sequence: u64,
    /// The sealed envelope recorded at this position.
    pub envelope: CrmfEnvelope,
}

/// Result of re-verifying the integrity of an event log chain.
#[derive(Debug, Clone)]
pub struct ChainVerdict {
    /// Number of entries examined.
    pub entries: u64,
    /// Human-readable evidence strings for every integrity failure.
    ///
    /// An empty list means the chain verified clean.
    pub tamper_evidence: Vec<String>,
}

impl ChainVerdict {
    pub fn is_clean(&self) -> bool {
        self.tamper_evidence.is_empty()
    }
}

/// Append-only, tamper-evident CRMF event log.
///
/// Every successful certification is appended as a single JSON line. Chain
/// integrity is recoverable at any time via [`EventLog::verify_chain`], which
/// checks, for every entry, the `prev_state_hash`→`state_hash` link, the
/// recomputable BCS payload digest, and the envelope's genesis anchoring.
///
/// Entries are opened with `append = true | create = true` and each
/// append performs `sync_all`, so a completed write survives process crash.
pub struct EventLog {
    path: PathBuf,
    file: File,
    entries: u64,
}

impl EventLog {
    /// Open (creating if necessary) the ledger at `path`.
    pub fn open(path: impl AsRef<Path>) -> io::Result<EventLog> {
        let path = path.as_ref().to_path_buf();
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .read(true)
            .open(&path)?;
        let entries = count_lines(&file)?;
        Ok(EventLog {
            path,
            file,
            entries,
        })
    }

    /// Path to the underlying ledger file.
    pub fn path(&self) -> &Path {
        &self.path
    }

    /// Number of entries currently recorded.
    pub fn len(&self) -> u64 {
        self.entries
    }

    pub fn is_empty(&self) -> bool {
        self.entries == 0
    }

    /// Append a sealed envelope, returning its 1-based sequence number.
    pub fn append(&mut self, envelope: &CrmfEnvelope) -> io::Result<u64> {
        let mut line = serde_json::to_string(envelope)
            .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;
        line.push('\n');
        self.file.write_all(line.as_bytes())?;
        self.file.flush()?;
        self.file.sync_all()?;
        self.entries += 1;
        Ok(self.entries)
    }

    /// Read every entry in file order.
    pub fn read_all(&self) -> io::Result<Vec<LedgerEntry>> {
        let file = OpenOptions::new().read(true).open(&self.path)?;
        let reader = BufReader::new(file);
        let mut out = Vec::new();
        for (idx, line) in reader.lines().enumerate() {
            let line = line?;
            if line.trim().is_empty() {
                continue;
            }
            let envelope: CrmfEnvelope = serde_json::from_str(&line)
                .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;
            out.push(LedgerEntry {
                sequence: (idx as u64) + 1,
                envelope,
            });
        }
        Ok(out)
    }

    /// Most recent entry, if any.
    pub fn tail(&self) -> io::Result<Option<CrmfEnvelope>> {
        Ok(self.read_all()?.pop().map(|e| e.envelope))
    }

    /// Re-verify full chain integrity of the ledger as persisted.
    ///
    /// Checks per entry:
    /// 1. head anchors to [`GENESIS_STATE_HASH`];
    /// 2. every successor's `prev_state_hash` equals the predecessor's
    ///    `state_hash`;
    /// 3. the sealed BCS payload digest still recomputes;
    /// 4. the derived `envelope_id` still matches `state_hash`.
    pub fn verify_chain(&self) -> io::Result<ChainVerdict> {
        let entries = self.read_all()?;
        let mut evidence = Vec::new();

        for (i, entry) in entries.iter().enumerate() {
            let env = &entry.envelope;
            if i == 0 {
                if env.prev_state_hash != GENESIS_STATE_HASH || !env.verify_genesis() {
                    evidence.push(format!(
                        "entry {}: prev_state_hash {} does not anchor to genesis",
                        entry.sequence, env.prev_state_hash
                    ));
                }
            } else if !env.verify_prev_link(&entries[i - 1].envelope) {
                evidence.push(format!(
                    "entry {}: prev_state_hash {} != predecessor state_hash {}",
                    entry.sequence,
                    env.prev_state_hash,
                    entries[i - 1].envelope.state_hash
                ));
            }

            if !env.verify_bcs_digest() {
                evidence.push(format!(
                    "entry {}: BCS payload digest does not recompute (public field mutated)",
                    entry.sequence
                ));
            }

            let expected_id = format!(
                "crmf_{}",
                env.state_hash.trim_start_matches("0x").chars().take(14).collect::<String>()
            );
            if env.envelope_id != expected_id {
                evidence.push(format!(
                    "entry {}: envelope_id {} inconsistent with state_hash",
                    entry.sequence, env.envelope_id
                ));
            }
        }

        Ok(ChainVerdict {
            entries: entries.len() as u64,
            tamper_evidence: evidence,
        })
    }
}

fn count_lines(file: &File) -> io::Result<u64> {
    let reader = BufReader::new(file);
    let mut n: u64 = 0;
    for line in reader.lines() {
        let line = line?;
        if !line.trim().is_empty() {
            n += 1;
        }
    }
    Ok(n)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::envelope::SealSpec;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn envelope(prev: &str, state: &str, tool: &str) -> CrmfEnvelope {
        CrmfEnvelope::seal(SealSpec {
            tool: tool.into(),
            workflow_id: "founder-os/t".into(),
            actor_id: "test".into(),
            prev_state_hash: prev.into(),
            state_hash: state.into(),
            policy_hash: "0xbbbb".into(),
            side_effect_permissions: vec!["content.publish".into()],
            zk_anchor: None,
        })
    }

    #[test]
    fn append_read_roundtrip() {
        let dir = std::env::temp_dir().join(format!("foe_log_{}", now()));
        let mut log = EventLog::open(&dir).unwrap();
        assert!(log.is_empty());
        let e1 = envelope(GENESIS_STATE_HASH, "0x1111", "workflow.run");
        assert_eq!(log.append(&e1).unwrap(), 1);
        let e2 = envelope("0x1111", "0x2222", "workflow.run");
        assert_eq!(log.append(&e2).unwrap(), 2);
        assert_eq!(log.len(), 2);

        let all = log.read_all().unwrap();
        assert_eq!(all.len(), 2);
        assert_eq!(all[0].envelope.state_hash, "0x1111");
        assert_eq!(all[1].envelope.state_hash, "0x2222");
        assert_eq!(log.tail().unwrap().unwrap().state_hash, "0x2222");
        std::fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn clean_chain_verifies() {
        let dir = std::env::temp_dir().join(format!("foe_log_{}", now()));
        let mut log = EventLog::open(&dir).unwrap();
        log.append(&envelope(GENESIS_STATE_HASH, "0x1111", "workflow.run"))
            .unwrap();
        log.append(&envelope("0x1111", "0x2222", "workflow.run"))
            .unwrap();
        log.append(&envelope("0x2222", "0x3333", "sequence.compile"))
            .unwrap();
        let verdict = log.verify_chain().unwrap();
        assert!(verdict.is_clean(), "{:?}", verdict.tamper_evidence);
        std::fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn broken_prev_link_detected() {
        let dir = std::env::temp_dir().join(format!("foe_log_{}", now()));
        let mut log = EventLog::open(&dir).unwrap();
        log.append(&envelope(GENESIS_STATE_HASH, "0x1111", "workflow.run"))
            .unwrap();
        log.append(&envelope("0xdeadbeef", "0x2222", "workflow.run"))
            .unwrap();
        let verdict = log.verify_chain().unwrap();
        assert!(!verdict.is_clean());
        assert!(verdict.tamper_evidence.iter().any(|e| e.contains("prev_state_hash")));
        std::fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn bcs_tamper_detected() {
        let dir = std::env::temp_dir().join(format!("foe_log_{}", now()));
        let mut log = EventLog::open(&dir).unwrap();
        log.append(&envelope(GENESIS_STATE_HASH, "0x1111", "workflow.run"))
            .unwrap();
        log.append(&envelope("0x1111", "0x2222", "workflow.run"))
            .unwrap();
        let path = log.path().to_path_buf();
        drop(log);

        let raw = std::fs::read_to_string(&path).unwrap();
        let tampered = raw.replace("\"actor_id\":\"test\"", "\"actor_id\":\"evil\"");
        assert_ne!(raw, tampered);
        std::fs::write(&path, tampered).unwrap();

        let reopened = EventLog::open(&path).unwrap();
        let verdict = reopened.verify_chain().unwrap();
        assert!(!verdict.is_clean());
        assert!(verdict.tamper_evidence.iter().any(|e| e.contains("BCS payload digest")));
        std::fs::remove_dir_all(&dir).ok();
    }

    fn now() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos() as u64
    }
}