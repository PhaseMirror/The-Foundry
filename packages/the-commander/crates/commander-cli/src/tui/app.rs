use std::collections::VecDeque;
use serde::{Deserialize, Serialize};

/// Maximum witness log entries held in memory for TUI display.
pub const MAX_LOG_ENTRIES: usize = 200;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowSummary {
    pub id: String,
    pub name: String,
    pub trust: String,      // "internal" | "external"
    pub server: String,
    pub alp_status: String, // "PASS" | "BLOCKED" | "PENDING"
    pub last_run: String,
    pub last_sat_token_id: Option<String>,  // historical — always expired
    pub last_witness_sha: Option<String>,   // SHA of last UnifiedWitness in archivum
}

#[derive(Debug, Clone)]
pub struct LogEntry {
    pub ts: String,
    pub level: String,  // "PASS" | "FAIL" | "INFO" | "WARN"
    pub msg: String,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Pane {
    Workflows,
    Log,
}

#[derive(Debug, Clone, PartialEq)]
pub enum SseStatus {
    Connected,
    Reconnecting { attempt: u32 },
    Disconnected,
}

#[derive(Debug)]
pub struct AppState {
    pub workflows: Vec<WorkflowSummary>,
    pub log: VecDeque<LogEntry>,
    pub selected: usize,
    pub scroll_offset: usize,
    pub active_pane: Pane,
    pub sse_status: SseStatus,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            workflows: Vec::new(),
            log: VecDeque::with_capacity(MAX_LOG_ENTRIES),
            selected: 0,
            scroll_offset: 0,
            active_pane: Pane::Workflows,
            sse_status: SseStatus::Disconnected,
        }
    }

    /// Called by the SSE task. Bounded write — no allocation on the hot path.
    pub fn push_log(&mut self, entry: LogEntry) {
        if self.log.len() >= MAX_LOG_ENTRIES {
            self.log.pop_back();
        }
        self.log.push_front(entry);
    }

    pub fn move_up(&mut self) {
        if self.selected > 0 { self.selected -= 1; }
        self.clamp_scroll();
    }

    pub fn move_down(&mut self) {
        if self.selected + 1 < self.workflows.len() { self.selected += 1; }
        self.clamp_scroll();
    }

    fn clamp_scroll(&mut self) {
        const PAGE: usize = 20;
        if self.selected < self.scroll_offset { self.scroll_offset = self.selected; }
        if self.selected >= self.scroll_offset + PAGE { self.scroll_offset = self.selected + 1 - PAGE; }
    }
}
