// Licensed under the Phase Mirror License, Version 1.0
// See the LICENSE file in the project root for more information.

//! # phasemirror-folder-loop
//!
//! Production implementation of **ADR-0001 — PhaseMirror Folder-Loop Module**.
//!
//! The module runs the PhaseMirror loop over a *specified input folder* and
//! writes the generated report to a *specified output folder*. The loop body
//! ([`engine::run_loop`]) is intentionally a deterministic, content-aware pass;
//! replace it with the domain-specific PhaseMirror loop without changing the
//! traversal or reporting contract.

pub mod engine;
pub mod error;
pub mod report;

pub use engine::{run, write_report, FolderLoopConfig, DEFAULT_ITERATIONS};
pub use error::{FolderLoopError, Result};
pub use report::{Counts, ItemResult, ItemStatus, LoopReport};
