// Licensed under the Phase Mirror License, Version 1.0
// See the LICENSE file in the project root for more information.

use std::path::PathBuf;

/// Errors produced by the folder-loop module.
///
/// These mirror the ADR-0001 consequence that the module "must validate that
/// the input folder exists and is readable before looping" and translate I/O
/// and configuration failures into a single typed error surface.
#[derive(Debug, thiserror::Error)]
pub enum FolderLoopError {
    #[error("input folder does not exist: {0}")]
    InputNotFound(PathBuf),

    #[error("input folder is not readable: {0}")]
    InputNotReadable(PathBuf),

    #[error("input folder is not a directory: {0}")]
    InputNotDirectory(PathBuf),

    #[error("output folder is not writable: {0}")]
    OutputNotWritable(PathBuf),

    #[error("failed to read entry {path}: {source}")]
    ReadEntry {
        path: PathBuf,
        #[source]
        source: std::io::Error,
    },

    #[error("failed to write report to {path}: {source}")]
    WriteReport {
        path: PathBuf,
        #[source]
        source: std::io::Error,
    },

    #[error("serialization error: {0}")]
    Serialize(#[from] serde_json::Error),
}

pub type Result<T> = std::result::Result<T, FolderLoopError>;
